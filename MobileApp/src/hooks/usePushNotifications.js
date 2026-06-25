/**
 * usePushNotifications.js
 *
 * Hook that handles Expo push notification setup:
 *  - Requests notification permission from the user
 *  - Retrieves the Expo push token
 *  - Saves the token to the user's Supabase profile for server-side delivery
 *  - Listens for foreground notifications and navigation on tap
 *
 * Usage:
 *   import { usePushNotifications } from '../hooks/usePushNotifications';
 *
 *   function App() {
 *     usePushNotifications(supabase);
 *     ...
 *   }
 */

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure how notifications are presented when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request push notification permissions and return the Expo push token.
 * Returns null if permission is denied or the device is not physical.
 *
 * @returns {Promise<string|null>} Expo push token string or null.
 */
async function registerForPushNotifications() {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.warn('[PushNotifications] Must use a physical device for push notifications.');
    return null;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('ticket-alerts', {
      name: 'Ticket Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
      sound: 'default',
    });
  }

  // Check current permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Prompt user if permission not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[PushNotifications] Permission not granted for push notifications.');
    return null;
  }

  // Get the Expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  });

  return tokenData.data;
}

/**
 * Hook: sets up push notifications for ticket alerts.
 *
 * @param {object} supabaseClient  - Supabase client instance.
 * @param {object} [navigationRef] - Optional React Navigation ref for handling
 *                                   notification taps (navigate to ticket screen).
 */
export function usePushNotifications(supabaseClient, navigationRef) {
  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function setup() {
      const token = await registerForPushNotifications();
      if (!token || !mounted) return;

      // Persist the token to the authenticated user's profile row
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          await supabaseClient
            .from('profiles')
            .update({ expo_push_token: token })
            .eq('id', user.id);
        }
      } catch (err) {
        console.warn('[PushNotifications] Failed to save push token:', err);
      }
    }

    setup();

    // Listen for notifications received while the app is in the foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[PushNotifications] Foreground notification:', notification);
      }
    );

    // Handle tap on a notification — navigate to the relevant ticket
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (navigationRef?.current && data?.ticketId) {
          navigationRef.current.navigate('AdminTicketDetail', { ticketId: data.ticketId });
        }
      }
    );

    return () => {
      mounted = false;
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [supabaseClient, navigationRef]);
}
