export interface WebSocketLike {
    readonly CONNECTING: number;
    readonly OPEN: number;
    readonly CLOSING: number;
    readonly CLOSED: number;
    readonly readyState: number;
    readonly url: string;
    readonly protocol: string;
    /**
     * Closes the socket, optionally providing a close code and reason.
     */
    close(code?: number, reason?: string): void;
    /**
     * Sends data through the socket using the underlying implementation.
     */
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    onopen: ((this: any, ev: Event) => any) | null;
    onmessage: ((this: any, ev: MessageEvent) => any) | null;
    onclose: ((this: any, ev: CloseEvent) => any) | null;
    onerror: ((this: any, ev: Event) => any) | null;
    /**
     * Registers an event listener on the socket (compatible with browser WebSocket API).
     */
    addEventListener(type: string, listener: EventListener): void;
    /**
     * Removes a previously registered event listener.
     */
    removeEventListener(type: string, listener: EventListener): void;
    binaryType?: string;
    bufferedAmount?: number;
    extensions?: string;
    dispatchEvent?: (event: Event) => boolean;
}
export interface WebSocketEnvironment {
    type: 'native' | 'ws' | 'cloudflare' | 'unsupported';
    constructor?: any;
    error?: string;
    workaround?: string;
}
/**
 * Utilities for creating WebSocket instances across runtimes.
 */
export declare class WebSocketFactory {
    /**
     * Static-only utility – prevent instantiation.
     */
    private constructor();
    private static detectEnvironment;
    /**
     * Returns the best available WebSocket constructor for the current runtime.
     *
     * @example
     * ```ts
     * const WS = WebSocketFactory.getWebSocketConstructor()
     * const socket = new WS('wss://realtime.supabase.co/socket')
     * ```
     */
    static getWebSocketConstructor(): typeof WebSocket;
    /**
     * Creates a WebSocket using the detected constructor.
     *
     * @example
     * ```ts
     * const socket = WebSocketFactory.createWebSocket('wss://realtime.supabase.co/socket')
     * ```
     */
    static createWebSocket(url: string | URL, protocols?: string | string[]): WebSocketLike;
    /**
     * Detects whether the runtime can establish WebSocket connections.
     *
     * @example
     * ```ts
     * if (!WebSocketFactory.isWebSocketSupported()) {
     *   console.warn('Falling back to long polling')
     * }
     * ```
     */
    static isWebSocketSupported(): boolean;
}
export default WebSocketFactory;
//# sourceMappingURL=websocket-factory.d.ts.map