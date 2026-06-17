import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import PrimaryButton from '../../../src/components/PrimaryButton';
import { formatTicketPrice } from '../../../src/utils/countdown';
import { useSellerDraft } from '../../../src/store/sellerDraft';

const PRICES = [10, 25, 50, 100]; // pence
const QUANTITIES = [500, 1000, 2000, 5000];

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepBar}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.stepSegment, i + 1 <= current ? styles.stepActive : styles.stepInactive]} />
      ))}
    </View>
  );
}

export default function ListPricingScreen() {
  const router = useRouter();
  const setPricing = useSellerDraft((s) => s.setPricing);
  const draft = useSellerDraft((s) => ({
    ticketPrice: s.ticketPrice,
    totalTickets: s.totalTickets,
    retailValue: s.retailValue,
  }));

  const [price, setPrice] = useState(draft.ticketPrice);
  const [qty, setQty] = useState(draft.totalTickets);
  const [retailValueInput, setRetailValueInput] = useState(
    draft.retailValue > 0 ? String(draft.retailValue / 100) : ''
  );

  const retailValuePence = Math.round(parseFloat(retailValueInput || '0') * 100);
  const totalRaise = price * qty;
  const sellerGets = Math.round(totalRaise * 0.846);
  const valueRatio = retailValuePence > 0 ? (retailValuePence / price).toFixed(0) : null;
  const canContinue = retailValueInput.trim().length > 0 && parseFloat(retailValueInput) > 0;

  const handleNext = () => {
    setPricing(price, qty, retailValuePence);
    router.push('/seller/list/review');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        <StepBar current={3} total={4} />
        <Text style={styles.stepLabel}>Step 3 of 4</Text>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Set your price</Text>

          {/* Retail value — key conversion signal */}
          <Text style={styles.label}>RETAIL VALUE</Text>
          <Text style={styles.labelHint}>What would this sell for on Vinted/eBay today?</Text>
          <View style={styles.retailRow}>
            <View style={styles.retailPrefix}>
              <Text style={styles.retailPrefixText}>£</Text>
            </View>
            <TextInput
              style={styles.retailInput}
              placeholder="0.00"
              placeholderTextColor={Colors.textTertiary}
              value={retailValueInput}
              onChangeText={setRetailValueInput}
              keyboardType="decimal-pad"
            />
          </View>
          {valueRatio && (
            <View style={styles.ratioHint}>
              <Ionicons name="flash" size={11} color={Colors.gold} />
              <Text style={styles.ratioText}>
                Buyers win <Text style={styles.ratioBold}>£{parseFloat(retailValueInput).toLocaleString()}</Text>
                {' '}for as little as <Text style={styles.ratioBold}>{formatTicketPrice(price)}</Text>
                {' '}— that's a <Text style={styles.ratioBold}>{valueRatio}× return</Text>
              </Text>
            </View>
          )}

          <Text style={styles.label}>TICKET PRICE</Text>
          <View style={styles.optRow}>
            {PRICES.map((p) => (
              <TouchableOpacity key={p} style={[styles.opt, price === p && styles.optOn]} onPress={() => setPrice(p)}>
                <Text style={[styles.optText, price === p && styles.optTextOn]}>{formatTicketPrice(p)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>TOTAL TICKETS</Text>
          <View style={styles.optRow}>
            {QUANTITIES.map((q) => (
              <TouchableOpacity key={q} style={[styles.opt, qty === q && styles.optOn]} onPress={() => setQty(q)}>
                <Text style={[styles.optText, qty === q && styles.optTextOn]}>{q.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.earningsCard}>
            <Text style={styles.earningsTitle}>If all tickets sell</Text>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Total raised</Text>
              <Text style={styles.earningsVal}>{formatTicketPrice(totalRaise)}</Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>DRAWN fee (12%)</Text>
              <Text style={[styles.earningsVal, { color: Colors.pink }]}>
                -{formatTicketPrice(Math.round(totalRaise * 0.12))}
              </Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Processing</Text>
              <Text style={[styles.earningsVal, { color: Colors.lilac }]}>
                -{formatTicketPrice(Math.round(totalRaise * 0.034))}
              </Text>
            </View>
            <View style={[styles.earningsRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>You get</Text>
              <Text style={styles.totalVal}>{formatTicketPrice(sellerGets)}</Text>
            </View>
          </View>

          <PrimaryButton
            label="Next: Review →"
            onPress={handleNext}
            style={{ marginTop: Spacing.lg }}
            disabled={!canContinue}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: Spacing.lg },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 4, marginTop: 16, fontWeight: '700' },
  labelHint: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginBottom: 8 },
  retailRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.darkCard, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.darkBorder, overflow: 'hidden',
  },
  retailPrefix: { paddingHorizontal: 14, paddingVertical: 14, borderRightWidth: 1, borderRightColor: Colors.darkBorder },
  retailPrefixText: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '700' },
  retailInput: { flex: 1, padding: 14, fontSize: FontSizes.md, color: Colors.white },
  ratioHint: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: 'rgba(249,200,70,0.08)', borderRadius: Radius.sm,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)',
    padding: Spacing.sm, marginTop: 8,
  },
  ratioText: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 16 },
  ratioBold: { color: Colors.gold, fontWeight: '700' },
  optRow: { flexDirection: 'row', gap: 8 },
  opt: { flex: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.darkBorder },
  optOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  optText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  optTextOn: { color: Colors.white },
  earningsCard: { backgroundColor: Colors.violet, borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.xl, gap: 10 },
  earningsTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.base, color: Colors.white, marginBottom: 4 },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  earningsLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  earningsVal: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 10, marginTop: 4 },
  totalLabel: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
  totalVal: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.gold },
});
