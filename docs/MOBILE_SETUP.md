# Mobile App Setup & Troubleshooting

HELPDESK.AI mobile is an **Expo SDK 54** React Native app under `MobileApp/`. This guide covers local setup, emulator/device testing, and common fixes for GSSoC contributors.

## Prerequisites

- **Node.js 18+** and npm
- **Expo CLI** (via `npx expo`; no global install required)
- **Android Studio** (Android emulator + USB debugging) — Windows, macOS, Linux
- **Xcode** (iOS Simulator) — macOS only
- Supabase project credentials (see `.env` below)

## 1. Local setup

```bash
git clone https://github.com/ritesh-1918/HELPDESK.AI.git
cd HELPDESK.AI/MobileApp
npm install
```

Create `MobileApp/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the Metro bundler and Expo dev server:

```bash
npx expo start
```

From the Expo terminal UI:

- Press **`a`** — open on Android emulator or connected device
- Press **`i`** — open on iOS Simulator (macOS)
- Scan the QR code with **Expo Go** on a physical device (same Wi‑Fi)

For a clean cache after dependency or config changes:

```bash
npx expo start -c
```

## 2. Android emulator & USB debugging

### Android Virtual Device (AVD)

1. Install [Android Studio](https://developer.android.com/studio).
2. Open **Device Manager** → **Create Device** → pick a phone profile (e.g. Pixel 7).
3. Download a system image (API 34+ recommended) and finish the wizard.
4. Start the AVD, then run `npx expo start` and press **`a`**.

### Physical Android device

1. Enable **Developer options** → **USB debugging** on the device.
2. Connect via USB; accept the debugging prompt.
3. Verify: `adb devices` should list your device.
4. Run `npx expo start` and press **`a`**, or use **Expo Go** and scan the QR code.

### KeyboardAvoidingView (Android)

If inputs sit under the keyboard, use platform-specific offset (see `ProfileScreen.js`):

```javascript
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'android' ? -100 : 0}
>
  {/* form content */}
</KeyboardAvoidingView>
```

## 3. iOS Simulator (macOS)

1. Install Xcode from the App Store.
2. Open Xcode once to accept licenses and install components.
3. Start Simulator: **Xcode → Open Developer Tool → Simulator**, or `open -a Simulator`.
4. Run `npx expo start` and press **`i`**.

For native iOS builds (not Expo Go):

```bash
npx expo run:ios
```

If CocoaPods fail:

```bash
cd ios && pod install --repo-update && cd ..
```

## 4. Common Expo troubleshooting

| Problem | Fix |
|--------|-----|
| Stale Metro cache / weird bundler errors | `npx expo start -c` |
| `Unable to resolve module` after npm install | Delete `node_modules`, run `npm install`, then `npx expo start -c` |
| React Native / Expo version mismatch | Match versions in `package.json`; run `npx expo install --fix` |
| Port 8081 in use | Kill the old Metro process or run `npx expo start --port 8082` |
| Android Gradle failures | `cd android && ./gradlew clean && cd ..` then `npx expo run:android` |
| Supabase auth / session issues | Confirm `.env` keys; test logout clears session in `ProfileScreen.js` |

### Metro dependency errors

```bash
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```

## 5. App-specific features

### Supabase

- Enable Email/Password auth in the Supabase dashboard.
- Apply migrations under `supabase/migrations/` and verify RLS policies.

### Voice / soundwave UI

Calling screens use the in-app soundwave player; ensure microphone permissions are granted on device builds.

## 6. Production builds

Use EAS (see `MobileApp/eas.json`):

```bash
npx eas build --platform android
npx eas build --platform ios
```

## Support

- [GitHub Issues](https://github.com/ritesh-1918/HELPDESK.AI/issues)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
