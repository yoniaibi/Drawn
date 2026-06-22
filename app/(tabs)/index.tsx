import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated as RNAnimated, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated2, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { Draw, MOCK_DRAWS } from '../../src/mocks';
import { fetchDraws, checkForWins, fetchRecentWinners, WinResult, RecentWinner } from '../../src/services/draws';
import { supabase } from '../../src/lib/supabase';
import TicketLogo from '../../src/components/TicketLogo';
import DrawCard from '../../src/components/DrawCard';
import WalletBadge from '../../src/components/WalletBadge';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import CategoryRow from '../../src/components/CategoryRow';
import { useStreak } from '../../src/hooks/useStreak';
import { formatTicketPrice } from '../../src/utils/countdown';
import { useAuthStore } from '../../src/store';

const FILTERS = ['Tonight', 'Filling fast', 'High value', 'Bundles', 'Just listed', 'Saved'];

const SECTION_LABEL: Record<string, string> = {
  Tonight: 'Closing tonight',
  'Filling fast': 'Filling fast',
  Bundles: 'Bundle draws',
  'High value': 'High value draws',
  'Just listed': 'Just listed',
  Saved: 'Saved draws',
};

const LIVE_TICKERS = [
  '@jade_m just bought 3 tickets · Chanel Flap',
  'Rolex Submariner is 97% sold',
  '@ryan.k grabbed 10 tickets · Rolex',
  'Threshold hit on Chanel Flap — draw is on tonight',
  '@priya__ joined · Designer Closet',
  'Chanel Flap draw closes in 2h',
  '@chloe_j added 15 tickets · Chanel Flap',
  '@tom_w bought 5 more · MacBook Pro',
  '@ellie.b just joined · Jordan 1 Chicago',
];



export default function HomeScreen() {
  const router = useRouter();
  const { streak } = useStreak();
  const [filter, setFilter] = useState('Tonight');
  const [tickerIdx, setTickerIdx] = useState(0);
  const [winnerIdx, setWinnerIdx] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const { user } = useAuthStore();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loadingDraws, setLoadingDraws] = useState(true);
  const [wins, setWins] = useState<WinResult[]>([]);
  const [recentWinners, setRecentWinners] = useState<RecentWinner[]>([]);

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

  async function toggleSave(id: string) {
    const isSaved = savedIds.has(id);
    setSavedIds(prev => {
      const next = new Set(prev);
      isSaved ? next.delete(id) : next.add(id);
      return next;
    });
    if (!user) return;
    if (isSaved) {
      await supabase.from('draw_watches').delete().eq('user_id', user.id).eq('draw_id', id);
    } else {
      await supabase.from('draw_watches').upsert({ user_id: user.id, draw_id: id }, { onConflict: 'user_id,draw_id' });
    }
  }

  // Fetch draws + check for wins + recent winners
  useEffect(() => {
    fetchDraws().then(result => {
      setDraws(result);
      setLoadingDraws(false);
    }).catch(() => setLoadingDraws(false));
    fetchRecentWinners().then(setRecentWinners).catch(() => {});
    if (user?.id) {
      checkForWins(user.id).then(setWins).catch(() => {});
      Promise.resolve(
        supabase.from('draw_watches').select('draw_id').eq('user_id', user.id)
      ).then(({ data }) => {
        if (data) setSavedIds(new Set((data as any[]).map(r => r.draw_id)));
      }).catch(() => {});
    }

    // Real-time ticket count updates for all draws
    const channel = supabase
      .channel('home-draws-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'draws' },
        (payload) => {
          if (payload.new && typeof payload.new.tickets_sold === 'number') {
            setDraws(prev =>
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


  // Rotate live ticker
  useEffect(() => {
    const interval = setInterval(() => {
      RNAnimated.timing(tickerOpacity, { toValue: 0, duration: 400, useNativeDriver: false }).start(() => {
        setTickerIdx(i => (i + 1) % LIVE_TICKERS.length);
        RNAnimated.timing(tickerOpacity, { toValue: 1, duration: 400, useNativeDriver: false }).start();
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Rotate winner banner
  useEffect(() => {
    const pool = recentWinners.length > 0 ? recentWinners : [{}];
    const interval = setInterval(() => {
      RNAnimated.sequence([
        RNAnimated.timing(winnerSlide, { toValue: -20, duration: 300, useNativeDriver: false }),
        RNAnimated.timing(winnerSlide, { toValue: 0, duration: 0, useNativeDriver: false }),
      ]).start(() => setWinnerIdx(i => (i + 1) % pool.length));
    }, 9000);
    return () => clearInterval(interval);
  }, [recentWinners]);

  const filtered = draws.filter(d => {
    if (filter === 'Tonight') return d.status === 'closing_tonight';
    if (filter === 'Filling fast') return (d.ticketsSold / d.totalTickets) >= 0.75;
    if (filter === 'Bundles') return d.isBundle;
    if (filter === 'High value') return d.retailValue >= 1000;
    if (filter === 'Saved') return savedIds.has(d.id);
    if (filter === 'Just listed') return d.status === 'open' && (d.ticketsSold / d.totalTickets) < 0.15;
    return true;
  });

  const winnersPool = recentWinners.length > 0 ? recentWinners : [
    { handle: '@chloe_j', item: 'Chanel Classic Flap', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=100&q=80', ticketPrice: 25, retailValue: 2400 },
  ];
  const winner = winnersPool[winnerIdx % winnersPool.length];
  const forYouDraw = draws.find(d => d.status === 'open' && d.myTickets === 0 && d.retailValue >= 400);

  return (
    <ScreenWrapper>
      {/* Nav */}
      <View style={styles.nav}>
        <TicketLogo size="md" />
        <View style={styles.navRight}>
          {streak >= 1 && (
            <Animated2.View style={[styles.streakBadge, streakStyle]}>
              <Text style={styles.streakText}>{streak}</Text>
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

        {/* YOU WON banner — highest priority, appears top of feed */}
        {wins.length > 0 && (
          <TouchableOpacity
            style={styles.winBanner}
            onPress={() => router.push(`/live/winner/${wins[0].drawId}` as any)}
            activeOpacity={0.9}
          >
            <View style={styles.winBannerIconBox}>
              <Ionicons name="trophy" size={18} color={Colors.gold} />
            </View>
            <View style={styles.winBannerInfo}>
              <Text style={styles.winBannerTitle}>You won</Text>
              <Text style={styles.winBannerSub}>{wins[0].drawTitle} · tap to celebrate</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.gold} />
          </TouchableOpacity>
        )}


        {/* HERO featured draw */}
        {featuredDraw && (
          <TouchableOpacity
            style={styles.heroCard}
            onPress={() => router.push(`/draw/${featuredDraw.id}` as any)}
            activeOpacity={0.9}
          >
            {featuredDraw.image ? (
              <Image
                source={{ uri: featuredDraw.image }}
                style={StyleSheet.absoluteFillObject as any}
                resizeMode="cover"
              />
            ) : null}
            <View style={styles.heroGradientOverlay} />

            <View style={styles.heroTop}>
              <View style={styles.heroLiveBadge}>
                <View style={styles.heroLiveDot} />
                <Text style={styles.heroLiveText}>CLOSING TONIGHT · 9PM</Text>
              </View>
              <View style={styles.heroViewers}>
                <Ionicons name="eye-outline" size={10} color="rgba(210,195,240,0.8)" />
                <Text style={styles.heroViewersText}>
                  {Math.round(featuredDraw.ticketsSold * 0.012 + 4).toLocaleString()} watching
                </Text>
              </View>
            </View>

            <View style={styles.heroBody}>
              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle}>{featuredDraw.title}</Text>
                <Text style={styles.heroSeller}>{featuredDraw.seller}</Text>
                <View style={styles.heroValueRow}>
                  <View style={styles.heroTicketPill}>
                    <Text style={styles.heroTicketPrice}>from {featuredDraw.ticketPrice}p</Text>
                  </View>
                  <Text style={styles.heroArrow}>→</Text>
                  <Text style={styles.heroValue}>£{featuredDraw.retailValue.toLocaleString()}</Text>
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
                  {' · '}{(featuredDraw.totalTickets - featuredDraw.ticketsSold).toLocaleString()} tickets left
                </Text>
                <View style={styles.heroEnterPill}>
                  <Text style={styles.heroEnterBtn}>Enter draw</Text>
                  <Ionicons name="arrow-forward" size={10} color={Colors.ink} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Recent winner rotating banner */}
        <View style={styles.winnerBanner}>
          <View style={styles.winnerLeft}>
            <Text style={styles.winnerKicker}>JUST WON</Text>
            <RNAnimated.Text style={[styles.winnerHandle, { transform: [{ translateY: winnerSlide }] }]}>
              {winner.handle}
            </RNAnimated.Text>
            <Text style={styles.winnerItem} numberOfLines={1}>{winner.item}</Text>
          </View>
          <View style={styles.winnerRight}>
            <Image source={{ uri: (winner as any).image || '' }} style={styles.winnerImg} resizeMode="cover" />
            <Text style={styles.winnerPrice}>{winner.ticketPrice}p ticket</Text>
            <Text style={styles.winnerValue}>£{winner.retailValue.toLocaleString()}</Text>
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

        {/* Categories */}
        <View style={styles.categorySection}>
          <View style={styles.categorySectionHeader}>
            <Text style={styles.categorySectionTitle}>Browse by category</Text>
            <TouchableOpacity onPress={() => router.push('/categories' as any)}>
              <Text style={styles.categorySeeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <CategoryRow />
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
              <Text style={styles.forYouKicker}>PICKED FOR YOU</Text>
              <Text style={styles.forYouTitle}>{forYouDraw.title}</Text>
              <Text style={styles.forYouSub}>
                {forYouDraw.ticketPrice}p ticket · £{forYouDraw.retailValue.toLocaleString()} prize
              </Text>
            </View>
            {forYouDraw.image ? (
              <Image source={{ uri: forYouDraw.image }} style={{ width: 60, height: 60, borderRadius: 10 }} resizeMode="cover" />
            ) : null}
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>{SECTION_LABEL[filter] ?? 'All draws'}</Text>

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
              <Ionicons name={draws.length === 0 ? 'time-outline' : 'search-outline'} size={28} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>
                {draws.length === 0
                  ? 'No draws live yet — check back at 9pm tonight'
                  : 'No draws match this filter right now'}
              </Text>
            </View>
          )}
          {!loadingDraws && filtered.map((draw, i) => {
            const saveProps = {
              saved: savedIds.has(draw.id),
              onSave: toggleSave,
            };
            if (draw.isBundle) {
              return (
                <View key={draw.id} style={styles.wideCard}>
                  <DrawCard draw={draw} wide {...saveProps} />
                </View>
              );
            }
            if (i % 2 === 0) {
              const next = filtered[i + 1];
              if (!next || next.isBundle) {
                return (
                  <View key={draw.id} style={styles.wideCard}>
                    <DrawCard draw={draw} {...saveProps} />
                  </View>
                );
              }
              return (
                <View key={draw.id} style={styles.row}>
                  <View style={styles.halfCard}><DrawCard draw={draw} {...saveProps} /></View>
                  {next && !next.isBundle && (
                    <View style={styles.halfCard}>
                      <DrawCard draw={next} saved={savedIds.has(next.id)} onSave={saveProps.onSave} />
                    </View>
                  )}
                </View>
              );
            }
            if (filtered[i - 1] && !filtered[i - 1].isBundle) return null;
            return (
              <View key={draw.id} style={styles.wideCard}>
                <DrawCard draw={draw} {...saveProps} />
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

    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    backgroundColor: '#100c20',
    borderBottomWidth: 1, borderBottomColor: 'rgba(139,92,246,0.15)',
  },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  streakBadge: {
    backgroundColor: 'rgba(249,200,70,0.1)', borderRadius: Radius.pill,
    paddingHorizontal: 9, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.3)',
  },
  streakText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '800' },

  ticker: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(16,12,32,0.95)', paddingHorizontal: Spacing.lg, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(139,92,246,0.12)',
  },
  tickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },
  tickerText: { fontSize: FontSizes.xs, color: 'rgba(210,195,240,0.7)', flex: 1, letterSpacing: 0.1 },

  // Hero
  heroCard: {
    margin: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: '#1A0D42', borderRadius: Radius.xl,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.3)',
    overflow: 'hidden', minHeight: 160,
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 10,
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,10,40,0.72)',
  },
  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 6,
  },
  heroLiveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(244,114,182,0.18)', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(244,114,182,0.35)',
  },
  heroLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },
  heroLiveText: { fontSize: 9, fontWeight: '800', color: Colors.pink, letterSpacing: 1 },
  heroViewers: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroViewersText: { fontSize: 9, color: 'rgba(210,195,240,0.7)' },
  heroBody: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, paddingTop: 6, gap: 14,
  },
  heroInfo: { flex: 1, gap: 5 },
  heroTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, lineHeight: 30 },
  heroSeller: { fontSize: FontSizes.xs, color: 'rgba(210,195,240,0.7)' },
  heroValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  heroTicketPill: {
    backgroundColor: 'rgba(139,92,246,0.3)', borderRadius: Radius.pill,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.4)',
  },
  heroTicketPrice: { fontSize: FontSizes.xs, color: Colors.lilac, fontWeight: '700' },
  heroArrow: { fontSize: FontSizes.xs, color: 'rgba(210,195,240,0.4)' },
  heroValue: { fontSize: FontSizes.md, color: Colors.gold, fontWeight: '800' },
  heroFooter: {
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 8,
  },
  heroProgressWrap: { height: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  heroProgressBar: { height: 5, backgroundColor: Colors.pink, borderRadius: 3 },
  heroFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroSoldText: { fontSize: 9.5, color: 'rgba(210,195,240,0.65)' },
  heroEnterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.gold, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  heroEnterBtn: { fontSize: FontSizes.xs, color: Colors.ink, fontWeight: '800' },

  // Winner
  winnerBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(249,200,70,0.06)',
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.22)',
    borderLeftWidth: 3, borderLeftColor: Colors.gold,
  },
  winnerLeft: { flex: 1 },
  winnerKicker: { fontSize: 8.5, fontWeight: '800', color: Colors.gold, letterSpacing: 1.2, marginBottom: 4 },
  winnerHandle: { fontFamily: Fonts.serif, fontSize: FontSizes.md, color: Colors.white, lineHeight: 20 },
  winnerItem: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 3 },
  winnerRight: { alignItems: 'flex-end', paddingLeft: 12, gap: 3 },
  winnerImg: { width: 50, height: 50, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(249,200,70,0.3)' },
  winnerPrice: { fontSize: 9, color: Colors.textTertiary },
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

  // Categories
  categorySection: { marginBottom: 4 },
  categorySectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 2,
  },
  categorySectionTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.base, color: Colors.white },
  categorySeeAll: { fontSize: FontSizes.xs, color: Colors.lilac, fontWeight: '600' },

  // Filters
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveText: { fontSize: 9, fontWeight: '700', color: Colors.white, letterSpacing: 0.6 },
  filterRow: { paddingHorizontal: Spacing.md, gap: 7, paddingBottom: 6, paddingTop: 6 },
  chip: {
    borderRadius: Radius.pill, paddingHorizontal: 15, paddingVertical: 7,
    backgroundColor: 'rgba(30,21,53,0.9)', borderWidth: 1, borderColor: Colors.darkBorder,
  },
  chipOn: {
    backgroundColor: 'rgba(139,92,246,0.22)', borderColor: Colors.lilac,
  },
  chipText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  chipTextOn: { color: Colors.lilac, fontWeight: '700' },

  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: FontSizes.base, color: Colors.white,
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 8,
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
  emptyText: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center' },

  bottomProof: { paddingHorizontal: Spacing.lg, paddingBottom: 24, alignItems: 'center' },
  bottomProofText: { fontSize: 9, color: Colors.textTertiary, textAlign: 'center', lineHeight: 14 },

  // Win banner
  winBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: 'rgba(249,200,70,0.12)', borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.4)',
  },
  winBannerIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(249,200,70,0.15)', alignItems: 'center', justifyContent: 'center' },
  winBannerInfo: { flex: 1 },
  winBannerTitle: { fontSize: FontSizes.base, color: Colors.gold, fontWeight: '800' },
  winBannerSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

});
