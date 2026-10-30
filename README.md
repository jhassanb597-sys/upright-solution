# Upright Solution

**Upright Solution - Karachi Real Estate Made Easy**

Expo (SDK 58) + React Native + expo-router app for browsing Karachi property listings.

## Run

```bash
npm install
npx expo start --web --clear   # web  (or: npm run web)
npx expo start --clear         # scan the QR code with Expo Go on Android
```

## Data

Copy `.env.example` to `.env` and fill in `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_ANON_KEY`. If they are missing, or Supabase is unreachable, the
app falls back to 8 built-in Karachi sample properties (`src/data/listings.ts`).

## Android

Package: `com.uprightsolution.app`. See `SIGNING.md` for release signing.
