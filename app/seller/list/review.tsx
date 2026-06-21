import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import PrimaryButton from '../../../src/components/PrimaryButton';
import { formatTicketPrice } from '../../../src/utils/countdown';
import { useSellerDraft } from '../../../src/store/sellerDraft';
import { useAuthStore } from '../../../src/store';
import { supabase } from '../../../src/lib/supabase';

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepBar}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.stepSegment, i + 1 <= current ? styles.stepActive : styles.stepInactive]} />
      ))}
    </View>
  );
}

export default function ListReviewScreen() {
  const router = useRouter();
  const { user, handle, avatar } = useAuthStore();
  const draft = useSellerDraft((s) => s);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const totalRaise = draft.ticketPrice * draft.totalTickets;
  const sellerGets = Math.round(totalRaise * 0.846);

  // Map display condition back to DB enum
  const conditionMap: Record<string, string> = {
    new: 'new', like_new: 'like_new', good: 'good', fair: 'fair',
  };

  async function handleSubmit() {
    if (!user) { setError('You must be logged in to list an item.'); return; }
    if (!draft.title || !draft.condition) { setError('Missing item details — go back and fill in all fields.'); return; }
    if (draft.retailValue <= 0) { setError('Missing retail value — go back and set it.'); return; }

    setError(null);
    setSubmitting(true);

    try {
      // 1. Mark seller as is_seller in profiles
      await supabase.from('profiles').update({ is_seller: true }).eq('id', user.id);

      // Schedule draw for next available 9pm slot (at least 3 days out for shipping)
      const drawDate = new Date();
      drawDate.setDate(drawDate.getDate() + 3);
      drawDate.setHours(21, 0, 0, 0);

      // 2. Insert draw
      const { data: draw, error: drawErr } = await supabase.from('draws').insert({
        title: draft.title,
        emoji: draft.emoji,
        seller_id: user.id,
        seller_handle: handle,
        seller_avatar: avatar,
        seller_verified: false,
        ticket_price: draft.ticketPrice,
        total_tickets: draft.totalTickets,
        tickets_sold: 0,
        status: 'pending',
        retail_value: draft.retailValue,
        min_threshold: 0.6,
        description: draft.description,
        condition: conditionMap[draft.condition] ?? 'good',
        is_bundle: draft.type === 'bundle',
        draw_date: drawDate.toISOString(),
      }).select().single();

      if (drawErr) throw new Error(drawErr.message);

      // 3. Mark done first (while draft still holds values), then clear
      setDone(true);
      draft.clearDraft();

    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successIconBox}>
          <Ionicons name="checkmark-circle" size={52} color={Colors.lilac} />
        </View>
        <Text style={styles.successHeading}>Draw submitted!</Text>
        <Text style={styles.successSub}>
          Your draw is pending verification. Ship your item using the prepaid label we'll send to your email.
          Once we verify your identity and receive the item, your draw goes live.
        </Text>
        <View style={styles.successSteps}>
          {[
            { icon: 'cube-outline' as const, label: 'Ship item', sub: 'Prepaid label sent to your email' },
            { icon: 'search-outline' as const, label: 'We verify it', sub: 'Authenticity check within 24h of receipt' },
            { icon: 'rocket-outline' as const, label: 'Goes live', sub: 'Next available 9pm slot' },
            { icon: 'cash-outline' as const, label: 'You get paid', sub: `${formatTicketPrice(sellerGets)} if all tickets sell` },
          ].map((s) => (
            <View key={s.label} style={styles.successStep}>
              <Ionicons name={s.icon} size={22} color={Colors.lilac} />
              <View>
                <Text style={styles.successStepLabel}>{s.label}</Text>
                <Text style={styles.successStepSub}>{s.sub}</Text>
              </View>
            </View>
          ))}
        </View>
        <PrimaryButton label="View my dashboard" onPress={() => router.replace('/seller/dashboard')} />
      </View>
    );
  }

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
          Once submitted, ship your item to us within 3 days. We verify it and schedule the draw.
        </Text>

        <View style={styles.previewCard}>
          {draft.images && draft.images[0] ? (
            <Image source={{ uri: draft.images[0] }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.previewIconBox}>
              <Ionicons name={draft.type === 'bundle' ? 'bag-outline' : 'shirt-outline'} size={36} color={Colors.lilac} />
            </View>
          )}
          <Text style={styles.previewTitle}>{draft.title || 'Untitled item'}</Text>
          <Text style={styles.previewSub}>
            {draft.condition ? `${draft.condition.replace('_', ' ')} · ` : ''}
            {draft.type === 'bundle' ? 'Bundle' : 'Single item'}
          </Text>
          {draft.description ? (
            <Text style={styles.previewDesc} numberOfLines={2}>{draft.description}</Text>
          ) : null}
        </View>

        <View style={styles.summaryCard}>
          {([
            ['Retail value', draft.retailValue > 0 ? `£${(draft.retailValue / 100).toFixed(0)}` : '—'],
            ['Ticket price', formatTicketPrice(draft.ticketPrice)],
            ['Total tickets', draft.totalTickets.toLocaleString()],
            ['Value ratio', draft.retailValue > 0 ? `${Math.round((draft.retailValue / 100) / draft.ticketPrice)}× return for buyers` : '—'],
            ['You receive', `${formatTicketPrice(sellerGets)} (if all sell)`],
          ] as [string, string][]).map(([label, val]) => (
            <View key={label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{label}</Text>
              <Text style={[styles.summaryVal, label === 'You receive' && { color: Colors.gold }]}>{val}</Text>
            </View>
          ))}
        </View>

        <View style={styles.shippingNote}>
          <Ionicons name="cube-outline" size={16} color={Colors.lilac} />
          <Text style={styles.shippingText}>
            A prepaid shipping label will be emailed to you immediately after submission.
          </Text>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={14} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {submitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={Colors.lilac} />
            <Text style={styles.loadingText}>Submitting your draw...</Text>
          </View>
        ) : (
          <PrimaryButton
            label="Submit & get shipping label"
            onPress={handleSubmit}
            style={{ marginTop: Spacing.lg }}
          />
        )}
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
  stepLabel: { fontSize: 10, color: Colors.textTertiary, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, letterSpacing: 0.5 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
  previewCard: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg,
    padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
  },
  previewImage: { width: 160, height: 120, borderRadius: Radius.md, marginBottom: 12 },
  previewIconBox: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(139,92,246,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  previewTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700', textAlign: 'center' },
  previewSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  previewDesc: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: 6, textAlign: 'center', lineHeight: 17 },
  summaryCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md, gap: 10, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.darkBorder },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  summaryVal: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600', flex: 1, textAlign: 'right' },
  shippingNote: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: Radius.md, padding: Spacing.md },
  shippingText: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(226,75,74,0.1)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(226,75,74,0.3)', padding: Spacing.md, marginTop: Spacing.md },
  errorText: { flex: 1, fontSize: FontSizes.sm, color: Colors.danger },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: Spacing.xl },
  loadingText: { fontSize: FontSizes.base, color: Colors.textSecondary, fontStyle: 'italic' },

  // Success screen
  successScreen: { flex: 1, backgroundColor: Colors.darkBg, alignItems: 'center', padding: Spacing.xl, paddingTop: 80 },
  successIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(139,92,246,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successHeading: { fontFamily: Fonts.serif, fontSize: FontSizes.xxl, color: Colors.white, marginBottom: 8, textAlign: 'center' },
  successSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl },
  successSteps: { width: '100%', gap: 12, marginBottom: Spacing.xl },
  successStep: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md },
  successStepLabel: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  successStepSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
});
