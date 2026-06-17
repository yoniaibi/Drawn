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
  open: Colors.lilac,
  closing_tonight: Colors.pink,
  completed: Colors.gold,
  cancelled: Colors.danger,
};

export default function SellerDashboardScreen() {
  const router = useRouter();
  const { user, handle } = useAuthStore();

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
            <Text style={styles.emptyEmoji}>📦</Text>
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
                  <Text style={styles.drawEmoji}>{draw.emoji}</Text>
                  <View style={styles.drawInfo}>
                    <Text style={styles.drawTitle} numberOfLines={1}>{draw.title}</Text>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.drawStatus, { color: statusColor }]}>
                        {draw.status.replace('_', ' ')}
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
  handle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
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
  drawEmoji: { fontSize: 24 },
  drawInfo: { flex: 1 },
  drawTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  drawStatus: { fontSize: FontSizes.xs, textTransform: 'capitalize' },
  drawEarning: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.gold },
  drawProgress: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  emptyCard: { alignItems: 'center', padding: Spacing.xxl, gap: 8 },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  emptySub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center' },
});
