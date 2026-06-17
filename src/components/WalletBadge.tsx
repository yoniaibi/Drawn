import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store';
import { Colors, Radius, FontSizes } from '../theme';
import { formatTicketPrice } from '../utils/countdown';

export default function WalletBadge() {
  const balance = useAuthStore(s => s.walletBalance);
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.badge} onPress={() => router.push('/wallet')} activeOpacity={0.8}>
      <Text style={styles.text}>{formatTicketPrice(balance)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '700' },
});
