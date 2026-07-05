# AI Proxy Edge Function — Setup Guide

This Supabase Edge Function proxies all AI API requests server-side,
so no API keys ever appear in the browser JavaScript bundle.

## Deploy the function

```bash
# From the project root:
supabase functions deploy ai-proxy
```

## Set the secrets (run once — keys stored in Supabase, never in code)

```bash
supabase secrets set GEMINI_API_KEY_1=AIzaSy...
supabase secrets set GEMINI_API_KEY_2=AIzaSy...
supabase secrets set GEMINI_API_KEY_3=AIzaSy...
supabase secrets set GEMINI_API_KEY_4=AIzaSy...

supabase secrets set OPENROUTER_API_KEY_1=sk-or-v1-...
supabase secrets set OPENROUTER_API_KEY_2=sk-or-v1-...
supabase secrets set OPENROUTER_API_KEY_3=sk-or-v1-...
supabase secrets set OPENROUTER_API_KEY_4=sk-or-v1-...

supabase secrets set GROQ_API_KEY_1=gsk_...
supabase secrets set GROQ_API_KEY_2=gsk_...
supabase secrets set GROQ_API_KEY_3=gsk_...
```

## How to call from frontend (replace old SDK calls)

```javascript
import { supabase } from '../lib/supabaseClient';

// Instead of calling Gemini SDK directly:
const { data, error } = await supabase.functions.invoke('ai-proxy', {
  body: {
    provider: 'gemini',         // 'gemini' | 'openrouter' | 'groq'
    model: 'gemma-3-27b-it',   // optional, uses default if omitted
    messages: [                 // or use 'prompt' for a simple string
      { parts: [{ text: 'Summarize this IT ticket: ...' }] }
    ]
  }
});

console.log(data); // Gemini API response
```

## Security model
- Keys stored in Supabase Vault (AES-256 encrypted at rest)
- Edge Function only accessible with a valid anon key (rate-limited by Supabase)
- Frontend .env only needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- CORS locked to helpdeskaiv1.vercel.app only
