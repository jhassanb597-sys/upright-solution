import React, {useEffect} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Image} from 'expo-image';
import {Ionicons} from '@expo/vector-icons';
import {Listing} from '../types';
import {COLORS, RADIUS} from '../theme';
import {formatPrice} from '../utils/currency';
import {prefetchImage} from '../utils/imageCache';
import {PressableOpacity} from './PressableOpacity';

type Props = {
  listing: Listing;
  saved: boolean;
  onPress: () => void;
  onToggleSaved: () => void;
};

export default function PropertyCard({listing, saved, onPress, onToggleSaved}: Props) {
  const imageUrl = listing.images?.[0];
  const isRent = listing.category === 'Rent';
  const priceNumber = typeof listing.price === 'number'
    ? listing.price
    : parseFloat(String(listing.price).replace(/[^0-9.]/g, '')) || 0;
  const monthlyPayment = calculateMonthlyPayment(priceNumber);

  useEffect(() => {
    if (imageUrl) prefetchImage(imageUrl);
  }, [imageUrl]);

  return (
    <Pressable
      style={({pressed}) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityLabel={`View ${listing.title}`}>
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{uri: imageUrl}} style={styles.image} contentFit="cover" cachePolicy="memory-disk" transition={150} />
        ) : (
          <View style={[styles.image, {backgroundColor: COLORS.surface}]} />
        )}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{listing.category === 'Buy' ? 'FOR SALE' : listing.category === 'Rent' ? 'FOR RENT' : 'PLOT'}</Text>
        </View>
        <PressableOpacity
          style={styles.heart}
          onPress={event => {
            event.stopPropagation();
            onToggleSaved();
          }}
          accessibilityLabel={saved ? 'Remove from favorites' : 'Add to favorites'}>
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? COLORS.primary : COLORS.textSecondary} />
        </PressableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.price}>{formatPrice(listing.price, isRent)}</Text>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <View style={styles.locRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>{listing.location}</Text>
        </View>
        <View style={styles.metaRow}>
          {listing.bedrooms > 0 && <Meta icon="bed-outline" label={`${listing.bedrooms}`} />}
          {listing.bathrooms > 0 && <Meta icon="water-outline" label={`${listing.bathrooms}`} />}
          <Meta icon="resize-outline" label={`${listing.area} ${listing.areaUnit ?? ''}`.trim()} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.monthly}>{isRent ? 'Rent' : 'EMI'}: {formatPrice(isRent ? priceNumber : monthlyPayment, true)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function calculateMonthlyPayment(price: number): number {
  if (!price) return 0;
  const monthlyRate = 0.12 / 12;
  const months = 20 * 12;
  const principal = price * 0.8;
  const growth = Math.pow(1 + monthlyRate, months);
  return Math.round((principal * monthlyRate * growth) / (growth - 1));
}

function Meta({icon, label}: {icon: React.ComponentProps<typeof Ionicons>['name']; label: string}) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={15} color={COLORS.textSecondary} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, margin: 8, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 3,
  },
  pressed: {opacity: 0.92},
  imageWrap: {width: '100%', aspectRatio: 16 / 9, backgroundColor: COLORS.surface},
  image: {width: '100%', height: '100%', borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg},
  badge: {position: 'absolute', left: 12, top: 12, backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6},
  badgeText: {color: COLORS.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.5},
  heart: {position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 6},
  content: {padding: 12},
  price: {fontSize: 18, fontWeight: '800', color: COLORS.text},
  title: {fontSize: 14, fontWeight: '600', color: COLORS.text, marginTop: 4},
  locRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 2},
  location: {fontSize: 12, color: COLORS.textSecondary, flexShrink: 1},
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10},
  meta: {flexDirection: 'row', alignItems: 'center', gap: 4},
  metaText: {fontSize: 12, color: COLORS.textSecondary, fontWeight: '600'},
  footer: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 9, borderTopWidth: 1, borderTopColor: COLORS.surface},
  monthly: {fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, flexShrink: 1},
});
