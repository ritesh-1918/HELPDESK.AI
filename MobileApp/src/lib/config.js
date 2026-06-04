/**
 * Mobile App Configuration
 *
 * Supabase credentials are read from Expo public environment variables.
 * Create a .env file in the MobileApp/ directory with:
 *   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
 *   EXPO_PUBLIC_BACKEND_URL=http://localhost:7860
 *
 * See .env.example for the full list of required variables.
 *
 * In Expo, only variables prefixed with EXPO_PUBLIC_ are injected into
 * the client bundle at build time (SDK 49+). Non-prefixed variables are
 * server-only and will be undefined in the mobile runtime.
 */

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:7860';
