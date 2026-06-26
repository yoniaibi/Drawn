import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts, PlayfairDisplay_700Bold_Italic } from '@expo-google-fonts/playfair-display';
import { useEffect, Component, ReactNode } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ScrollView, Platform } from 'react-native';
import { Colors } from '../src/theme';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store';
import '../src/lib/amplify';

try { SplashScreen.preventAutoHideAsync(); } catch {}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <View style={{ flex: 1, backgroundColor: '#0F0A1E', padding: 24, paddingTop: 60 }}>
          <Text style={{ color: '#F472B6', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
            App Error (web debug)
          </Text>
          <ScrollView>
            <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'monospace' }}>
              {err.message}{'\n\n'}{err.stack}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ PlayfairDisplay_700Bold_Italic });
  const { setSession, refreshProfile, session } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  // Expose router to window for E2E test navigation (web/dev only)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      (window as any).__drawnNavigate = (path: string) => router.push(path as any);
    }
  }, [router]);

  // Listen for auth state changes (Amplify-backed shim)
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session as any);
        if (session) refreshProfile();
      })
      .catch(() => setSession(null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as any);
      if (session) refreshProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle deep links (Cognito sends ?code= for email confirmation)
  useEffect(() => {
    async function handleUrl(url: string) {
      const parsed = Linking.parse(url);
      const params = parsed.queryParams ?? {};
      const type = params['type'] as string | undefined;
      // Cognito password reset deep link
      if (type === 'recovery') {
        router.replace('/(auth)/reset-password');
      }
    }

    Linking.getInitialURL().then(url => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    const inAuth = segments[0] === '(auth)';
    if (!session && !inAuth) {
      router.replace('/(auth)');
    } else if (session && inAuth) {
      router.replace('/(tabs)');
    }
  }, [session]);

  useEffect(() => { SplashScreen.hideAsync(); }, []);

  return (
    <ErrorBoundary>
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
        <Stack.Screen name="seller/gate" options={{ headerShown: false }} />
        <Stack.Screen name="seller/apply" options={{ headerShown: false }} />
        <Stack.Screen name="seller/kyc" options={{ headerShown: false }} />
        <Stack.Screen name="seller/kyc-approved" options={{ headerShown: false }} />
        <Stack.Screen name="seller/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="seller/payout" options={{ headerShown: false }} />
        <Stack.Screen name="seller/draw-complete/[drawId]" options={{ headerShown: false }} />
        <Stack.Screen name="seller/item/[drawId]" options={{ headerShown: false }} />
        <Stack.Screen name="account/settings" options={{ headerShown: false }} />
        <Stack.Screen name="account/orders" options={{ headerShown: false }} />
        <Stack.Screen name="saved/index" options={{ headerShown: false }} />
        <Stack.Screen name="browse/[category]" options={{ headerShown: false }} />
        <Stack.Screen name="seller/profile/[handle]" options={{ headerShown: false }} />
        <Stack.Screen name="draw/qa/[drawId]" options={{ headerShown: false }} />
        <Stack.Screen name="share/[drawId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="search/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="legal/terms" options={{ headerShown: false }} />
        <Stack.Screen name="legal/privacy" options={{ headerShown: false }} />
        <Stack.Screen name="legal/seller-terms" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
    </ErrorBoundary>
  );
}
