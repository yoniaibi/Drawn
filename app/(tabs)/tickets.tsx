import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { Draw, MOCK_MY_TICKETS } from '../../src/mocks';
import { fetchMyTickets } from '../../src/services/draws';
import { useAuthStore } from '../../src/store';
import { supabase } from '../../src/lib/supabase';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import ProgressBar from '../../src/components/ProgressBar';
import { formatTicketPrice } from '../../src/utils/countdown';
import { requestNotificationPermission, scheduleDailyDrawReminder } from '../../src/services/notifications';

function getOddsColor(pct: number) {
  if (pct >= 1) return Colors.gold;
  if (pct >= 0.5) return Colors.lilac;
  return Colors.textSecondary;
}

export default function TicketsScreen() {
  const router = useRouter();
  const { user, notifyBeforeClose } = useAuthStore();
  const [myTickets, setMyTickets] = useState<Draw[]>(MOCK_MY_TICKETS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setMyTickets(MOCK_MY_TICKETS);
      setLoading(false);
      return;
    }
    fetchMyTickets(user.id).then(async result => {
      setMyTickets(result);
      setLoading(false);
      if (notifyBeforeClose) {
        const granted = await requestNotificationPermission();
        if (granted) {
          const highestValue = result.length > 0
            ? result.reduce((max, d) => d.retailValue > max.retailValue ? d : max, result[0])
            : null;
          const totalCount = result.reduce((s, d) => s + d.myTickets, 0);
          await scheduleDailyDrawReminder(
            highestValue ? `£${highestValue.retailValue.toLocaleString()} ${highestValue.title}` : undefined,
            totalCount > 0 ? totalCount : undefined,
          );
        }
      }
    });

    // Real-time tickets_sold updates so "your odds" stays live
    const channel = supabase
      .channel('tickets-draws-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'draws' },
        (payload) => {
          if (payload.new && typeof payload.new.tickets_sold === 'number') {
            setMyTickets(prev =>
              prev.map(d =>
                d.id === payload.new.id
                  ? { ...d, ticketsSold: payload.new.tickets_sold }
                  : d
              )
            );
          }
        },
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [user?.id]);

  const totalTickets = myTickets.reduce((s, d) => s + d.myTickets, 0);
  const totalValue = myTickets.reduce((s, d) => s + d.retailValue, 0);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.heading}>My Tickets</Text>
        <Text style={styles.sub}>
          {myTickets.length === 0
            ? 'No draws entered yet'
            : `You're in ${myTickets.length} draw${myTickets.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>{totalTickets}</Text>
          <Text style={styles.summaryLabel}>tickets held</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: Colors.gold }]}>£{totalValue.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>could win tonight</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryVal}>{myTickets.length}</Text>
          <Text style={styles.summaryLabel}>draws entered</Text>
        </View>
      </View>

      {/* Callout */}
      <View style={styles.callout}>
        <Ionicons name="flash" size={14} color={Colors.gold} />
        <Text style={styles.calloutText}>
          {myTickets.length > 0
            ? <>Win up to <Text style={styles.calloutBold}>£{Math.max(...myTickets.map(d => d.retailValue)).toLocaleString()}</Text> for as little as <Text style={styles.calloutBold}>{formatTicketPrice(Math.min(...myTickets.map(d => d.ticketPrice)))}</Text></>
            : 'Enter a draw to see your potential winnings'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.lilac} />
        </View>
      ) : (
      <FlatList
        data={myTickets}
        keyExtractor={d => d.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const progress = item.ticketsSold / item.totalTickets;
          const isTonight = item.status === 'closing_tonight';
          const myOddsPct = (item.myTickets / item.totalTickets) * 100;
          const remaining = item.totalTickets - item.ticketsSold;
          const valueRatio = `${item.ticketPrice}p ticket → £${item.retailValue.toLocaleString()} prize`;

          return (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/draw/${item.id}`)}>
              {/* Top */}
              <View style={styles.cardTop}>
                <View style={styles.emojiBox}>
                  {item.image
                    ? <Image source={{ uri: item.image }} style={styles.thumbImg} />
                    : <View style={styles.thumbPlaceholder}><Ionicons name="ticket-outline" size={22} color={Colors.lilac} /></View>}
                  {isTonight && <View style={styles.tonightDot} />}
                </View>
                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    {item.verified && (
                      <Ionicons name="checkmark-circle" size={12} color={Colors.lilac} />
                    )}
                  </View>
                  <Text style={styles.seller}>{item.seller}</Text>
                  <Text style={styles.valueRatio}>{valueRatio}</Text>
                  <View style={styles.progressRow}>
                    <ProgressBar
                      progress={progress}
                      height={5}
                      color={progress > 0.85 ? Colors.danger : Colors.lilac}
                    />
                    <Text style={styles.progressLabel}>{Math.round(progress * 100)}%</Text>
                  </View>
                  {remaining < 500 && (
                    <Text style={styles.scarcity}>Only {remaining} tickets left</Text>
                  )}
                </View>
              </View>

              {/* Status tag */}
              <View style={[styles.statusTag, { backgroundColor: isTonight ? 'rgba(244,114,182,0.12)' : 'rgba(139,92,246,0.12)' }]}>
                <View style={[styles.statusDot, { backgroundColor: isTonight ? Colors.pink : Colors.lilac }]} />
                <Text style={[styles.statusText, { color: isTonight ? Colors.pink : Colors.lilac }]}>
                  {isTonight ? 'Draws tonight at 9pm' : 'Draws tomorrow at 9pm'}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Bottom stats */}
              <View style={styles.cardBottom}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.myTickets}</Text>
                  <Text style={styles.statLabel}>your tickets</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{formatTicketPrice(item.ticketPrice)}</Text>
                  <Text style={styles.statLabel}>each</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statVal, { color: getOddsColor(myOddsPct) }]}>
                    {myOddsPct.toFixed(2)}%
                  </Text>
                  <Text style={styles.statLabel}>your odds</Text>
                </View>
                <TouchableOpacity
                  style={styles.addMore}
                  onPress={e => { e.stopPropagation?.(); router.push(`/purchase/${item.id}`); }}
                >
                  <Ionicons name="add" size={12} color={Colors.white} />
                  <Text style={styles.addMoreText}>More</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎫</Text>
            <Text style={styles.emptyTitle}>No tickets yet</Text>
            <Text style={styles.emptySub}>Enter your first draw for as little as 10p. Tonight's closes at 9pm.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.emptyBtnText}>Browse tonight's draws →</Text>
            </TouchableOpacity>
          </View>
        }
      />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  heading: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },

  summaryStrip: {
    flexDirection: 'row', backgroundColor: Colors.darkCard,
    marginHorizontal: Spacing.lg, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  summaryLabel: { fontSize: 9, color: Colors.textSecondary, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: Colors.darkBorder },

  callout: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
    backgroundColor: 'rgba(249,200,70,0.08)', borderRadius: Radius.sm,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)',
    padding: Spacing.sm,
  },
  calloutText: { fontSize: FontSizes.xs, color: Colors.textSecondary, flex: 1 },
  calloutBold: { color: Colors.gold, fontWeight: '700' },

  list: { paddingHorizontal: Spacing.lg, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: Spacing.sm },
  emojiBox: { position: 'relative' },
  thumbImg: { width: 52, height: 52, borderRadius: 10 },
  thumbPlaceholder: { width: 52, height: 52, borderRadius: 10, backgroundColor: 'rgba(139,92,246,0.12)', alignItems: 'center', justifyContent: 'center' },
  tonightDot: { position: 'absolute', top: 0, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.pink, borderWidth: 1.5, borderColor: Colors.darkCard },
  info: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  title: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600', flex: 1 },
  seller: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  valueRatio: { fontSize: 9, color: Colors.gold, fontWeight: '600' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  progressLabel: { fontSize: 9, color: Colors.textTertiary, minWidth: 26, textAlign: 'right' },
  scarcity: { fontSize: 9, color: Colors.danger, fontWeight: '700', marginTop: 2 },

  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4, marginBottom: Spacing.sm },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '700' },

  divider: { height: 1, backgroundColor: Colors.darkBorder, marginBottom: Spacing.sm },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  statLabel: { fontSize: 9, color: Colors.textSecondary, marginTop: 2 },
  addMore: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.lilac, borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 6,
  },
  addMoreText: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '700' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: Spacing.xl, gap: 6 },
  emptyEmoji: { fontSize: 44, marginBottom: 6 },
  emptyTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white },
  emptySub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  emptyBtn: {
    marginTop: 12, backgroundColor: Colors.lilac, borderRadius: Radius.md,
    paddingVertical: 12, paddingHorizontal: 24,
  },
  emptyBtnText: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
});
