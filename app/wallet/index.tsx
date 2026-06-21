import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated as RNAnimated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { useAuthStore } from '../../src/store';
import { fetchWalletTransactions, WalletTransaction } from '../../src/services/draws';
import PrimaryButton from '../../src/components/PrimaryButton';
import { formatTicketPrice } from '../../src/utils/countdown';
import { supabase } from '../../src/lib/supabase';

const TOP_UPS = [500, 1000, 2000, 5000]; // pence

export default function WalletScreen() {
  const router = useRouter();
  const { walletBalance, addFunds, user, refreshProfile } = useAuthStore();
  const [selected, setSelected] = useState(1000);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [topUpError, setTopUpError] = useState<string | null>(null);

  // Per-button flash: maps amount → 'added' | null
  const [flashedAmt, setFlashedAmt] = useState<number | null>(null);

  // Confirmation chip
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const chipOpacity = useRef(new RNAnimated.Value(0)).current;
  const chipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    refreshProfile();
    fetchWalletTransactions(user.id).then(txns => {
      setTransactions(txns);
      setTxLoading(false);
    }).catch(() => setTxLoading(false));
  }, [user?.id]);

  async function handleTopUp(amt: number) {
    setTopUpError(null);
    setFlashedAmt(amt);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not signed in');

      const { error: balErr } = await supabase
        .from('profiles')
        .update({ wallet_balance: walletBalance + amt })
        .eq('id', currentUser.id);
      if (balErr) throw balErr;

      const { error: txErr } = await supabase.from('wallet_transactions').insert({
        user_id: currentUser.id,
        amount: amt,
        type: 'topup',
        description: `Wallet top-up · ${formatTicketPrice(amt)}`,
      });
      if (txErr) throw txErr;

      // Only update local balance after DB confirms
      addFunds(amt);
      fetchWalletTransactions(currentUser.id).then(setTransactions);

      // Show confirmation chip
      if (chipTimer.current) clearTimeout(chipTimer.current);
      setLastAdded(amt);
      RNAnimated.timing(chipOpacity, { toValue: 1, duration: 200, useNativeDriver: false }).start();
      chipTimer.current = setTimeout(() => {
        RNAnimated.timing(chipOpacity, { toValue: 0, duration: 400, useNativeDriver: false }).start(() => setLastAdded(null));
      }, 2000);
    } catch {
      setTopUpError('Top-up failed — please try again.');
    } finally {
      setTimeout(() => setFlashedAmt(null), 1000);
    }
  }

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

      {/* Added chip */}
      {lastAdded !== null && (
        <RNAnimated.View style={[styles.addedChip, { opacity: chipOpacity }]}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
          <Text style={styles.addedChipText}>{formatTicketPrice(lastAdded)} added to your wallet</Text>
        </RNAnimated.View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>TOP UP</Text>
        <View style={styles.topUpGrid}>
          {TOP_UPS.map(amt => {
            const isFlashed = flashedAmt === amt;
            return (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.topUpBtn,
                  selected === amt && styles.topUpBtnOn,
                  isFlashed && styles.topUpBtnFlash,
                ]}
                onPress={() => {
                  setSelected(amt);
                }}
              >
                <Text style={[
                  styles.topUpText,
                  selected === amt && styles.topUpTextOn,
                  isFlashed && styles.topUpTextFlash,
                ]}>
                  {isFlashed ? 'Added!' : formatTicketPrice(amt)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <PrimaryButton
          label={`Add ${formatTicketPrice(selected)}`}
          onPress={() => handleTopUp(selected)}
          style={{ marginBottom: Spacing.xl }}
        />

        {topUpError && (
          <Text style={{ fontSize: FontSizes.xs, color: Colors.danger, marginBottom: 10, lineHeight: 16 }}>{topUpError}</Text>
        )}

        <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
        {txLoading && <ActivityIndicator color={Colors.lilac} style={{ marginTop: 20 }} />}
        {!txLoading && transactions.map(tx => (
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
    padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.md,
  },
  balanceLabel: { fontSize: FontSizes.xs, color: '#C9B3EF', letterSpacing: 0.5, marginBottom: 6 },
  balance: { fontFamily: Fonts.serif, fontSize: FontSizes.hero, color: Colors.white },

  addedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'center',
    backgroundColor: 'rgba(29,158,117,0.15)', borderRadius: Radius.pill,
    borderWidth: 1, borderColor: 'rgba(29,158,117,0.3)',
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    marginBottom: Spacing.md, marginHorizontal: Spacing.lg,
  },
  addedChipText: { fontSize: FontSizes.sm, color: Colors.success, fontWeight: '600' },

  content: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, letterSpacing: 0.8, marginBottom: 12 },
  topUpGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  topUpBtn: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.darkCard, borderRadius: Radius.md,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.darkBorder,
  },
  topUpBtnOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  topUpBtnFlash: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  topUpText: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '700' },
  topUpTextOn: { color: Colors.white },
  topUpTextFlash: { color: Colors.ink },
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
