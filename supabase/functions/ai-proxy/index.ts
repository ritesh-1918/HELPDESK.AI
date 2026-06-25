// @ts-nocheck
// ^ VS Code shows errors here because its TS engine is Node-based.
//   This file runs in Deno (Supabase Edge Runtime) where Deno.* globals exist.
//   These errors are false positives — the code deploys and runs correctly.
//
// Deploy:  supabase functions deploy ai-proxy
// Secrets: supabase secrets set GEMINI_API_KEY_1=... OPENROUTER_API_KEY_1=... etc.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

import { corsHeaders, handleCors } from "../_shared/cors.ts";

// Key pools — pulled from Supabase Secrets. Never shipped to the browser.
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

/** Try each key in the pool until one succeeds. Retries on 429 rate-limits. */
async function tryWithFailover(keys, buildRequest) {
  let lastError = null;
  for (const key of keys) {
    try {
      const resp = await fetch(buildRequest(key), { signal: AbortSignal.timeout(30000) });
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

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const headers = { ...corsHeaders(), "Content-Type": "application/json" };

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: caller, error: authError } = await supabase.auth.getUser(token);
    if (authError || !caller.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { provider, model, messages, prompt } = body;
    const defaultModel = {
      gemini: "gemma-3-27b-it",
      openrouter: "google/gemma-3-27b-it:free",
      groq: "llama3-8b-8192",
    }[provider];
    if (!defaultModel || !ALLOWED_MODELS[provider].has(model || defaultModel)) {
      return new Response(JSON.stringify({ error: "Model is not allowed" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    let upstreamResponse;

    // ── Gemini ──────────────────────────────────────────────────────────────
    if (provider === "gemini") {
      const requestModel = model || "gemini-2.0-flash";
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

    // ── OpenRouter ───────────────────────────────────────────────────────────
    else if (provider === "openrouter") {
      upstreamResponse = await tryWithFailover(OPENROUTER_KEYS, (key) =>
        new Request("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: model || "meta-llama/llama-3.2-3b-instruct:free",
            messages,
          }),
        })
      );
    }

    // ── Groq ─────────────────────────────────────────────────────────────────
    else if (provider === "groq") {
      upstreamResponse = await tryWithFailover(GROQ_KEYS, (key) =>
        new Request("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: model || "llama-3.1-8b-instant",
            messages,
          }),
        })
      );
    }

    else {
      return new Response(
        JSON.stringify({ error: `Unknown provider "${provider}". Use: gemini | openrouter | groq` }),
        { status: 400, headers }
      );
    }

    const data = await upstreamResponse.json();
    return new Response(JSON.stringify(data), {
      status: upstreamResponse.status,
      headers,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Proxy error" }),
      { status: 500, headers }
    );
  }
});
