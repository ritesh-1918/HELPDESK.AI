import * as LocalAuthentication from 'expo-local-authentication';

const MAX_ATTEMPTS = 3;

/**
 * Result shape:
 * { success: boolean, error?: 'cancelled' | 'lockout' | 'not_available' | 'max_attempts' | 'unknown' }
 */

export const authenticateUser = async () => {
  // Check hardware availability
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return { success: false, error: 'not_available' };
  }

  // Check if biometrics are enrolled
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    return { success: false, error: 'not_available' };
  }

  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    attempts += 1;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access Helpdesk',
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });

    // Success
    if (result.success) {
      return { success: true };
    }

    // User explicitly pressed Cancel — stop immediately, do NOT retry
    if (
      result.error === 'user_cancel' ||
      result.error === 'system_cancel' ||
      result.error === 'app_cancel'
    ) {
      return { success: false, error: 'cancelled' };
    }

    // User chose fallback (e.g. Use PIN) — stop immediately, do NOT retry
    if (result.error === 'user_fallback') {
      return { success: false, error: 'user_fallback' };
    }

    // Device lockout — biometrics disabled by OS, stop immediately
    if (
      result.error === 'lockout' ||
      result.error === 'lockout_permanent'
    ) {
      return { success: false, error: 'lockout' };
    }

    // Max attempts reached
    if (attempts >= MAX_ATTEMPTS) {
      return { success: false, error: 'max_attempts' };
    }

    // Other transient error (e.g. sensor dirty) — retry
  }

  return { success: false, error: 'unknown' };
};

/**
 * Helper: check if biometrics are available and enrolled on this device.
 */
export const isBiometricAvailable = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return isEnrolled;
};

/**
 * Helper: get supported biometric types (FaceID, TouchID, etc.)
 */
export const getSupportedBiometricTypes = async () => {
  return await LocalAuthentication.supportedAuthenticationTypesAsync();
};