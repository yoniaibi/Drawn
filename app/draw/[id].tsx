import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '../../src/theme';
import { MOCK_DRAWS } from '../../src/mocks';
import ProgressBar from '../../src/components/ProgressBar';
import PrimaryButton from '../../src/components/PrimaryButton';
import { formatTicketPrice } from '../../src/utils/countdown';

const BUYER_TICKERS = [
  '@sophie_k just bought 5 tickets',
  '@dan.w grabbed 3 tickets',
  '@priya__ added 10 tickets',
  '@mike_j bought 2 tickets',
  '@chloe just joined the draw',
];

const VIEWER_COUNTS = [84, 91, 88, 97, 103, 89];

export default function DrawDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const draw = MOCK_DRAWS.find(d => d.id === id);

  if (!draw) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.darkBg, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ fontSize: 40 }}>🎟️</Text>
        <Text style={{ color: Colors.white, fontSize: FontSizes.base, fontWeight: '700' }}>Draw not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.lilac, fontSize: FontSizes.sm }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const progress = draw.ticketsSold / draw.totalTickets;
  const remaining = draw.totalTickets - draw.ticketsSold;
  const isVeryLow = remaining < 200;
  const isLow = remaining < 500;

  const [buyerIdx, setBuyerIdx] = useState(0);
  const [viewers, setViewers] = useState(VIEWER_COUNTS[0]);
  const buyerOpacity = useRef(new RNAnimated.Value(1)).current;

  // Pulse for scarcity
  const pulseOpacity = useSharedValue(1);
  useEffect(() => {
    if (isLow) {
      pulseOpacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
      );
    }
  }, [isLow]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));

  // Rotate buyer ticker
  useEffect(() => {
    const intervalId = setInterval(() => {
      RNAnimated.timing(buyerOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setBuyerIdx(i => (i + 1) % BUYER_TICKERS.length);
        RNAnimated.timing(buyerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  // Rotate viewer count
  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      i = (i + 1) % VIEWER_COUNTS.length;
      setViewers(VIEWER_COUNTS[i]);
    }, 5000);
    return () => clearInterval(intervalId);
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

        {/* Viewer count badge */}
        <View style={styles.viewersBadge}>
          <View style={styles.viewersDot} />
          <Text style={styles.viewersText}>{viewers} viewing</Text>
        </View>

        <Text style={styles.heroEmoji}>{draw.emoji}</Text>

        {/* Value ratio overlay */}
        <View style={styles.heroValueBox}>
          <Text style={styles.heroValueLabel}>{formatTicketPrice(draw.ticketPrice)}</Text>
          <Text style={styles.heroValueArrow}>→</Text>
          <Text style={styles.heroValueAmount}>£{draw.retailValue.toLocaleString()}</Text>
        </View>

        {draw.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.white} />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Live buyer ticker */}
        <View style={styles.buyerTicker}>
          <View style={styles.buyerDot} />
          <RNAnimated.Text style={[styles.buyerTickerText, { opacity: buyerOpacity }]} numberOfLines={1}>
            {BUYER_TICKERS[buyerIdx]}
          </RNAnimated.Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{draw.title}</Text>
        </View>

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

        {/* Scarcity warning */}
        {isLow && (
          <Animated.View style={[styles.scarcityCard, pulseStyle, { borderColor: isVeryLow ? Colors.danger : Colors.warning }]}>
            <Ionicons name="warning" size={14} color={isVeryLow ? Colors.danger : Colors.warning} />
            <Text style={[styles.scarcityText, { color: isVeryLow ? Colors.danger : Colors.warning }]}>
              {isVeryLow
                ? `🚨 Only ${remaining} tickets left — drawing soon!`
                : `⚡ ${remaining} tickets remaining · filling fast`}
            </Text>
          </Animated.View>
        )}

        {/* Threshold card */}
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
            <Text style={[styles.statVal, { color: Colors.gold }]}>£{draw.retailValue.toLocaleString()}</Text>
            <Text style={styles.statLabel}>prize value</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{draw.condition.replace('_', ' ')}</Text>
            <Text style={styles.statLabel}>condition</Text>
          </View>
        </View>

        {/* My tickets / odds */}
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

        {/* Bundle items */}
        {draw.isBundle && draw.bundleItems && (
          <View style={styles.bundleCard}>
            <Text style={styles.bundleTitle}>What's included ({draw.bundleItems.length} items)</Text>
            {draw.bundleItems.map((item, i) => (
              <View key={i} style={styles.bundleRow}>
                <Text style={styles.bundleEmoji}>{item.emoji}</Text>
                <Text style={styles.bundleName}>{item.name}</Text>
                <Text style={styles.bundleVal}>£{item.retailValue.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* CTA */}
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
  back: { position: 'absolute', top: 52, left: 16, zIndex: 10, padding: 6, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  viewersBadge: {
    position: 'absolute', top: 52, right: 16, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  viewersDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },
  viewersText: { fontSize: 9, color: Colors.white, fontWeight: '600' },
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

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, flex: 1, lineHeight: 30 },

  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sellerAvatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.royal, alignItems: 'center', justifyContent: 'center' },
  sellerAvatarText: { fontSize: 9, color: Colors.white, fontWeight: '700' },
  sellerHandle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(139,92,246,0.12)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedChipText: { fontSize: 7, color: Colors.lilac, fontWeight: '700' },

  scarcityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: Radius.md, padding: Spacing.sm,
    backgroundColor: 'rgba(226,75,74,0.08)', borderWidth: 1,
  },
  scarcityText: { fontSize: FontSizes.xs, fontWeight: '700', flex: 1 },

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

  bundleCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md },
  bundleTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '700', marginBottom: 10 },
  bundleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: Colors.darkBorder },
  bundleEmoji: { fontSize: 18 },
  bundleName: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary },
  bundleVal: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '700' },

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
