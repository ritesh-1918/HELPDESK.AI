// @ts-nocheck
// ^ VS Code shows errors here because its TS engine is Node-based.
//   This file runs in Deno (Supabase Edge Runtime) where all Deno.* globals exist.
//   These errors are false positives — the code deploys and runs correctly.
//
// Deploy:  supabase functions deploy ai-proxy
// Secrets: supabase secrets set GEMINI_API_KEY_1=... OPENROUTER_API_KEY_1=... etc.

/**
 * HELPDESK.AI — AI Proxy Edge Function
 *
 * Keeps all AI API keys server-side in Supabase Secrets.
 * Frontend calls this function instead of hitting AI providers directly.
 * Keys are NEVER exposed in the browser JavaScript bundle.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://helpdeskaiv1.vercel.app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

// Key pools — pulled from Supabase Secrets (env vars, never shipped to browser)
const GEMINI_KEYS = [
  Deno.env.get("GEMINI_API_KEY_1"),
  Deno.env.get("GEMINI_API_KEY_2"),
  Deno.env.get("GEMINI_API_KEY_3"),
  Deno.env.get("GEMINI_API_KEY_4"),
].filter(Boolean);

const OPENROUTER_KEYS = [
  Deno.env.get("OPENROUTER_API_KEY_1"),
  Deno.env.get("OPENROUTER_API_KEY_2"),
  Deno.env.get("OPENROUTER_API_KEY_3"),
  Deno.env.get("OPENROUTER_API_KEY_4"),
].filter(Boolean);

const GROQ_KEYS = [
  Deno.env.get("GROQ_API_KEY_1"),
  Deno.env.get("GROQ_API_KEY_2"),
  Deno.env.get("GROQ_API_KEY_3"),
].filter(Boolean);

/** Try each key in pool until one succeeds. Handles 429 rate-limits automatically. */
async function tryWithFailover(keys, buildRequest) {
  let lastError = null;
  for (const key of keys) {
    try {
      const resp = await fetch(buildRequest(key));
      if (resp.ok) return resp;
      if (resp.status === 429) {
        lastError = new Error("Rate limited — trying next key");
        continue;
      }
      return resp;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError ?? new Error("All keys exhausted");
}

// Deno.serve is built into the Deno runtime — no import required
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const { provider, model, messages, prompt } = body;

    let upstreamResponse;

    // ── Gemini ────────────────────────────────────────────────────────────
    if (provider === "gemini") {
      const requestModel = model || "gemma-3-27b-it";
      const contents = messages ?? [{ parts: [{ text: prompt }] }];

      upstreamResponse = await tryWithFailover(GEMINI_KEYS, (key) =>
        new Request(
          `https://generativelanguage.googleapis.com/v1beta/models/${requestModel}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents }),
          }
        )
      );
    }

    // ── OpenRouter ────────────────────────────────────────────────────────
    else if (provider === "openrouter") {
      upstreamResponse = await tryWithFailover(OPENROUTER_KEYS, (key) =>
        new Request("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({ model: model || "google/gemma-3-27b-it:free", messages }),
        })
      );
    }

    // ── Groq ──────────────────────────────────────────────────────────────
    else if (provider === "groq") {
      upstreamResponse = await tryWithFailover(GROQ_KEYS, (key) =>
        new Request("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({ model: model || "llama3-8b-8192", messages }),
        })
      );
    }

    else {
      return new Response(
        JSON.stringify({ error: `Unknown provider: "${provider}". Use gemini | openrouter | groq` }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const data = await upstreamResponse.json();
    return new Response(JSON.stringify(data), {
      status: upstreamResponse.status,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Proxy error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
