import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import TicketLogo from '../../src/components/TicketLogo';
import PrimaryButton from '../../src/components/PrimaryButton';
import GhostButton from '../../src/components/GhostButton';
import { getCountdownTo9pm } from '../../src/utils/countdown';
import { useAuthStore } from '../../src/store';

export default function SplashScreen() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const [time, setTime] = useState(getCountdownTo9pm());

  useEffect(() => {
    const id = setInterval(() => setTime(getCountdownTo9pm()), 1000);
    return () => clearInterval(id);
  }, []);

  function handleGetStarted() {
    router.push('/(auth)/sign-up');
  }

  function handleLogin() {
    login();
    router.replace('/(tabs)');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} bounces={false}>
      <View style={styles.logoRow}>
        <TicketLogo size="lg" />
      </View>

      <Text style={styles.headline}>Their loss.{'\n'}Your win.</Text>
      <Text style={styles.sub}>Win designer things for pennies.{'\n'}Sell what you don't wear. Get paid in 24h.</Text>

      {/* Latest win card */}
      <View style={styles.card}>
        <View style={styles.cardLabelRow}>
          <View style={[styles.dot, { backgroundColor: Colors.gold }]} />
          <Text style={[styles.cardLabel, { color: Colors.gold }]}>LATEST WIN</Text>
        </View>
        <View style={styles.cardRow}>
          <View style={styles.itemBox}><Text style={styles.itemEmoji}>👜</Text></View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Chanel Classic Flap</Text>
            <Text style={styles.cardSub}>Won by @sophie_k · 3 mins ago</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.cardPrice}>30p</Text>
            <Text style={styles.cardPriceSub}>ticket price</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.cardRow}>
          <Text style={styles.cardSub}>Retail value</Text>
          <Text style={styles.cardValue}>£2,400</Text>
        </View>
      </View>

      {/* Latest payout card */}
      <View style={styles.card}>
        <View style={styles.cardLabelRow}>
          <View style={[styles.dot, { backgroundColor: Colors.lilac }]} />
          <Text style={[styles.cardLabel, { color: Colors.lilac }]}>LATEST PAYOUT</Text>
        </View>
        <View style={styles.cardRow}>
          <View style={styles.itemBox}>
            <Text style={{ fontSize: 10 }}>👔👟👛👗</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Wardrobe drop · 28 pieces</Text>
            <Text style={styles.cardSub}>@sophiestyle · paid out today</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={[styles.cardPrice, { color: Colors.lilac }]}>£876</Text>
            <Text style={styles.cardPriceSub}>she earned</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.cardRow}>
          <Text style={styles.cardSub}>Time to list</Text>
          <Text style={[styles.cardSub, { color: Colors.lilac, fontWeight: '600' }]}>Under 5 minutes →</Text>
        </View>
      </View>

      {/* Countdown */}
      <View style={styles.countdown}>
        <View style={styles.countdownLeft}>
          <View style={[styles.dot, { backgroundColor: Colors.pink }]} />
          <Text style={styles.countdownLabel}>Next draw closes in</Text>
        </View>
        <View style={styles.countdownRight}>
          <Text style={styles.countdownNum}>{time.h}</Text>
          <Text style={styles.countdownColon}>:</Text>
          <Text style={styles.countdownNum}>{time.m}</Text>
          <Text style={styles.countdownColon}>:</Text>
          <Text style={styles.countdownNum}>{time.s}</Text>
        </View>
      </View>

      <PrimaryButton label="Get started — it's free" onPress={handleGetStarted} style={styles.btn} />
      <GhostButton label="Log in" onPress={handleLogin} style={styles.ghostBtn} />
      <Text style={styles.noCard}>No card needed to browse</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.violet },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  logoRow: { alignItems: 'center', paddingTop: 16, paddingBottom: 20 },
  headline: {
    fontFamily: Fonts.serif, fontSize: 36, color: Colors.white,
    textAlign: 'center', lineHeight: 38, marginBottom: 8,
  },
  sub: { fontSize: FontSizes.sm, color: '#C9B3EF', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  card: {
    backgroundColor: Colors.ink, borderRadius: Radius.lg, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: 'rgba(249,200,70,0.15)',
  },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  dot: { width: 7, height: 7, borderRadius: 99 },
  cardLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemBox: {
    width: 44, height: 44, borderRadius: 11, backgroundColor: '#2a1216',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  itemEmoji: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600' },
  cardSub: { fontSize: 9, color: Colors.textTertiary, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  cardPrice: { fontFamily: Fonts.serif, fontSize: 20, color: Colors.gold, lineHeight: 22 },
  cardPriceSub: { fontSize: 8, color: Colors.textTertiary, marginTop: 1 },
  cardValue: { fontFamily: Fonts.serif, fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 10 },
  countdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 13, padding: 12, marginBottom: Spacing.md,
  },
  countdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  countdownLabel: { fontSize: 9, color: '#C9B3EF' },
  countdownRight: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  countdownNum: { fontFamily: Fonts.serif, fontSize: 20, color: Colors.white, lineHeight: 22 },
  countdownColon: { fontSize: 13, color: Colors.lilac, fontWeight: '700', marginHorizontal: 1 },
  btn: { marginBottom: Spacing.sm },
  ghostBtn: { marginBottom: Spacing.sm },
  noCard: { textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.25)' },
});
