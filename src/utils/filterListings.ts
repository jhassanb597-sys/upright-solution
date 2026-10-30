import {Listing} from '../types';
import type {Filter} from '../components/SearchHeader';

export function filterListings(source: Listing[], query: string, filter: Filter): Listing[] {
  const q = query.trim().toLowerCase();
  return (source || []).filter(l => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'For Sale' && l.category === 'Buy') ||
      (filter === 'For Rent' && l.category === 'Rent') ||
      (filter === 'Plots' && l.category === 'Plot');
    const matchesQuery =
      !q || `${l.title} ${l.location} ${l.neighborhood}`.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });
}
