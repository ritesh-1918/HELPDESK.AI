/**
 * Mobile App Configuration
 *
 * Supabase credentials are loaded from environment variables.
 * Create a .env file in the MobileApp/ directory with:
 *   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
 *
 * See .env.example for the required variables.
 */

// In React Native / Expo, environment variables are injected at build time.
// For Expo: use expo-constants with extra in app.json, or use react-native-dotenv.
// For bare React Native: use react-native-config.
// Fallback to process.env which works with most bundlers (Metro, Webpack).

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase config. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in MobileApp/.env'
  );
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseKey;
