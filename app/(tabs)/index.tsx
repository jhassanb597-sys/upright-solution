import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {useRouter} from 'expo-router';
import {ListingGrid, Page} from '../../src/components/ListingGrid';
import {BuilderProjectCard} from '../../src/components/BuilderProjectCard';
import {BusinessServiceCard} from '../../src/components/BusinessServiceCard';
import {PressableOpacity} from '../../src/components/PressableOpacity';
import {Filter, SearchHeader} from '../../src/components/SearchHeader';
import {EmptyState, LoadingState} from '../../src/components/States';
import {BUILDER_PROJECTS} from '../../src/data/builderProjects';
import {SERVICES} from '../../src/data/services';
import {useListings} from '../../src/hooks/useListings';
import {filterListings} from '../../src/utils/filterListings';
import {COLORS, RADIUS} from '../../src/theme';

const SERVICE_FILTERS = ['All Services', 'Builder Projects', 'Finance', 'Tax Help', 'Construction'] as const;
type ServiceFilter = (typeof SERVICE_FILTERS)[number];

export default function HomeScreen() {
  const router = useRouter();
  const {width} = useWindowDimensions();
  const {listings, loading, error, reload} = useListings();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('All Services');

  const data = useMemo(
    () => filterListings(listings, query, filter),
    [listings, query, filter],
  );
  const services = useMemo(() => {
    const serviceSlugs: Partial<Record<ServiceFilter, string>> = {
      'Builder Projects': 'builder-projects',
      Finance: 'finance',
      'Tax Help': 'tax-filing',
      Construction: 'construction',
    };
    const slug = serviceSlugs[serviceFilter];
    return slug ? SERVICES.filter(service => service.slug === slug) : SERVICES;
  }, [serviceFilter]);
  const cardWidth = width >= 700 ? '33.333%' : '50%';

  const listHeader = (
    <View>
      <View style={styles.serviceFilters}>
        <Text style={styles.filterLabel}>Services</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SERVICE_FILTERS.map(item => {
            const active = item === serviceFilter;
            return (
              <PressableOpacity
                key={item}
                onPress={() => setServiceFilter(item)}
                accessibilityState={{selected: active}}
                style={[styles.chip, {backgroundColor: active ? COLORS.primary : COLORS.surface}]}>
                <Text style={{fontSize: 13, fontWeight: '600', color: active ? COLORS.white : COLORS.text}}>{item}</Text>
              </PressableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <Text style={styles.section}>Top Properties in Karachi</Text>
      {serviceFilter === 'Builder Projects' && (
        <View style={styles.projectList}>
          {BUILDER_PROJECTS.map(project => (
            <BuilderProjectCard
              key={project.id}
              project={project}
              onPress={() => router.push({pathname: '/project/[id]', params: {id: project.id}})}
            />
          ))}
        </View>
      )}
    </View>
  );

  const serviceFooter = (
    <View style={styles.serviceSection}>
      <Text style={styles.serviceTitle}>Our Services</Text>
      <View style={styles.serviceCards}>
        {services.map(service => (
          <View key={service.slug} style={[styles.serviceCardSlot, {width: cardWidth}]}>
            <BusinessServiceCard
              service={service}
              onPress={() => router.push({pathname: '/services/[slug]', params: {slug: service.slug}})}
            />
          </View>
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
        ) : (
          <ListingGrid
            data={data}
            refreshing={loading}
            onRefresh={reload}
            header={listHeader}
            footer={serviceFooter}
            empty={<EmptyState icon="search-outline" title="No properties found" message="Try a different search or filter." actionLabel="Clear filters" onAction={() => {setQuery(''); setFilter('All'); setServiceFilter('All Services');}} />}
          />
        )}
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: COLORS.background},
  section: {fontSize: 18, fontWeight: '800', color: COLORS.text, marginHorizontal: 8, marginTop: 14, marginBottom: 4},
  filterLabel: {fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginHorizontal: 8, marginTop: 4},
  serviceFilters: {paddingTop: 6},
  chips: {paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4},
  chip: {paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill, marginRight: 8},
  projectList: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'},
  serviceSection: {paddingTop: 20, paddingBottom: 8},
  serviceTitle: {fontSize: 18, fontWeight: '800', color: COLORS.text, marginHorizontal: 8, marginBottom: 10},
  serviceCards: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 2, paddingBottom: 8},
  serviceCardSlot: {paddingHorizontal: 6, paddingBottom: 12},
});
