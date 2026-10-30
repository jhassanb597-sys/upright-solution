import {useCallback, useEffect, useState} from 'react';
import {fetchListings} from '../services/listingService';
import {Listing} from '../types';

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchListings({category: 'All', query: ''})
      .then(data => {
        if (!cancelled) setListings(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load properties. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setListings(await fetchListings({category: 'All', query: ''}));
    } catch {
      setError('Could not load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {listings, loading, error, reload};
}
