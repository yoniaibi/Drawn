import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '../../src/theme';
import { MOCK_DRAWS } from '../../src/mocks';
import ProgressBar from '../../src/components/ProgressBar';
import PrimaryButton from '../../src/components/PrimaryButton';
import { formatTicketPrice } from '../../src/utils/countdown';

export default function DrawDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const draw = MOCK_DRAWS.find(d => d.id === id) ?? MOCK_DRAWS[0];
  const progress = draw.ticketsSold / draw.totalTickets;

  return (
    <View style={styles.screen}>
      {/* Header image area */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.heroEmoji}>{draw.emoji}</Text>
        {draw.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.white} />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{draw.title}</Text>
          <View style={styles.valueBadge}>
            <Text style={styles.valueText}>£{draw.retailValue.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.sellerRow}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerAvatarText}>{draw.sellerAvatar}</Text>
          </View>
          <Text style={styles.sellerHandle}>{draw.seller}</Text>
          <View style={styles.verifiedChip}>
            <Text style={styles.verifiedChipText}>VERIFIED</Text>
          </View>
        </View>

        {/* Threshold card */}
        <View style={styles.thresholdCard}>
          <View style={styles.thresholdTop}>
            <Text style={styles.thresholdLabel}>Tickets sold</Text>
            <Text style={styles.thresholdCount}>{draw.ticketsSold.toLocaleString()} / {draw.totalTickets.toLocaleString()}</Text>
          </View>
          <ProgressBar progress={progress} height={5} />
          <View style={styles.thresholdBottom}>
            <Text style={[styles.thresholdMet, { color: progress >= draw.minThreshold ? Colors.gold : Colors.textSecondary }]}>
              {progress >= draw.minThreshold ? 'Threshold met · draws tonight' : `${Math.round(draw.minThreshold * 100)}% needed to draw`}
            </Text>
            <Text style={styles.pctSold}>{Math.round(progress * 100)}% sold</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statVal}>{formatTicketPrice(draw.ticketPrice)}</Text><Text style={styles.statLabel}>per ticket</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>{draw.totalTickets.toLocaleString()}</Text><Text style={styles.statLabel}>total tickets</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>{draw.condition.replace('_', ' ')}</Text><Text style={styles.statLabel}>condition</Text></View>
        </View>

        <Text style={styles.desc}>{draw.description}</Text>

        {draw.myTickets > 0 && (
          <View style={styles.myTicketsCard}>
            <Ionicons name="ticket" size={16} color={Colors.lilac} />
            <Text style={styles.myTicketsText}>You hold {draw.myTickets} ticket{draw.myTickets > 1 ? 's' : ''}</Text>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <PrimaryButton
          label={`Enter from ${formatTicketPrice(draw.ticketPrice)}`}
          onPress={() => router.push(`/purchase/${draw.id}`)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg },
  hero: {
    height: 220, backgroundColor: Colors.darkCard,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  back: { position: 'absolute', top: 50, left: 16, zIndex: 10, padding: 4 },
  heroEmoji: { fontSize: 80 },
  verifiedBadge: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: Colors.lilac, borderRadius: Radius.pill,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  verifiedText: { fontSize: 8, fontWeight: '700', color: Colors.white },
  body: { flex: 1 },
  bodyContent: { padding: Spacing.lg, paddingBottom: 100, gap: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, flex: 1, lineHeight: 30 },
  valueBadge: { backgroundColor: Colors.gold, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  valueText: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.ink },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sellerAvatar: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.royal, alignItems: 'center', justifyContent: 'center' },
  sellerAvatarText: { fontSize: 9, color: Colors.white, fontWeight: '700' },
  sellerHandle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  verifiedChip: { backgroundColor: Colors.darkCard, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 },
  verifiedChipText: { fontSize: 7, color: Colors.lilac, fontWeight: '700' },
  thresholdCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md, gap: 6 },
  thresholdTop: { flexDirection: 'row', justifyContent: 'space-between' },
  thresholdLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  thresholdCount: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '600' },
  thresholdBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  thresholdMet: { fontSize: FontSizes.xs, fontWeight: '600' },
  pctSold: { fontSize: FontSizes.xs, color: Colors.pink, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' },
  statVal: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  desc: { fontSize: FontSizes.base, color: Colors.textSecondary, lineHeight: 22 },
  myTicketsCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(139,92,246,0.12)', borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)',
  },
  myTicketsText: { fontSize: FontSizes.base, color: Colors.lilac, fontWeight: '600' },
  cta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.lg, backgroundColor: Colors.darkBg,
    borderTopWidth: 1, borderTopColor: Colors.darkBorder,
    ...Shadows.card,
  },
});
