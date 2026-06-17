import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated as RNAnimated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { Draw, MOCK_DRAWS } from '../../src/mocks';
import { fetchDraws } from '../../src/services/draws';
import TicketLogo from '../../src/components/TicketLogo';
import DrawCard from '../../src/components/DrawCard';
import WalletBadge from '../../src/components/WalletBadge';
import ScreenWrapper from '../../src/components/ScreenWrapper';

const FILTERS = ['Tonight', 'High value', 'Bundles', 'Just listed'];

const LIVE_TICKERS = [
  '@jade_m just bought 3 tickets · Chanel Flap',
  '@ryan.k grabbed 10 tickets · Rolex Submariner',
  '@priya__ just joined · Designer Closet',
  '@tom_w bought 5 more · MacBook Pro',
  '1,247 people are watching tonight',
  '@chloe_j added 15 tickets · Chanel Flap',
  'Rolex draw is 97% full 🔥',
];

const RECENT_WINNERS = [
  { handle: '@chloe_j', item: 'Chanel Classic Flap', price: '25p', value: '£2,400', emoji: '👜' },
  { handle: '@dan.west', item: 'Rolex Submariner', price: '50p', value: '£8,500', emoji: '⌚' },
  { handle: '@soph_r', item: "Designer Closet Bundle", price: '40p', value: '£8,600', emoji: '👗' },
  { handle: '@mike_j', item: 'MacBook Pro 16"', price: '30p', value: '£2,399', emoji: '💻' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('Tonight');
  const [tickerIdx, setTickerIdx] = useState(0);
  const [winnerIdx, setWinnerIdx] = useState(0);
  const [draws, setDraws] = useState<Draw[]>(MOCK_DRAWS);
  const [loadingDraws, setLoadingDraws] = useState(true);
  const tickerOpacity = useRef(new RNAnimated.Value(1)).current;
  const winnerSlide = useRef(new RNAnimated.Value(0)).current;

  const tonightCount = draws.filter(d => d.status === 'closing_tonight').length;
  const myCount = draws.filter(d => d.myTickets > 0).length;
  const featuredDraw = draws.find(d => d.status === 'closing_tonight' && !d.isBundle) ?? draws[0];

  // Fetch draws from Supabase
  useEffect(() => {
    fetchDraws().then(result => {
      setDraws(result);
      setLoadingDraws(false);
    });
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
    if (filter === 'Tonight') return d.status === 'closing_tonight';
    if (filter === 'Bundles') return d.isBundle;
    if (filter === 'High value') return d.retailValue >= 500;
    return true;
  });

  const winner = RECENT_WINNERS[winnerIdx];

  return (
    <ScreenWrapper>
      {/* Nav */}
      <View style={styles.nav}>
        <TicketLogo size="md" />
        <View style={styles.navRight}>
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
          <TouchableOpacity style={styles.heroCard} onPress={() => router.push(`/draw/${featuredDraw.id}` as any)} activeOpacity={0.92}>
            <View style={styles.heroTop}>
              <View style={styles.heroLiveBadge}>
                <View style={styles.heroLiveDot} />
                <Text style={styles.heroLiveText}>CLOSING TONIGHT</Text>
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
                <View style={[styles.heroProgressBar, { width: `${Math.round(featuredDraw.ticketsSold / featuredDraw.totalTickets * 100)}%` as any }]} />
              </View>
              <View style={styles.heroFooterRow}>
                <Text style={styles.heroSoldText}>{Math.round(featuredDraw.ticketsSold / featuredDraw.totalTickets * 100)}% sold · {(featuredDraw.totalTickets - featuredDraw.ticketsSold).toLocaleString()} left</Text>
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
            <Text style={styles.tonightStripText}>{tonightCount} draws tonight at 9pm · You're in {myCount}</Text>
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

        {/* Value teaser */}
        <View style={styles.valueTeaser}>
          <Ionicons name="flash" size={13} color={Colors.gold} />
          <Text style={styles.valueTeaserText}>Win £2,400 of Chanel for as little as <Text style={styles.valueTeaserBold}>25p</Text></Text>
        </View>

        <Text style={styles.sectionTitle}>Closing soon</Text>

        {/* 2-col grid */}
        <View style={styles.grid}>
          {loadingDraws && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.lilac} />
              <Text style={styles.loadingText}>Loading draws…</Text>
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
          <Text style={styles.bottomProofText}>🔒 Verified draws only · 9pm every night · Free postal entry</Text>
        </View>
      </ScrollView>
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

  ticker: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#120D2A', paddingHorizontal: Spacing.lg, paddingVertical: 7,
    borderBottomWidth: 1, borderBottomColor: 'rgba(139,92,246,0.15)',
  },
  tickerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },
  tickerText: { fontSize: FontSizes.xs, color: Colors.textSecondary, flex: 1 },

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
  heroBody: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: 14 },
  heroEmoji: { fontSize: 64 },
  heroInfo: { flex: 1, gap: 3 },
  heroTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white, lineHeight: 24 },
  heroSeller: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  heroValueRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  heroTicketPrice: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  heroArrow: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  heroValue: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '800' },
  heroFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 6 },
  heroProgressWrap: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  heroProgressBar: { height: 4, backgroundColor: Colors.pink, borderRadius: 2 },
  heroFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroSoldText: { fontSize: 9, color: Colors.textSecondary },
  heroEnterBtn: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '700' },

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

  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveText: { fontSize: 9, fontWeight: '700', color: Colors.white, letterSpacing: 0.6 },
  filterRow: { paddingHorizontal: Spacing.md, gap: 8, paddingBottom: 4, paddingTop: 4 },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.darkBorder },
  chipOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  chipText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  chipTextOn: { color: Colors.white },

  valueTeaser: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
  },
  valueTeaserText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  valueTeaserBold: { color: Colors.gold, fontWeight: '700' },

  sectionTitle: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '600', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 6 },
  grid: { paddingHorizontal: Spacing.md, gap: 8, paddingBottom: 20 },
  row: { flexDirection: 'row', gap: 8 },
  halfCard: { flex: 1 },
  wideCard: { flex: 1 },

  bottomProof: { paddingHorizontal: Spacing.lg, paddingBottom: 24, alignItems: 'center' },
  bottomProofText: { fontSize: 9, color: Colors.textTertiary, textAlign: 'center', lineHeight: 14 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 20, justifyContent: 'center' },
  loadingText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
});
