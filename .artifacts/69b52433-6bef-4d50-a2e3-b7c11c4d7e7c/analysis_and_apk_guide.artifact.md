# Upright Solution - Code Audit, Fixes & APK Generation Guide

This document summarizes the issues identified in the project, the fixes applied, and the recommended steps to build the APK.

## Summary of Issues Found & Fixed

1. **TypeScript Compilation Errors (`src/lib/supabase.ts`)**
   - **Issue:** Imported non-existent members `SUPABASE_URL` and `SUPABASE_ANON_KEY` from `../config/supabase`.
   - **Fix:** Updated `src/lib/supabase.ts` to re-export `supabase` from `../config/supabase`.

2. **Unused Broken Legacy Screen (`src/screens/ExploreScreen.tsx`)**
   - **Issue:** Contained type errors (`onPress` argument mismatch and implicit `any` type) and React hooks rules violation (`setState` inside `useMemo`).
   - **Fix:** Removed unused `src/screens/ExploreScreen.tsx` as the app correctly uses `app/(tabs)/index.tsx` (`HomeScreen`).

3. **Routing Configuration (`app/index.tsx`)**
   - **Issue:** Pointed directly to the legacy `ExploreScreen` instead of the modern tab layout.
   - **Fix:** Updated `app/index.tsx` to redirect to `/(tabs)`.

> [!TIP]
> After these fixes, running `npm run typecheck` and `npm run lint` both pass cleanly with **0 errors and 0 warnings**.

---

## How to Build the APK

### Method 1: Using EAS Build (Recommended for Expo Apps)
EAS Build builds your APK in the cloud without needing local Android NDK/SDK/JDK configuration hassles.

1. Install EAS CLI (if not already installed):
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Run the preview build for Android (which generates an installable `.apk` file):
   ```bash
   eas build --platform android --profile preview
   ```
4. Once completed, EAS will provide a download link for your APK.

### Method 2: Local Android Build
If you want to build locally using Gradle:
1. Ensure a compatible JDK version (Java 17 or Java 21) is selected in Android Studio / environment (Gradle 8.x supports up to Java 24; Java 25 is currently active in your IDE).
2. Navigate to the `android` folder and run the Gradle wrapper:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
3. The resulting APK will be generated at:
   `android/app/build/outputs/apk/debug/app-debug.apk`
