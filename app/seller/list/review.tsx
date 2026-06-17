import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import PrimaryButton from '../../../src/components/PrimaryButton';

export default function ListReviewScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Review & submit</Text>
        <Text style={styles.sub}>Once submitted, ship your item to us within 3 days. We'll verify it and go live.</Text>

        <View style={styles.previewCard}>
          <Text style={styles.emoji}>👜</Text>
          <Text style={styles.itemTitle}>Chanel Classic Flap</Text>
          <Text style={styles.itemSub}>Like new · @sophiestyle</Text>
        </View>

        <View style={styles.summaryCard}>
          {[
            ['Ticket price', '25p'],
            ['Total tickets', '2,000'],
            ['Draw date', 'Tonight 9pm (if shipped today)'],
            ['You receive', '£423 (if all tickets sell)'],
          ].map(([label, val]) => (
            <View key={label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{label}</Text>
              <Text style={styles.summaryVal}>{val}</Text>
            </View>
          ))}
        </View>

        <View style={styles.shippingNote}>
          <Ionicons name="cube-outline" size={16} color={Colors.lilac} />
          <Text style={styles.shippingText}>We'll send you a prepaid shipping label after submission.</Text>
        </View>

        <PrimaryButton
          label="Submit & get shipping label"
          onPress={() => router.replace('/seller/dashboard')}
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
  previewCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md },
  emoji: { fontSize: 48, marginBottom: 10 },
  itemTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  itemSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 4 },
  summaryCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md, gap: 10, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  summaryVal: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600', flex: 1, textAlign: 'right' },
  shippingNote: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: Radius.md, padding: Spacing.md },
  shippingText: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
});
