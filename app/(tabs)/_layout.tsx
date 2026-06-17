import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.darkDeep,
          borderTopColor: Colors.darkCard,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.lilac,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Browse', tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} /> }} />
      <Tabs.Screen name="live" options={{ title: 'Live', tabBarIcon: ({ color }) => <Ionicons name="radio" size={20} color={color} /> }} />
      <Tabs.Screen name="tickets" options={{ title: 'My Tickets', tabBarIcon: ({ color }) => <Ionicons name="ticket" size={20} color={color} /> }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} /> }} />
    </Tabs>
  );
}
