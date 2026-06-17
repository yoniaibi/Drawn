import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_SELLER } from '../../src/mocks';
import PrimaryButton from '../../src/components/PrimaryButton';
import ProgressBar from '../../src/components/ProgressBar';
import { formatTicketPrice } from '../../src/utils/countdown';

export default function SellerDashboardScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Seller Dashboard</Text>
        <Text style={styles.handle}>{MOCK_SELLER.handle}</Text>

        {/* Earnings cards */}
        <View style={styles.earningsRow}>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Total earned</Text>
            <Text style={styles.earningsVal}>£{MOCK_SELLER.totalEarned}</Text>
          </View>
          <View style={[styles.earningsCard, { borderColor: 'rgba(249,200,70,0.3)' }]}>
            <Text style={styles.earningsLabel}>Pending payout</Text>
            <Text style={[styles.earningsVal, { color: Colors.gold }]}>£{MOCK_SELLER.pendingPayout}</Text>
          </View>
        </View>

        <PrimaryButton
          label="+ List a new item"
          onPress={() => router.push('/seller/list/type')}
          style={{ marginBottom: Spacing.xl }}
        />

        <Text style={styles.sectionLabel}>YOUR DRAWS</Text>
        {MOCK_SELLER.draws.map(draw => {
          const progress = draw.ticketsSold / draw.totalTickets;
          return (
            <TouchableOpacity key={draw.id} style={styles.drawCard} onPress={() => router.push(`/draw/${draw.id}`)}>
              <View style={styles.drawTop}>
                <Text style={styles.drawEmoji}>{draw.emoji}</Text>
                <View style={styles.drawInfo}>
                  <Text style={styles.drawTitle}>{draw.title}</Text>
                  <Text style={styles.drawStatus}>{draw.status.replace('_', ' ')}</Text>
                </View>
                <Text style={styles.drawEarning}>£{Math.round(draw.ticketsSold * draw.ticketPrice * 0.846 / 100)}</Text>
              </View>
              <ProgressBar progress={progress} height={4} />
              <Text style={styles.drawProgress}>{draw.ticketsSold.toLocaleString()} / {draw.totalTickets.toLocaleString()} tickets · {Math.round(progress * 100)}%</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white },
  handle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  earningsRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  earningsCard: {
    flex: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.darkBorder,
  },
  earningsLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 4 },
  earningsVal: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, letterSpacing: 0.8, marginBottom: 12 },
  drawCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10, gap: 8 },
  drawTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  drawEmoji: { fontSize: 24 },
  drawInfo: { flex: 1 },
  drawTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  drawStatus: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  drawEarning: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.gold },
  drawProgress: { fontSize: FontSizes.xs, color: Colors.textTertiary },
});
