import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {COLORS} from '../theme';
import {PressableOpacity} from '../components/PressableOpacity';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  createListing,
  deleteListing,
  fetchListings,
  getLocalListingIds,
  ListingDraft,
  updateListing,
} from '../services/listingService';
import {AreaUnit, Listing, ListingCategory} from '../types';


interface ListingForm {
  title: string;
  location: string;
  neighborhood: string;
  category: ListingCategory;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  areaUnit: AreaUnit;
  latitude: string;
  longitude: string;
  images: string;
  description: string;
  agentName: string;
}

type TextFieldKey = Exclude<keyof ListingForm, 'category' | 'areaUnit'>;

const TEXT_FIELDS: {
  key: TextFieldKey;
  label: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  multiline?: boolean;
}[] = [
  {key: 'title', label: 'Title'},
  {key: 'location', label: 'Location'},
  {key: 'neighborhood', label: 'Neighborhood'},
  {key: 'price', label: 'Price (PKR)', keyboardType: 'numeric'},
  {key: 'bedrooms', label: 'Bedrooms', keyboardType: 'numeric'},
  {key: 'bathrooms', label: 'Bathrooms', keyboardType: 'numeric'},
  {key: 'area', label: 'Area', keyboardType: 'decimal-pad'},
  {key: 'latitude', label: 'Latitude', keyboardType: 'decimal-pad'},
  {key: 'longitude', label: 'Longitude', keyboardType: 'decimal-pad'},
  {
    key: 'images',
    label: 'Image URLs (one per line)',
    multiline: true,
  },
  {key: 'description', label: 'Description', multiline: true},
  {key: 'agentName', label: 'Agent name'},
];

function emptyForm(): ListingForm {
  return {
    title: '',
    location: '',
    neighborhood: '',
    category: 'Buy',
    price: '',
    bedrooms: '0',
    bathrooms: '0',
    area: '',
    areaUnit: 'Sq Yd',
    latitude: '',
    longitude: '',
    images: '',
    description: '',
    agentName: 'Upright Karachi Office',
  };
}

function formFromListing(listing: Listing): ListingForm {
  return {
    title: listing.title,
    location: listing.location,
    neighborhood: listing.neighborhood,
    category: listing.category,
    price: String(listing.price),
    bedrooms: String(listing.bedrooms),
    bathrooms: String(listing.bathrooms),
    area: String(listing.area),
    areaUnit: (listing.areaUnit ?? 'Sq Yd') as AreaUnit,
    latitude: String(listing.latitude),
    longitude: String(listing.longitude),
    images: listing.images.join('\n'),
    description: listing.description,
    agentName: listing.agent.name,
  };
}

function toListingDraft(form: ListingForm): ListingDraft {
  const numbers = {
    price: Number(form.price),
    bedrooms: Number(form.bedrooms),
    bathrooms: Number(form.bathrooms),
    area: Number(form.area),
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
  };
  const missingNumber = (
    Object.keys(numbers) as (keyof typeof numbers)[]
  ).some(key => form[key].trim() === '');

  if (
    !form.title.trim() ||
    !form.location.trim() ||
    !form.neighborhood.trim() ||
    !form.description.trim() ||
    missingNumber ||
    Object.values(numbers).some(value => !Number.isFinite(value))
  ) {
    throw new Error('Complete the required text and numeric fields first.');
  }

  return {
    title: form.title.trim(),
    location: form.location.trim(),
    neighborhood: form.neighborhood.trim(),
    category: form.category,
    ...numbers,
    areaUnit: form.areaUnit,
    images: form.images
      .split(/\r?\n/)
      .map(image => image.trim())
      .filter(Boolean),
    description: form.description.trim(),
    agent: {name: form.agentName.trim() || 'Upright Karachi Office'},
  };
}

export function AdminScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [form, setForm] = useState<ListingForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localListingIds, setLocalListingIds] = useState<string[]>([]);

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const [nextListings, localIds] = await Promise.all([
        fetchListings({category: 'All', query: ''}),
        getLocalListingIds(),
      ]);
      setListings(nextListings);
      setLocalListingIds(localIds);
    } catch (error) {
      Alert.alert(
        'Listings unavailable',
        error instanceof Error ? error.message : 'Could not load listings.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadListings();
  }, [loadListings]);

  const setTextField = (key: TextFieldKey, value: string) => {
    setForm(current => ({...current, [key]: value}));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const saveListing = async () => {
    let draft: ListingDraft;
    try {
      draft = toListingDraft(form);
    } catch (error) {
      Alert.alert(
        'Check listing details',
        error instanceof Error ? error.message : 'The listing is incomplete.',
      );
      return;
    }

    setSaving(true);
    try {
      const result = editingId
        ? await updateListing(editingId, draft)
        : await createListing(draft);
      const {listing} = result;
      setListings(current =>
        editingId
          ? current.map(item => (item.id === listing.id ? listing : item))
          : [listing, ...current],
      );
      setLocalListingIds(await getLocalListingIds());
      resetForm();
      Alert.alert(
        result.savedTo === 'supabase' ? 'Saved to Supabase' : 'Saved on this device only',
        result.savedTo === 'supabase'
          ? 'The listing was saved to Supabase.'
          : [
              'Supabase rejected the write. The listing has been saved locally and has not been synced to the server.',
              result.error?.message,
              result.error?.details,
              result.error?.hint,
            ]
              .filter(Boolean)
              .join('\n'),
      );
    } catch (error) {
      Alert.alert(
        'Could not save listing',
        error instanceof Error ? error.message : 'Supabase rejected the write.',
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (listing: Listing) => {
    Alert.alert(
      'Delete listing?',
      `“${listing.title}” will be removed from Supabase.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                const savedTo = await deleteListing(listing.id);
                setListings(current =>
                  current.filter(item => item.id !== listing.id),
                );
                setLocalListingIds(await getLocalListingIds());
                if (editingId === listing.id) {
                  resetForm();
                }
                if (savedTo === 'device') {
                  Alert.alert(
                    'Hidden on this device only',
                    'Supabase rejected the delete. The listing remains on the server and is hidden locally.',
                  );
                }
              } catch (error) {
                Alert.alert(
                  'Could not delete listing',
                  error instanceof Error
                    ? error.message
                    : 'Supabase rejected the delete.',
                );
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.intro}>
            Manage properties stored in Supabase. Write access is controlled by
            your project’s row-level security policies.
          </Text>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>
              {editingId ? 'Edit listing' : 'Add a listing'}
            </Text>
            {TEXT_FIELDS.map(field => (
              <View key={field.key} style={styles.field}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  accessibilityLabel={field.label}
                  value={form[field.key]}
                  onChangeText={value => setTextField(field.key, value)}
                  keyboardType={field.keyboardType ?? 'default'}
                  multiline={field.multiline}
                  autoCapitalize={
                    field.key === 'images' ? 'none' : 'sentences'
                  }
                  style={[
                    styles.input,
                    field.multiline && styles.multilineInput,
                  ]}
                />
              </View>
            ))}

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.choiceRow}>
              {(['Buy', 'Rent', 'Plot'] as ListingCategory[]).map(category => (
                <PressableOpacity
                  key={category}
                  accessibilityRole="button"
                  onPress={() => setForm(current => ({...current, category}))}
                  style={[
                    styles.choice,
                    form.category === category && styles.choiceActive,
                  ]}>
                  <Text
                    style={[
                      styles.choiceText,
                      form.category === category && styles.choiceTextActive,
                    ]}>
                    {category}
                  </Text>
                </PressableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Area unit</Text>
            <View style={styles.choiceRow}>
              {(['Sq Yd', 'Marla'] as AreaUnit[]).map(areaUnit => (
                <PressableOpacity
                  key={areaUnit}
                  accessibilityRole="button"
                  onPress={() => setForm(current => ({...current, areaUnit}))}
                  style={[
                    styles.choice,
                    form.areaUnit === areaUnit && styles.choiceActive,
                  ]}>
                  <Text
                    style={[
                      styles.choiceText,
                      form.areaUnit === areaUnit && styles.choiceTextActive,
                    ]}>
                    {areaUnit}
                  </Text>
                </PressableOpacity>
              ))}
            </View>

            <View style={styles.actions}>
              {editingId ? (
                <PressableOpacity
                  accessibilityRole="button"
                  onPress={resetForm}
                  style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel edit</Text>
                </PressableOpacity>
              ) : null}
              <PressableOpacity
                accessibilityRole="button"
                disabled={saving}
                onPress={() => void saveListing()}
                style={[styles.saveButton, saving && styles.disabledButton]}>
                {saving ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingId ? 'Save changes' : 'Create listing'}
                  </Text>
                )}
              </PressableOpacity>
            </View>
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Listings</Text>
            <PressableOpacity
              accessibilityRole="button"
              disabled={loading}
              onPress={() => void loadListings()}>
              <Text style={styles.refreshText}>Refresh</Text>
            </PressableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={styles.loader} />
          ) : listings.length === 0 ? (
            <Text style={styles.emptyText}>No listings are available.</Text>
          ) : (
            listings.map(listing => (
              <View key={listing.id} style={styles.listingRow}>
                <View style={styles.listingCopy}>
                  <Text style={styles.listingTitle}>{listing.title}</Text>
                  <Text style={styles.listingLocation}>{listing.location}</Text>
                  {localListingIds.includes(listing.id) ? (
                    <Text style={styles.localStatus}>On this device only — not synced</Text>
                  ) : null}
                </View>
                <PressableOpacity
                  accessibilityRole="button"
                  onPress={() => {
                    setEditingId(listing.id);
                    setForm(formFromListing(listing));
                  }}
                  style={styles.rowAction}>
                  <Text style={styles.rowActionText}>Edit</Text>
                </PressableOpacity>
                <PressableOpacity
                  accessibilityRole="button"
                  onPress={() => confirmDelete(listing)}
                  style={styles.rowAction}>
                  <Text style={styles.deleteText}>Delete</Text>
                </PressableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.surface},
  flex: {flex: 1},
  content: {padding: 18, paddingBottom: 32},
  intro: {color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 14},
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {color: COLORS.text, fontSize: 19, fontWeight: '800'},
  field: {marginTop: 13},
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 13,
  },
  input: {
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  multilineInput: {minHeight: 78, textAlignVertical: 'top'},
  choiceRow: {flexDirection: 'row', gap: 8, marginTop: 2},
  choice: {
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  choiceActive: {backgroundColor: COLORS.primary, borderColor: COLORS.primary},
  choiceText: {color: COLORS.textSecondary, fontSize: 13, fontWeight: '600'},
  choiceTextActive: {color: COLORS.white},
  actions: {flexDirection: 'row', gap: 10, marginTop: 20},
  saveButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
    padding: 12,
  },
  disabledButton: {opacity: 0.65},
  saveButtonText: {color: COLORS.white, fontSize: 14, fontWeight: '700'},
  cancelButton: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cancelButtonText: {color: COLORS.textSecondary, fontWeight: '700'},
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  refreshText: {color: COLORS.primary, fontSize: 13, fontWeight: '700'},
  loader: {padding: 24},
  emptyText: {color: COLORS.textSecondary, paddingVertical: 18},
  listingRow: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 12,
  },
  listingCopy: {flex: 1, paddingRight: 8},
  listingTitle: {color: COLORS.text, fontSize: 13, fontWeight: '700'},
  listingLocation: {color: COLORS.textSecondary, fontSize: 11, marginTop: 4},
  localStatus: {color: COLORS.warning, fontSize: 10, fontWeight: '700', marginTop: 4},
  rowAction: {paddingHorizontal: 7, paddingVertical: 8},
  rowActionText: {color: COLORS.primary, fontSize: 12, fontWeight: '700'},
  deleteText: {color: COLORS.danger, fontSize: 12, fontWeight: '700'},
});
