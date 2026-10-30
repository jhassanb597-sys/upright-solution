import React, {useMemo, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Image} from 'expo-image';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {PressableOpacity} from '../components/PressableOpacity';
import {EmptyState} from '../components/States';
import {OFFICE_CONTACTS} from '../data/officeContacts';
import {useSavedListings} from '../state/SavedListingsContext';
import {Listing} from '../types';
import {COLORS, RADIUS} from '../theme';
import {formatPrice} from '../utils/currency';
import {prefetchImages} from '../utils/imageCache';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ANNUAL_RATE = 0.12;
const LOAN_YEARS = 20;

const AMENITIES: {icon: IconName; title: string; detail: string}[] = [
  {icon: 'school-outline', title: 'Schools', detail: '5 min away'},
  {icon: 'medkit-outline', title: 'Hospitals', detail: '10 min away'},
  {icon: 'cart-outline', title: 'Markets', detail: '3 min away'},
];

export function ListingDetailsScreen({listing}: {listing?: Listing}) {
  const router = useRouter();
  const {isSaved, toggleSaved} = useSavedListings();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);
  const [downPct, setDownPct] = useState(20);
  const listRef = useRef<FlatList<string>>(null);

  const images = useMemo(() => {
    const imgs = listing?.images?.filter(Boolean) ?? [];
    return imgs.length ? imgs : [];
  }, [listing]);

  React.useEffect(() => {
    prefetchImages(images);
  }, [images]);

  const isRent = listing?.category === 'Rent';
  const priceNum = useMemo(() => {
    if (!listing) return 0;
    return typeof listing.price === 'number' ? listing.price : parseFloat(String(listing.price).replace(/[^0-9.]/g, '')) || 0;
  }, [listing]);

  const monthly = useMemo(() => {
    const principal = priceNum * (1 - downPct / 100);
    const r = ANNUAL_RATE / 12;
    const n = LOAN_YEARS * 12;
    const g = Math.pow(1 + r, n);
    return (principal * r * g) / (g - 1);
  }, [priceNum, downPct]);

  if (!listing) {
    return (
      <EmptyState
        icon="home-outline"
        title="This property is no longer available"
        message="Head back to browse current homes in Karachi."
        actionLabel="Back to listings"
        onAction={() => router.replace('/')}
      />
    );
  }

  const saved = isSaved(listing.id);

  const open = async (url: string, label: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(`${label} unavailable`, `This device can't open ${label.toLowerCase()}.`);
    }
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) setActive(Math.round(e.nativeEvent.contentOffset.x / width));
  };
  const goTo = (i: number) => {
    setActive(i);
    listRef.current?.scrollToIndex({index: i, animated: true});
  };

  const whatsappText = [
    'Upright Solution enquiry',
    `Property: ${listing.title}`,
    `Location: ${listing.location}`,
    `Price: ${formatPrice(listing.price, isRent)}`,
  ].join('\n');

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 32}}>
      {/* Carousel */}
      <View onLayout={e => setWidth(e.nativeEvent.layout.width)} style={styles.carousel}>
        {width > 0 && images.length > 0 ? (
          <FlatList
            ref={listRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(u, i) => `${u}-${i}`}
            onMomentumScrollEnd={onScrollEnd}
            getItemLayout={(_, index) => ({length: width, offset: width * index, index})}
            renderItem={({item, index}) => (
              <Image
                source={{uri: item}}
                style={{width, aspectRatio: 4 / 3}}
                contentFit="cover"
                cachePolicy="memory-disk"
                accessibilityLabel={`${listing.title}, photo ${index + 1}`}
              />
            )}
          />
        ) : (
          <View style={[styles.noPhoto]}>
            <Ionicons name="image-outline" size={48} color={COLORS.textMuted} />
          </View>
        )}
        <PressableOpacity
          style={styles.fav}
          onPress={() => toggleSaved(listing.id)}
          accessibilityLabel={saved ? 'Remove from favorites' : 'Add to favorites'}>
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={22} color={saved ? COLORS.primary : COLORS.textSecondary} />
        </PressableOpacity>
      </View>

      {images.length > 1 && (
        <>
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === active ? styles.dotActive : styles.dotIdle]} />
            ))}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
            {images.map((uri, i) => (
              <PressableOpacity key={`${uri}-${i}`} onPress={() => goTo(i)} style={[styles.thumb, i === active && styles.thumbActive]}>
                <Image source={{uri}} style={styles.thumbImg} contentFit="cover" cachePolicy="memory-disk" />
              </PressableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <View style={styles.pad}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(listing.price, isRent)}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{listing.category === 'Buy' ? 'FOR SALE' : listing.category === 'Rent' ? 'FOR RENT' : 'PLOT'}</Text>
          </View>
        </View>
        <Text style={styles.title}>{listing.title}</Text>
        <View style={styles.locRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.location}>{listing.location}</Text>
        </View>

        <View style={styles.metaRow}>
          {listing.bedrooms > 0 && <MetaCard icon="bed-outline" value={`${listing.bedrooms}`} label="Beds" />}
          {listing.bathrooms > 0 && <MetaCard icon="water-outline" value={`${listing.bathrooms}`} label="Baths" />}
          <MetaCard icon="resize-outline" value={`${listing.area}`} label={listing.areaUnit ?? 'Area'} />
        </View>

        <Text style={styles.sectionTitle}>About this property</Text>
        <Text style={styles.body}>{listing.description}</Text>

        {!isRent && priceNum > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Ionicons name="calculator-outline" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Mortgage calculator</Text>
            </View>
            <Text style={styles.estimate}>{formatPrice(Math.round(monthly), true)}</Text>
            <Text style={styles.muted}>{Math.round(ANNUAL_RATE * 100)}% annual rate · {LOAN_YEARS} years · {downPct}% down</Text>
            <View style={styles.stepRow}>
              <Text style={styles.stepLabel}>Down payment</Text>
              <View style={styles.stepControls}>
                <PressableOpacity disabled={downPct <= 10} onPress={() => setDownPct(p => Math.max(10, p - 5))} style={styles.stepBtn} accessibilityLabel="Decrease down payment">
                  <Ionicons name="remove" size={18} color={COLORS.primary} />
                </PressableOpacity>
                <Text style={styles.stepValue}>{downPct}%</Text>
                <PressableOpacity disabled={downPct >= 50} onPress={() => setDownPct(p => Math.min(50, p + 5))} style={styles.stepBtn} accessibilityLabel="Increase down payment">
                  <Ionicons name="add" size={18} color={COLORS.primary} />
                </PressableOpacity>
              </View>
            </View>
            <Text style={styles.disclaimer}>Illustrative estimate only, not a financing offer. Bank rates, fees and eligibility vary.</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Ionicons name="navigate-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Nearby amenities</Text>
          </View>
          {AMENITIES.map(a => (
            <View key={a.title} style={styles.amenity}>
              <View style={styles.amenityIcon}>
                <Ionicons name={a.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.amenityTitle}>{a.title}</Text>
              <Text style={styles.muted}>{a.detail}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Ionicons name="person-circle-outline" size={22} color={COLORS.primary} />
            <Text style={styles.cardTitle}>{listing.agent?.name || 'Upright Solution Office'}</Text>
          </View>
          <Text style={styles.muted}>Call or chat with our Karachi office about this property.</Text>
          {OFFICE_CONTACTS.map(o => (
            <View key={o.whatsappNumber} style={styles.office}>
              <View>
                <Text style={styles.officeName}>{o.label}</Text>
                <Text style={styles.muted}>{o.phoneNumber}</Text>
              </View>
              <View style={styles.officeBtns}>
                <PressableOpacity style={styles.redBtn} onPress={() => open(`tel:${o.phoneNumber}`, 'Phone calls')} accessibilityLabel={`Call ${o.label}`}>
                  <Ionicons name="call" size={16} color={COLORS.white} />
                  <Text style={styles.redBtnText}>Call</Text>
                </PressableOpacity>
                <PressableOpacity
                  style={styles.redBtn}
                  onPress={() => open(`https://wa.me/${o.whatsappNumber}?text=${encodeURIComponent(whatsappText)}`, 'WhatsApp')}
                  accessibilityLabel={`Chat with ${o.label}`}>
                  <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.white} />
                  <Text style={styles.redBtnText}>Chat</Text>
                </PressableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function MetaCard({icon, value, label}: {icon: IconName; value: string; label: string}) {
  return (
    <View style={styles.metaCard}>
      <Ionicons name={icon} size={22} color={COLORS.primary} />
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const shadow = {shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 3} as const;

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: COLORS.background},
  carousel: {width: '100%', backgroundColor: COLORS.surface},
  noPhoto: {width: '100%', aspectRatio: 4 / 3, alignItems: 'center', justifyContent: 'center'},
  fav: {position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 22, padding: 8},
  dots: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12},
  dot: {height: 8, borderRadius: 4},
  dotActive: {width: 20, backgroundColor: COLORS.primary},
  dotIdle: {width: 8, backgroundColor: COLORS.border},
  thumbs: {paddingHorizontal: 16, paddingTop: 12, gap: 8},
  thumb: {width: 64, height: 48, borderRadius: RADIUS.sm, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent'},
  thumbActive: {borderColor: COLORS.primary},
  thumbImg: {width: '100%', height: '100%'},
  pad: {padding: 16},
  priceRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  price: {fontSize: 26, fontWeight: '800', color: COLORS.text},
  badge: {backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6},
  badgeText: {color: COLORS.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.5},
  title: {fontSize: 17, fontWeight: '600', color: COLORS.text, marginTop: 6},
  locRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6},
  location: {fontSize: 14, color: COLORS.textSecondary, flexShrink: 1},
  metaRow: {flexDirection: 'row', gap: 10, marginTop: 16},
  metaCard: {flex: 1, alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.surface, paddingVertical: 14},
  metaValue: {fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 6},
  metaLabel: {fontSize: 12, color: COLORS.textSecondary, marginTop: 2},
  sectionTitle: {fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 22, marginBottom: 8},
  body: {fontSize: 15, lineHeight: 22, color: COLORS.textSecondary},
  card: {backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 16, marginTop: 18, ...shadow},
  cardHead: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8},
  cardTitle: {fontSize: 16, fontWeight: '800', color: COLORS.text, flexShrink: 1},
  estimate: {fontSize: 24, fontWeight: '800', color: COLORS.primary, marginTop: 4},
  muted: {fontSize: 13, color: COLORS.textSecondary, marginTop: 2},
  stepRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14},
  stepLabel: {fontSize: 14, fontWeight: '600', color: COLORS.text},
  stepControls: {flexDirection: 'row', alignItems: 'center', gap: 12},
  stepBtn: {width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center'},
  stepValue: {minWidth: 40, textAlign: 'center', fontWeight: '800', color: COLORS.text},
  disclaimer: {fontSize: 11, color: COLORS.textMuted, marginTop: 12},
  amenity: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8},
  amenityIcon: {width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center'},
  amenityTitle: {flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text},
  office: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.surface},
  officeName: {fontSize: 14, fontWeight: '700', color: COLORS.text},
  officeBtns: {flexDirection: 'row', gap: 8},
  redBtn: {flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md},
  redBtnText: {color: COLORS.white, fontWeight: '700'},
});
