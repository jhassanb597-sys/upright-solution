import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useRouter} from 'expo-router';
import {ListingGrid, Page} from '../../src/components/ListingGrid';
import {EmptyState, LoadingState} from '../../src/components/States';
import {useListings} from '../../src/hooks/useListings';
import {useSavedListings} from '../../src/state/SavedListingsContext';
import {COLORS} from '../../src/theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const {listings, loading} = useListings();
  const {savedIds} = useSavedListings();
  const data = useMemo(() => listings.filter(l => savedIds.includes(l.id)), [listings, savedIds]);

  return (
    <View style={styles.root}>
      <Page>
        {loading ? (
          <LoadingState />
        ) : (
          <ListingGrid
            data={data}
            header={<Text style={styles.title}>Saved properties</Text>}
            empty={<EmptyState icon="heart-outline" title="No favorites yet" message="Tap the heart on any property to save it here." actionLabel="Browse properties" onAction={() => router.push('/')} />}
          />
        )}
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: COLORS.background},
  title: {fontSize: 20, fontWeight: '800', color: COLORS.text, margin: 12},
});
