import React, {useCallback} from 'react';
import {FlatList, StyleSheet, useWindowDimensions, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Listing} from '../types';
import {useSavedListings} from '../state/SavedListingsContext';
import {COLORS} from '../theme';
import PropertyCard from './PropertyCard';

/** Responsive grid of property cards: 1 column on phones, 2 on tablets, 3 on wide web. */
export function ListingGrid({data, header, footer, empty, refreshing, onRefresh}: {
  data: Listing[];
  header?: React.ReactElement;
  footer?: React.ReactElement;
  empty?: React.ReactElement;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const {width} = useWindowDimensions();
  const {savedIds, toggleSaved} = useSavedListings();
  const numColumns = width >= 1000 ? 3 : width >= 600 ? 2 : 1;

  const renderItem = useCallback(
    ({item}: {item: Listing}) => (
      <PropertyCard
        listing={item}
        saved={savedIds.includes(item.id)}
        onToggleSaved={() => toggleSaved(item.id)}
        onPress={() => router.push({pathname: '/property/[id]', params: {id: item.id}})}
      />
    ),
    [router, savedIds, toggleSaved],
  );

  return (
    <FlatList
      key={`cols-${numColumns}`}
      data={data}
      numColumns={numColumns}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={empty}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
    />
  );
}

export function Page({children}: {children: React.ReactNode}) {
  return (
    <View style={styles.page}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {paddingHorizontal: 8, paddingBottom: 24, flexGrow: 1},
  page: {flex: 1, alignItems: 'center', backgroundColor: COLORS.background},
  inner: {flex: 1, width: '100%', maxWidth: 1100},
});
