import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Image as ExpoImage} from 'expo-image';
import {Ionicons} from '@expo/vector-icons';
import {BuilderProject, FLOOR_PLAN_IMAGE_SOURCES} from '../data/builderProjects';
import {COLORS, RADIUS} from '../theme';
import {openWhatsAppInquiry} from '../utils/whatsapp';
import {PressableOpacity} from '../components/PressableOpacity';
import {EmptyState} from '../components/States';

export function BuilderProjectDetailsScreen({project}: {project?: BuilderProject}) {
  if (!project) {
    return (
      <EmptyState
        icon="business-outline"
        title="Project details unavailable"
        message="Return to the home page to browse current builder projects."
      />
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Ionicons name="business-outline" size={52} color={COLORS.primary} />
        <View style={styles.stageBadge}>
          <Text style={styles.stageText}>{project.progressStage}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>{project.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.location}>{project.location}</Text>
        </View>

        <Text style={styles.sectionTitle}>Construction progress</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressValue}>{project.progress}%</Text>
          <Text style={styles.secondary}>{project.progressStage}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${project.progress}%`}]} />
        </View>

        <Text style={styles.sectionTitle}>Available units</Text>
        <View style={styles.unitsRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{project.availableUnits}</Text>
            <Text style={styles.infoLabel}>Available flats</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{project.totalUnits}</Text>
            <Text style={styles.infoLabel}>Total flats</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeading}>
            <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Price range</Text>
          </View>
          <Text style={styles.body}>{project.priceRange}</Text>
          {project.startingEmi ? <Text style={styles.body}>EMI starts from {project.startingEmi}</Text> : null}
        </View>

        <Text style={styles.sectionTitle}>Floor plans</Text>
        <View style={styles.floorPlans}>
          {project.floorPlans.map(plan => {
            const source = FLOOR_PLAN_IMAGE_SOURCES[plan.assetPath];
            return (
              <View key={plan.assetPath} style={styles.floorPlanCard}>
                {source ? (
                  <ExpoImage source={source} style={styles.floorPlanImage} contentFit="contain" />
                ) : (
                  <View style={styles.floorPlanPlaceholder}>
                    <Ionicons name="grid-outline" size={30} color={COLORS.primary} />
                    <Text style={styles.floorPlanPlaceholderText}>Floor Plan Coming Soon</Text>
                  </View>
                )}
                <Text style={styles.floorPlanType}>{plan.unitType}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeading}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Payment plan</Text>
          </View>
          <Text style={styles.body}>{project.paymentPlan}</Text>
          {project.cashDiscount ? <Text style={styles.body}>{project.cashDiscount}</Text> : null}
          <PressableOpacity
            style={styles.paymentButton}
            onPress={() => void openWhatsAppInquiry(`I would like to know more about the payment plan for ${project.name}.`)}
          >
            <Ionicons name="logo-whatsapp" size={18} color={COLORS.white} />
            <Text style={styles.paymentButtonText}>Ask About Payment Plan</Text>
          </PressableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.features}>
          {project.features.map(feature => (
            <View key={feature} style={styles.feature}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const shadow = {shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 3} as const;

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: COLORS.background},
  content: {paddingBottom: 28, width: '100%', maxWidth: 720, alignSelf: 'center'},
  hero: {width: '100%', aspectRatio: 16 / 9, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center'},
  stageBadge: {position: 'absolute', left: 16, top: 16, backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6},
  stageText: {fontSize: 11, fontWeight: '800', color: COLORS.white},
  section: {padding: 16},
  title: {fontSize: 24, fontWeight: '800', color: COLORS.text},
  locationRow: {flexDirection: 'row', gap: 5, alignItems: 'flex-start', marginTop: 7},
  location: {flex: 1, fontSize: 14, lineHeight: 20, color: COLORS.textSecondary},
  sectionTitle: {fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 22, marginBottom: 10},
  progressRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  progressValue: {fontSize: 18, fontWeight: '800', color: COLORS.primary},
  secondary: {fontSize: 13, color: COLORS.textSecondary},
  progressTrack: {height: 8, backgroundColor: COLORS.surface, borderRadius: 4, overflow: 'hidden', marginTop: 8},
  progressFill: {height: '100%', backgroundColor: COLORS.primary, borderRadius: 4},
  unitsRow: {flexDirection: 'row', gap: 10},
  infoCard: {flex: 1, alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.surface, paddingVertical: 14},
  infoValue: {fontSize: 20, fontWeight: '800', color: COLORS.text},
  infoLabel: {fontSize: 12, color: COLORS.textSecondary, marginTop: 3},
  card: {backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 16, marginTop: 18, ...shadow},
  cardHeading: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8},
  cardTitle: {fontSize: 16, fontWeight: '800', color: COLORS.text},
  body: {fontSize: 14, lineHeight: 21, color: COLORS.textSecondary, marginTop: 3},
  floorPlans: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  floorPlanCard: {flex: 1, minWidth: 220, overflow: 'hidden', borderRadius: RADIUS.md, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.surface},
  floorPlanImage: {width: '100%', aspectRatio: 4 / 3, backgroundColor: COLORS.surface},
  floorPlanPlaceholder: {width: '100%', aspectRatio: 4 / 3, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primarySoft},
  floorPlanPlaceholderText: {fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginTop: 8},
  floorPlanType: {fontSize: 13, fontWeight: '700', color: COLORS.text, textAlign: 'center', paddingVertical: 8},
  paymentButton: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: RADIUS.md, marginTop: 14},
  paymentButtonText: {fontSize: 14, fontWeight: '700', color: COLORS.white},
  features: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  feature: {flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.surface, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 7},
  featureText: {fontSize: 12, fontWeight: '600', color: COLORS.text},
});
