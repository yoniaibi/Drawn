import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts, PlayfairDisplay_700Bold_Italic } from '@expo-google-fonts/playfair-display';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../src/theme';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold_Italic });
  const { setSession, refreshProfile, session, loading } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  // Listen for Supabase auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) refreshProfile();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) refreshProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect based on auth state once fonts + session are resolved
  useEffect(() => {
    if (!fontsLoaded || loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!session && !inAuth) {
      router.replace('/(auth)');
    } else if (session && inAuth) {
      router.replace('/(tabs)');
    }
  }, [session, fontsLoaded, loading]);

  useEffect(() => {
    if (fontsLoaded && !loading) SplashScreen.hideAsync();
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.darkBg } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="draw/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="draw/bundle/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="live/wheel/[drawId]" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="live/winner/[drawId]" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="purchase/[drawId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="wallet/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="seller/gate" />
        <Stack.Screen name="seller/apply" />
        <Stack.Screen name="seller/kyc" />
        <Stack.Screen name="seller/kyc-approved" />
        <Stack.Screen name="seller/dashboard" />
        <Stack.Screen name="share/[drawId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="search/index" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
