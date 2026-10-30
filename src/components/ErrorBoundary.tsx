import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {COLORS, RADIUS} from '../theme';
import {PressableOpacity} from './PressableOpacity';

type State = {error: Error | null};

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, State> {
  state: State = {error: null};
  static getDerivedStateFromError(error: Error): State {
    return {error};
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.wrap}>
        <Ionicons name="alert-circle-outline" size={56} color={COLORS.primary} />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.msg}>Please try again. If the problem continues, restart the app.</Text>
        <PressableOpacity style={styles.btn} onPress={() => this.setState({error: null})}>
          <Text style={styles.btnText}>Try again</Text>
        </PressableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background},
  title: {fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 12},
  msg: {fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8},
  btn: {marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: RADIUS.md},
  btnText: {color: COLORS.white, fontWeight: '700'},
});
