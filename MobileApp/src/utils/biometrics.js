// Biometrics Helper
import * as LocalAuthentication from 'expo-local-authentication';

export const authenticateUser = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;
    
    const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Helpdesk',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false
    });
    return result.success;
};
