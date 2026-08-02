import { describe, it, expect, beforeEach } from 'vitest';
import secureStorage from '../../utils/secureStorage';

describe('secureStorage Utility', () => {
    beforeEach(() => {
        secureStorage.clear();
    });

    it('should securely encrypt and decrypt strings', () => {
        const testKey = 'test_key';
        const testValue = 'highly_sensitive_data';

        secureStorage.setItem(testKey, testValue);

        // Verify it was stored
        const rawStorage = localStorage.getItem(testKey);
        expect(rawStorage).toBeDefined();
        expect(rawStorage).not.toBe(testValue); // It must be encrypted

        // Verify retrieval
        const retrievedValue = secureStorage.getItem(testKey);
        expect(retrievedValue).toBe(testValue);
    });

    it('should return null for non-existent keys', () => {
        const retrievedValue = secureStorage.getItem('missing_key');
        expect(retrievedValue).toBeNull();
    });

    it('should remove items correctly', () => {
        const testKey = 'delete_me';
        secureStorage.setItem(testKey, 'value');
        secureStorage.removeItem(testKey);
        expect(secureStorage.getItem(testKey)).toBeNull();
    });
});
