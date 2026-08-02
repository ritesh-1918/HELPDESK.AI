import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { supabase } from '../lib/supabase';

const PROJECT_ID =
  Constants.expoConfig?.extra?.eas?.projectId ||
  Constants.easConfig?.projectId;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let tokenListener = null;

export const getExpoProjectId = () => PROJECT_ID;

export const isSupportedDevice = () => {
  if (!Device.isDevice) return false;
  if (Platform.OS === 'android' && Platform.Version < 26) return false;
  return true;
};

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    finalStatus = request.status;
  }

  return finalStatus === 'granted' || finalStatus === 'provisional';
};

export const getPushToken = async () => {
  if (!PROJECT_ID) return null;
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: PROJECT_ID,
  });
  return token.data;
};

const TOKEN_COLUMN = 'expo_push_token';
const DEVICE_COLUMN = 'expo_device_token';

export const savePushTokenToBackend = async (token) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !token) return { ok: false, reason: 'no-user-or-token' };

  const deviceToken = await Notifications.getDevicePushTokenAsync().catch(
    () => null,
  );
  const deviceTokenData = deviceToken?.data
    ? typeof deviceToken.data === 'string'
      ? deviceToken.data
      : JSON.stringify(deviceToken.data)
    : null;

  const payload = {
    [TOKEN_COLUMN]: token,
    [DEVICE_COLUMN]: deviceTokenData,
    push_token_updated_at: new Date().toISOString(),
    push_platform: Platform.OS,
  };

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id);

  if (error) {
    console.warn('Failed to persist push token:', error.message);
    return { ok: false, reason: error.message };
  }
  return { ok: true };
};

export const registerForPushNotificationsAsync = async () => {
  if (!isSupportedDevice()) return null;

  let hasPermission;
  try {
    hasPermission = await requestNotificationPermissions();
  } catch (e) {
    console.warn('Push permission request failed:', e);
    return null;
  }
  if (!hasPermission) return null;

  let token = null;
  try {
    token = await getPushToken();
  } catch (e) {
    console.warn('Failed to obtain Expo push token:', e);
    return null;
  }

  if (!token) return null;

  await savePushTokenToBackend(token);

  if (!tokenListener) {
    tokenListener = Notifications.addPushTokenListener((tokenData) => {
      const refreshed = tokenData.data;
      if (typeof refreshed === 'string') {
        savePushTokenToBackend(refreshed);
      }
    });
  }

  return token;
};

export const cleanupPushTokenListener = () => {
  if (tokenListener) {
    Notifications.removePushTokenSubscription(tokenListener);
    tokenListener = null;
  }
};
