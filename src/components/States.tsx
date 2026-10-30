import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {COLORS, RADIUS} from '../theme';
import {PressableOpacity} from './PressableOpacity';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function LoadingState({label = 'Loading properties…'}: {label?: string}) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.sub}>{label}</Text>
    </View>
  );
}

export function EmptyState({icon = 'home-outline', title, message, actionLabel, onAction}: {
  icon?: IconName; title: string; message?: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={48} color={COLORS.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.sub}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <PressableOpacity style={styles.btn} onPress={onAction}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </PressableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, minHeight: 260},
  title: {fontSize: 17, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginTop: 10},
  sub: {fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8},
  btn: {marginTop: 16, backgroundColor: COLORS.primary, paddingHorizontal: 22, paddingVertical: 12, borderRadius: RADIUS.md},
  btnText: {color: COLORS.white, fontWeight: '700'},
});
