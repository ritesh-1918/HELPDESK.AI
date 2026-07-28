//#region src/cors.d.ts
/**
 * Canonical CORS configuration for Supabase Edge Functions
 *
 * This module exports CORS headers that stay synchronized with the Supabase SDK.
 * When new headers are added to the SDK, they are automatically included here,
 * preventing CORS errors in Edge Functions.
 *
 * @example Basic usage
 * ```typescript
 * import { corsHeaders } from '@supabase/supabase-js/cors'
 *
 * Deno.serve(async (req) => {
 *   if (req.method === 'OPTIONS') {
 *     return new Response('ok', { headers: corsHeaders })
 *   }
 *
 *   return new Response(
 *     JSON.stringify({ data: 'Hello' }),
 *     { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
 *   )
 * })
 * ```
 *
 * @module cors
 */
/**
 * Type representing CORS headers as a record of header names to values
 */
type CorsHeaders = Record<string, string>;
/**
 * Default CORS headers for Supabase Edge Functions.
 *
 * Includes all headers sent by Supabase client libraries and allows all standard HTTP methods.
 * Use this for simple CORS configurations with wildcard origin.
 *
 * @example
 * ```typescript
 * import { corsHeaders } from '@supabase/supabase-js/cors'
 *
 * Deno.serve(async (req) => {
 *   if (req.method === 'OPTIONS') {
 *     return new Response('ok', { headers: corsHeaders })
 *   }
 *
 *   return new Response(
 *     JSON.stringify({ data: 'Hello' }),
 *     { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
 *   )
 * })
 * ```
 */
declare const corsHeaders: CorsHeaders;
//#endregion
export { CorsHeaders, corsHeaders };
//# sourceMappingURL=cors.d.cts.map