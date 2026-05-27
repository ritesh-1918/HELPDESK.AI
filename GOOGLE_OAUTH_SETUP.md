# Google OAuth Setup Guide for HELPDESK.AI

This guide explains how to configure Google OAuth login for HELPDESK.AI using Supabase.

## Prerequisites

- A Supabase project with Auth enabled
- A Google Cloud Console project

## Step 1: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application** as the application type
6. Add the following **Authorized redirect URIs**:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
7. Note down the **Client ID** and **Client Secret**

## Step 2: Enable Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** and enable it
5. Enter the **Client ID** and **Client Secret** from Step 1
6. Click **Save**

## Step 3: Configure Redirect URLs in Supabase

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Add your site URL to **Site URL** (e.g., `http://localhost:5173` for development)
3. Add the following to **Redirect URLs**:
   ```
   http://localhost:5173/login
   https://your-production-domain.com/login
   ```

## Environment Variables

No additional environment variables are needed beyond the existing Supabase configuration:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## How It Works

1. User clicks "Continue with Google" on the login page
2. The app calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
3. User is redirected to Google's consent screen
4. After authorization, Google redirects back to the app
5. Supabase handles the OAuth callback and creates/retrieves the user session
6. The existing `onAuthStateChange` listener picks up the session and resolves the user profile

## Notes

- Google OAuth users will have their profile automatically created with the default `user` role
- The `full_name` and `email` are populated from the Google account metadata
- Email verification is automatically handled by Google (Google-verified emails are trusted)
