import 'react-native-url-polyfill/auto';
import {createClient, SupabaseClient} from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && key);

// null when env vars are missing -> the app runs on built-in mock data.
export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(url as string, key as string, {
      auth: {autoRefreshToken: false, detectSessionInUrl: false, persistSession: false},
    })
  : null;
