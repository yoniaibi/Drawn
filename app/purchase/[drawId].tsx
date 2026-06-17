import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_DRAWS } from '../../src/mocks';
import { useAuthStore } from '../../src/store';
import PrimaryButton from '../../src/components/PrimaryButton';
import ProgressBar from '../../src/components/ProgressBar';
import { formatTicketPrice } from '../../src/utils/countdown';

const QUICK_AMOUNTS = [1, 5, 10, 25];

const BUYER_MESSAGES = [
  '@priya__ just bought 10 tickets',
  '@marcus_t grabbed 5 more',
  '@chloe_j added 3 tickets',
  '@dan.west just joined',
];

export default function PurchaseScreen() {
  const { drawId } = useLocalSearchParams<{ drawId: string }>();
  const router = useRouter();
  const draw = MOCK_DRAWS.find(d => d.id === drawId) ?? MOCK_DRAWS[0];
  const [qty, setQty] = useState(5);
  const { walletBalance, deductFunds } = useAuthStore();
  const [msgIdx, setMsgIdx] = useState(0);
  const msgOpacity = useRef(new RNAnimated.Value(1)).current;

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
    if (!canAfford) { router.push('/wallet'); return; }
    deductFunds(total);
    router.replace(`/live/winner/${draw.id}`);
  }

  return (
    <View style={styles.screen}>
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

      {!canAfford && (
        <TouchableOpacity style={styles.topUpRow} onPress={() => router.push('/wallet')}>
          <Ionicons name="add-circle-outline" size={16} color={Colors.lilac} />
          <Text style={styles.topUpText}>Top up your wallet to continue</Text>
        </TouchableOpacity>
      )}

      <View style={styles.cta}>
        <PrimaryButton
          label={canAfford ? `Confirm — ${formatTicketPrice(total)}` : 'Top up wallet'}
          onPress={handleBuy}
          variant={canAfford ? 'pink' : 'lilac'}
        />
        <Text style={styles.freeNote}>Or enter free via postal entry · T&Cs apply</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, padding: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, paddingTop: Spacing.xl },
  close: { marginRight: 12 },
  heading: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white },

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

  topUpRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, justifyContent: 'center' },
  topUpText: { fontSize: FontSizes.sm, color: Colors.lilac },

  cta: { marginTop: 'auto', gap: 8 },
  freeNote: { textAlign: 'center', fontSize: 9, color: Colors.textTertiary },
});
