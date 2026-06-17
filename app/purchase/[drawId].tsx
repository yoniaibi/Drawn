import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated as RNAnimated, Modal, Pressable, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_DRAWS } from '../../src/mocks';
import type { Draw } from '../../src/mocks';
import { useAuthStore } from '../../src/store';
import PrimaryButton from '../../src/components/PrimaryButton';
import ProgressBar from '../../src/components/ProgressBar';
import { formatTicketPrice } from '../../src/utils/countdown';
import { supabase } from '../../src/lib/supabase';
import { fetchDrawById } from '../../src/services/draws';

const QUICK_AMOUNTS = [1, 5, 10, 25];

const BUYER_MESSAGES = [
  '@priya__ just bought 10 tickets',
  '@marcus_t grabbed 5 more',
  '@chloe_j added 3 tickets',
  '@dan.west just joined',
];

type FlowState = 'idle' | 'confirm' | 'loading' | 'success';

export default function PurchaseScreen() {
  const { drawId } = useLocalSearchParams<{ drawId: string }>();
  const router = useRouter();

  const [draw, setDraw] = useState<Draw | null>(MOCK_DRAWS.find(d => d.id === drawId) ?? null);
  const [drawLoading, setDrawLoading] = useState(!MOCK_DRAWS.find(d => d.id === drawId));

  useEffect(() => {
    if (!drawId || MOCK_DRAWS.find(d => d.id === drawId)) return;
    fetchDrawById(drawId).then(d => {
      setDraw(d);
      setDrawLoading(false);
    });
  }, [drawId]);

  if (drawLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.darkBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.lilac} />
      </View>
    );
  }

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

  const [qty, setQty] = useState(5);
  const { walletBalance, deductFunds } = useAuthStore();
  const [msgIdx, setMsgIdx] = useState(0);
  const msgOpacity = useRef(new RNAnimated.Value(1)).current;

  // Flow state
  const [flow, setFlow] = useState<FlowState>('idle');
  const bannerOpacity = useRef(new RNAnimated.Value(0)).current;
  const successOpacity = bannerOpacity;
  const [error, setError] = useState<string | null>(null);

  const total = qty * draw.ticketPrice;
  const canAfford = walletBalance >= total;
  const maxAllowed = Math.floor(draw.totalTickets * 0.25);
  const remaining = draw.totalTickets - draw.ticketsSold;
  const myNewOdds = ((qty / draw.totalTickets) * 100).toFixed(2);
  const progress = draw.ticketsSold / draw.totalTickets;
  const isLow = remaining < 500;

  useEffect(() => {
    const id = setInterval(() => {
      RNAnimated.timing(msgOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setMsgIdx(i => (i + 1) % BUYER_MESSAGES.length);
        RNAnimated.timing(msgOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  function handleBuy() {
    if (!canAfford) {
      // Inline error card is shown via canAfford flag — button does nothing extra here
      // But we can still guide user to wallet via the error card button
      return;
    }
    setFlow('confirm');
  }

  async function handleConfirm() {
    setError(null);
    setFlow('loading');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setFlow('idle'); return; }

    // 1. Insert ticket purchase
    const { error: ticketError } = await supabase
      .from('tickets')
      .insert({ draw_id: draw.id, user_id: user.id, quantity: qty });

    if (ticketError) {
      setFlow('idle');
      setError('Something went wrong. Please try again.');
      return;
    }

    // 2. Deduct wallet balance in DB
    await supabase
      .from('profiles')
      .update({ wallet_balance: walletBalance - total })
      .eq('id', user.id);

    // 3. Log wallet transaction
    await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      amount: -total,
      type: 'purchase',
      description: `${qty} ticket${qty > 1 ? 's' : ''} · ${draw.title}`,
    });

    // 4. Increment tickets_sold on the draw
    await supabase
      .from('draws')
      .update({ tickets_sold: draw.ticketsSold + qty })
      .eq('id', draw.id);

    // 5. Deduct local state too so UI updates immediately
    deductFunds(total);

    setFlow('success');
    successOpacity.setValue(1);
    setTimeout(() => {
      router.replace(`/purchase/success?drawId=${draw.id}&qty=${qty}&total=${total}` as any);
    }, 600);
  }

  return (
    <View style={styles.screen}>
      {/* Success banner */}
      {flow === 'success' && (
        <RNAnimated.View style={[styles.successBanner, { opacity: bannerOpacity }]}>
          <Text style={styles.successBannerText}>🎟 You're in! Good luck tonight.</Text>
        </RNAnimated.View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.close}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.heading}>Enter Draw</Text>
      </View>

      {/* Draw preview */}
      <View style={styles.drawPreview}>
        <Text style={styles.previewEmoji}>{draw.emoji}</Text>
        <View style={styles.previewInfo}>
          <Text style={styles.previewTitle}>{draw.title}</Text>
          <Text style={styles.previewSeller}>{draw.seller}</Text>
          {/* Value ratio */}
          <View style={styles.valueRatioRow}>
            <Text style={styles.valueRatioLabel}>{formatTicketPrice(draw.ticketPrice)}</Text>
            <Text style={styles.valueRatioArrow}> → </Text>
            <Text style={styles.valueRatioAmount}>£{draw.retailValue.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Fill status */}
      <View style={styles.fillCard}>
        <View style={styles.fillHeader}>
          <Text style={styles.fillLabel}>Draw filling up</Text>
          <Text style={[styles.fillPct, { color: isLow ? Colors.danger : Colors.textSecondary }]}>
            {Math.round(progress * 100)}% sold
          </Text>
        </View>
        <ProgressBar progress={progress} height={5} color={isLow ? Colors.danger : Colors.lilac} />
        {isLow && (
          <Text style={styles.fillScarcity}>⚡ Only {remaining} tickets left!</Text>
        )}
      </View>

      {/* Live buyer ticker */}
      <View style={styles.buyerTicker}>
        <View style={styles.buyerDot} />
        <RNAnimated.Text style={[styles.buyerText, { opacity: msgOpacity }]} numberOfLines={1}>
          {BUYER_MESSAGES[msgIdx]}
        </RNAnimated.Text>
      </View>

      {/* Qty picker */}
      <View style={styles.qtySection}>
        <Text style={styles.sectionLabel}>HOW MANY TICKETS?</Text>
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.quickBtn, qty === n && styles.quickBtnOn]}
              onPress={() => setQty(n)}
            >
              <Text style={[styles.quickText, qty === n && styles.quickTextOn]}>{n}</Text>
              {qty === n && (
                <Text style={styles.quickOdds}>{((n / draw.totalTickets) * 100).toFixed(1)}%</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.qtyControl}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
            <Ionicons name="remove" size={20} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.qtyDisplay}>
            <Text style={styles.qtyNum}>{qty}</Text>
            <Text style={styles.qtyLabel}>tickets</Text>
          </View>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.min(maxAllowed, q + 1))}>
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Odds display */}
        <View style={styles.oddsCard}>
          <Ionicons name="trophy-outline" size={14} color={Colors.gold} />
          <Text style={styles.oddsText}>
            {qty} tickets = <Text style={styles.oddsBold}>{myNewOdds}% chance</Text> to win £{draw.retailValue.toLocaleString()}
          </Text>
        </View>

        <Text style={styles.maxNote}>Max {maxAllowed} per person</Text>
      </View>

      {/* Cost breakdown */}
      <View style={styles.breakdown}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>{qty} × {formatTicketPrice(draw.ticketPrice)}</Text>
          <Text style={styles.breakdownVal}>{formatTicketPrice(total)}</Text>
        </View>
        <View style={styles.breakdownDivider} />
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Wallet balance</Text>
          <Text style={[styles.breakdownVal, !canAfford && { color: Colors.danger }]}>
            {formatTicketPrice(walletBalance)}
          </Text>
        </View>
        {canAfford && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Remaining after</Text>
            <Text style={styles.breakdownVal}>{formatTicketPrice(walletBalance - total)}</Text>
          </View>
        )}
      </View>

      {/* Insufficient balance error card */}
      {!canAfford && (
        <View style={styles.errorCard}>
          <Ionicons name="warning-outline" size={16} color={Colors.danger} />
          <Text style={styles.errorText}>Not enough balance — top up your wallet</Text>
          <TouchableOpacity style={styles.errorBtn} onPress={() => router.push('/wallet')}>
            <Text style={styles.errorBtnText}>Top up</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.cta}>
        <PrimaryButton
          label={canAfford ? `Confirm — ${formatTicketPrice(total)}` : 'Top up wallet'}
          onPress={handleBuy}
          variant={canAfford ? 'pink' : 'lilac'}
        />
        <Text style={styles.freeNote}>Or enter free via postal entry · T&Cs apply</Text>
      </View>

      {/* Confirmation bottom sheet (modal overlay) */}
      <Modal
        visible={flow === 'confirm' || flow === 'loading'}
        transparent
        animationType="slide"
        onRequestClose={() => setFlow('idle')}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => flow === 'confirm' && setFlow('idle')}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Confirm your entry</Text>

            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Draw</Text>
              <Text style={styles.sheetVal}>{draw.title}</Text>
            </View>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Tickets</Text>
              <Text style={styles.sheetVal}>{qty}</Text>
            </View>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Total cost</Text>
              <Text style={[styles.sheetVal, { color: Colors.gold }]}>{formatTicketPrice(total)}</Text>
            </View>

            <View style={styles.sheetDivider} />

            {error && (
              <View style={styles.sheetError}>
                <Ionicons name="warning-outline" size={14} color={Colors.danger} />
                <Text style={styles.sheetErrorText}>{error}</Text>
              </View>
            )}

            {flow === 'loading' ? (
              <View style={styles.loadingRow}>
                <Text style={styles.loadingText}>Entering draw...</Text>
              </View>
            ) : (
              <PrimaryButton
                label="Confirm & enter"
                onPress={handleConfirm}
                variant="pink"
              />
            )}

            {flow === 'confirm' && (
              <TouchableOpacity style={styles.sheetCancel} onPress={() => setFlow('idle')}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, padding: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, paddingTop: Spacing.xl },
  close: { marginRight: 12 },
  heading: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white },

  successBanner: {
    backgroundColor: Colors.success,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  successBannerText: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },

  drawPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  previewEmoji: { fontSize: 36 },
  previewInfo: { flex: 1 },
  previewTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
  previewSeller: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 4 },
  valueRatioRow: { flexDirection: 'row', alignItems: 'center' },
  valueRatioLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  valueRatioArrow: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  valueRatioAmount: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '800' },

  fillCard: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.sm,
    marginBottom: Spacing.sm, gap: 5,
  },
  fillHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  fillLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  fillPct: { fontSize: FontSizes.xs, fontWeight: '700' },
  fillScarcity: { fontSize: 9, color: Colors.danger, fontWeight: '700', marginTop: 2 },

  buyerTicker: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 5, marginBottom: Spacing.sm,
  },
  buyerDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.pink },
  buyerText: { fontSize: 9, color: Colors.textSecondary, fontStyle: 'italic', flex: 1 },

  qtySection: { marginBottom: Spacing.md },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, letterSpacing: 0.6, marginBottom: 10, fontWeight: '700' },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  quickBtn: {
    flex: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.sm,
    padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.darkBorder,
  },
  quickBtnOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  quickText: { fontSize: FontSizes.base, color: Colors.textSecondary, fontWeight: '600' },
  quickTextOn: { color: Colors.white },
  quickOdds: { fontSize: 8, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 8 },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.darkCard, alignItems: 'center', justifyContent: 'center' },
  qtyDisplay: { alignItems: 'center' },
  qtyNum: { fontFamily: Fonts.serif, fontSize: FontSizes.xxl, color: Colors.white, lineHeight: 36 },
  qtyLabel: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  oddsCard: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(249,200,70,0.08)', borderRadius: Radius.sm,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)',
    padding: Spacing.sm, marginBottom: 6,
  },
  oddsText: { fontSize: FontSizes.xs, color: Colors.textSecondary, flex: 1 },
  oddsBold: { color: Colors.gold, fontWeight: '700' },
  maxNote: { fontSize: FontSizes.xs, color: Colors.textTertiary, textAlign: 'center' },

  breakdown: { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md, gap: 8, marginBottom: 10 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownDivider: { height: 1, backgroundColor: Colors.darkBorder },
  breakdownLabel: { fontSize: FontSizes.base, color: Colors.textSecondary },
  breakdownVal: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },

  errorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(226,75,74,0.12)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(226,75,74,0.3)',
    padding: Spacing.md, marginBottom: 10,
  },
  errorText: { flex: 1, fontSize: FontSizes.sm, color: Colors.danger },
  errorBtn: {
    backgroundColor: Colors.danger, borderRadius: Radius.sm,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  errorBtnText: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '700' },

  cta: { marginTop: 'auto', gap: 8 },
  freeNote: { textAlign: 'center', fontSize: 9, color: Colors.textTertiary },

  // Bottom sheet
  sheetOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.darkCard, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.xl, paddingBottom: 40,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.darkBorder,
    alignSelf: 'center', marginBottom: Spacing.xl,
  },
  sheetTitle: {
    fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white,
    textAlign: 'center', marginBottom: Spacing.xl,
  },
  sheetRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.darkBorder,
  },
  sheetLabel: { fontSize: FontSizes.base, color: Colors.textSecondary },
  sheetVal: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
  sheetDivider: { height: Spacing.xl },
  loadingRow: { alignItems: 'center', paddingVertical: Spacing.xl },
  loadingText: { fontSize: FontSizes.md, color: Colors.textSecondary, fontStyle: 'italic' },
  sheetCancel: { alignItems: 'center', marginTop: Spacing.md },
  sheetCancelText: { fontSize: FontSizes.sm, color: Colors.textTertiary },
  sheetError: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(226,75,74,0.12)', borderRadius: Radius.sm,
    borderWidth: 1, borderColor: 'rgba(226,75,74,0.3)',
    padding: Spacing.sm, marginBottom: Spacing.md,
  },
  sheetErrorText: { flex: 1, fontSize: FontSizes.sm, color: Colors.danger },
});
