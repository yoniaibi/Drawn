import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { useAuthStore } from '../../src/store';
import { checkForWins, WinResult } from '../../src/services/draws';
import { supabase } from '../../src/lib/supabase';

interface Order {
  drawId: string;
  drawTitle: string;
  ticketsBought: number;
  totalPaid: number; // pence
  purchasedAt: string;
  status: 'won' | 'entered' | 'completed';
  drawDate: string;
}

const STATUS_LABEL: Record<string, string> = {
  won: 'You won!',
  entered: 'Entered',
  completed: 'Draw complete',
};
const STATUS_COLOR: Record<string, string> = {
  won: Colors.gold,
  entered: Colors.lilac,
  completed: Colors.textSecondary,
};

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wins, setWins] = useState<WinResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([
      supabase
        .from('tickets')
        .select('draw_id, quantity, purchased_at, draws(title, draw_date, status, ticket_price)')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false }),
      checkForWins(user.id),
    ]).then(([{ data: ticketData }, winResults]) => {
      const winIds = new Set(winResults.map(w => w.drawId));
      setWins(winResults);
      const mapped: Order[] = (ticketData ?? []).map((t: any) => {
        const draw = t.draws;
        const isWon = winIds.has(t.draw_id);
        const isCompleted = draw?.status === 'completed';
        return {
          drawId: t.draw_id,
          drawTitle: draw?.title ?? 'Unknown draw',
          ticketsBought: t.quantity,
          totalPaid: t.quantity * (draw?.ticket_price ?? 0),
          purchasedAt: t.purchased_at,
          status: isWon ? 'won' : isCompleted ? 'completed' : 'entered',
          drawDate: draw?.draw_date ?? '',
        };
      });
      setOrders(mapped);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>My orders</Text>
        <Text style={styles.sub}>Every draw you've entered and won.</Text>

        {loading ? (
          <ActivityIndicator color={Colors.lilac} style={{ marginTop: Spacing.xl }} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="ticket-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptySub}>Browse draws and buy your first ticket to get started.</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.replace('/(tabs)' as any)}>
              <Text style={styles.browseBtnText}>Browse draws</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map(order => {
            const statusColor = STATUS_COLOR[order.status];
            const date = order.drawDate ? new Date(order.drawDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
            return (
              <TouchableOpacity
                key={order.drawId}
                style={[styles.orderCard, order.status === 'won' && styles.orderCardWon]}
                onPress={() => order.status === 'won' ? router.push(`/live/winner/${order.drawId}` as any) : router.push(`/draw/${order.drawId}` as any)}
              >
                <View style={styles.orderTop}>
                  <View style={[styles.orderIconBox, { backgroundColor: statusColor + '18' }]}>
                    <Ionicons
                      name={order.status === 'won' ? 'trophy' : order.status === 'completed' ? 'checkmark-circle-outline' : 'ticket-outline'}
                      size={18}
                      color={statusColor}
                    />
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderTitle} numberOfLines={1}>{order.drawTitle}</Text>
                    <Text style={styles.orderMeta}>
                      {order.ticketsBought} ticket{order.ticketsBought !== 1 ? 's' : ''} · {date}
                    </Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={[styles.orderStatus, { color: statusColor }]}>{STATUS_LABEL[order.status]}</Text>
                    <Text style={styles.orderPaid}>
                      £{(order.totalPaid / 100).toFixed(2)} paid
                    </Text>
                  </View>
                </View>
                {order.status === 'won' && (
                  <View style={styles.winBanner}>
                    <Ionicons name="gift-outline" size={14} color={Colors.gold} />
                    <Text style={styles.winBannerText}>Your item is on its way — check your email for delivery updates.</Text>
                  </View>
                )}
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
  content: { padding: Spacing.lg, paddingBottom: 48 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },
  emptyCard: { alignItems: 'center', padding: Spacing.xxl, gap: 10 },
  emptyTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  emptySub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  browseBtn: { marginTop: 8, backgroundColor: Colors.lilac, borderRadius: Radius.md, paddingHorizontal: Spacing.xl, paddingVertical: 10 },
  browseBtnText: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '700' },
  orderCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10, borderWidth: 1, borderColor: Colors.darkBorder, gap: 10 },
  orderCardWon: { borderColor: 'rgba(249,200,70,0.35)', backgroundColor: 'rgba(249,200,70,0.04)' },
  orderTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orderIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  orderInfo: { flex: 1 },
  orderTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  orderMeta: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: 2 },
  orderRight: { alignItems: 'flex-end' },
  orderStatus: { fontSize: FontSizes.xs, fontWeight: '700' },
  orderPaid: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: 2 },
  winBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(249,200,70,0.08)', borderRadius: Radius.sm, padding: 10 },
  winBannerText: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 16 },
});
