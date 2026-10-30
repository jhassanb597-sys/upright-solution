import React from 'react';
import {StatusBar} from 'expo-status-bar';
import {Stack} from 'expo-router';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ErrorBoundary} from '../src/components/ErrorBoundary';
import {SavedListingsProvider} from '../src/state/SavedListingsContext';
import {COLORS} from '../src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SavedListingsProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerTintColor: COLORS.primary,
              headerTitleStyle: {color: COLORS.text},
              headerShadowVisible: false,
              contentStyle: {backgroundColor: COLORS.background},
            }}>
            <Stack.Screen name="(tabs)" options={{headerShown: false}} />
            <Stack.Screen name="property/[id]" options={{title: 'Property Details', headerBackTitle: 'Back'}} />
            <Stack.Screen name="project/[id]" options={{title: 'Builder Project Details', headerBackTitle: 'Back'}} />
            <Stack.Screen name="services/[slug]" options={{title: 'Service Details', headerBackTitle: 'Back'}} />
            <Stack.Screen name="contact" options={{title: 'Contact Us', headerBackTitle: 'Back'}} />
            <Stack.Screen name="admin" options={{title: 'Manage Listings'}} />
          </Stack>
        </SavedListingsProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
