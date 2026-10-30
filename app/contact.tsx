import React from 'react';
import {Alert, Linking, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useLocalSearchParams} from 'expo-router';
import {OFFICE_CONTACTS} from '../src/data/officeContacts';
import {getServiceBySlug} from '../src/data/services';
import {COLORS, RADIUS} from '../src/theme';
import {PressableOpacity} from '../src/components/PressableOpacity';

export default function ContactRoute() {
  const {service: serviceParam} = useLocalSearchParams<{service?: string}>();
  const serviceSlug = Array.isArray(serviceParam) ? serviceParam[0] : serviceParam;
  const service = serviceSlug ? getServiceBySlug(serviceSlug) : undefined;

  const callOffice = async (phoneNumber: string) => {
    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch {
      Alert.alert('Unable to start call', 'Please try calling the office number from your phone.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="chatbubbles-outline" size={26} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Contact Upright</Text>
        <Text style={styles.description}>
          {service
            ? `Let us know how we can help with ${service.title.toLowerCase()}. Call our team and we’ll be happy to answer your questions.`
            : 'Call our team and we’ll be happy to answer your questions.'}
        </Text>
        {service ? (
          <View style={styles.serviceBadge}>
            <Text style={styles.serviceBadgeText}>Enquiry: {service.title}</Text>
          </View>
        ) : null}
        <View style={styles.contacts}>
          {OFFICE_CONTACTS.map(contact => (
            <View key={contact.phoneNumber} style={styles.contactRow}>
              <View style={styles.phoneIcon}>
                <Ionicons name="call-outline" size={19} color={COLORS.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.officeLabel}>{contact.label}</Text>
                <Text style={styles.phoneNumber}>{contact.phoneNumber}</Text>
              </View>
              <PressableOpacity style={styles.callButton} onPress={() => void callOffice(contact.phoneNumber)}>
                <Text style={styles.callButtonText}>Call</Text>
              </PressableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 22, backgroundColor: COLORS.background},
  card: {width: '100%', maxWidth: 620, padding: 28, borderRadius: 22, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border},
  iconWrap: {width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primarySoft},
  title: {fontSize: 28, fontWeight: '800', color: COLORS.text, marginTop: 18},
  description: {fontSize: 15, lineHeight: 23, color: COLORS.textSecondary, marginTop: 8},
  serviceBadge: {alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.pill, backgroundColor: COLORS.surface, marginTop: 16},
  serviceBadgeText: {fontSize: 13, fontWeight: '700', color: COLORS.text},
  contacts: {marginTop: 25, gap: 12},
  contactRow: {flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 16, backgroundColor: COLORS.surface},
  phoneIcon: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.white},
  contactInfo: {flex: 1, marginLeft: 11},
  officeLabel: {fontSize: 12, color: COLORS.textSecondary},
  phoneNumber: {fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 3},
  callButton: {paddingHorizontal: 18, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: RADIUS.md},
  callButtonText: {fontSize: 13, fontWeight: '700', color: COLORS.white},
});
