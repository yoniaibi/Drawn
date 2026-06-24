import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import StepBar from '../../../src/components/StepBar';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import PrimaryButton from '../../../src/components/PrimaryButton';
import { formatTicketPrice } from '../../../src/utils/countdown';
import { useSellerDraft } from '../../../src/store/sellerDraft';
import {
  SELLER_FEE_MULTIPLIER, PLATFORM_FEE_PERCENT, PROCESSING_FEE_PERCENT,
  TICKET_PRICE_OPTIONS_PENCE, TICKET_QUANTITY_OPTIONS,
  getCategoryMeta,
} from '../../../src/constants';
import type { DrawCategory } from '../../../src/constants';

const CLOSE_DAY_OPTIONS = [7, 10, 14, 21, 30] as const;

function formatChipDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatPickedDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ListPricingScreen() {
  const router = useRouter();
  const setPricing = useSellerDraft((s) => s.setPricing);
  const setCloseDays = useSellerDraft((s) => s.setCloseDays);
  const draft = useSellerDraft((s) => ({
    ticketPrice: s.ticketPrice,
    totalTickets: s.totalTickets,
    retailValue: s.retailValue,
    category: s.category,
    closeDays: s.closeDays,
  }));

  const catMeta = getCategoryMeta((draft.category ?? 'fashion') as DrawCategory);
  const PRICES = catMeta.ticketPrices;
  const QUANTITIES = catMeta.ticketQuantities;

  const [price, setPrice] = useState(PRICES.includes(draft.ticketPrice) ? draft.ticketPrice : PRICES[1]);
  const [qty, setQty] = useState(QUANTITIES.includes(draft.totalTickets) ? draft.totalTickets : QUANTITIES[1]);
  const [retailValueInput, setRetailValueInput] = useState(
    draft.retailValue > 0 ? String(draft.retailValue / 100) : ''
  );
  const [closeDays, setCloseDaysLocal] = useState<number | 'custom'>(
    CLOSE_DAY_OPTIONS.includes(draft.closeDays as any) ? draft.closeDays : 14
  );
  const [customDate, setCustomDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    d.setHours(21, 0, 0, 0);
    return d;
  });
  const [showPicker, setShowPicker] = useState(false);

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 7);
  minDate.setHours(21, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 60);
  maxDate.setHours(21, 0, 0, 0);

  const retailValuePence = Math.round(parseFloat(retailValueInput || '0') * 100);
  const totalRaise = price * qty;
  const sellerGets = Math.round(totalRaise * SELLER_FEE_MULTIPLIER);
  const valueRatio = retailValuePence > 0 ? (retailValuePence / price).toFixed(0) : null;
  const canContinue = retailValueInput.trim().length > 0 && parseFloat(retailValueInput) > 0;

  const effectiveDays = closeDays === 'custom'
    ? Math.round((customDate.getTime() - today.getTime()) / 86400000)
    : closeDays;

  const handleNext = () => {
    setPricing(price, qty, retailValuePence);
    setCloseDays(effectiveDays);
    router.push('/seller/list/review');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        <StepBar current={3} total={4} />

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Set your price</Text>

          {/* Retail value */}
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

          {/* Close date section */}
          <Text style={styles.label}>DRAW CLOSE DATE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CLOSE_DAY_OPTIONS.map((d) => {
              const isMin = d === 7;
              const isSelected = closeDays === d;
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.dateChip, isSelected && styles.dateChipOn]}
                  onPress={() => setCloseDaysLocal(d)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dateChipTop}>
                    <Text style={[styles.dateChipDays, isSelected && styles.dateChipDaysOn]}>{d} days</Text>
                    {isMin && (
                      <View style={styles.minBadge}>
                        <Text style={styles.minBadgeText}>MIN</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.dateChipDate, isSelected && styles.dateChipDateOn]}>
                    {formatChipDate(d)}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.dateChip, closeDays === 'custom' && styles.dateChipOn]}
              onPress={() => { setCloseDaysLocal('custom'); setShowPicker(true); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateChipDays, closeDays === 'custom' && styles.dateChipDaysOn]}>Custom</Text>
              <Text style={[styles.dateChipDate, closeDays === 'custom' && styles.dateChipDateOn]}>
                {closeDays === 'custom' ? formatPickedDate(customDate) : 'Pick a date'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
          <Text style={styles.closeDateHint}>
            Draw resolves at 9pm on the close date. Minimum 7 days from today.
          </Text>

          <View style={styles.earningsCard}>
            <Text style={styles.earningsTitle}>If all tickets sell</Text>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Total raised</Text>
              <Text style={styles.earningsVal}>{formatTicketPrice(totalRaise)}</Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>DRAWN fee ({Math.round(PLATFORM_FEE_PERCENT * 100)}%)</Text>
              <Text style={[styles.earningsVal, { color: Colors.pink }]}>
                -{formatTicketPrice(Math.round(totalRaise * PLATFORM_FEE_PERCENT))}
              </Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Processing ({(PROCESSING_FEE_PERCENT * 100).toFixed(1)}%)</Text>
              <Text style={[styles.earningsVal, { color: Colors.lilac }]}>
                -{formatTicketPrice(Math.round(totalRaise * PROCESSING_FEE_PERCENT))}
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

      {/* Custom date picker modal */}
      {showPicker && Platform.OS !== 'web' && (
        <Modal transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerTitle}>Choose close date</Text>
              <DateTimePicker
                value={customDate}
                mode="date"
                display="spinner"
                minimumDate={minDate}
                maximumDate={maxDate}
                onChange={(_, date) => { if (date) { date.setHours(21, 0, 0, 0); setCustomDate(date); } }}
                textColor={Colors.white}
                themeVariant="dark"
              />
              <TouchableOpacity
                style={styles.pickerDone}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.pickerDoneText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 12 },
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

  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  dateChip: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.sm,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.darkBorder, minWidth: 80, alignItems: 'center',
  },
  dateChipOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  dateChipTop: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateChipDays: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  dateChipDaysOn: { color: Colors.white },
  dateChipDate: { fontSize: FontSizes.xs - 1, color: Colors.textTertiary, marginTop: 2 },
  dateChipDateOn: { color: 'rgba(255,255,255,0.75)' },
  minBadge: { backgroundColor: Colors.gold, borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 },
  minBadgeText: { fontSize: 7, color: Colors.darkBg, fontWeight: '800' },
  closeDateHint: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 8 },

  earningsCard: { backgroundColor: Colors.violet, borderRadius: Radius.lg, padding: Spacing.md, marginTop: Spacing.xl, gap: 10 },
  earningsTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.base, color: Colors.white, marginBottom: 4 },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  earningsLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  earningsVal: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 10, marginTop: 4 },
  totalLabel: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
  totalVal: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.gold },

  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: Colors.darkCard, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, paddingBottom: 40 },
  pickerTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white, textAlign: 'center', marginBottom: Spacing.md },
  pickerDone: { backgroundColor: Colors.lilac, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.md },
  pickerDoneText: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
});
