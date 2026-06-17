import { Stack } from 'expo-router';
import { useFonts, PlayfairDisplay_700Bold_Italic } from '@expo-google-fonts/playfair-display';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../src/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold_Italic });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
      </Stack>
    </SafeAreaProvider>
  );
}
