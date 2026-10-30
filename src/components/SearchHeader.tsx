import React from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {COLORS, RADIUS} from '../theme';
import {PressableOpacity} from './PressableOpacity';

export const FILTERS = ['All', 'For Sale', 'For Rent', 'Plots'] as const;
export type Filter = (typeof FILTERS)[number];

/** Search input and property-type filters, rendered above the listings. */
export function SearchHeader({query, onQuery, filter, onFilter}: {
  query: string; onQuery: (q: string) => void; filter: Filter; onFilter: (f: Filter) => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.inputWrap}>
        <Ionicons name="search" size={18} color={COLORS.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder="Search in Karachi..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={onQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <PressableOpacity onPress={() => onQuery('')} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </PressableOpacity>
        )}
      </View>
      <Text style={styles.filterLabel}>Property Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills} keyboardShouldPersistTaps="handled">
        {FILTERS.map(f => {
          const active = f === filter;
          return (
            <PressableOpacity key={f} onPress={() => onFilter(f)} style={[styles.pill, {backgroundColor: active ? COLORS.primary : COLORS.surface}]}>
              <Text style={{color: active ? COLORS.white : COLORS.text, fontWeight: '600'}}>{f}</Text>
            </PressableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {backgroundColor: COLORS.white, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4},
  inputWrap: {flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 12},
  input: {flex: 1, fontSize: 15, color: COLORS.text, padding: 0},
  filterLabel: {fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginTop: 12},
  pills: {paddingTop: 8, paddingBottom: 10},
  pill: {paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.pill, marginRight: 8},
});
