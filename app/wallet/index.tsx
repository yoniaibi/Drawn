import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { useAuthStore } from '../../src/store';
import { MOCK_WALLET } from '../../src/mocks';
import { fetchWalletTransactions, WalletTransaction } from '../../src/services/draws';
import PrimaryButton from '../../src/components/PrimaryButton';
import { formatTicketPrice } from '../../src/utils/countdown';

const TOP_UPS = [500, 1000, 2000, 5000]; // pence

export default function WalletScreen() {
  const router = useRouter();
  const { walletBalance, addFunds, user, refreshProfile } = useAuthStore();
  const [selected, setSelected] = useState(1000);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(MOCK_WALLET.transactions);

  useEffect(() => {
    if (!user?.id) return;
    refreshProfile();
    fetchWalletTransactions(user.id).then(setTransactions);
  }, [user?.id]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.heading}>My Wallet</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balance}>{formatTicketPrice(walletBalance)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>TOP UP</Text>
        <View style={styles.topUpGrid}>
          {TOP_UPS.map(amt => (
            <TouchableOpacity
              key={amt}
              style={[styles.topUpBtn, selected === amt && styles.topUpBtnOn]}
              onPress={() => setSelected(amt)}
            >
              <Text style={[styles.topUpText, selected === amt && styles.topUpTextOn]}>
                {formatTicketPrice(amt)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          label={`Add ${formatTicketPrice(selected)}`}
          onPress={() => { addFunds(selected); router.back(); }}
          style={{ marginBottom: Spacing.xl }}
        />

        <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
        {transactions.map(tx => (
          <View key={tx.id} style={styles.txRow}>
            <View style={styles.txLeft}>
              <Text style={styles.txLabel}>{tx.label}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[styles.txAmt, tx.amount > 0 ? styles.txPos : styles.txNeg]}>
              {tx.amount > 0 ? '+' : ''}{formatTicketPrice(Math.abs(tx.amount))}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  heading: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white },
  balanceCard: {
    backgroundColor: Colors.violet, marginHorizontal: Spacing.lg, borderRadius: Radius.xl,
    padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.xl,
  },
  balanceLabel: { fontSize: FontSizes.xs, color: '#C9B3EF', letterSpacing: 0.5, marginBottom: 6 },
  balance: { fontFamily: Fonts.serif, fontSize: FontSizes.hero, color: Colors.white },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, letterSpacing: 0.8, marginBottom: 12 },
  topUpGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  topUpBtn: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.darkCard, borderRadius: Radius.md,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.darkBorder,
  },
  topUpBtnOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  topUpText: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '700' },
  topUpTextOn: { color: Colors.white },
  txRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.darkBorder,
  },
  txLeft: {},
  txLabel: { fontSize: FontSizes.base, color: Colors.white },
  txDate: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: 2 },
  txAmt: { fontSize: FontSizes.base, fontWeight: '700' },
  txPos: { color: Colors.success },
  txNeg: { color: Colors.textSecondary },
});
