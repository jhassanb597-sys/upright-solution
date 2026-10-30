import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {BuilderProject} from '../data/builderProjects';
import {COLORS, RADIUS} from '../theme';
import {PressableOpacity} from './PressableOpacity';

export function BuilderProjectCard({project, onPress}: {project: BuilderProject; onPress: () => void}) {
  return (
    <PressableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrap}>
        <Ionicons name="business-outline" size={40} color={COLORS.primary} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>UNDER CONSTRUCTION</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{project.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.location} numberOfLines={2}>{project.location}</Text>
        </View>
        <Text style={styles.price}>{project.priceRange}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.meta}>{project.progress}% complete</Text>
          <Text style={styles.meta}>{project.availableUnits} units available</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressValue, {width: `${project.progress}%`}]} />
        </View>
      </View>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 260,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    margin: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  imageWrap: {width: '100%', aspectRatio: 16 / 9, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center'},
  badge: {position: 'absolute', left: 12, top: 12, backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6},
  badgeText: {color: COLORS.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.5},
  content: {padding: 12},
  title: {fontSize: 16, fontWeight: '700', color: COLORS.text},
  locationRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 3, marginTop: 5},
  location: {fontSize: 12, color: COLORS.textSecondary, flex: 1},
  price: {fontSize: 13, fontWeight: '700', color: COLORS.text, marginTop: 8},
  progressRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 10},
  meta: {fontSize: 11, fontWeight: '600', color: COLORS.textSecondary},
  progressTrack: {height: 5, backgroundColor: COLORS.surface, borderRadius: 3, overflow: 'hidden', marginTop: 6},
  progressValue: {height: '100%', backgroundColor: COLORS.primary, borderRadius: 3},
});
