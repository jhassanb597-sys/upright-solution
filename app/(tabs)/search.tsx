import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ListingGrid, Page} from '../../src/components/ListingGrid';
import {PressableOpacity} from '../../src/components/PressableOpacity';
import {Filter, SearchHeader} from '../../src/components/SearchHeader';
import {EmptyState, LoadingState} from '../../src/components/States';
import {useListings} from '../../src/hooks/useListings';
import {filterListings} from '../../src/utils/filterListings';
import {COLORS, RADIUS} from '../../src/theme';

export default function SearchScreen() {
  const {listings, loading, error, reload} = useListings();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [view, setView] = useState<'list' | 'map'>('list');
  const data = useMemo(() => filterListings(listings, query, filter), [listings, query, filter]);

  const toggle = (
    <View style={styles.toggleRow}>
      <Text style={styles.count}>{data.length} {data.length === 1 ? 'property' : 'properties'}</Text>
      <View style={styles.toggle}>
        {(['list', 'map'] as const).map(v => (
          <PressableOpacity key={v} onPress={() => setView(v)} style={[styles.toggleBtn, view === v && styles.toggleActive]}>
            <Ionicons name={v === 'list' ? 'list' : 'map'} size={16} color={view === v ? COLORS.white : COLORS.textSecondary} />
            <Text style={[styles.toggleText, view === v && {color: COLORS.white}]}>{v === 'list' ? 'List' : 'Map'}</Text>
          </PressableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <Page>
        <SearchHeader query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} />
        {loading ? (
          <LoadingState />
        ) : error ? (
          <EmptyState icon="cloud-offline-outline" title="Something went wrong" message={error} actionLabel="Retry" onAction={reload} />
        ) : view === 'map' ? (
          <View style={{flex: 1}}>
            {toggle}
            <View style={styles.mapBox}>
              <Ionicons name="map-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.mapText}>Map View Coming Soon - Premium feature</Text>
            </View>
          </View>
        ) : (
          <ListingGrid
            data={data}
            header={toggle}
            empty={<EmptyState icon="search-outline" title="No matches" message="Try another area or clear the filters." actionLabel="Clear" onAction={() => {setQuery(''); setFilter('All');}} />}
          />
        )}
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: COLORS.background},
  toggleRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12},
  count: {color: COLORS.textSecondary, fontSize: 13, fontWeight: '600'},
  toggle: {flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.pill, padding: 3},
  toggleBtn: {flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.pill},
  toggleActive: {backgroundColor: COLORS.primary},
  toggleText: {fontSize: 13, fontWeight: '600', color: COLORS.textSecondary},
  mapBox: {flex: 1, margin: 8, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', minHeight: 300},
  mapText: {marginTop: 10, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center', paddingHorizontal: 20},
});
