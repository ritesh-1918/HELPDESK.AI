import CryptoJS from 'crypto-js';

// Fallback secret if env variable is missing
const SECRET_KEY = import.meta.env.VITE_STORAGE_KEY || 'emerald-helpdesk-fallback-secret-key-9a8b7c6d5e';

export const secureStorage = {
    /**
     * Encrypts and stores a string value in localStorage.
     */
    setItem: (key: string, value: string): void => {
        try {
            const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
            localStorage.setItem(key, encrypted);
        } catch (e) {
            console.error('Error encrypting storage item', e);
        }
    },

    /**
     * Retrieves and decrypts a value from localStorage.
     * Returns null if not found or decryption fails.
     */
    getItem: (key: string): string | null => {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;
            
            const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8);
            if (!decrypted) return null;
            
            return decrypted;
        } catch (e) {
            console.error('Error decrypting storage item', e);
            return null;
        }
    },

    removeItem: (key: string): void => {
        localStorage.removeItem(key);
    },

    clear: (): void => {
        localStorage.clear();
    }
};

export default secureStorage;
