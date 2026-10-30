import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase as maybeSupabase} from '../config/supabase';
import {listings as mockListings} from '../data/listings';
import {Listing, ListingCategory} from '../types';

export interface ListingFilters {
  category: ListingCategory | 'All';
  query: string;
  page?: number;
  pageSize?: number;
}

export type ListingDraft = Omit<Listing, 'id'>;

export interface ListingWriteResult {
  listing: Listing;
  savedTo: 'supabase' | 'device';
  error?: {
    message: string;
    details?: string;
    hint?: string;
  };
}

export type ListingDeleteResult = 'supabase' | 'device';

type ListingRow = Record<string, unknown>;
type SupabaseErrorLike = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

interface LocalListingState {
  listings: Listing[];
  deletedIds: string[];
}

// When Supabase env vars are missing the client is null; calls then throw and the
// existing catch blocks fall back to local/mock data.
const supabase = maybeSupabase as NonNullable<typeof maybeSupabase>;

const LOCAL_STORAGE_KEY = '@upright/local-listings-v1';
const remoteListings = new Map<string, Listing>();

export async function fetchListings(
  filters: ListingFilters,
): Promise<Listing[]> {
  const localState = await readLocalState();
  let result: Listing[] = mockListings;

  if (maybeSupabase) {
    try {
      const page = filters.page ?? 1;
      const pageSize = filters.pageSize ?? 1000;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 8000),
      );
      const {data, error} = await Promise.race([
        supabase
          .from('listings')
          .select('*')
          .order('id', {ascending: true})
          .range(from, to),
        timeout,
      ]);
      if (!error && Array.isArray(data) && data.length > 0) {
        result = (data as ListingRow[]).map(toListing);
        result.forEach(listing => remoteListings.set(listing.id, listing));
      }
    } catch {
      // Any failure (offline, missing table, timeout) -> use mock data.
      result = mockListings;
    }
  }

  const deletedIds = new Set(localState.deletedIds);
  const merged = new Map(
    result
      .filter(listing => !deletedIds.has(listing.id))
      .map(listing => [listing.id, listing]),
  );
  localState.listings.forEach(listing => merged.set(listing.id, listing));

  const listings = [...merged.values()];
  listings.forEach(listing => remoteListings.set(listing.id, listing));
  return filterListings(listings, filters);
}

export function getListingById(id: string): Listing | undefined {
  return (
    remoteListings.get(id) ??
    mockListings.find(listing => listing.id === id)
  );
}

export async function getLocalListingIds(): Promise<string[]> {
  const localState = await readLocalState();
  return localState.listings.map(listing => listing.id);
}

export async function createListing(
  draft: ListingDraft,
): Promise<ListingWriteResult> {
  const fallbackListing: Listing = {
    ...draft,
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  let response;
  try {
    response = await supabase
      .from('listings')
      .insert(toListingRow(draft))
      .select('*')
      .single();
  } catch (error) {
    return saveFailedWriteLocally('insert', fallbackListing, error);
  }

  const {data, error} = response;
  if (error) {
    return saveFailedWriteLocally('insert', fallbackListing, error);
  }

  const listing = toListing(data as ListingRow);
  remoteListings.set(listing.id, listing);
  await removeLocalOverride(listing.id);
  return {listing, savedTo: 'supabase'};
}

export async function updateListing(
  id: string,
  draft: ListingDraft,
): Promise<ListingWriteResult> {
  const localState = await readLocalState();
  if (id.startsWith('local-') || localState.listings.some(item => item.id === id)) {
    const localListing = {...draft, id};
    await saveLocalOverride(localListing);
    remoteListings.set(id, localListing);
    return {listing: localListing, savedTo: 'device'};
  }

  let response;
  try {
    response = await supabase
      .from('listings')
      .update(toListingRow(draft))
      .eq('id', id)
      .select('*')
      .single();
  } catch (error) {
    return saveFailedWriteLocally('update', {...draft, id}, error);
  }

  const {data, error} = response;
  if (error) {
    return saveFailedWriteLocally('update', {...draft, id}, error);
  }

  const listing = toListing(data as ListingRow);
  remoteListings.set(listing.id, listing);
  await removeLocalOverride(listing.id);
  return {listing, savedTo: 'supabase'};
}

export async function deleteListing(
  id: string,
): Promise<ListingDeleteResult> {
  const localState = await readLocalState();
  if (id.startsWith('local-')) {
    await removeLocalOverride(id);
    remoteListings.delete(id);
    return 'device';
  }

  let response;
  try {
    response = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();
  } catch (error) {
    logSupabaseError('delete', error);
    await saveLocalDelete(id, localState);
    remoteListings.delete(id);
    return 'device';
  }

  const {data, error} = response;
  if (error) {
    logSupabaseError('delete', error);
    await saveLocalDelete(id, localState);
    remoteListings.delete(id);
    return 'device';
  }
  if (!data) {
    throw new Error('The listing was not found or could not be deleted.');
  }

  await removeLocalOverride(id);
  remoteListings.delete(id);
  return 'supabase';
}

async function saveFailedWriteLocally(
  operation: 'insert' | 'update',
  listing: Listing,
  error: unknown,
): Promise<ListingWriteResult> {
  const supabaseError = toSupabaseErrorLike(error);
  logSupabaseError(operation, supabaseError, error);
  await saveLocalOverride(listing);
  remoteListings.set(listing.id, listing);
  return {
    listing,
    savedTo: 'device',
    error: {
      message: supabaseError.message,
      details: supabaseError.details,
      hint: supabaseError.hint,
    },
  };
}

async function readLocalState(): Promise<LocalListingState> {
  const stored = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    return {listings: [], deletedIds: []};
  }

  const parsed: unknown = JSON.parse(stored);
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('listings' in parsed) ||
    !Array.isArray(parsed.listings) ||
    !('deletedIds' in parsed) ||
    !Array.isArray(parsed.deletedIds) ||
    !parsed.listings.every(isListing) ||
    !parsed.deletedIds.every((id: unknown) => typeof id === 'string')
  ) {
    throw new Error('Saved local listing data is invalid and could not be loaded.');
  }

  return {
    listings: parsed.listings,
    deletedIds: parsed.deletedIds,
  };
}

async function writeLocalState(state: LocalListingState): Promise<void> {
  await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

async function saveLocalOverride(listing: Listing): Promise<void> {
  const state = await readLocalState();
  const existing = state.listings.findIndex(item => item.id === listing.id);
  if (existing === -1) {
    state.listings.push(listing);
  } else {
    state.listings[existing] = listing;
  }
  state.deletedIds = state.deletedIds.filter(id => id !== listing.id);
  await writeLocalState(state);
}

async function removeLocalOverride(id: string): Promise<void> {
  const state = await readLocalState();
  state.listings = state.listings.filter(listing => listing.id !== id);
  state.deletedIds = state.deletedIds.filter(deletedId => deletedId !== id);
  await writeLocalState(state);
}

async function saveLocalDelete(
  id: string,
  state: LocalListingState,
): Promise<void> {
  state.listings = state.listings.filter(listing => listing.id !== id);
  if (!state.deletedIds.includes(id)) {
    state.deletedIds.push(id);
  }
  await writeLocalState(state);
}

function isListing(value: unknown): value is Listing {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'title' in value &&
    typeof value.title === 'string'
  );
}

function logSupabaseError(
  operation: string,
  error: unknown,
  originalError: unknown = error,
): void {
  // Supabase errors are surfaced via return values and UI error states.
  // Console logging is intentionally disabled for release builds.
}

function toSupabaseErrorLike(error: unknown): SupabaseErrorLike {
  if (error instanceof Error) {
    const supabaseError = error as SupabaseErrorLike;
    return {
      message: supabaseError.message,
      details: supabaseError.details,
      hint: supabaseError.hint,
      code: supabaseError.code,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const response = error as Record<string, unknown>;
    return {
      message:
        typeof response.message === 'string'
          ? response.message
          : 'Unknown Supabase error',
      details:
        typeof response.details === 'string' ? response.details : undefined,
      hint: typeof response.hint === 'string' ? response.hint : undefined,
      code: typeof response.code === 'string' ? response.code : undefined,
    };
  }

  return {
    message: typeof error === 'string' ? error : 'Unknown Supabase error',
  };
}

function toListing(row: ListingRow): Listing {
  const safeImages = Array.isArray(row.images)
    ? row.images.filter((img): img is string => typeof img === 'string')
    : row.images
    ? [String(row.images)]
    : [];

  let priceValue: string | number = 0;
  if (row.price !== undefined && row.price !== null && row.price !== '') {
    priceValue = typeof row.price === 'string' ? Number(row.price) : row.price as number;
  } else if (row.price_numeric !== undefined && row.price_numeric !== null) {
    priceValue = String(row.price_numeric);
  } else {
    priceValue = '0';
  }

  const lat = row.lat !== undefined && row.lat !== null ? Number(row.lat) : 0;
  const lng = row.lng !== undefined && row.lng !== null ? Number(row.lng) : 0;

  const beds = row.beds !== undefined && row.beds !== null ? Number(row.beds) : 0;
  const baths = row.baths !== undefined && row.baths !== null ? Number(row.baths) : 0;
  const size = row.size !== undefined && row.size !== null ? String(row.size) : '120 Sq Yard';

  const category = (row.category === 'Buy' || row.category === 'Rent' || row.category === 'Plot')
    ? row.category
    : 'Buy';

  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? 'Untitled'),
    location: String(row.location ?? ''),
    neighborhood: String(row.neighborhood ?? row.location ?? ''),
    category,
    price: priceValue,
    bedrooms: isNaN(beds) ? 0 : beds,
    bathrooms: isNaN(baths) ? 0 : baths,
    area: size,
    areaUnit: '',
    latitude: isNaN(lat) ? 0 : lat,
    longitude: isNaN(lng) ? 0 : lng,
    images: safeImages,
    description: String(row.description ?? ''),
    agent: { name: 'Upright Karachi Office' },
  };
}

function toListingRow(listing: ListingDraft): ListingRow {
  return {
    title: listing.title,
    location: listing.location,
    neighborhood: listing.neighborhood,
    category: listing.category,
    price: listing.price,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    area: listing.area,
    area_unit: listing.areaUnit,
    latitude: listing.latitude,
    longitude: listing.longitude,
    images: listing.images,
    description: listing.description,
    agent: listing.agent,
  };
}

function filterListings(
  source: Listing[],
  filters: ListingFilters,
): Listing[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  return source.filter(listing => {
    const matchesCategory =
      filters.category === 'All' || listing.category === filters.category;
    const matchesQuery =
      !normalizedQuery ||
      listing.location.toLowerCase().includes(normalizedQuery) ||
      listing.neighborhood.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
}
