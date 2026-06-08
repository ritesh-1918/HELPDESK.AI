import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_STORAGE_KEY;

if (!SECRET_KEY) {
  console.warn('[secureStorage] VITE_STORAGE_KEY not set — encryption disabled, using raw storage');
}

export const secureStorage = {
    setItem: (key: string, value: string): void => {
        try {
            if (SECRET_KEY) {
                const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
                localStorage.setItem(key, encrypted);
            } else {
                localStorage.setItem(key, value);
            }
        } catch (e) {
            console.error('Error encrypting storage item', e);
        }
    },

    getItem: (key: string): string | null => {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;

            if (SECRET_KEY) {
                const decrypted = CryptoJS.AES.decrypt(stored, SECRET_KEY).toString(CryptoJS.enc.Utf8);
                return decrypted || null;
            }

            return stored;
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
