import React from 'react';
import {ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {Image} from 'expo-image';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {SERVICES} from '../data/services';
import type {Service} from '../data/services';
import {COLORS, RADIUS} from '../theme';
import {openWhatsAppInquiry} from '../utils/whatsapp';
import {BusinessServiceCard} from '../components/BusinessServiceCard';
import {PressableOpacity} from '../components/PressableOpacity';
import {SafeAreaView} from 'react-native-safe-area-context';

const DEFAULT_IMAGE_URI =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&auto=format&fit=crop&q=85';

export function ServiceDetailsScreen({service}: {service?: Service}) {
  const router = useRouter();
  const {width} = useWindowDimensions();
  const wide = width >= 768;

  const [imageLoaded, setImageLoaded] = React.useState(true);
  const imageUri = service?.image ?? DEFAULT_IMAGE_URI;

  if (!service) {
    return (
      <SafeAreaView style={styles.notFound} edges={[]}>
        <Ionicons name="search-outline" size={40} color={COLORS.textMuted} />
        <Text style={styles.notFoundTitle}>Service not found</Text>
        <Text style={styles.body}>The service you are looking for may have moved.</Text>
        <PressableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.primaryButtonText}>Back to home</Text>
        </PressableOpacity>
      </SafeAreaView>
    );
  }

  const otherServices = SERVICES.filter(item => item.slug !== service.slug);
  const otherCardWidth = width >= 700 ? '33.333%' : '50%';
  const content = (
    <>
      <View style={styles.breadcrumb}>
        <PressableOpacity onPress={() => router.push('/(tabs)')}>
          <Text style={styles.breadcrumbLink}>Home</Text>
        </PressableOpacity>
        <Ionicons name="chevron-forward" size={13} color={COLORS.textMuted} />
        <Text style={styles.breadcrumbCurrent}>Services</Text>
        <Ionicons name="chevron-forward" size={13} color={COLORS.textMuted} />
        <Text style={styles.breadcrumbCurrent} numberOfLines={1}>{service.title}</Text>
      </View>

      <Image
        source={{uri: imageUri}}
        style={styles.heroImage}
        contentFit="cover"
        resizeMode="cover"
        transition={180}
      />

      {!wide && (
        <View style={styles.mobileContactSection}>
          <ContactPanel service={service} />
        </View>
      )}

      <View style={styles.heroCopy}>
        <Text style={styles.eyebrow}>UPRIGHT SMART SOLUTIONS AND ESTATE</Text>
        <Text style={styles.title}>{service.title}</Text>
        <Text style={styles.shortDesc}>{service.shortDesc}</Text>
        {service.fullDesc.split('\n\n').map((paragraph, index) => (
          <Text key={index} style={styles.body}>{paragraph}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What we can help with</Text>
        {service.features.map(feature => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={21} color={COLORS.primary} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.whySection}>
        <Text style={styles.sectionTitle}>Why choose Upright?</Text>
        <View style={styles.whyGrid}>
          <WhyItem icon="people-outline" title="Personal guidance" description="We take time to understand your goals and priorities." />
          <WhyItem icon="chatbubbles-outline" title="Clear communication" description="Practical answers and updates at every step." />
          <WhyItem icon="shield-checkmark-outline" title="A trusted partner" description="A team focused on helping you make informed decisions." />
        </View>
      </View>

      <View style={styles.otherSection}>
        <Text style={styles.sectionTitle}>Explore other services</Text>
        <View style={styles.otherGrid}>
          {otherServices.map(item => (
            <View key={item.slug} style={[styles.otherCard, {width: otherCardWidth}]}>
              <BusinessServiceCard
                service={item}
                onPress={() => router.push({pathname: '/services/[slug]', params: {slug: item.slug}})}
              />
            </View>
          ))}
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.page} edges={[]}>
      {wide ? (
        <View style={styles.wideLayout}>
          <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
            {content}
          </ScrollView>
          <View style={styles.sidebar}>
            <ContactPanel service={service} />
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.mobileContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ContactPanel({service}: {service: Service}) {
  const router = useRouter();

  return (
    <View style={styles.contactPanel}>
      <Text style={styles.panelEyebrow}>LET&apos;S TALK</Text>
      <Text style={styles.panelTitle}>Interested in {service.title.toLowerCase()}?</Text>
      <Text style={styles.panelBody}>Our team is ready to answer your questions and help you plan your next step.</Text>
      <PressableOpacity
        style={styles.whatsappButton}
        onPress={() => void openWhatsAppInquiry(service.whatsappMessage)}>
        <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
        <Text style={styles.whatsappText}>Chat on WhatsApp</Text>
      </PressableOpacity>
      <PressableOpacity
        style={styles.contactButton}
        onPress={() => router.push({pathname: '/contact', params: {service: service.slug}})}>
        <Text style={styles.contactButtonText}>Contact Us for More Info</Text>
      </PressableOpacity>
      <View style={styles.responseNote}>
        <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.responseText}>We’re here to help with your enquiry.</Text>
      </View>
    </View>
  );
}

function WhyItem({icon, title, description}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
}) {
  return (
    <View style={styles.whyCard}>
      <View style={styles.whyIcon}>
        <Ionicons name={icon} size={21} color={COLORS.primary} />
      </View>
      <Text style={styles.whyTitle}>{title}</Text>
      <Text style={styles.whyDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {flex: 1, backgroundColor: COLORS.background},
  wideLayout: {flex: 1, width: '100%', maxWidth: 1100, flexDirection: 'row', paddingHorizontal: 20},
  mainScroll: {flex: 1},
  mainContent: {paddingBottom: 40},
  mobileContent: {width: '100%', paddingHorizontal: 16, paddingBottom: 40},
  breadcrumb: {flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 16, paddingBottom: 16},
  breadcrumbLink: {fontSize: 13, color: COLORS.primary, fontWeight: '700'},
  breadcrumbCurrent: {fontSize: 13, color: COLORS.textSecondary, flexShrink: 1},
  heroImage: {width: '100%', aspectRatio: 16 / 9, maxHeight: 320, borderRadius: 20, backgroundColor: COLORS.surface},
  heroCopy: {paddingTop: 20},
  mobileContactSection: {paddingTop: 16},
  eyebrow: {fontSize: 11, fontWeight: '800', letterSpacing: 1.1, color: COLORS.primary},
  title: {fontSize: 28, lineHeight: 36, fontWeight: '800', color: COLORS.text, marginTop: 8},
  shortDesc: {fontSize: 16, lineHeight: 24, fontWeight: '600', color: COLORS.textSecondary, marginTop: 8, marginBottom: 14},
  body: {fontSize: 15, lineHeight: 24, color: COLORS.textSecondary, marginTop: 10},
  section: {marginTop: 24, padding: 20, backgroundColor: COLORS.white, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border},
  sectionTitle: {fontSize: 20, lineHeight: 26, fontWeight: '800', color: COLORS.text, marginBottom: 14},
  featureRow: {flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 8},
  featureText: {fontSize: 15, lineHeight: 22, color: COLORS.text, flex: 1},
  whySection: {marginTop: 26},
  whyGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  whyCard: {flex: 1, minWidth: 160, padding: 16, borderRadius: 18, backgroundColor: COLORS.surface},
  whyIcon: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.primarySoft},
  whyTitle: {fontSize: 15, fontWeight: '800', color: COLORS.text, marginTop: 12},
  whyDescription: {fontSize: 13, lineHeight: 19, color: COLORS.textSecondary, marginTop: 5},
  otherSection: {marginTop: 28},
  otherGrid: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 2, paddingBottom: 8},
  otherCard: {paddingHorizontal: 6, paddingBottom: 12},
  sidebar: {width: 310, paddingLeft: 24, paddingTop: 24},
  contactPanel: {padding: 20, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#111827', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: {width: 0, height: 8}, elevation: 4, marginTop: 16},
  panelEyebrow: {fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.primary},
  panelTitle: {fontSize: 18, lineHeight: 24, fontWeight: '800', color: COLORS.text, marginTop: 8},
  panelBody: {fontSize: 14, lineHeight: 20, color: COLORS.textSecondary, marginTop: 8, marginBottom: 16},
  whatsappButton: {minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#25D366', borderRadius: RADIUS.md, paddingHorizontal: 12},
  whatsappText: {fontSize: 14, fontWeight: '800', color: COLORS.white},
  contactButton: {minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 10, marginTop: 10},
  contactButtonText: {fontSize: 13, fontWeight: '800', color: COLORS.primary, textAlign: 'center'},
  responseNote: {flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14},
  responseText: {fontSize: 12, color: COLORS.textSecondary, flex: 1},
  notFound: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORS.background},
  notFoundTitle: {fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 12},
  primaryButton: {marginTop: 16, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 20, paddingVertical: 12},
  primaryButtonText: {fontSize: 14, fontWeight: '700', color: COLORS.white},
});
