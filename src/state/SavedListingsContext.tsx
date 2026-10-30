import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedListingsValue {
  savedIds: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const KEY = '@upright/saved-ids-v1';
const SavedListingsContext = createContext<SavedListingsValue | null>(null);

export function SavedListingsProvider({children}: {children: React.ReactNode}) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setSavedIds(parsed.filter(x => typeof x === 'string'));
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(KEY, JSON.stringify(savedIds)).catch(() => {});
  }, [savedIds, hydrated]);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds(cur => (cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]));
  }, []);
  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  return (
    <SavedListingsContext.Provider value={{savedIds, toggleSaved, isSaved}}>
      {children}
    </SavedListingsContext.Provider>
  );
}

export function useSavedListings() {
  const ctx = useContext(SavedListingsContext);
  if (!ctx) throw new Error('useSavedListings must be used inside SavedListingsProvider.');
  return ctx;
}
