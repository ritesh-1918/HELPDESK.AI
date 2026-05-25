# Mobile App Setup Guide

## Prerequisites

- Node.js 18+ and npm/yarn
- React Native CLI or Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Supabase account and project

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ritesh-1918/HELPDESK.AI.git
cd HELPDESK.AI/MobileApp
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the MobileApp directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server

```bash
# For Android
npx react-native run-android

# For iOS
npx react-native run-ios

# For Expo
npx expo start
```

## Supabase Integration

### Authentication Setup

1. Enable Email/Password auth in Supabase Dashboard
2. Configure session clearing for smooth logout (ProfileScreen.js)
3. Handle token refresh automatically

### Database Setup

1. Run the SQL migrations in `supabase/migrations/`
2. Set up Row Level Security (RLS) policies
3. Configure real-time subscriptions for live updates

## Troubleshooting

### Android Issues

#### KeyboardAvoidingView Offset
If the keyboard overlaps input fields on Android:

```javascript
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'android' ? -100 : 0}
>
  {/* Your form content */}
</KeyboardAvoidingView>
```

#### Gradle Build Failures
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### iOS Issues

#### Pod Installation
```bash
cd ios
pod install --repo-update
cd ..
npx react-native run-ios
```

#### Signing Issues
1. Open `ios/HELPDESK.xcworkspace` in Xcode
2. Select your development team
3. Update bundle identifier if needed

### Supabase Connection Issues

1. Verify `.env` credentials are correct
2. Check Supabase project status
3. Ensure RLS policies allow your queries
4. Check network connectivity

## Soundwave Voice Player

The mobile app includes voice calling with soundwave visualization:

```javascript
import { SoundWavePlayer } from './components/SoundWavePlayer';

<SoundWavePlayer
  audioUrl={callAudioUrl}
  onPlaybackComplete={handleComplete}
/>
```

## Build for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

The APK will be in `android/app/build/outputs/apk/release/`

### iOS
1. Open Xcode
2. Product → Archive
3. Follow the distribution wizard

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## Support

- GitHub Issues: https://github.com/ritesh-1918/HELPDESK.AI/issues
- Discussions: https://github.com/ritesh-1918/HELPDESK.AI/discussions
