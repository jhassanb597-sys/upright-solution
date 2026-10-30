import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import type {Service} from '../data/services';
import {COLORS} from '../theme';

export function BusinessServiceCard({service, onPress}: {service: Service; onPress: () => void}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      style={({pressed}) => [styles.card, (hovered || pressed) && styles.hovered]}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="link"
      accessibilityLabel={`View ${service.title} service`}>
      <View style={styles.iconWrap}>
        <Ionicons name={service.icon} size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{service.title}</Text>
      <Text style={styles.description} numberOfLines={3}>{service.shortDesc}</Text>
      <View style={styles.action}>
        <Text style={styles.actionText}>Enquire Now</Text>
        <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 190,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  hovered: {transform: [{translateY: -4}], shadowOpacity: 0.18, shadowRadius: 20, elevation: 8},
  iconWrap: {width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 16, fontWeight: '800', color: COLORS.text, marginTop: 14},
  description: {fontSize: 13, lineHeight: 19, color: COLORS.textSecondary, marginTop: 6},
  action: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 'auto', paddingTop: 12},
  actionText: {fontSize: 13, fontWeight: '700', color: COLORS.primary},
});
