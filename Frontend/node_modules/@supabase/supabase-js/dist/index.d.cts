import { FunctionInvokeOptions, FunctionRegion, FunctionsClient, FunctionsError, FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from "@supabase/functions-js";
import { PostgrestClient, PostgrestError, PostgrestError as PostgrestError$1, PostgrestFilterBuilder, PostgrestMaybeSingleResponse, PostgrestQueryBuilder, PostgrestResponse, PostgrestSingleResponse } from "@supabase/postgrest-js";
import { RealtimeChannel, RealtimeChannelOptions, RealtimeClient, RealtimeClientOptions } from "@supabase/realtime-js";
import { StorageClient, StorageClientOptions } from "@supabase/storage-js";
import { AuthClient, GoTrueClientOptions, Session as AuthSession, User as AuthUser } from "@supabase/auth-js";
export * from "@supabase/realtime-js";
export * from "@supabase/auth-js";

//#region src/lib/rest/types/common/common.d.ts
type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};
type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: GenericRelationship[];
};
type GenericUpdatableView = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: GenericRelationship[];
};
type GenericNonUpdatableView = {
  Row: Record<string, unknown>;
  Relationships: GenericRelationship[];
};
type GenericView = GenericUpdatableView | GenericNonUpdatableView;
type GenericSetofOption = {
  isSetofReturn?: boolean | undefined;
  isOneToOne?: boolean | undefined;
  isNotNullable?: boolean | undefined;
  to: string;
  from: string;
};
type GenericFunction = {
  Args: Record<string, unknown> | never;
  Returns: unknown;
  SetofOptions?: GenericSetofOption;
};
type GenericSchema = {
  Tables: Record<string, GenericTable>;
  Views: Record<string, GenericView>;
  Functions: Record<string, GenericFunction>;
};
//#endregion
//#region src/lib/types.d.ts
interface SupabaseAuthClientOptions extends GoTrueClientOptions {}
type Fetch = typeof fetch;
type SupabaseClientOptions<SchemaName> = {
  /**
   * The Postgres schema which your tables belong to. Must be on the list of exposed schemas in Supabase. Defaults to `public`.
   */
  db?: {
    schema?: SchemaName;
    /**
     * Optional timeout in milliseconds for PostgREST requests.
     * When set, requests will automatically abort after this duration to prevent indefinite hangs.
     *
     * @example
     * ```ts
     * const supabase = createClient(url, key, {
     *   db: { timeout: 30000 } // 30 second timeout
     * })
     * ```
     */
    timeout?: number;
    /**
     * Maximum URL length in characters before warnings/errors are triggered.
     * Defaults to 8000 characters. Used to provide helpful hints when URLs
     * exceed server limits.
     *
     * @example
     * ```ts
     * const supabase = createClient(url, key, {
     *   db: { urlLengthLimit: 10000 } // Custom limit
     * })
     * ```
     */
    urlLengthLimit?: number;
  };
  auth?: {
    /**
     * Automatically refreshes the token for logged-in users. Defaults to true.
     */
    autoRefreshToken?: boolean;
    /**
     * Optional key name used for storing tokens in local storage.
     */
    storageKey?: string;
    /**
     * Whether to persist a logged-in session to storage. Defaults to true.
     */
    persistSession?: boolean;
    /**
     * Detect a session from the URL. Used for OAuth login callbacks. Defaults to true.
     *
     * Can be set to a function to provide custom logic for determining if a URL contains
     * a Supabase auth callback. The function receives the current URL and parsed parameters,
     * and should return true if the URL should be processed as a Supabase auth callback.
     *
     * This is useful when your app uses other OAuth providers (e.g., Facebook Login) that
     * also return access_token in the URL fragment, which would otherwise be incorrectly
     * intercepted by Supabase Auth.
     *
     * @example
     * ```ts
     * detectSessionInUrl: (url, params) => {
     *   // Ignore Facebook OAuth redirects
     *   if (url.pathname === '/facebook/redirect') return false
     *   // Use default detection for other URLs
     *   return Boolean(params.access_token || params.error_description)
     * }
     * ```
     */
    detectSessionInUrl?: boolean | ((url: URL, params: {
      [parameter: string]: string;
    }) => boolean);
    /**
     * A storage provider. Used to store the logged-in session.
     */
    storage?: SupabaseAuthClientOptions['storage'];
    /**
     * A storage provider to store the user profile separately from the session.
     * Useful when you need to store the session information in cookies,
     * without bloating the data with the redundant user object.
     *
     * @experimental
     */
    userStorage?: SupabaseAuthClientOptions['userStorage'];
    /**
     * OAuth flow to use - defaults to implicit flow. PKCE is recommended for mobile and server-side applications.
     */
    flowType?: SupabaseAuthClientOptions['flowType'];
    /**
     * If debug messages for authentication client are emitted. Can be used to inspect the behavior of the library.
     */
    debug?: SupabaseAuthClientOptions['debug'];
    /**
     * Provide your own locking mechanism based on the environment. By default no locking is done at this time.
     *
     * @experimental
     */
    lock?: SupabaseAuthClientOptions['lock'];
    /**
     * If there is an error with the query, throwOnError will reject the promise by
     * throwing the error instead of returning it as part of a successful response.
     */
    throwOnError?: SupabaseAuthClientOptions['throwOnError'];
  };
  /**
   * Options passed to the realtime-js instance
   */
  realtime?: RealtimeClientOptions;
  storage?: StorageClientOptions;
  global?: {
    /**
     * A custom `fetch` implementation.
     */
    fetch?: Fetch;
    /**
     * Optional headers for initializing the client.
     */
    headers?: Record<string, string>;
  };
  /**
   * Optional function for using a third-party authentication system with
   * Supabase. The function should return an access token or ID token (JWT) by
   * obtaining it from the third-party auth SDK. Note that this
   * function may be called concurrently and many times. Use memoization and
   * locking techniques if this is not supported by the SDKs.
   *
   * When set, the `auth` namespace of the Supabase client cannot be used.
   * Create another client if you wish to use Supabase Auth and third-party
   * authentications concurrently in the same application.
   */
  accessToken?: () => Promise<string | null>;
};
/**
 * Helper types for query results.
 */
type QueryResult<T> = T extends PromiseLike<infer U> ? U : never;
type QueryData<T> = T extends PromiseLike<{
  data: infer U;
}> ? Exclude<U, null> : never;
type QueryError = PostgrestError$1;
/**
 * Strips internal Supabase metadata from Database types.
 * Useful for libraries defining generic constraints on Database types.
 *
 * @example
 * ```typescript
 * type CleanDB = DatabaseWithoutInternals<Database>
 * ```
 */
type DatabaseWithoutInternals<DB> = Omit<DB, '__InternalSupabase'>;
//#endregion
//#region src/lib/SupabaseAuthClient.d.ts
declare class SupabaseAuthClient extends AuthClient {
  constructor(options: SupabaseAuthClientOptions);
}
//#endregion
//#region src/lib/rest/types/common/rpc.d.ts
type IsMatchingArgs<FnArgs extends GenericFunction['Args'], PassedArgs extends GenericFunction['Args']> = [FnArgs] extends [Record<PropertyKey, never>] ? PassedArgs extends Record<PropertyKey, never> ? true : false : keyof PassedArgs extends keyof FnArgs ? PassedArgs extends FnArgs ? true : false : false;
type MatchingFunctionArgs<Fn$1 extends GenericFunction, Args extends GenericFunction['Args']> = Fn$1 extends {
  Args: infer A extends GenericFunction['Args'];
} ? IsMatchingArgs<A, Args> extends true ? Fn$1 : never : false;
type FindMatchingFunctionByArgs<FnUnion, Args extends GenericFunction['Args']> = FnUnion extends infer Fn extends GenericFunction ? MatchingFunctionArgs<Fn, Args> : false;
type TablesAndViews<Schema extends GenericSchema> = Schema['Tables'] & Exclude<Schema['Views'], ''>;
type UnionToIntersection<U$1> = (U$1 extends any ? (k: U$1) => void : never) extends ((k: infer I) => void) ? I : never;
type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends (() => infer R) ? R : never;
type IsAny<T> = 0 extends 1 & T ? true : false;
type ExactMatch<T, S> = [T] extends [S] ? ([S] extends [T] ? true : false) : false;
type ExtractExactFunction<Fns, Args> = Fns extends infer F ? F extends GenericFunction ? ExactMatch<F['Args'], Args> extends true ? F : never : never : never;
type IsNever<T> = [T] extends [never] ? true : false;
type RpcFunctionNotFound<FnName> = {
  Row: any;
  Result: {
    error: true;
  } & "Couldn't infer function definition matching provided arguments";
  RelationName: FnName;
  Relationships: null;
};
type CrossSchemaError<TableRef extends string> = {
  error: true;
} & `Function returns SETOF from a different schema ('${TableRef}'). Use .overrideTypes<YourReturnType>() to specify the return type explicitly.`;
type GetRpcFunctionFilterBuilderByArgs<Schema extends GenericSchema, FnName extends string & keyof Schema['Functions'], Args> = {
  0: Schema['Functions'][FnName];
  1: IsAny<Schema> extends true ? any : IsNever<Args> extends true ? IsNever<ExtractExactFunction<Schema['Functions'][FnName], Args>> extends true ? LastOf<Schema['Functions'][FnName]> : ExtractExactFunction<Schema['Functions'][FnName], Args> : Args extends Record<PropertyKey, never> ? LastOf<Schema['Functions'][FnName]> : Args extends GenericFunction['Args'] ? IsNever<LastOf<FindMatchingFunctionByArgs<Schema['Functions'][FnName], Args>>> extends true ? LastOf<Schema['Functions'][FnName]> : LastOf<FindMatchingFunctionByArgs<Schema['Functions'][FnName], Args>> : ExtractExactFunction<Schema['Functions'][FnName], Args> extends GenericFunction ? ExtractExactFunction<Schema['Functions'][FnName], Args> : any;
}[1] extends infer Fn ? IsAny<Fn> extends true ? {
  Row: any;
  Result: any;
  RelationName: FnName;
  Relationships: null;
} : Fn extends GenericFunction ? {
  Row: Fn['SetofOptions'] extends GenericSetofOption ? Fn['SetofOptions']['to'] extends keyof TablesAndViews<Schema> ? TablesAndViews<Schema>[Fn['SetofOptions']['to']]['Row'] : Fn['Returns'] extends any[] ? Fn['Returns'][number] extends Record<string, unknown> ? Fn['Returns'][number] : CrossSchemaError<Fn['SetofOptions']['to'] & string> : Fn['Returns'] extends Record<string, unknown> ? Fn['Returns'] : CrossSchemaError<Fn['SetofOptions']['to'] & string> : Fn['Returns'] extends any[] ? Fn['Returns'][number] extends Record<string, unknown> ? Fn['Returns'][number] : never : Fn['Returns'] extends Record<string, unknown> ? Fn['Returns'] : never;
  Result: Fn['SetofOptions'] extends GenericSetofOption ? Fn['SetofOptions']['isSetofReturn'] extends true ? Fn['SetofOptions']['isOneToOne'] extends true ? Fn['Returns'][] : Fn['Returns'] : Fn['Returns'] : Fn['Returns'];
  RelationName: Fn['SetofOptions'] extends GenericSetofOption ? Fn['SetofOptions']['to'] : FnName;
  Relationships: Fn['SetofOptions'] extends GenericSetofOption ? Fn['SetofOptions']['to'] extends keyof Schema['Tables'] ? Schema['Tables'][Fn['SetofOptions']['to']]['Relationships'] : Fn['SetofOptions']['to'] extends keyof Schema['Views'] ? Schema['Views'][Fn['SetofOptions']['to']]['Relationships'] : null : null;
} : Fn extends false ? RpcFunctionNotFound<FnName> : RpcFunctionNotFound<FnName> : RpcFunctionNotFound<FnName>;
//#endregion
//#region src/SupabaseClient.d.ts
/**
 * Supabase Client.
 *
 * An isomorphic Javascript client for interacting with Postgres.
 */
declare class SupabaseClient<Database = any, SchemaNameOrClientOptions extends (string & keyof Omit<Database, '__InternalSupabase'>) | {
  PostgrestVersion: string;
} = ('public' extends keyof Omit<Database, '__InternalSupabase'> ? 'public' : string & keyof Omit<Database, '__InternalSupabase'>), SchemaName extends string & keyof Omit<Database, '__InternalSupabase'> = (SchemaNameOrClientOptions extends string & keyof Omit<Database, '__InternalSupabase'> ? SchemaNameOrClientOptions : 'public' extends keyof Omit<Database, '__InternalSupabase'> ? 'public' : string & keyof Omit<Omit<Database, '__InternalSupabase'>, '__InternalSupabase'>), Schema extends (Omit<Database, '__InternalSupabase'>[SchemaName] extends GenericSchema ? Omit<Database, '__InternalSupabase'>[SchemaName] : never) = (Omit<Database, '__InternalSupabase'>[SchemaName] extends GenericSchema ? Omit<Database, '__InternalSupabase'>[SchemaName] : never), ClientOptions extends {
  PostgrestVersion: string;
} = (SchemaNameOrClientOptions extends string & keyof Omit<Database, '__InternalSupabase'> ? Database extends {
  __InternalSupabase: {
    PostgrestVersion: string;
  };
} ? Database['__InternalSupabase'] : {
  PostgrestVersion: '12';
} : SchemaNameOrClientOptions extends {
  PostgrestVersion: string;
} ? SchemaNameOrClientOptions : never)> {
  protected supabaseUrl: string;
  protected supabaseKey: string;
  /**
   * Supabase Auth allows you to create and manage user sessions for access to data that is secured by access policies.
   */
  auth: SupabaseAuthClient;
  realtime: RealtimeClient;
  /**
   * Supabase Storage allows you to manage user-generated content, such as photos or videos.
   */
  storage: StorageClient;
  protected realtimeUrl: URL;
  protected authUrl: URL;
  protected storageUrl: URL;
  protected functionsUrl: URL;
  protected rest: PostgrestClient<Database, ClientOptions, SchemaName>;
  protected storageKey: string;
  protected fetch?: Fetch;
  protected changedAccessToken?: string;
  protected accessToken?: () => Promise<string | null>;
  protected headers: Record<string, string>;
  /**
   * Create a new client for use in the browser.
   * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
   * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
   * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
   * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
   * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
   * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
   * @param options.realtime Options passed along to realtime-js constructor.
   * @param options.storage Options passed along to the storage-js constructor.
   * @param options.global.fetch A custom fetch implementation.
   * @param options.global.headers Any additional headers to send with each network request.
   * @example
   * ```ts
   * import { createClient } from '@supabase/supabase-js'
   *
   * const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
   * const { data } = await supabase.from('profiles').select('*')
   * ```
   */
  constructor(supabaseUrl: string, supabaseKey: string, options?: SupabaseClientOptions<SchemaName>);
  /**
   * Supabase Functions allows you to deploy and invoke edge functions.
   */
  get functions(): FunctionsClient;
  from<TableName extends string & keyof Schema['Tables'], Table extends Schema['Tables'][TableName]>(relation: TableName): PostgrestQueryBuilder<ClientOptions, Schema, Table, TableName>;
  from<ViewName extends string & keyof Schema['Views'], View extends Schema['Views'][ViewName]>(relation: ViewName): PostgrestQueryBuilder<ClientOptions, Schema, View, ViewName>;
  /**
   * Select a schema to query or perform an function (rpc) call.
   *
   * The schema needs to be on the list of exposed schemas inside Supabase.
   *
   * @param schema - The schema to query
   */
  schema<DynamicSchema extends string & keyof Omit<Database, '__InternalSupabase'>>(schema: DynamicSchema): PostgrestClient<Database, ClientOptions, DynamicSchema, Database[DynamicSchema] extends GenericSchema ? Database[DynamicSchema] : any>;
  /**
   * Perform a function call.
   *
   * @param fn - The function name to call
   * @param args - The arguments to pass to the function call
   * @param options - Named parameters
   * @param options.head - When set to `true`, `data` will not be returned.
   * Useful if you only need the count.
   * @param options.get - When set to `true`, the function will be called with
   * read-only access mode.
   * @param options.count - Count algorithm to use to count rows returned by the
   * function. Only applicable for [set-returning
   * functions](https://www.postgresql.org/docs/current/functions-srf.html).
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   */
  rpc<FnName extends string & keyof Schema['Functions'], Args extends Schema['Functions'][FnName]['Args'] = never, FilterBuilder extends GetRpcFunctionFilterBuilderByArgs<Schema, FnName, Args> = GetRpcFunctionFilterBuilderByArgs<Schema, FnName, Args>>(fn: FnName, args?: Args, options?: {
    head?: boolean;
    get?: boolean;
    count?: 'exact' | 'planned' | 'estimated';
  }): PostgrestFilterBuilder<ClientOptions, Schema, FilterBuilder['Row'], FilterBuilder['Result'], FilterBuilder['RelationName'], FilterBuilder['Relationships'], 'RPC'>;
  /**
   * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
   *
   * @param {string} name - The name of the Realtime channel.
   * @param {Object} opts - The options to pass to the Realtime channel.
   *
   */
  channel(name: string, opts?: RealtimeChannelOptions): RealtimeChannel;
  /**
   * Returns all Realtime channels.
   */
  getChannels(): RealtimeChannel[];
  /**
   * Unsubscribes and removes Realtime channel from Realtime client.
   *
   * @param {RealtimeChannel} channel - The name of the Realtime channel.
   *
   */
  removeChannel(channel: RealtimeChannel): Promise<'ok' | 'timed out' | 'error'>;
  /**
   * Unsubscribes and removes all Realtime channels from Realtime client.
   */
  removeAllChannels(): Promise<('ok' | 'timed out' | 'error')[]>;
  private _getAccessToken;
  private _initSupabaseAuthClient;
  private _initRealtimeClient;
  private _listenForAuthEvents;
  private _handleTokenChanged;
}
//#endregion
//#region src/index.d.ts
/**
 * Creates a new Supabase Client.
 *
 * @example
 * ```ts
 * import { createClient } from '@supabase/supabase-js'
 *
 * const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
 * const { data, error } = await supabase.from('profiles').select('*')
 * ```
 */
declare const createClient: <Database = any, SchemaNameOrClientOptions extends (string & keyof Omit<Database, "__InternalSupabase">) | {
  PostgrestVersion: string;
} = ("public" extends keyof Omit<Database, "__InternalSupabase"> ? "public" : string & keyof Omit<Database, "__InternalSupabase">), SchemaName extends string & keyof Omit<Database, "__InternalSupabase"> = (SchemaNameOrClientOptions extends string & keyof Omit<Database, "__InternalSupabase"> ? SchemaNameOrClientOptions : "public" extends keyof Omit<Database, "__InternalSupabase"> ? "public" : string & keyof Omit<Omit<Database, "__InternalSupabase">, "__InternalSupabase">)>(supabaseUrl: string, supabaseKey: string, options?: SupabaseClientOptions<SchemaName>) => SupabaseClient<Database, SchemaNameOrClientOptions, SchemaName>;
//#endregion
export { type AuthSession, type AuthUser, type DatabaseWithoutInternals, type FunctionInvokeOptions, FunctionRegion, FunctionsError, FunctionsFetchError, FunctionsHttpError, FunctionsRelayError, PostgrestError, type PostgrestMaybeSingleResponse, type PostgrestResponse, type PostgrestSingleResponse, type QueryData, type QueryError, type QueryResult, SupabaseClient, type SupabaseClientOptions, createClient };
//# sourceMappingURL=index.d.cts.map