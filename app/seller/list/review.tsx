import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import PrimaryButton from '../../../src/components/PrimaryButton';
import { formatTicketPrice } from '../../../src/utils/countdown';
import { useSellerDraft } from '../../../src/store/sellerDraft';

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepBar}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.stepSegment, i + 1 <= current ? styles.stepActive : styles.stepInactive]}
        />
      ))}
    </View>
  );
}

export default function ListReviewScreen() {
  const router = useRouter();
  const draft = useSellerDraft((s) => ({
    type: s.type,
    title: s.title,
    description: s.description,
    condition: s.condition,
    ticketPrice: s.ticketPrice,
    totalTickets: s.totalTickets,
    clearDraft: s.clearDraft,
  }));

  const totalRaise = draft.ticketPrice * draft.totalTickets;
  const sellerGets = Math.round(totalRaise * 0.846);

  const handleSubmit = () => {
    draft.clearDraft();
    router.replace('/seller/dashboard');
  };

  const typeEmoji = draft.type === 'bundle' ? '🛍️' : '👜';
  const typeLabel = draft.type === 'bundle' ? 'Bundle' : 'Single item';

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <StepBar current={4} total={4} />
      <Text style={styles.stepLabel}>Step 4 of 4</Text>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Review & submit</Text>
        <Text style={styles.sub}>
          Once submitted, ship your item to us within 3 days. We'll verify it and go live.
        </Text>

        <View style={styles.previewCard}>
          <Text style={styles.emoji}>{typeEmoji}</Text>
          <Text style={styles.itemTitle}>{draft.title || 'Untitled item'}</Text>
          <Text style={styles.itemSub}>
            {draft.condition ? `${draft.condition} · ` : ''}{typeLabel}
          </Text>
          {draft.description ? (
            <Text style={styles.itemDesc} numberOfLines={2}>{draft.description}</Text>
          ) : null}
        </View>

        <View style={styles.summaryCard}>
          {([
            ['Ticket price', formatTicketPrice(draft.ticketPrice)],
            ['Total tickets', draft.totalTickets.toLocaleString()],
            ['Draw date', 'Tonight 9pm (if shipped today)'],
            ['You receive', `${formatTicketPrice(sellerGets)} (if all tickets sell)`],
          ] as [string, string][]).map(([label, val]) => (
            <View key={label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{label}</Text>
              <Text style={styles.summaryVal}>{val}</Text>
            </View>
          ))}
        </View>

        <View style={styles.shippingNote}>
          <Ionicons name="cube-outline" size={16} color={Colors.lilac} />
          <Text style={styles.shippingText}>
            We'll send you a prepaid shipping label after submission.
          </Text>
        </View>

        <PrimaryButton
          label="Submit & get shipping label"
          onPress={handleSubmit}
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 12 },

  stepBar: { flexDirection: 'row', gap: 4, paddingHorizontal: Spacing.lg, marginBottom: 6 },
  stepSegment: { flex: 1, height: 3, borderRadius: 2 },
  stepActive: { backgroundColor: Colors.lilac },
  stepInactive: { backgroundColor: Colors.darkBorder },
  stepLabel: {
    fontSize: 10, color: Colors.textTertiary,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, letterSpacing: 0.5,
  },

  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
  previewCard: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg,
    padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md,
  },
  emoji: { fontSize: 48, marginBottom: 10 },
  itemTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  itemSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 4 },
  itemDesc: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: 6, textAlign: 'center', lineHeight: 17 },
  summaryCard: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg,
    padding: Spacing.md, gap: 10, marginBottom: Spacing.md,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  summaryVal: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600', flex: 1, textAlign: 'right' },
  shippingNote: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: Radius.md, padding: Spacing.md,
  },
  shippingText: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
});
