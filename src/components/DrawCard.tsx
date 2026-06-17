import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Draw } from '../mocks';
import { Colors, Radius, FontSizes, Spacing } from '../theme';
import { formatTicketPrice } from '../utils/countdown';
import ProgressBar from './ProgressBar';

interface Props {
  draw: Draw;
  wide?: boolean;
}

export default function DrawCard({ draw, wide }: Props) {
  const router = useRouter();
  const progress = draw.ticketsSold / draw.totalTickets;
  const isTonight = draw.status === 'closing_tonight' || draw.status === 'live';

  return (
    <TouchableOpacity
      style={[styles.card, wide && styles.wide]}
      onPress={() => router.push(`/draw/${draw.id}`)}
      activeOpacity={0.85}
    >
      {draw.isBundle ? (
        <View style={styles.bundleStrip}>
          {(draw.bundleItems ?? []).slice(0, 3).map((item, i) => (
            <View key={i} style={[styles.bundleCell, { backgroundColor: `rgba(${45 + i * 20},20,${60 + i * 10},1)` }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
          ))}
          <View style={[styles.bundleCell, styles.bundleMore]}>
            <Text style={styles.bundleMoreText}>+{(draw.bundleItems?.length ?? 0) - 3}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.imageBox}>
          <Text style={styles.emoji}>{draw.emoji}</Text>
          <View style={styles.valueBadge}>
            <Text style={styles.valueBadgeText}>£{draw.retailValue.toLocaleString()}</Text>
          </View>
          {draw.isBundle && (
            <View style={styles.bundleBadge}>
              <Text style={styles.bundleBadgeText}>BUNDLE</Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.meta}>
        {wide && draw.isBundle && (
          <View style={styles.bundleTagRow}>
            <Text style={styles.bundleTag}>BUNDLE</Text>
            <Text style={styles.valueBadgeWide}>£{draw.retailValue.toLocaleString()}</Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={1}>{draw.title}</Text>
        <Text style={styles.seller}>{draw.seller}</Text>
        <ProgressBar progress={progress} height={4} />
        <View style={styles.footer}>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>{formatTicketPrice(draw.ticketPrice)}</Text>
          </View>
          <Text style={[styles.timing, isTonight && styles.timingTonight]}>
            {isTonight ? 'Tonight' : 'Tomorrow'}
          </Text>
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
  },
  wide: { flex: 1 },
  imageBox: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1030',
    position: 'relative',
  },
  bundleStrip: { flexDirection: 'row', height: 60 },
  bundleCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bundleMore: { backgroundColor: '#161030' },
  bundleMoreText: { fontFamily: undefined, fontSize: 13, fontWeight: '800', color: Colors.gold },
  emoji: { fontSize: 30 },
  valueBadge: {
    position: 'absolute', top: 5, right: 5,
    backgroundColor: Colors.gold, borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  valueBadgeText: { fontSize: 7, fontWeight: '800', color: Colors.ink },
  bundleBadge: {
    position: 'absolute', top: 5, left: 5,
    backgroundColor: Colors.gold, borderRadius: 5,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  bundleBadgeText: { fontSize: 6.5, fontWeight: '800', color: Colors.violet, letterSpacing: 0.3 },
  meta: { padding: Spacing.sm, paddingBottom: Spacing.md, gap: 4 },
  bundleTagRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  bundleTag: { fontSize: 7, fontWeight: '800', color: Colors.gold },
  valueBadgeWide: { fontSize: 7, fontWeight: '800', color: Colors.gold },
  title: { color: Colors.white, fontSize: 11, fontWeight: '600' },
  seller: { color: Colors.textSecondary, fontSize: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  pricePill: { backgroundColor: Colors.pink, borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  priceText: { color: Colors.white, fontSize: 9, fontWeight: '700' },
  timing: { fontSize: 8, color: Colors.textSecondary },
  timingTonight: { color: Colors.gold, fontWeight: '600' },
});
