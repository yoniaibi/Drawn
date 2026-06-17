import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Draw } from '../mocks';
import { Colors, Radius, FontSizes, Spacing } from '../theme';
import { formatTicketPrice } from '../utils/countdown';
import ProgressBar from './ProgressBar';

interface Props {
  draw: Draw;
  wide?: boolean;
}

const URGENCY_COLORS = {
  closing_tonight: Colors.pink,
  live: Colors.gold,
  open: Colors.lilac,
  completed: Colors.textTertiary,
  cancelled: Colors.textTertiary,
};

export default function DrawCard({ draw, wide }: Props) {
  const router = useRouter();
  const progress = draw.ticketsSold / draw.totalTickets;
  const remaining = draw.totalTickets - draw.ticketsSold;
  const isTonight = draw.status === 'closing_tonight';
  const isLive = draw.status === 'live';
  const isUrgent = isTonight && progress > 0.7;
  const urgentColor = URGENCY_COLORS[draw.status];

  // Fake live viewer count
  const viewers = Math.floor(draw.ticketsSold * 0.08 + 12);

  return (
    <TouchableOpacity
      style={[styles.card, wide && styles.wide, isUrgent && styles.urgentBorder]}
      onPress={() => router.push(`/draw/${draw.id}`)}
      activeOpacity={0.85}
    >
      {draw.isBundle ? (
        <View style={styles.bundleStrip}>
          {(draw.bundleItems ?? []).slice(0, 3).map((item, i) => (
            <View key={i} style={[styles.bundleCell, { backgroundColor: `rgba(${45 + i * 25},15,${60 + i * 15},1)` }]}>
              <Text style={styles.bundleEmoji}>{item.emoji}</Text>
            </View>
          ))}
          <View style={[styles.bundleCell, styles.bundleMore]}>
            <Text style={styles.bundleMoreText}>+{Math.max(0, (draw.bundleItems?.length ?? 0) - 3)}</Text>
          </View>
          {draw.isBundle && (
            <View style={styles.bundleBadgeAbsolute}>
              <Text style={styles.bundleBadgeText}>BUNDLE</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.imageBox}>
          <Text style={styles.emoji}>{draw.emoji}</Text>
          <View style={styles.valueBadge}>
            <Text style={styles.valueBadgeText}>£{draw.retailValue.toLocaleString()}</Text>
          </View>
          {/* Live viewer count */}
          <View style={styles.viewerBadge}>
            <View style={[styles.viewerDot, { backgroundColor: urgentColor }]} />
            <Text style={styles.viewerText}>{viewers}</Text>
          </View>
        </View>
      )}

      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>{draw.title}</Text>
        <Text style={styles.seller}>{draw.seller}</Text>

        <View style={styles.progressRow}>
          <ProgressBar progress={progress} height={3} />
          {isUrgent && (
            <Text style={styles.urgentPct}>{Math.round(progress * 100)}%</Text>
          )}
        </View>

        {/* Scarcity line */}
        {remaining < 500 && (
          <Text style={styles.scarcity}>⚡ Only {remaining.toLocaleString()} tickets left</Text>
        )}

        <View style={styles.footer}>
          <View style={[styles.pricePill, { backgroundColor: isLive ? Colors.gold : Colors.pink }]}>
            <Text style={[styles.priceText, isLive && { color: Colors.ink }]}>
              {formatTicketPrice(draw.ticketPrice)}
            </Text>
          </View>
          <View style={styles.timingRow}>
            {isTonight && <View style={[styles.timingDot, { backgroundColor: Colors.pink }]} />}
            {isLive && <View style={[styles.timingDot, { backgroundColor: Colors.gold }]} />}
            <Text style={[
              styles.timing,
              isTonight && styles.timingTonight,
              isLive && styles.timingLive,
            ]}>
              {isLive ? 'LIVE' : isTonight ? 'Tonight' : 'Tomorrow'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.md,
    overflow: 'hidden',
    flex: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  wide: { flex: 1 },
  urgentBorder: { borderColor: 'rgba(244,114,182,0.35)' },
  imageBox: {
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#150e28',
  },
  bundleStrip: { flexDirection: 'row', height: 68, position: 'relative' },
  bundleCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bundleEmoji: { fontSize: 22 },
  bundleMore: { backgroundColor: '#0f0a1e' },
  bundleMoreText: { fontSize: 12, fontWeight: '800', color: Colors.gold },
  bundleBadgeAbsolute: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: Colors.gold, borderRadius: 5,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  bundleBadgeText: { fontSize: 6.5, fontWeight: '800', color: Colors.violet },
  emoji: { fontSize: 34 },
  valueBadge: {
    position: 'absolute', top: 5, right: 5,
    backgroundColor: 'rgba(249,200,70,0.9)', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  valueBadgeText: { fontSize: 7, fontWeight: '800', color: Colors.ink },
  viewerBadge: {
    position: 'absolute', bottom: 5, left: 5,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  viewerDot: { width: 4, height: 4, borderRadius: 2 },
  viewerText: { fontSize: 7, color: Colors.white, fontWeight: '600' },
  meta: { padding: Spacing.sm, paddingBottom: 10, gap: 3 },
  title: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  seller: { color: Colors.textSecondary, fontSize: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  urgentPct: { fontSize: 7, color: Colors.pink, fontWeight: '700' },
  scarcity: { fontSize: 7.5, color: Colors.gold, fontWeight: '600', marginTop: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 },
  pricePill: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  priceText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  timingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  timingDot: { width: 4, height: 4, borderRadius: 2 },
  timing: { fontSize: 8, color: Colors.textSecondary, fontWeight: '600' },
  timingTonight: { color: Colors.pink },
  timingLive: { color: Colors.gold },
});
