import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import PrimaryButton from '../../../src/components/PrimaryButton';
import { formatTicketPrice } from '../../../src/utils/countdown';

const PRICES = [10, 25, 50, 100]; // pence
const QUANTITIES = [500, 1000, 2000, 5000];

export default function ListPricingScreen() {
  const router = useRouter();
  const [price, setPrice] = useState(25);
  const [qty, setQty] = useState(2000);
  const totalRaise = price * qty;
  const sellerGets = Math.round(totalRaise * 0.846);

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Set your price</Text>

        <Text style={styles.label}>TICKET PRICE</Text>
        <View style={styles.optRow}>
          {PRICES.map(p => (
            <TouchableOpacity key={p} style={[styles.opt, price === p && styles.optOn]} onPress={() => setPrice(p)}>
              <Text style={[styles.optText, price === p && styles.optTextOn]}>{formatTicketPrice(p)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>TOTAL TICKETS</Text>
        <View style={styles.optRow}>
          {QUANTITIES.map(q => (
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
            <Text style={[styles.earningsVal, { color: Colors.pink }]}>−{formatTicketPrice(Math.round(totalRaise * 0.12))}</Text>
          </View>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Processing</Text>
            <Text style={[styles.earningsVal, { color: Colors.lilac }]}>−{formatTicketPrice(Math.round(totalRaise * 0.034))}</Text>
          </View>
          <View style={[styles.earningsRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>You get</Text>
            <Text style={styles.totalVal}>{formatTicketPrice(sellerGets)}</Text>
          </View>
        </View>

        <PrimaryButton label="Next: Review →" onPress={() => router.push('/seller/list/review')} style={{ marginTop: Spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: Spacing.lg },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8, marginTop: 14 },
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
