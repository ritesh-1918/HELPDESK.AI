# Security Advisory

## Managing Hardcoded Secrets in GitHub

Your repository previously had GitHub code scanning alerts (the "eyes") because it detected sensitive keys in your code history. Even if you remove the keys from your current codebase, they remain in your Git history and are technically compromised.

### The Leaked Keys
1. **Google API Key (Gemini)**: Detected in `Frontend/simple_discover.js`
2. **Supabase Service Key**: Detected in `supabase/migrations/20260330231302_webhook-trigger.sql`
3. **GitHub PAT**: Pasted during testing.

### Immediate Action Required

To ensure your application is secure for enterprise use, you **must** rotate these keys.

1. **Rotate Supabase Key**:
   - Go to your Supabase Project Settings > API.
   - Click "Roll" next to the `service_role` secret.
   - Update your server environment variables with the new key.

2. **Rotate Google API Key**:
   - Go to Google Cloud Console > APIs & Services > Credentials.
   - Delete the exposed `AIza` key.
   - Generate a new key and update your environment variables.

3. **Rotate GitHub PAT**:
   - Go to GitHub > Settings > Developer Settings > Personal access tokens.
   - Revoke the token starting with `github_pat_...`
   - Generate a new one if needed for the Actions workflow and update the secret via `gh secret set GH_MODELS_TOKEN`.

### Resolving the Alerts on GitHub
Once the keys are rotated, you can safely go to the "Security" tab on your GitHub repository, view the "Secret scanning alerts", and dismiss them as "Revoked". This will hide the alerts while maintaining actual security.
