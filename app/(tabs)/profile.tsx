import React from 'react';
import {Linking, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {PressableOpacity} from '../../src/components/PressableOpacity';
import {OFFICE_CONTACTS} from '../../src/data/officeContacts';
import {useSavedListings} from '../../src/state/SavedListingsContext';
import {BRAND, COLORS, RADIUS, TAGLINE} from '../../src/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const {savedIds} = useSavedListings();
  return (
    <ScrollView style={{backgroundColor: COLORS.background}} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>US</Text></View>
        <Text style={styles.name}>{BRAND}</Text>
        <Text style={styles.tag}>{TAGLINE}</Text>
      </View>

      <PressableOpacity style={styles.row} onPress={() => router.push('/favorites')}>
        <View style={styles.rowLeft}>
          <Ionicons name="heart-outline" size={22} color={COLORS.text} />
          <Text style={styles.rowText}>Saved properties</Text>
        </View>
        <Text style={styles.rowValue}>{savedIds.length}</Text>
      </PressableOpacity>
      <PressableOpacity style={styles.row} onPress={() => router.push('/admin')}>
        <View style={styles.rowLeft}>
          <Ionicons name="construct-outline" size={22} color={COLORS.text} />
          <Text style={styles.rowText}>Manage listings</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </PressableOpacity>

      <Text style={styles.section}>Contact our offices</Text>
      {OFFICE_CONTACTS.map(c => (
        <View key={c.label} style={styles.contact}>
          <Text style={styles.rowText}>{c.label}</Text>
          <Text style={styles.phone}>{c.phoneNumber}</Text>
          <View style={styles.actions}>
            <PressableOpacity style={styles.btn} onPress={() => Linking.openURL(`tel:${c.phoneNumber}`).catch(() => {})}>
              <Ionicons name="call" size={16} color={COLORS.white} />
              <Text style={styles.btnText}>Call</Text>
            </PressableOpacity>
            <PressableOpacity style={styles.btn} onPress={() => Linking.openURL(`https://wa.me/${c.whatsappNumber}`).catch(() => {})}>
              <Ionicons name="logo-whatsapp" size={16} color={COLORS.white} />
              <Text style={styles.btnText}>WhatsApp</Text>
            </PressableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {padding: 16, width: '100%', maxWidth: 640, alignSelf: 'center'},
  card: {alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: {width: 0, height: 4}, elevation: 3},
  avatar: {width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: COLORS.white, fontSize: 24, fontWeight: '800'},
  name: {fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 12},
  tag: {fontSize: 13, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center'},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, padding: 16, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.surface, marginBottom: 10},
  rowLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
  rowText: {fontSize: 15, fontWeight: '600', color: COLORS.text},
  rowValue: {fontSize: 15, color: COLORS.textSecondary},
  section: {fontSize: 16, fontWeight: '800', color: COLORS.text, marginTop: 14, marginBottom: 10},
  contact: {backgroundColor: COLORS.card, padding: 16, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.surface, marginBottom: 10},
  phone: {fontSize: 13, color: COLORS.textSecondary, marginTop: 2},
  actions: {flexDirection: 'row', gap: 10, marginTop: 12},
  btn: {flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 11, borderRadius: RADIUS.md, backgroundColor: COLORS.primary},
  btnText: {color: COLORS.white, fontWeight: '700'},
});
