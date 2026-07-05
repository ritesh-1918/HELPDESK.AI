import 'react-native-gesture-handler';
import LogRocket from '@logrocket/react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './src/lib/supabase';
import { COLORS } from './src/styles/theme';
import { LayoutDashboard, Ticket, User } from 'lucide-react-native';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Notification system
import { NotificationProvider } from './src/components/NotificationProvider';

// Auth Screens
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import AdminSignupScreen from './src/screens/auth/AdminSignupScreen';
import UserLobbyScreen from './src/screens/auth/UserLobbyScreen';

// User Screens
import DashboardScreen from './src/screens/user/DashboardScreen';
import CreateTicketScreen from './src/screens/user/CreateTicketScreen';
import TicketDetailScreen from './src/screens/user/TicketDetailScreen';
import ProfileScreen from './src/screens/user/ProfileScreen';
import TicketsListScreen from './src/screens/user/TicketsListScreen';
import TicketTrackingScreen from './src/screens/user/TicketTrackingScreen';
import AIProcessingScreen from './src/screens/user/AIProcessingScreen';
import NotificationsScreen from './src/screens/user/NotificationsScreen';
import KnowledgeBaseScreen from './src/screens/user/KnowledgeBaseScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') return <LayoutDashboard size={size} color={color} />;
          if (route.name === 'Tickets') return <Ticket size={size} color={color} />;
          if (route.name === 'Profile') return <User size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: insets.bottom + 8,
          paddingTop: 10,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tickets" component={TicketsListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Inner app that has access to SafeAreaProvider context
const AppContent = () => {
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [userStatus, setUserStatus] = useState(null); // 'active', 'pending_approval', 'rejected'

  useEffect(() => {
    // Initialize LogRocket
    LogRocket.init('ky7sla/helpdeskai');

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          // Identify user in LogRocket
          LogRocket.identify(session.user.id, {
            email: session.user.email,
            name: session.user.user_metadata?.full_name || 'User',
          });

          const { data } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', session.user.id)
            .single();
          setUserStatus(data?.status || 'active');
        }

        const onboardingDone = await AsyncStorage.getItem('@onboarding_complete');
        setShowOnboarding(onboardingDone === null);
      } catch (e) {
        console.log('Init error', e);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        // Identify user in LogRocket on auth change
        LogRocket.identify(session.user.id, {
          email: session.user.email,
          name: session.user.user_metadata?.full_name || 'User',
        });

        // Fetch profile status for routing
        const { data } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', session.user.id)
          .single();
        setUserStatus(data?.status || 'active');
      } else {
        setUserStatus(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Also subscribe to profile changes to catch approval in real-time
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel(`app-profile-${session.user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${session.user.id}`,
      }, (payload) => {
        setUserStatus(payload.new.status);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [session?.user?.id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b1120' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isAuthenticated = !!session;
  const isActive = userStatus === 'active';
  const isPending = userStatus === 'pending_approval';
  const isRejected = userStatus === 'rejected';

  return (
    <NotificationProvider topInset={insets.top}>
      <NavigationContainer>
        <StatusBar style={isAuthenticated && isActive ? 'dark' : 'light'} />
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {!isAuthenticated ? (
            // ─── Unauthenticated ───
            <>
              {showOnboarding && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="AdminSignup" component={AdminSignupScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ animation: 'slide_from_right' }} />
            </>
          ) : (isPending || isRejected) ? (
            // ─── Pending / Rejected ───
            <Stack.Screen name="UserLobby" component={UserLobbyScreen} />
          ) : (
            // ─── Active user ───
            <>
               <Stack.Screen name="MainTabs" component={TabNavigator} />
              <Stack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="AIProcessing" component={AIProcessingScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="TicketTracking" component={TicketTrackingScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="KnowledgeBase" component={KnowledgeBaseScreen} options={{ animation: 'slide_from_right' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
