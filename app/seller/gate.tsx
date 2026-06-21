import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';

const PERKS = [
  { icon: 'cash-outline', text: 'Get paid within 24h of the draw', color: '#4ADE80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)' },
  { icon: 'shield-checkmark-outline', text: 'Items held in custody — buyers trust you instantly', color: '#7DD3FC', bg: 'rgba(125,211,252,0.1)', border: 'rgba(125,211,252,0.25)' },
  { icon: 'people-outline', text: 'Every draw gets thousands of eyes at 9pm', color: Colors.lilac, bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' },
  { icon: 'pricetag-outline', text: 'First draw commission-free (founding sellers only)', color: Colors.gold, bg: 'rgba(249,200,70,0.1)', border: 'rgba(249,200,70,0.25)' },
];

export default function SellerGateScreen() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>LIMITED — 100 SPOTS</Text>
        </View>
        <Text style={styles.title}>Become a founding seller.</Text>
        <Text style={styles.sub}>
          Got a bag, watch, or pair of trainers that won't sell? List it on DRAWN and a crowd of ticket buyers turns it into real cash tonight.
        </Text>

        <View style={styles.perks}>
          {PERKS.map((p, i) => (
            <View key={i} style={styles.perkRow}>
              <View style={[styles.perkIcon, { backgroundColor: p.bg, borderColor: p.border }]}>
                <Ionicons name={p.icon as any} size={22} color={p.color} />
              </View>
              <Text style={styles.perkText}>{p.text}</Text>
            </View>
          ))}
        </View>

        <PrimaryButton label="Apply to sell" onPress={() => router.push('/seller/apply')} style={{ marginBottom: Spacing.sm }} />
        <TouchableOpacity onPress={() => router.back()} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary }}>Maybe later</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ink, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  badge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(244,114,182,0.18)',
    borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16,
  },
  badgeText: { fontSize: FontSizes.xs, color: Colors.pink, fontWeight: '700', letterSpacing: 0.6 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xxl, color: Colors.white, marginBottom: 12, lineHeight: 38 },
  sub: { fontSize: FontSizes.base, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xl },
  perks: { gap: 14, marginBottom: Spacing.xl },
  perkRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  perkIcon: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  perkText: { flex: 1, fontSize: FontSizes.base, color: Colors.textSecondary, lineHeight: 22, paddingTop: 12 },
});
