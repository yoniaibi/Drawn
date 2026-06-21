import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { useAuthStore } from '../../src/store';
import { fetchWalletTransactions, checkForWins, WalletTransaction, WinResult } from '../../src/services/draws';

type NotifItem = {
  id: string;
  type: 'win' | 'payout' | 'purchase' | 'reminder' | 'threshold' | 'approved';
  title: string;
  body: string;
  time: string;
  read: boolean;
  drawId?: string;
};

function mapTxnToNotif(t: WalletTransaction): NotifItem {
  const isPayout = t.amount > 0 && t.label.toLowerCase().includes('payout');
  const isWin = t.label.toLowerCase().includes('won') || t.label.toLowerCase().includes('winner');
  const type: NotifItem['type'] = isWin ? 'win' : isPayout ? 'payout' : 'purchase';
  return {
    id: t.id,
    type,
    title: isWin ? 'You won!' : isPayout ? 'Payout received' : 'Tickets purchased',
    body: t.label,
    time: t.date,
    read: false,
  };
}

function mapWinToNotif(w: WinResult): NotifItem {
  return {
    id: `win-${w.drawId}`,
    type: 'win',
    title: `You won — ${w.drawTitle}`,
    body: `Worth £${(w.retailValue / 100).toFixed(0)} — congratulations! We'll be in touch to arrange delivery.`,
    time: w.completedAt ? new Date(w.completedAt).toLocaleDateString() : 'Recently',
    read: false,
    drawId: w.drawId,
  };
}

function iconForType(type: NotifItem['type']): { name: string; color: string } {
  switch (type) {
    case 'win':      return { name: 'trophy', color: Colors.gold };
    case 'payout':   return { name: 'cash', color: Colors.pink };
    case 'purchase': return { name: 'ticket', color: Colors.lilac };
    case 'reminder':
    case 'threshold': return { name: 'alarm', color: Colors.lilac };
    case 'approved': return { name: 'shield-checkmark', color: Colors.pink };
    default:         return { name: 'notifications', color: Colors.textSecondary };
  }
}

function bgForType(type: NotifItem['type']): string {
  switch (type) {
    case 'win':      return 'rgba(249,200,70,0.08)';
    case 'payout':
    case 'approved': return 'rgba(244,114,182,0.08)';
    default:         return Colors.darkCard;
  }
}

function borderForType(type: NotifItem['type']): string {
  switch (type) {
    case 'win':      return 'rgba(249,200,70,0.2)';
    case 'payout':
    case 'approved': return 'rgba(244,114,182,0.2)';
    default:         return Colors.darkBorder;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [items, setItems] = useState<NotifItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    Promise.all([
      fetchWalletTransactions(user.id),
      checkForWins(user.id),
    ]).then(([txns, wins]) => {
      const winNotifs = wins.map(mapWinToNotif);
      const txnNotifs = txns.map(mapTxnToNotif);
      setItems([...winNotifs, ...txnNotifs]);
    }).finally(() => setLoading(false));
  }, [user]);

  function markRead(id: string) {
    setReadIds(prev => new Set([...prev, id]));
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 34 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.lilac} style={{ marginTop: 60 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="notifications-outline" size={32} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptySub}>Draw alerts and win announcements will appear here.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.replace('/(tabs)' as any)}>
            <Text style={styles.emptyBtnText}>Browse draws →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {items.map(n => {
            const isRead = n.read || readIds.has(n.id);
            const { name: iconName, color: iconColor } = iconForType(n.type);
            return (
              <TouchableOpacity
                key={n.id}
                style={[
                  styles.row,
                  { backgroundColor: bgForType(n.type), borderColor: borderForType(n.type) },
                  !isRead && styles.rowUnread,
                ]}
                onPress={() => {
                  markRead(n.id);
                  if (n.drawId) router.push(`/live/winner/${n.drawId}` as any);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, { backgroundColor: `${iconColor}22` }]}>
                  <Ionicons name={iconName as any} size={18} color={iconColor} />
                </View>
                <View style={styles.textBox}>
                  <Text style={styles.rowTitle}>{n.title}</Text>
                  <Text style={styles.rowBody}>{n.body}</Text>
                </View>
                <View style={styles.meta}>
                  <Text style={styles.time}>{n.time}</Text>
                  {!isRead && <View style={styles.unreadDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.darkBorder,
  },
  back: { padding: 4 },
  headerTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.md, color: Colors.white },
  list: { padding: Spacing.md, gap: 10, paddingBottom: 40 },
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1,
  },
  rowUnread: { borderLeftWidth: 3, borderLeftColor: Colors.lilac },
  iconBox: {
    width: 36, height: 36, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  textBox: { flex: 1 },
  rowTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600', marginBottom: 2 },
  rowBody: { fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 16 },
  meta: { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  time: { fontSize: 9, color: Colors.textTertiary },
  unreadDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: Colors.lilac },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: Spacing.xxl },
  emptyIconBox: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(139,92,246,0.1)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  emptySub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  emptyBtn: { marginTop: 8, backgroundColor: Colors.lilac, borderRadius: Radius.pill, paddingHorizontal: 28, paddingVertical: 12 },
  emptyBtnText: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
});
