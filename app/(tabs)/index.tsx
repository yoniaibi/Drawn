import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated as RNAnimated, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated2, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { Draw, MOCK_DRAWS } from '../../src/mocks';
import { fetchDraws } from '../../src/services/draws';
import TicketLogo from '../../src/components/TicketLogo';
import DrawCard from '../../src/components/DrawCard';
import WalletBadge from '../../src/components/WalletBadge';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import { useStreak } from '../../src/hooks/useStreak';
import { formatTicketPrice } from '../../src/utils/countdown';

const FILTERS = ['Tonight 🔥', 'Hot', 'High value', 'Bundles', 'Just listed'];

const LIVE_TICKERS = [
  '@jade_m just bought 3 tickets · Chanel Flap',
  '@ryan.k grabbed 10 tickets · Rolex Submariner',
  '@priya__ just joined · Designer Closet',
  '@tom_w bought 5 more · MacBook Pro',
  '1,247 people are watching tonight',
  '@chloe_j added 15 tickets · Chanel Flap',
  'Rolex draw is 97% full 🔥',
  '@ellie.b joined the Designer Closet draw',
  'Threshold hit on Chanel Flap — draw is running tonight ✅',
];

const RECENT_WINNERS = [
  { handle: '@chloe_j', item: 'Chanel Classic Flap', price: '25p', value: '£2,400', emoji: '👜' },
  { handle: '@dan.west', item: 'Rolex Submariner', price: '50p', value: '£8,500', emoji: '⌚' },
  { handle: '@soph_r', item: 'Designer Closet Bundle', price: '40p', value: '£8,600', emoji: '👗' },
  { handle: '@mike_j', item: 'MacBook Pro 16"', price: '30p', value: '£2,399', emoji: '💻' },
];

const DAILY_REWARDS = [
  { emoji: '🎟️', title: 'Free entry added!', body: "We've added a free entry to tonight's Chanel Flap draw. Just for showing up." },
  { emoji: '⚡', title: 'Early-bird bonus', body: "You're one of the first 100 in today. We've topped up your wallet by 50p." },
  { emoji: '🏆', title: 'Loyalty reward', body: "You've been on a streak. Here's an extra ticket on us for tonight's draw." },
];

export default function HomeScreen() {
  const router = useRouter();
  const { streak, isNewDay } = useStreak();
  const [filter, setFilter] = useState('Tonight 🔥');
  const [tickerIdx, setTickerIdx] = useState(0);
  const [winnerIdx, setWinnerIdx] = useState(0);
  const [draws, setDraws] = useState<Draw[]>(MOCK_DRAWS);
  const [loadingDraws, setLoadingDraws] = useState(true);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [dailyReward] = useState(DAILY_REWARDS[Math.floor(Math.random() * DAILY_REWARDS.length)]);
  // Local sold-count state for live ticking
  const [liveSold, setLiveSold] = useState<Record<string, number>>({});

  const tickerOpacity = useRef(new RNAnimated.Value(1)).current;
  const winnerSlide = useRef(new RNAnimated.Value(0)).current;

  // Pulse for streak fire emoji
  const streakPulse = useSharedValue(1);
  useEffect(() => {
    if (streak >= 2) {
      streakPulse.value = withRepeat(
        withSequence(withTiming(1.2, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
      );
    }
  }, [streak]);
  const streakStyle = useAnimatedStyle(() => ({ transform: [{ scale: streakPulse.value }] }));

  const tonightCount = draws.filter(d => d.status === 'closing_tonight').length;
  const myCount = draws.filter(d => d.myTickets > 0).length;
  const featuredDraw = draws.find(d => d.status === 'closing_tonight' && !d.isBundle) ?? draws[0];

  // Fetch draws
  useEffect(() => {
    fetchDraws().then(result => {
      setDraws(result);
      setLoadingDraws(false);
    });
  }, []);

  // Show daily reward modal on new day
  useEffect(() => {
    if (isNewDay) {
      const t = setTimeout(() => setShowDailyReward(true), 2000);
      return () => clearTimeout(t);
    }
  }, [isNewDay]);

  // Live ticking: increment sold counts on closing_tonight draws
  useEffect(() => {
    const tick = setInterval(() => {
      setDraws(prev => {
        const tonightDraws = prev.filter(d => d.status === 'closing_tonight');
        if (!tonightDraws.length) return prev;
        const target = tonightDraws[Math.floor(Math.random() * tonightDraws.length)];
        const increment = 1 + Math.floor(Math.random() * 4); // 1–4 tickets
        return prev.map(d =>
          d.id === target.id && d.ticketsSold < d.totalTickets - 5
            ? { ...d, ticketsSold: d.ticketsSold + increment }
            : d
        );
      });
    }, 18000 + Math.random() * 12000); // every 18–30 seconds
    return () => clearInterval(tick);
  }, []);

  // Rotate live ticker
  useEffect(() => {
    const interval = setInterval(() => {
      RNAnimated.timing(tickerOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setTickerIdx(i => (i + 1) % LIVE_TICKERS.length);
        RNAnimated.timing(tickerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Rotate winner banner
  useEffect(() => {
    const interval = setInterval(() => {
      RNAnimated.sequence([
        RNAnimated.timing(winnerSlide, { toValue: -20, duration: 250, useNativeDriver: true }),
        RNAnimated.timing(winnerSlide, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]).start(() => setWinnerIdx(i => (i + 1) % RECENT_WINNERS.length));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const filtered = draws.filter(d => {
    if (filter === 'Tonight 🔥') return d.status === 'closing_tonight';
    if (filter === 'Hot') return (d.ticketsSold / d.totalTickets) >= 0.75;
    if (filter === 'Bundles') return d.isBundle;
    if (filter === 'High value') return d.retailValue >= 1000;
    return true;
  });

  const winner = RECENT_WINNERS[winnerIdx];
  const forYouDraw = draws.find(d => d.status === 'open' && d.myTickets === 0 && d.retailValue >= 400);

  return (
    <ScreenWrapper>
      {/* Nav */}
      <View style={styles.nav}>
        <TicketLogo size="md" />
        <View style={styles.navRight}>
          {streak >= 1 && (
            <Animated2.View style={[styles.streakBadge, streakStyle]}>
              <Text style={styles.streakText}>🔥 {streak}</Text>
            </Animated2.View>
          )}
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <WalletBadge />
        </View>
      </View>

      {/* Live activity ticker */}
      <View style={styles.ticker}>
        <View style={styles.tickerDot} />
        <RNAnimated.Text style={[styles.tickerText, { opacity: tickerOpacity }]} numberOfLines={1}>
          {LIVE_TICKERS[tickerIdx]}
        </RNAnimated.Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO featured draw */}
        {featuredDraw && (
          <TouchableOpacity
            style={styles.heroCard}
            onPress={() => router.push(`/draw/${featuredDraw.id}` as any)}
            activeOpacity={0.92}
          >
            <View style={styles.heroTop}>
              <View style={styles.heroLiveBadge}>
                <View style={styles.heroLiveDot} />
                <Text style={styles.heroLiveText}>CLOSING TONIGHT · 9PM</Text>
              </View>
              <View style={styles.heroViewers}>
                <Ionicons name="eye-outline" size={10} color={Colors.textSecondary} />
                <Text style={styles.heroViewersText}>1,247 watching</Text>
              </View>
            </View>

            <View style={styles.heroBody}>
              <Text style={styles.heroEmoji}>{featuredDraw.emoji}</Text>
              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle}>{featuredDraw.title}</Text>
                <Text style={styles.heroSeller}>{featuredDraw.seller}</Text>
                <View style={styles.heroValueRow}>
                  <Text style={styles.heroTicketPrice}>from {featuredDraw.ticketPrice}p</Text>
                  <Text style={styles.heroArrow}>→</Text>
                  <Text style={styles.heroValue}>£{featuredDraw.retailValue.toLocaleString()} prize</Text>
                </View>
              </View>
            </View>

            <View style={styles.heroFooter}>
              <View style={styles.heroProgressWrap}>
                <View
                  style={[
                    styles.heroProgressBar,
                    { width: `${Math.min(100, Math.round(featuredDraw.ticketsSold / featuredDraw.totalTickets * 100))}%` as any },
                  ]}
                />
              </View>
              <View style={styles.heroFooterRow}>
                <Text style={styles.heroSoldText}>
                  {Math.round(featuredDraw.ticketsSold / featuredDraw.totalTickets * 100)}% sold
                  {' · '}{(featuredDraw.totalTickets - featuredDraw.ticketsSold).toLocaleString()} left
                </Text>
                <Text style={styles.heroEnterBtn}>Enter draw →</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Recent winner rotating banner */}
        <View style={styles.winnerBanner}>
          <View style={styles.winnerLeft}>
            <Text style={styles.winnerKicker}>🏆 JUST WON</Text>
            <RNAnimated.Text style={[styles.winnerHandle, { transform: [{ translateY: winnerSlide }] }]}>
              {winner.handle}
            </RNAnimated.Text>
            <Text style={styles.winnerItem} numberOfLines={1}>{winner.item}</Text>
          </View>
          <View style={styles.winnerRight}>
            <Text style={styles.winnerEmoji}>{winner.emoji}</Text>
            <Text style={styles.winnerPrice}>{winner.price} ticket</Text>
            <Text style={styles.winnerValue}>{winner.value}</Text>
          </View>
        </View>

        {/* Tonight info strip */}
        <View style={styles.tonightStrip}>
          <View style={styles.tonightStripLeft}>
            <View style={[styles.dot, { backgroundColor: Colors.pink }]} />
            <Text style={styles.tonightStripText}>
              {tonightCount} draws tonight at 9pm · you're in {myCount}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/live')} style={styles.watchBtn}>
            <Text style={styles.watchText}>Watch live →</Text>
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipOn]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextOn]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* For You section */}
        {forYouDraw && myCount > 0 && (
          <TouchableOpacity
            style={styles.forYouCard}
            onPress={() => router.push(`/draw/${forYouDraw.id}` as any)}
            activeOpacity={0.9}
          >
            <View style={styles.forYouLeft}>
              <Text style={styles.forYouKicker}>✦ PICKED FOR YOU</Text>
              <Text style={styles.forYouTitle}>{forYouDraw.title}</Text>
              <Text style={styles.forYouSub}>
                {forYouDraw.ticketPrice}p ticket · £{forYouDraw.retailValue.toLocaleString()} prize
              </Text>
            </View>
            <Text style={styles.forYouEmoji}>{forYouDraw.emoji}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>
          {filter === 'Tonight 🔥' ? 'Closing tonight' :
           filter === 'Hot' ? '🔥 Filling fast' :
           filter === 'Bundles' ? 'Bundle draws' :
           filter === 'High value' ? 'High value draws' : 'All draws'}
        </Text>

        {/* 2-col grid */}
        <View style={styles.grid}>
          {loadingDraws && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.lilac} />
              <Text style={styles.loadingText}>Loading draws…</Text>
            </View>
          )}
          {!loadingDraws && filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎟️</Text>
              <Text style={styles.emptyText}>No draws match this filter right now</Text>
            </View>
          )}
          {!loadingDraws && filtered.map((draw, i) => {
            if (draw.isBundle) {
              return (
                <View key={draw.id} style={styles.wideCard}>
                  <DrawCard draw={draw} wide />
                </View>
              );
            }
            if (i % 2 === 0) {
              const next = filtered[i + 1];
              if (!next || next.isBundle) {
                return (
                  <View key={draw.id} style={styles.wideCard}>
                    <DrawCard draw={draw} />
                  </View>
                );
              }
              return (
                <View key={draw.id} style={styles.row}>
                  <View style={styles.halfCard}><DrawCard draw={draw} /></View>
                  {next && !next.isBundle && (
                    <View style={styles.halfCard}><DrawCard draw={next} /></View>
                  )}
                </View>
              );
            }
            if (filtered[i - 1] && !filtered[i - 1].isBundle) return null;
            return (
              <View key={draw.id} style={styles.wideCard}>
                <DrawCard draw={draw} />
              </View>
            );
          })}
        </View>

        {/* Bottom social proof */}
        <View style={styles.bottomProof}>
          <Text style={styles.bottomProofText}>
            🔒 All draws verified · Every night at 9pm · Free postal entry available
          </Text>
        </View>
      </ScrollView>

      {/* Daily reward modal */}
      <Modal
        visible={showDailyReward}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDailyReward(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDailyReward(false)}>
          <Pressable style={styles.rewardSheet} onPress={() => {}}>
            <View style={styles.rewardHandle} />
            <Text style={styles.rewardEmoji}>{dailyReward.emoji}</Text>
            <Text style={styles.rewardTitle}>{dailyReward.title}</Text>
            <Text style={styles.rewardBody}>{dailyReward.body}</Text>
            {streak > 1 && (
              <View style={styles.streakRow}>
                <Text style={styles.streakRowText}>🔥 {streak} day streak — keep it up!</Text>
              </View>
            )}
            <TouchableOpacity style={styles.rewardBtn} onPress={() => setShowDailyReward(false)}>
              <Text style={styles.rewardBtnText}>Claim bonus 🎉</Text>
            </TouchableOpacity>
            <Text style={styles.rewardSmall}>Bonus applied to your account automatically</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.darkDeep, borderBottomWidth: 1, borderBottomColor: Colors.darkCard,
  },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakBadge: {
    backgroundColor: 'rgba(249,200,70,0.12)', borderRadius: Radius.pill,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.25)',
  },
  streakText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '800' },

  ticker: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#120D2A', paddingHorizontal: Spacing.lg, paddingVertical: 7,
    borderBottomWidth: 1, borderBottomColor: 'rgba(139,92,246,0.15)',
  },
  tickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },
  tickerText: { fontSize: FontSizes.xs, color: Colors.textSecondary, flex: 1 },

  // Hero
  heroCard: {
    margin: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: '#1A0D42', borderRadius: Radius.lg,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.25)',
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 6,
  },
  heroLiveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },
  heroLiveText: { fontSize: 9, fontWeight: '800', color: Colors.pink, letterSpacing: 0.8 },
  heroViewers: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroViewersText: { fontSize: 9, color: Colors.textSecondary },
  heroBody: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: 14,
  },
  heroEmoji: { fontSize: 64 },
  heroInfo: { flex: 1, gap: 3 },
  heroTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white, lineHeight: 24 },
  heroSeller: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  heroValueRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  heroTicketPrice: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  heroArrow: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  heroValue: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '800' },
  heroFooter: {
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 6,
  },
  heroProgressWrap: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  heroProgressBar: { height: 4, backgroundColor: Colors.pink, borderRadius: 2 },
  heroFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroSoldText: { fontSize: 9, color: Colors.textSecondary },
  heroEnterBtn: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '700' },

  // Winner
  winnerBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.darkCard, marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.18)',
  },
  winnerLeft: { flex: 1 },
  winnerKicker: { fontSize: 9, fontWeight: '700', color: Colors.gold, letterSpacing: 0.5, marginBottom: 3 },
  winnerHandle: { fontFamily: Fonts.serif, fontSize: FontSizes.md, color: Colors.white, lineHeight: 18 },
  winnerItem: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  winnerRight: { alignItems: 'flex-end', paddingLeft: 10, gap: 2 },
  winnerEmoji: { fontSize: 22 },
  winnerPrice: { fontSize: 9, color: Colors.textSecondary },
  winnerValue: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '800' },

  // Tonight strip
  tonightStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: 'rgba(244,114,182,0.08)', borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(244,114,182,0.15)',
  },
  tonightStripLeft: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  tonightStripText: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '600', flex: 1 },
  dot: { width: 7, height: 7, borderRadius: 99 },
  watchBtn: { backgroundColor: Colors.pink, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  watchText: { fontSize: 9, fontWeight: '700', color: Colors.white },

  // For You
  forYouCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)',
  },
  forYouLeft: { flex: 1 },
  forYouKicker: { fontSize: 8, color: Colors.lilac, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  forYouTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700', marginBottom: 2 },
  forYouSub: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  forYouEmoji: { fontSize: 40 },

  // Filters
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveText: { fontSize: 9, fontWeight: '700', color: Colors.white, letterSpacing: 0.6 },
  filterRow: { paddingHorizontal: Spacing.md, gap: 8, paddingBottom: 4, paddingTop: 4 },
  chip: {
    borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.darkBorder,
  },
  chipOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  chipText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  chipTextOn: { color: Colors.white },

  sectionTitle: {
    fontSize: FontSizes.xs, color: Colors.white, fontWeight: '600',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 6,
  },

  // Grid
  grid: { paddingHorizontal: Spacing.md, gap: 8, paddingBottom: 20 },
  row: { flexDirection: 'row', gap: 8 },
  halfCard: { flex: 1 },
  wideCard: { flex: 1 },
  loadingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 20, justifyContent: 'center',
  },
  loadingText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyEmoji: { fontSize: 32 },
  emptyText: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center' },

  bottomProof: { paddingHorizontal: Spacing.lg, paddingBottom: 24, alignItems: 'center' },
  bottomProofText: { fontSize: 9, color: Colors.textTertiary, textAlign: 'center', lineHeight: 14 },

  // Daily reward modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  rewardSheet: {
    backgroundColor: Colors.darkCard,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.xl, paddingBottom: 48, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: 'rgba(139,92,246,0.3)',
  },
  rewardHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.darkBorder, marginBottom: Spacing.xl,
  },
  rewardEmoji: { fontSize: 52, marginBottom: 12 },
  rewardTitle: {
    fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white,
    textAlign: 'center', marginBottom: 8,
  },
  rewardBody: {
    fontSize: FontSizes.sm, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 20, marginBottom: 16,
  },
  streakRow: {
    backgroundColor: 'rgba(249,200,70,0.1)', borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg, paddingVertical: 8, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)',
  },
  streakRowText: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '700' },
  rewardBtn: {
    width: '100%', backgroundColor: Colors.lilac, borderRadius: Radius.md,
    padding: 15, alignItems: 'center', marginBottom: 10,
  },
  rewardBtnText: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
  rewardSmall: { fontSize: 9, color: Colors.textTertiary, textAlign: 'center' },
});
