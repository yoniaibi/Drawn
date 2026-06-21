import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import PrimaryButton from '../../../src/components/PrimaryButton';
import { useAuthStore } from '../../../src/store';
import { supabase } from '../../../src/lib/supabase';
import { formatTicketPrice } from '../../../src/utils/countdown';
import { SELLER_FEE_MULTIPLIER } from '../../../src/constants';

interface DrawSummary {
  id: string;
  title: string;
  ticket_price: number;
  tickets_sold: number;
  total_tickets: number;
  winner_handle: string | null;
  winner_user_id: string | null;
  retail_value: number;
  completed_at: string | null;
  status: string;
  seller_id: string;
}

type ShipStatus = 'idle' | 'shipping' | 'shipped' | 'error';

export default function DrawCompleteScreen() {
  const router = useRouter();
  const { drawId } = useLocalSearchParams<{ drawId: string }>();
  const { user } = useAuthStore();

  const [draw, setDraw] = useState<DrawSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipStatus, setShipStatus] = useState<ShipStatus>('idle');
  const [alreadyShipped, setAlreadyShipped] = useState(false);

  useEffect(() => {
    if (!drawId) return;
    supabase
      .from('draws')
      .select('id, title, ticket_price, tickets_sold, total_tickets, winner_handle, winner_user_id, retail_value, completed_at, status, seller_id')
      .eq('id', drawId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError('Draw not found.'); setLoading(false); return; }
        if (data.seller_id !== user?.id) { setError('This draw does not belong to you.'); setLoading(false); return; }
        setDraw(data as DrawSummary);
        setLoading(false);
      });

    // Check if already marked shipped
    supabase
      .from('draw_shipments')
      .select('id')
      .eq('draw_id', drawId)
      .maybeSingle()
      .then(({ data }) => { if (data) setAlreadyShipped(true); });
  }, [drawId, user?.id]);

  async function markShipped() {
    if (!draw || !user) return;
    setShipStatus('shipping');
    try {
      const { error: err } = await supabase.from('draw_shipments').insert({
        draw_id: draw.id,
        seller_id: user.id,
        winner_handle: draw.winner_handle,
        marked_at: new Date().toISOString(),
      });
      if (err) throw new Error(err.message);
      setAlreadyShipped(true);
      setShipStatus('shipped');
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
      setShipStatus('error');
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.lilac} />
      </View>
    );
  }

  if (error || !draw) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.danger} />
        <Text style={styles.errorMsg}>{error ?? 'Something went wrong.'}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const earned = Math.round(draw.tickets_sold * draw.ticket_price * SELLER_FEE_MULTIPLIER);
  const completedDate = draw.completed_at
    ? new Date(draw.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Recently';

  const isNoWinner = !draw.winner_handle;

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.iconBox}>
          <Ionicons
            name={isNoWinner ? 'alert-circle-outline' : 'trophy'}
            size={32}
            color={isNoWinner ? Colors.warning : Colors.gold}
          />
        </View>
        <Text style={styles.title}>
          {isNoWinner ? 'Draw cancelled' : 'Draw complete'}
        </Text>
        <Text style={styles.sub}>
          {isNoWinner
            ? 'This draw did not reach its minimum threshold and was cancelled. No payment was taken from buyers.'
            : `Completed ${completedDate}. Your item needs to be shipped to the winner.`}
        </Text>

        {/* Draw summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{draw.title}</Text>
          <View style={styles.divider} />
          {([
            ['Tickets sold', `${draw.tickets_sold.toLocaleString()} / ${draw.total_tickets.toLocaleString()}`],
            ['Ticket price', formatTicketPrice(draw.ticket_price)],
            ['Prize value', `£${(draw.retail_value / 100).toFixed(0)}`],
            ['Your earnings', formatTicketPrice(earned)],
          ] as [string, string][]).map(([label, val]) => (
            <View key={label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{label}</Text>
              <Text style={[styles.summaryVal, label === 'Your earnings' && { color: Colors.gold }]}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Winner info */}
        {!isNoWinner && (
          <View style={styles.winnerCard}>
            <View style={styles.winnerIconBox}>
              <Ionicons name="person-circle-outline" size={28} color={Colors.lilac} />
            </View>
            <View style={styles.winnerInfo}>
              <Text style={styles.winnerLabel}>Winner</Text>
              <Text style={styles.winnerHandle}>{draw.winner_handle}</Text>
            </View>
            <View style={styles.winnerBadge}>
              <Ionicons name="trophy" size={12} color={Colors.gold} />
              <Text style={styles.winnerBadgeText}>WINNER</Text>
            </View>
          </View>
        )}

        {/* Shipping section */}
        {!isNoWinner && (
          <>
            <Text style={styles.sectionLabel}>SHIPPING</Text>

            {alreadyShipped ? (
              <View style={styles.shippedCard}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.shippedTitle}>Marked as shipped</Text>
                  <Text style={styles.shippedSub}>We'll notify the winner. Your payout will be released once they confirm receipt.</Text>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.shippingSteps}>
                  {[
                    { icon: 'cube-outline' as const, text: 'Pack the item securely — use the original box if possible' },
                    { icon: 'mail-outline' as const, text: 'We\'ll email you a prepaid tracked shipping label within 2 hours' },
                    { icon: 'car-outline' as const, text: 'Drop off at any Post Office or DPD pickup point' },
                    { icon: 'checkmark-circle-outline' as const, text: 'Once delivered, your payout releases in 3–5 business days' },
                  ].map((s, i) => (
                    <View key={i} style={styles.shippingStep}>
                      <View style={styles.shippingStepNum}>
                        <Text style={styles.shippingStepNumText}>{i + 1}</Text>
                      </View>
                      <Ionicons name={s.icon} size={16} color={Colors.lilac} />
                      <Text style={styles.shippingStepText}>{s.text}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.contactCard}>
                  <Ionicons name="mail-outline" size={14} color={Colors.gold} />
                  <Text style={styles.contactText}>
                    Shipping label will arrive at your registered email. If it doesn't arrive within 2 hours email{' '}
                    <Text style={styles.contactEmail}>sellers@drawn.co.uk</Text>
                  </Text>
                </View>

                {shipStatus === 'error' && (
                  <View style={styles.errorCard}>
                    <Ionicons name="warning-outline" size={14} color={Colors.danger} />
                    <Text style={styles.errorCardText}>{error}</Text>
                  </View>
                )}

                {shipStatus === 'shipping' ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={Colors.lilac} />
                    <Text style={styles.loadingText}>Saving…</Text>
                  </View>
                ) : (
                  <PrimaryButton
                    label="I've shipped the item"
                    onPress={markShipped}
                    style={{ marginTop: Spacing.lg }}
                  />
                )}

                <Text style={styles.footNote}>
                  Only tap this once you have actually posted the item. False confirmations may result in account suspension.
                </Text>
              </>
            )}
          </>
        )}

        {/* Payout link */}
        <TouchableOpacity style={styles.payoutLink} onPress={() => router.push('/seller/payout' as any)}>
          <Ionicons name="cash-outline" size={16} color={Colors.gold} />
          <Text style={styles.payoutLinkText}>View payout details</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.dashboardLink} onPress={() => router.replace('/seller/dashboard' as any)}>
          <Text style={styles.dashboardLinkText}>Back to dashboard</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  center: { flex: 1, backgroundColor: Colors.darkBg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { padding: Spacing.lg, paddingBottom: 48 },
  iconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(249,200,70,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
  summaryCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.darkBorder, gap: 10 },
  summaryTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700', marginBottom: 4 },
  divider: { height: 1, backgroundColor: Colors.darkBorder, marginVertical: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  summaryVal: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600' },
  winnerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(249,200,70,0.06)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(249,200,70,0.25)', padding: Spacing.md, marginBottom: Spacing.xl },
  winnerIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(139,92,246,0.12)', alignItems: 'center', justifyContent: 'center' },
  winnerInfo: { flex: 1 },
  winnerLabel: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  winnerHandle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
  winnerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(249,200,70,0.15)', borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  winnerBadgeText: { fontSize: 9, color: Colors.gold, fontWeight: '700', letterSpacing: 0.5 },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, letterSpacing: 0.8, marginBottom: 12 },
  shippedCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: 'rgba(29,158,117,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(29,158,117,0.3)', padding: Spacing.md, marginBottom: Spacing.xl },
  shippedTitle: { fontSize: FontSizes.sm, color: Colors.success, fontWeight: '700' },
  shippedSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 4, lineHeight: 17 },
  shippingSteps: { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.darkBorder, padding: Spacing.md, gap: 14, marginBottom: Spacing.md },
  shippingStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  shippingStepNum: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(139,92,246,0.2)', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  shippingStepNumText: { fontSize: 9, color: Colors.lilac, fontWeight: '700' },
  shippingStepText: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 18 },
  contactCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(249,200,70,0.06)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)', padding: Spacing.md, marginBottom: Spacing.md },
  contactText: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 17 },
  contactEmail: { color: Colors.gold, fontWeight: '700' },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(226,75,74,0.1)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(226,75,74,0.3)', padding: Spacing.md, marginBottom: Spacing.md },
  errorCardText: { flex: 1, fontSize: FontSizes.sm, color: Colors.danger },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: Spacing.xl },
  loadingText: { fontSize: FontSizes.base, color: Colors.textSecondary, fontStyle: 'italic' },
  footNote: { fontSize: 10, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 15 },
  payoutLink: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(249,200,70,0.06)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)', padding: Spacing.md, marginTop: Spacing.xl },
  payoutLinkText: { flex: 1, fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '600' },
  dashboardLink: { alignItems: 'center', paddingVertical: Spacing.lg },
  dashboardLinkText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  errorMsg: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600', textAlign: 'center' },
  backLink: { fontSize: FontSizes.sm, color: Colors.lilac },
});
