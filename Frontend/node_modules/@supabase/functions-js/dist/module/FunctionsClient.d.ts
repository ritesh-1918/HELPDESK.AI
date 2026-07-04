import { Fetch, FunctionInvokeOptions, FunctionRegion, FunctionsResponse } from './types';
/**
 * Client for invoking Supabase Edge Functions.
 */
export declare class FunctionsClient {
    protected url: string;
    protected headers: Record<string, string>;
    protected region: FunctionRegion;
    protected fetch: Fetch;
    /**
     * Creates a new Functions client bound to an Edge Functions URL.
     *
     * @example
     * ```ts
     * import { FunctionsClient, FunctionRegion } from '@supabase/functions-js'
     *
     * const functions = new FunctionsClient('https://xyzcompany.supabase.co/functions/v1', {
     *   headers: { apikey: 'public-anon-key' },
     *   region: FunctionRegion.UsEast1,
     * })
     * ```
     */
    constructor(url: string, { headers, customFetch, region, }?: {
        headers?: Record<string, string>;
        customFetch?: Fetch;
        region?: FunctionRegion;
    });
    /**
     * Updates the authorization header
     * @param token - the new jwt token sent in the authorisation header
     * @example
     * ```ts
     * functions.setAuth(session.access_token)
     * ```
     */
    setAuth(token: string): void;
    /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     * @example
     * ```ts
     * const { data, error } = await functions.invoke('hello-world', {
     *   body: { name: 'Ada' },
     * })
     * ```
     */
    invoke<T = any>(functionName: string, options?: FunctionInvokeOptions): Promise<FunctionsResponse<T>>;
}
//# sourceMappingURL=FunctionsClient.d.ts.map