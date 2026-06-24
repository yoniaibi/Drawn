import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../src/theme';
import PurchaseToast from '../../src/components/PurchaseToast';
import { useGrandDrawStore } from '../../src/store';

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

function GrandDrawTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { todayTicketClaimed } = useGrandDrawStore();
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={focused ? 'gift' : 'gift-outline'} size={20} color={color} />
      {!todayTicketClaimed && (
        <View style={styles.grandBadge} />
      )}
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
            backgroundColor: '#100c20',
            borderTopColor: 'rgba(139,92,246,0.18)',
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 10,
            paddingTop: 4,
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 16,
          },
          tabBarActiveTintColor: Colors.lilac,
          tabBarInactiveTintColor: Colors.textTertiary,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
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
          name="grand-draw"
          options={{
            title: 'Grand Draw',
            tabBarActiveTintColor: Colors.gold,
            tabBarIcon: ({ color, focused }) => <GrandDrawTabIcon color={color} focused={focused} />,
          }}
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
  grandBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1,
    borderColor: '#100c20',
  },
});
