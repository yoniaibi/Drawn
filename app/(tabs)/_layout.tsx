import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme';

function TabBarBackground() {
  return (
    <View style={styles.tabBarBg} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.darkDeep,
          borderTopColor: Colors.darkBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          // Subtle elevated card shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 12,
        },
        tabBarActiveTintColor: Colors.lilac,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarBackground: () => <TabBarBackground />,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Browse', tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} /> }} />
      <Tabs.Screen name="live" options={{ title: 'Live', tabBarIcon: ({ color }) => <Ionicons name="radio" size={20} color={color} /> }} />
      <Tabs.Screen name="tickets" options={{ title: 'My Tickets', tabBarIcon: ({ color }) => <Ionicons name="ticket" size={20} color={color} /> }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBg: {
    flex: 1,
    backgroundColor: Colors.darkDeep,
    borderTopWidth: 1,
    borderTopColor: Colors.darkBorder,
  },
});
