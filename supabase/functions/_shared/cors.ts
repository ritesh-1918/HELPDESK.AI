/**
 * Shared CORS utility for all HELPDESK.AI Supabase Edge Functions.
 *
 * Usage:
 *   import { corsHeaders, handleCors } from "../_shared/cors.ts";
 *
 *   Deno.serve(async (req) => {
 *     const cors = handleCors(req);
 *     if (cors) return cors;
 *     // ... your handler
 *   });
 *
 * In production, the allowed origin is read from the ALLOWED_ORIGIN
 * environment variable. Defaults to the production frontend URL.
 */

const DEFAULT_ALLOWED_ORIGIN = "https://helpdeskaiv1.vercel.app";

function getAllowedOrigin(): string {
  return Deno.env.get("ALLOWED_ORIGIN") || DEFAULT_ALLOWED_ORIGIN;
}

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(),
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

/**
 * Handle a CORS preflight OPTIONS request.
 * Returns a Response with CORS headers if it is an OPTIONS request,
 * or null if the request should continue to the handler.
 */
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  return null;
}
