/**
 * Tests for biometric authentication — issue #3222
 * Verifies no infinite loop on cancel or lockout.
 */

import { authenticateUser, isBiometricAvailable } from './biometrics';

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
}));

const LocalAuthentication = require('expo-local-authentication');

beforeEach(() => {
  jest.clearAllMocks();
  LocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
  LocalAuthentication.isEnrolledAsync.mockResolvedValue(true);
});

describe('authenticateUser', () => {
  it('returns success true on successful auth', async () => {
    LocalAuthentication.authenticateAsync.mockResolvedValue({ success: true });
    const result = await authenticateUser();
    expect(result.success).toBe(true);
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1);
  });

  it('stops immediately on user_cancel — no retry', async () => {
    LocalAuthentication.authenticateAsync.mockResolvedValue({
      success: false,
      error: 'user_cancel',
    });
    const result = await authenticateUser();
    expect(result.success).toBe(false);
    expect(result.error).toBe('cancelled');
    // Must NOT retry after cancel
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1);
  });

  it('stops immediately on system_cancel — no retry', async () => {
    LocalAuthentication.authenticateAsync.mockResolvedValue({
      success: false,
      error: 'system_cancel',
    });
    const result = await authenticateUser();
    expect(result.success).toBe(false);
    expect(result.error).toBe('cancelled');
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1);
  });

  it('stops immediately on user_fallback — no retry', async () => {
    LocalAuthentication.authenticateAsync.mockResolvedValue({
      success: false,
      error: 'user_fallback',
    });
    const result = await authenticateUser();
    expect(result.success).toBe(false);
    expect(result.error).toBe('user_fallback');
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1);
  });

  it('stops immediately on lockout — no retry', async () => {
    LocalAuthentication.authenticateAsync.mockResolvedValue({
      success: false,
      error: 'lockout',
    });
    const result = await authenticateUser();
    expect(result.success).toBe(false);
    expect(result.error).toBe('lockout');
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1);
  });

  it('retries up to MAX_ATTEMPTS on transient errors', async () => {
    LocalAuthentication.authenticateAsync.mockResolvedValue({
      success: false,
      error: 'sensor_dirty',
    });
    const result = await authenticateUser();
    expect(result.success).toBe(false);
    expect(result.error).toBe('max_attempts');
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(3);
  });

  it('returns not_available when no hardware', async () => {
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(false);
    const result = await authenticateUser();
    expect(result.success).toBe(false);
    expect(result.error).toBe('not_available');
  });

  it('returns not_available when not enrolled', async () => {
    LocalAuthentication.isEnrolledAsync.mockResolvedValue(false);
    const result = await authenticateUser();
    expect(result.success).toBe(false);
    expect(result.error).toBe('not_available');
  });
});