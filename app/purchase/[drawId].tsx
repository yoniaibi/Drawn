import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_DRAWS } from '../../src/mocks';
import { useAuthStore } from '../../src/store';
import PrimaryButton from '../../src/components/PrimaryButton';
import { formatTicketPrice } from '../../src/utils/countdown';

const QUICK_AMOUNTS = [1, 5, 10, 25];

export default function PurchaseScreen() {
  const { drawId } = useLocalSearchParams<{ drawId: string }>();
  const router = useRouter();
  const draw = MOCK_DRAWS.find(d => d.id === drawId) ?? MOCK_DRAWS[0];
  const [qty, setQty] = useState(1);
  const { walletBalance, deductFunds } = useAuthStore();

  const total = qty * draw.ticketPrice;
  const canAfford = walletBalance >= total;
  const maxAllowed = Math.floor(draw.totalTickets * 0.25);

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
        <Text style={styles.heading}>Buy Tickets</Text>
      </View>

      <View style={styles.drawPreview}>
        <Text style={styles.previewEmoji}>{draw.emoji}</Text>
        <View>
          <Text style={styles.previewTitle}>{draw.title}</Text>
          <Text style={styles.previewSeller}>{draw.seller}</Text>
        </View>
        <View style={styles.previewValue}>
          <Text style={styles.valueText}>£{draw.retailValue.toLocaleString()}</Text>
        </View>
      </View>

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
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.qtyControl}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
            <Ionicons name="remove" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.qtyNum}>{qty}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.min(maxAllowed, q + 1))}>
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.maxNote}>Max {maxAllowed} tickets per person (25%)</Text>
      </View>

      {/* Cost breakdown */}
      <View style={styles.breakdown}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>{qty} × {formatTicketPrice(draw.ticketPrice)}</Text>
          <Text style={styles.breakdownVal}>{formatTicketPrice(total)}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Wallet balance</Text>
          <Text style={[styles.breakdownVal, !canAfford && { color: Colors.danger }]}>
            {formatTicketPrice(walletBalance)}
          </Text>
        </View>
      </View>

      {!canAfford && (
        <TouchableOpacity style={styles.topUpRow} onPress={() => router.push('/wallet')}>
          <Ionicons name="add-circle-outline" size={16} color={Colors.lilac} />
          <Text style={styles.topUpText}>Top up your wallet first</Text>
        </TouchableOpacity>
      )}

      <View style={styles.cta}>
        <PrimaryButton
          label={canAfford ? `Confirm — ${formatTicketPrice(total)}` : 'Top up wallet'}
          onPress={handleBuy}
          variant={canAfford ? 'pink' : 'lilac'}
        />
        <Text style={styles.freeNote}>Or enter free via postal entry</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, padding: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl, paddingTop: Spacing.xl },
  close: { marginRight: 12 },
  heading: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white },
  drawPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.xl,
  },
  previewEmoji: { fontSize: 32 },
  previewTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  previewSeller: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  previewValue: { marginLeft: 'auto', backgroundColor: Colors.gold, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  valueText: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.ink },
  qtySection: { marginBottom: Spacing.lg },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, letterSpacing: 0.6, marginBottom: 12 },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickBtn: { flex: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.darkBorder },
  quickBtnOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  quickText: { fontSize: FontSizes.base, color: Colors.textSecondary, fontWeight: '600' },
  quickTextOn: { color: Colors.white },
  qtyControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 8 },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.darkCard, alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontFamily: Fonts.serif, fontSize: FontSizes.xxl, color: Colors.white, minWidth: 60, textAlign: 'center' },
  maxNote: { fontSize: FontSizes.xs, color: Colors.textTertiary, textAlign: 'center' },
  breakdown: { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md, gap: 8, marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { fontSize: FontSizes.base, color: Colors.textSecondary },
  breakdownVal: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
  topUpRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, justifyContent: 'center' },
  topUpText: { fontSize: FontSizes.sm, color: Colors.lilac },
  cta: { marginTop: 'auto', gap: 10 },
  freeNote: { textAlign: 'center', fontSize: FontSizes.xs, color: Colors.textTertiary },
});
