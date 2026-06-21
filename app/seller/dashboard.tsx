import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import ProgressBar from '../../src/components/ProgressBar';
import { formatTicketPrice } from '../../src/utils/countdown';
import { useAuthStore } from '../../src/store';
import { fetchSellerDraws, fetchSellerStats, SellerStats } from '../../src/services/draws';
import type { Draw } from '../../src/mocks';

const STATUS_COLOR: Record<string, string> = {
  pending: Colors.textSecondary,
  open: Colors.lilac,
  closing_tonight: Colors.pink,
  completed: Colors.gold,
  cancelled: Colors.danger,
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting verification',
  open: 'Open',
  closing_tonight: 'Closing tonight',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function SellerDashboardScreen() {
  const router = useRouter();
  const { user, handle, isSeller } = useAuthStore();
  const isVerified = (useAuthStore.getState().profile as any)?.seller_verified ?? false;

  const [draws, setDraws] = useState<Draw[]>([]);
  const [stats, setStats] = useState<SellerStats>({ totalEarned: 0, pendingPayout: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchSellerDraws(user.id),
      fetchSellerStats(user.id),
    ]).then(([d, s]) => {
      setDraws(d);
      setStats(s);
    }).finally(() => setLoading(false));
  }, [user]);

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Seller Dashboard</Text>
        <Text style={styles.handle}>{handle}</Text>

        {/* Verification status banner */}
        {!isVerified && (
          <TouchableOpacity style={styles.verifyBanner} onPress={() => router.push('/seller/kyc')}>
            <View style={styles.verifyBannerLeft}>
              <Ionicons name="shield-outline" size={18} color={Colors.gold} />
              <View>
                <Text style={styles.verifyBannerTitle}>Identity not yet verified</Text>
                <Text style={styles.verifyBannerSub}>Verify your ID so your draws can go live</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.gold} />
          </TouchableOpacity>
        )}

        {/* Earnings cards */}
        <View style={styles.earningsRow}>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Total earned</Text>
            <Text style={styles.earningsVal}>
              {stats.totalEarned > 0 ? formatTicketPrice(stats.totalEarned) : '£0'}
            </Text>
          </View>
          <View style={[styles.earningsCard, { borderColor: 'rgba(249,200,70,0.3)' }]}>
            <Text style={styles.earningsLabel}>Pending payout</Text>
            <Text style={[styles.earningsVal, { color: Colors.gold }]}>
              {stats.pendingPayout > 0 ? formatTicketPrice(stats.pendingPayout) : '£0'}
            </Text>
          </View>
        </View>

        <PrimaryButton
          label="+ List a new item"
          onPress={() => router.push('/seller/list/type')}
          style={{ marginBottom: Spacing.xl }}
        />

        <Text style={styles.sectionLabel}>YOUR DRAWS</Text>

        {loading ? (
          <ActivityIndicator color={Colors.lilac} style={{ marginTop: Spacing.xl }} />
        ) : draws.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="cube-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No draws yet</Text>
            <Text style={styles.emptySub}>List your first item to start earning.</Text>
          </View>
        ) : (
          draws.map(draw => {
            const progress = draw.ticketsSold / draw.totalTickets;
            const earned = Math.round(draw.ticketsSold * draw.ticketPrice * 0.846);
            const statusColor = STATUS_COLOR[draw.status] ?? Colors.textSecondary;
            return (
              <TouchableOpacity key={draw.id} style={styles.drawCard} onPress={() => router.push(`/draw/${draw.id}`)}>
                <View style={styles.drawTop}>
                  <View style={styles.drawIconBox}>
                    <Ionicons name="ticket-outline" size={18} color={Colors.lilac} />
                  </View>
                  <View style={styles.drawInfo}>
                    <Text style={styles.drawTitle} numberOfLines={1}>{draw.title}</Text>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.drawStatus, { color: statusColor }]}>
                        {STATUS_LABEL[draw.status] ?? draw.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.drawEarning}>{formatTicketPrice(earned)}</Text>
                </View>
                <ProgressBar progress={progress} height={4} />
                <Text style={styles.drawProgress}>
                  {draw.ticketsSold.toLocaleString()} / {draw.totalTickets.toLocaleString()} tickets · {Math.round(progress * 100)}%
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white },
  handle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  verifyBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(249,200,70,0.08)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.25)',
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  verifyBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  verifyBannerTitle: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '700' },
  verifyBannerSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  earningsRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  earningsCard: {
    flex: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.darkBorder,
  },
  earningsLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 4 },
  earningsVal: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, letterSpacing: 0.8, marginBottom: 12 },
  drawCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10, gap: 8 },
  drawTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  drawIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(139,92,246,0.12)', alignItems: 'center', justifyContent: 'center' },
  drawInfo: { flex: 1 },
  drawTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  drawStatus: { fontSize: FontSizes.xs, textTransform: 'capitalize' },
  drawEarning: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.gold },
  drawProgress: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  emptyCard: { alignItems: 'center', padding: Spacing.xxl, gap: 10 },
  emptyTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  emptySub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center' },
});
