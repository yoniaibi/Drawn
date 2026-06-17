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
  '@ryan.k grabbed 10 tickets · Jordan 1 Chicago',
  '@priya__ just joined · Designer Closet',
  '@tom_w bought 5 tickets · Tag Heuer',
  '247 people are browsing right now',
];

const RECENT_WINNERS = [
  { handle: '@chloe_j', item: 'Louis Vuitton Speedy', price: '20p', value: '£820' },
  { handle: '@dan.west', item: 'Air Jordan 4 Retro', price: '15p', value: '£340' },
  { handle: '@soph_r', item: 'Chanel Classic Flap', price: '30p', value: '£2,400' },
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
        {/* Recent winner banner */}
        <View style={styles.winnerBanner}>
          <View style={styles.winnerLeft}>
            <Text style={styles.winnerKicker}>🏆 JUST WON</Text>
            <RNAnimated.Text style={[styles.winnerHandle, { transform: [{ translateY: winnerSlide }] }]}>
              {winner.handle}
            </RNAnimated.Text>
            <Text style={styles.winnerItem} numberOfLines={1}>{winner.item}</Text>
          </View>
          <View style={styles.winnerRight}>
            <Text style={styles.winnerPrice}>{winner.price} ticket</Text>
            <Text style={styles.winnerValue}>{winner.value} value</Text>
          </View>
        </View>

        {/* Tonight banner */}
        <View style={styles.tonightBanner}>
          <View style={styles.tonightTop}>
            <View style={styles.liveRow}>
              <View style={[styles.dot, { backgroundColor: Colors.pink }]} />
              <Text style={styles.liveText}>LIVE TONIGHT 9PM</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/live')} style={styles.watchBtn}>
              <Ionicons name="radio" size={11} color={Colors.white} style={{ marginRight: 3 }} />
              <Text style={styles.watchText}>Watch</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.tonightTitle}>{tonightCount} draws resolve at 9pm</Text>
          <Text style={styles.tonightSub}>You're entered in {myCount} — don't miss the reveal</Text>
          <View style={styles.socialProofRow}>
            <Ionicons name="people" size={11} color={Colors.gold} />
            <Text style={styles.socialProofText}>1,247 people watching tonight</Text>
          </View>
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

  winnerBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.darkCard, marginHorizontal: Spacing.md, marginTop: Spacing.md,
    borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)',
    overflow: 'hidden',
  },
  winnerLeft: { flex: 1 },
  winnerKicker: { fontSize: 9, fontWeight: '700', color: Colors.gold, letterSpacing: 0.5, marginBottom: 3 },
  winnerHandle: { fontFamily: Fonts.serif, fontSize: FontSizes.md, color: Colors.white, lineHeight: 18 },
  winnerItem: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  winnerRight: { alignItems: 'flex-end', paddingLeft: 10 },
  winnerPrice: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '700' },
  winnerValue: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  tonightBanner: {
    backgroundColor: Colors.royal, margin: Spacing.md, marginTop: Spacing.sm,
    borderRadius: Radius.md, padding: Spacing.md,
  },
  tonightTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 99 },
  liveText: { fontSize: 9, fontWeight: '700', color: Colors.white, letterSpacing: 0.6 },
  watchBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.pink, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
  watchText: { fontSize: 9, fontWeight: '600', color: Colors.white },
  tonightTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '700' },
  tonightSub: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  socialProofRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  socialProofText: { fontSize: 9, color: Colors.gold, fontWeight: '600' },

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
