import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../src/theme';
import PurchaseToast from '../../src/components/PurchaseToast';

function LiveTabIcon({ color }: { color: string }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.4, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
    );
  }, []);
  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="radio" size={20} color={color} />
      <Animated.View style={[styles.liveDot, dotStyle]} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.darkDeep,
            borderTopColor: Colors.darkBorder,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 12,
          },
          tabBarActiveTintColor: Colors.lilac,
          tabBarInactiveTintColor: Colors.textTertiary,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Browse', tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} /> }}
        />
        <Tabs.Screen
          name="live"
          options={{ title: 'Live', tabBarIcon: ({ color }) => <LiveTabIcon color={color} /> }}
        />
        <Tabs.Screen
          name="tickets"
          options={{ title: 'My Tickets', tabBarIcon: ({ color }) => <Ionicons name="ticket" size={20} color={color} /> }}
        />
        <Tabs.Screen
          name="account"
          options={{ title: 'Account', tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} /> }}
        />
      </Tabs>

      {/* Global purchase activity toast — floats over all tab screens */}
      <PurchaseToast />
    </View>
  );
}

const styles = StyleSheet.create({
  liveDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.pink,
  },
});
