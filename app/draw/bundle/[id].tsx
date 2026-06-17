import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated as RNAnimated, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '../../../src/theme';
import { MOCK_DRAWS, Draw } from '../../../src/mocks';
import ProgressBar from '../../../src/components/ProgressBar';
import PrimaryButton from '../../../src/components/PrimaryButton';
import { formatTicketPrice } from '../../../src/utils/countdown';
import { fetchDrawById } from '../../../src/services/draws';

const BUYER_TICKERS = [
  '@sophie_k just bought 5 tickets',
  '@dan.w grabbed 3 tickets',
  '@priya__ added 10 tickets',
  '@mike_j bought 2 tickets',
  '@chloe just joined the draw',
];

export default function BundleDrawScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const mockFind = MOCK_DRAWS.find(d => d.id === id && d.isBundle);
  const [draw, setDraw] = useState<Draw | null>(mockFind ?? null);
  const [loading, setLoading] = useState(!mockFind);

  useEffect(() => {
    if (!id || mockFind) return;
    fetchDrawById(id).then(d => {
      setDraw(d);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.darkBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.lilac} />
      </View>
    );
  }

  if (!draw || !draw.bundleItems) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.darkBg, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ fontSize: 40 }}>📦</Text>
        <Text style={{ color: Colors.white, fontSize: FontSizes.base, fontWeight: '700' }}>Bundle not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.lilac, fontSize: FontSizes.sm }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = draw.ticketsSold / draw.totalTickets;
  const remaining = draw.totalTickets - draw.ticketsSold;
  const isLow = remaining < 500;
  const isVeryLow = remaining < 200;
  const totalBundleValue = draw.bundleItems.reduce((s, i) => s + i.retailValue, 0);

  const [buyerIdx, setBuyerIdx] = useState(0);
  const buyerOpacity = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      RNAnimated.timing(buyerOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setBuyerIdx(i => (i + 1) % BUYER_TICKERS.length);
        RNAnimated.timing(buyerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const myOdds = draw.myTickets > 0
    ? ((draw.myTickets / draw.totalTickets) * 100).toFixed(2)
    : null;

  return (
    <View style={styles.screen}>
      {/* Hero */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.bundleBadge}>
          <Ionicons name="cube" size={11} color={Colors.white} />
          <Text style={styles.bundleBadgeText}>BUNDLE</Text>
        </View>

        <Text style={styles.heroEmoji}>{draw.emoji}</Text>

        <View style={styles.heroValueBox}>
          <Text style={styles.heroValueLabel}>{formatTicketPrice(draw.ticketPrice)}</Text>
          <Text style={styles.heroValueArrow}>→</Text>
          <Text style={styles.heroValueAmount}>£{totalBundleValue.toLocaleString()} bundle</Text>
        </View>

        {draw.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.white} />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Live ticker */}
        <View style={styles.buyerTicker}>
          <View style={styles.buyerDot} />
          <RNAnimated.Text style={[styles.buyerTickerText, { opacity: buyerOpacity }]} numberOfLines={1}>
            {BUYER_TICKERS[buyerIdx]}
          </RNAnimated.Text>
        </View>

        <Text style={styles.title}>{draw.title}</Text>

        <View style={styles.sellerRow}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerAvatarText}>{draw.sellerAvatar}</Text>
          </View>
          <Text style={styles.sellerHandle}>{draw.seller}</Text>
          {draw.verified && (
            <View style={styles.verifiedChip}>
              <Ionicons name="checkmark-circle" size={10} color={Colors.lilac} />
              <Text style={styles.verifiedChipText}>VERIFIED</Text>
            </View>
          )}
        </View>

        {/* Bundle items — prominent */}
        <View style={styles.bundleCard}>
          <View style={styles.bundleHeader}>
            <Text style={styles.bundleTitle}>What's in the bundle</Text>
            <View style={styles.bundleCountBadge}>
              <Text style={styles.bundleCountText}>{draw.bundleItems.length} items</Text>
            </View>
          </View>

          {draw.bundleItems.map((item, i) => (
            <View key={i} style={[styles.bundleRow, i === draw.bundleItems!.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.bundleEmoji}>{item.emoji}</Text>
              <Text style={styles.bundleName}>{item.name}</Text>
              <View style={styles.bundleValBadge}>
                <Text style={styles.bundleVal}>£{item.retailValue.toLocaleString()}</Text>
              </View>
            </View>
          ))}

          <View style={styles.bundleTotal}>
            <Text style={styles.bundleTotalLabel}>Total bundle value</Text>
            <Text style={styles.bundleTotalVal}>£{totalBundleValue.toLocaleString()}</Text>
          </View>
        </View>

        {/* Value ratio highlight */}
        <View style={styles.valueCard}>
          <Ionicons name="flash" size={16} color={Colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.valueCardTitle}>
              Win £{totalBundleValue.toLocaleString()} for {formatTicketPrice(draw.ticketPrice)}
            </Text>
            <Text style={styles.valueCardSub}>
              That's {Math.round(totalBundleValue / (draw.ticketPrice / 100))}× your money if you win
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.thresholdCard}>
          <View style={styles.thresholdTop}>
            <Text style={styles.thresholdLabel}>Tickets sold</Text>
            <Text style={styles.thresholdCount}>
              {draw.ticketsSold.toLocaleString()} / {draw.totalTickets.toLocaleString()}
            </Text>
          </View>
          <ProgressBar
            progress={progress}
            height={6}
            color={progress > 0.9 ? Colors.danger : progress > 0.7 ? Colors.warning : Colors.lilac}
          />
          <View style={styles.thresholdBottom}>
            <Text style={[styles.thresholdMet, { color: progress >= draw.minThreshold ? Colors.gold : Colors.textSecondary }]}>
              {progress >= draw.minThreshold ? '✅ Threshold met · draws tonight' : `${Math.round(draw.minThreshold * 100)}% needed to draw`}
            </Text>
            <Text style={styles.pctSold}>{Math.round(progress * 100)}% sold</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{formatTicketPrice(draw.ticketPrice)}</Text>
            <Text style={styles.statLabel}>per ticket</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: Colors.gold }]}>£{totalBundleValue.toLocaleString()}</Text>
            <Text style={styles.statLabel}>bundle value</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{draw.condition.replace('_', ' ')}</Text>
            <Text style={styles.statLabel}>condition</Text>
          </View>
        </View>

        {/* My tickets */}
        {draw.myTickets > 0 && (
          <View style={styles.myTicketsCard}>
            <Ionicons name="ticket" size={16} color={Colors.lilac} />
            <View style={{ flex: 1 }}>
              <Text style={styles.myTicketsText}>
                You hold {draw.myTickets} ticket{draw.myTickets > 1 ? 's' : ''}
              </Text>
              {myOdds && (
                <Text style={styles.myOddsText}>Your odds: {myOdds}% · add more to improve</Text>
              )}
            </View>
          </View>
        )}

        <Text style={styles.desc}>{draw.description}</Text>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.cta}>
        {isLow && (
          <Text style={styles.ctaScarcity}>
            {isVeryLow ? `🚨 Only ${remaining} tickets left!` : `⚡ ${remaining} remaining`}
          </Text>
        )}
        <PrimaryButton
          label={`Enter from ${formatTicketPrice(draw.ticketPrice)}`}
          onPress={() => router.push(`/purchase/${draw.id}`)}
        />
        <Text style={styles.ctaSub}>Free postal entry also available</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg },
  hero: {
    height: 240, backgroundColor: Colors.darkCard,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  back: {
    position: 'absolute', top: 52, left: 16, zIndex: 10,
    padding: 6, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20,
  },
  bundleBadge: {
    position: 'absolute', top: 52, right: 16, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.royal, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  bundleBadgeText: { fontSize: 8, fontWeight: '700', color: Colors.white },
  heroEmoji: { fontSize: 90 },
  heroValueBox: {
    position: 'absolute', bottom: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  heroValueLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  heroValueArrow: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  heroValueAmount: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '800' },
  verifiedBadge: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: Colors.lilac, borderRadius: Radius.pill,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  verifiedText: { fontSize: 8, fontWeight: '700', color: Colors.white },

  body: { flex: 1 },
  bodyContent: { padding: Spacing.lg, paddingBottom: 120, gap: 14 },

  buyerTicker: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: Radius.sm,
    padding: 8, borderWidth: 1, borderColor: 'rgba(139,92,246,0.15)',
  },
  buyerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.lilac },
  buyerTickerText: { fontSize: FontSizes.xs, color: Colors.textSecondary, flex: 1 },

  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, lineHeight: 30 },

  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sellerAvatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.royal, alignItems: 'center', justifyContent: 'center' },
  sellerAvatarText: { fontSize: 9, color: Colors.white, fontWeight: '700' },
  sellerHandle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(139,92,246,0.12)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedChipText: { fontSize: 7, color: Colors.lilac, fontWeight: '700' },

  bundleCard: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(249,200,70,0.15)',
  },
  bundleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  bundleTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
  bundleCountBadge: {
    backgroundColor: 'rgba(139,92,246,0.15)', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  bundleCountText: { fontSize: 9, color: Colors.lilac, fontWeight: '700' },
  bundleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.darkBorder,
  },
  bundleEmoji: { fontSize: 22 },
  bundleName: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary },
  bundleValBadge: { backgroundColor: 'rgba(249,200,70,0.1)', borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  bundleVal: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '700' },
  bundleTotal: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(249,200,70,0.2)',
  },
  bundleTotalLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  bundleTotalVal: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.gold },

  valueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(249,200,70,0.06)', borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(249,200,70,0.15)',
  },
  valueCardTitle: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '700' },
  valueCardSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  thresholdCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md, gap: 8 },
  thresholdTop: { flexDirection: 'row', justifyContent: 'space-between' },
  thresholdLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  thresholdCount: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '700' },
  thresholdBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  thresholdMet: { fontSize: FontSizes.xs, fontWeight: '600' },
  pctSold: { fontSize: FontSizes.xs, color: Colors.pink, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' },
  statVal: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  myTicketsCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(139,92,246,0.12)', borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)',
  },
  myTicketsText: { fontSize: FontSizes.base, color: Colors.lilac, fontWeight: '600' },
  myOddsText: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  desc: { fontSize: FontSizes.base, color: Colors.textSecondary, lineHeight: 22 },

  cta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.lg, backgroundColor: Colors.darkBg,
    borderTopWidth: 1, borderTopColor: Colors.darkBorder,
    gap: 6,
    ...Shadows.card,
  },
  ctaScarcity: { textAlign: 'center', fontSize: FontSizes.xs, color: Colors.danger, fontWeight: '700' },
  ctaSub: { textAlign: 'center', fontSize: 9, color: Colors.textTertiary },
});
