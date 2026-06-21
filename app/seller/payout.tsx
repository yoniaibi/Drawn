import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import { useAuthStore } from '../../src/store';
import { fetchSellerStats, SellerStats } from '../../src/services/draws';
import { formatTicketPrice } from '../../src/utils/countdown';
import { useEffect } from 'react';

export default function SellerPayoutScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<SellerStats>({ totalEarned: 0, pendingPayout: 0 });

  useEffect(() => {
    if (user) fetchSellerStats(user.id).then(setStats).catch(() => {});
  }, [user?.id]);

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Payouts</Text>
        <Text style={styles.sub}>
          Earnings are released once a draw completes and the winner confirms receipt. Payouts process within 3–5 business days.
        </Text>

        {/* Balance cards */}
        <View style={styles.balanceRow}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total earned</Text>
            <Text style={styles.balanceVal}>
              {stats.totalEarned > 0 ? formatTicketPrice(stats.totalEarned) : '£0'}
            </Text>
          </View>
          <View style={[styles.balanceCard, { borderColor: 'rgba(249,200,70,0.3)' }]}>
            <Text style={styles.balanceLabel}>Pending payout</Text>
            <Text style={[styles.balanceVal, { color: Colors.gold }]}>
              {stats.pendingPayout > 0 ? formatTicketPrice(stats.pendingPayout) : '£0'}
            </Text>
          </View>
        </View>

        {/* Fee explanation */}
        <View style={styles.feeCard}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.lilac} />
          <Text style={styles.feeText}>
            DRAWN takes a 15.4% platform fee. You receive 84.6% of total ticket revenue once the draw completes.
          </Text>
        </View>

        {/* Payment method — placeholder for Stripe Connect */}
        <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
        <View style={styles.comingSoonCard}>
          <View style={styles.comingSoonIconBox}>
            <Ionicons name="card-outline" size={28} color={Colors.lilac} />
          </View>
          <Text style={styles.comingSoonTitle}>Bank transfer coming soon</Text>
          <Text style={styles.comingSoonSub}>
            We're setting up direct bank transfers via Stripe. For now, payouts are processed manually — we'll contact you at your registered email when a payout is ready.
          </Text>
        </View>

        {/* Schedule */}
        <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>PAYOUT SCHEDULE</Text>
        {[
          { icon: 'checkmark-circle-outline' as const, label: 'Draw completes', sub: 'Winner confirmed at 9pm' },
          { icon: 'cube-outline' as const, label: 'Winner confirms receipt', sub: 'Within 7 days of delivery' },
          { icon: 'cash-outline' as const, label: 'We release your funds', sub: '3–5 business days after confirmation' },
        ].map(s => (
          <View key={s.label} style={styles.scheduleRow}>
            <Ionicons name={s.icon} size={20} color={Colors.lilac} />
            <View>
              <Text style={styles.scheduleLabel}>{s.label}</Text>
              <Text style={styles.scheduleSub}>{s.sub}</Text>
            </View>
          </View>
        ))}

        {/* Contact */}
        <View style={styles.contactCard}>
          <Ionicons name="mail-outline" size={16} color={Colors.gold} />
          <Text style={styles.contactText}>
            Questions about a payout? Email{' '}
            <Text style={styles.contactEmail}>sellers@drawn.co.uk</Text>
            {' '}with your handle and draw title.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { padding: Spacing.lg, paddingBottom: 48 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
  balanceRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.md },
  balanceCard: { flex: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.darkBorder },
  balanceLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 4 },
  balanceVal: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white },
  feeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', padding: Spacing.md, marginBottom: Spacing.xl },
  feeText: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 18 },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, letterSpacing: 0.8, marginBottom: 12 },
  comingSoonCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.darkBorder, padding: Spacing.xl, alignItems: 'center', gap: 10 },
  comingSoonIconBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(139,92,246,0.12)', alignItems: 'center', justifyContent: 'center' },
  comingSoonTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700', textAlign: 'center' },
  comingSoonSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 8, borderWidth: 1, borderColor: Colors.darkBorder },
  scheduleLabel: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600' },
  scheduleSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  contactCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(249,200,70,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)', padding: Spacing.md, marginTop: Spacing.xl },
  contactText: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 18 },
  contactEmail: { color: Colors.gold, fontWeight: '700' },
});
