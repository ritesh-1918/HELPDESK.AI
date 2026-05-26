import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './src/lib/supabase';
import { COLORS } from './src/styles/theme';
import { LayoutDashboard, Ticket, User, Settings, ShieldAlert, Users } from 'lucide-react-native';
import { View, ActivityIndicator, Linking } from 'react-native';
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

// Admin Screens
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import AdminTicketsScreen from './src/screens/admin/AdminTicketsScreen';
import AdminTicketDetailScreen from './src/screens/admin/AdminTicketDetailScreen';
import AdminUsersScreen from './src/screens/admin/AdminUsersScreen';
import AdminSettingsScreen from './src/screens/admin/AdminSettingsScreen';

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

const AdminTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'AdminDashboard') return <LayoutDashboard size={size} color={color} />;
          if (route.name === 'Tickets') return <Ticket size={size} color={color} />;
          if (route.name === 'Users') return <Users size={size} color={color} />;
          if (route.name === 'Settings') return <Settings size={size} color={color} />;
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
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Tickets" component={AdminTicketsScreen} />
      <Tab.Screen name="Users" component={AdminUsersScreen} />
      <Tab.Screen name="Settings" component={AdminSettingsScreen} />
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
  const [userRole, setUserRole] = useState('user'); // 'user', 'admin', 'master_admin'

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('status, role')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.log('[AuthInit] Profile fetch error, validating session:', error.message);
            // Verify if session is still validly active (GetUser forces refresh if expired)
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) {
              console.log('[AuthInit] Token validation failed. Clearing session.');
              setSession(null);
            } else {
              // Valid token but profiles table is temporarily offline; default to user
              setUserStatus('active');
              setUserRole('user');
            }
          } else {
            setUserStatus(data?.status || 'active');
            setUserRole(data?.role || 'user');
          }
        }
      } catch (e) {
        console.log('[AuthInit] Crash caught during initialization:', e);
      } finally {
        // Guarantee showOnboarding is resolved to a boolean to prevent React Navigation stack layout mismatch
        try {
          const onboardingDone = await AsyncStorage.getItem('@onboarding_complete');
          setShowOnboarding(onboardingDone === null);
        } catch (err) {
          setShowOnboarding(false);
        }
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('status, role')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.log('[AuthChange] Profile query failed:', error.message);
            // Default to safe values to avoid blank screens
            setUserStatus('active');
            setUserRole('user');
          } else {
            setUserStatus(data?.status || 'active');
            setUserRole(data?.role || 'user');
          }
        } catch (err) {
          console.warn('[AuthChange] Uncaught exception inside handler:', err);
          setUserStatus('active');
          setUserRole('user');
        }
      } else {
        setUserStatus(null);
        setUserRole('user');
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
        setUserRole(payload.new.role || 'user');
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [session?.user?.id]);

  // Deep link listener for magic link / email verification callbacks
  useEffect(() => {
    const handleUrl = async ({ url }) => {
      if (!url) return;
      // Parse hash fragment: helpdeskai://login#access_token=...&refresh_token=...
      const hashIndex = url.indexOf('#');
      if (hashIndex === -1) return;
      const hash = url.substring(hashIndex + 1);
      const params = {};
      hash.split('&').forEach(pair => {
        const [key, val] = pair.split('=');
        if (key && val) params[key] = decodeURIComponent(val);
      });
      if (params.access_token && params.refresh_token) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (error) {
            console.warn('[DeepLink] Failed to set session:', error.message);
          } else {
            console.log('[DeepLink] Session set successfully for:', data.user?.email);
          }
        } catch (e) {
          console.warn('[DeepLink] Error parsing magic link:', e);
        }
      }
    };

    // Handle app already open
    const subscription = Linking.addEventListener('url', handleUrl);
    // Handle cold start — app launched from the link
    Linking.getInitialURL().then(url => url && handleUrl({ url }));

    return () => subscription.remove();
  }, []);

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
  const isAdmin = userRole === 'admin' || userRole === 'master_admin';

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
               {isAdmin ? (
                 <Stack.Screen name="MainTabs" component={AdminTabNavigator} />
               ) : (
                 <Stack.Screen name="MainTabs" component={TabNavigator} />
               )}
              <Stack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="AIProcessing" component={AIProcessingScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="TicketTracking" component={TicketTrackingScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="KnowledgeBase" component={KnowledgeBaseScreen} options={{ animation: 'slide_from_right' }} />
              
              {/* Admin specific screens */}
              <Stack.Screen name="AdminTicketDetail" component={AdminTicketDetailScreen} options={{ animation: 'slide_from_right' }} />
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
