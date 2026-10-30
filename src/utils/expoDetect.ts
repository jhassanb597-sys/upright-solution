import {Platform} from 'react-native';

export const IS_EXPO_GO =
  typeof globalThis !== 'undefined' &&
  (globalThis as any).process &&
  typeof (globalThis as any).process.env === 'object' &&
  typeof (globalThis as any).process.env.EXPO_PUBLIC_SUPABASE_URL === 'string' &&
  Platform.OS !== 'web';
