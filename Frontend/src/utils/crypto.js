/**
 * End-to-end encryption helpers for support message payloads (issue #3910).
 *
 * Messages are encrypted in-browser with AES-GCM before being posted to the
 * API. The server never sees the plaintext — it only transports opaque
 * ciphertext blobs between participants.
 *
 * Payload envelope (stored in the `message` column / sent over the wire):
 *     enc:v1:<ivBase64Url>:<ciphertextBase64Url>
 */

const AES_ALGO = { name: 'AES-GCM', length: 256 };
const KEY_USAGES = ['encrypt', 'decrypt'];

export const E2E_PREFIX = 'enc:v1:';

export const isWebCryptoSupported = () =>
    typeof globalThis !== 'undefined' &&
    Boolean(globalThis.crypto && globalThis.crypto.subtle);

const bytesToBase64Url = (bytes) => {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const base64UrlToBytes = (value) => {
    const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
};

/**
 * Generates a fresh AES-256-GCM conversation key.
 * @returns {Promise<CryptoKey>}
 */
export const createConversationKey = async () => {
    if (!isWebCryptoSupported()) throw new Error('Web Crypto API is not available');
    return globalThis.crypto.subtle.generateKey(AES_ALGO, true, KEY_USAGES);
};

/**
 * Serializes a CryptoKey to a base64url string so it can be transported
 * through the (blind) server for the other participants to import.
 * @returns {Promise<string>}
 */
export const exportKeyBase64 = async (key) => {
    const raw = await globalThis.crypto.subtle.exportKey('raw', key);
    return bytesToBase64Url(new Uint8Array(raw));
};

/**
 * Rehydrates a CryptoKey from a base64url string.
 * @returns {Promise<CryptoKey>}
 */
export const importKeyBase64 = async (base64) => {
    const bytes = base64UrlToBytes(base64);
    return globalThis.crypto.subtle.importKey('raw', bytes, AES_ALGO, true, KEY_USAGES);
};

/**
 * Encrypts a plaintext string, returning the full `enc:v1:...` envelope.
 * @returns {Promise<string>}
 */
export const encryptMessage = async (key, plaintext) => {
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(String(plaintext));
    const ciphertext = await globalThis.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
    );
    return `${E2E_PREFIX}${bytesToBase64Url(iv)}:${bytesToBase64Url(new Uint8Array(ciphertext))}`;
};

/**
 * Returns true when `payload` looks like an E2E envelope this module created.
 */
export const isEncryptedPayload = (payload) =>
    typeof payload === 'string' && payload.startsWith(E2E_PREFIX);

/**
 * Decrypts an `enc:v1:` envelope back to its original plaintext.
 * @returns {Promise<string>}
 */
export const decryptMessage = async (key, payload) => {
    if (!isEncryptedPayload(payload)) return String(payload);

    const rest = payload.slice(E2E_PREFIX.length);
    const separator = rest.indexOf(':');
    if (separator <= 0) throw new Error('Malformed E2E payload');

    const iv = base64UrlToBytes(rest.slice(0, separator));
    const data = base64UrlToBytes(rest.slice(separator + 1));

    const plaintext = await globalThis.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );
    return new TextDecoder().decode(plaintext);
};
