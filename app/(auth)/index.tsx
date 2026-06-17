import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated as RNAnimated, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, Pattern, Circle as SvgCircle, Rect } from 'react-native-svg';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import TicketLogo from '../../src/components/TicketLogo';
import PrimaryButton from '../../src/components/PrimaryButton';
import GhostButton from '../../src/components/GhostButton';
import { getCountdownTo9pm } from '../../src/utils/countdown';
import { fetchRecentWinners, RecentWinner } from '../../src/services/draws';

const FALLBACK_WINS = [
  { handle: '@sophie_k', item: 'Chanel Classic Flap', ticketPrice: 25, retailValue: 2400, emoji: '👜' },
  { handle: '@dan.west', item: 'Rolex Submariner', ticketPrice: 50, retailValue: 8500, emoji: '⌚' },
  { handle: '@chloe_j', item: 'Designer Closet Bundle', ticketPrice: 40, retailValue: 8600, emoji: '👗' },
];

type SplashWin = { handle: string; item: string; ticketPrice: number; retailValue: number; emoji: string; };

const SOCIAL_PROOF = [
  '🎉 1,247 people watching tonight',
  '🏆 23 winners this week',
  '💜 £127,000 in prizes drawn so far',
  '⚡ Seller payouts within 24 hours',
  '👜 Chanel Flap won for 25p tonight',
];

export default function SplashScreen() {
  const router = useRouter();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [time, setTime] = useState(getCountdownTo9pm());
  const [winnerIdx, setWinnerIdx] = useState(0);
  const [proofIdx, setProofIdx] = useState(0);
  const winnerOpacity = useRef(new RNAnimated.Value(1)).current;
  const proofOpacity = useRef(new RNAnimated.Value(1)).current;
  const [recentWins, setRecentWins] = useState<SplashWin[]>(FALLBACK_WINS);

  useEffect(() => {
    fetchRecentWinners().then(winners => {
      if (winners.length > 0) setRecentWins(winners.slice(0, 3));
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTime(getCountdownTo9pm()), 1000);
    return () => clearInterval(id);
  }, []);

  // Rotate winner showcase
  useEffect(() => {
    const id = setInterval(() => {
      RNAnimated.timing(winnerOpacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        setWinnerIdx(i => (i + 1) % recentWins.length);
        RNAnimated.timing(winnerOpacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      });
    }, 3500);
    return () => clearInterval(id);
  }, [recentWins.length]);

  // Rotate social proof
  useEffect(() => {
    const id = setInterval(() => {
      RNAnimated.timing(proofOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setProofIdx(i => (i + 1) % SOCIAL_PROOF.length);
        RNAnimated.timing(proofOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  function handleGetStarted() {
    router.push('/(auth)/sign-up');
  }

  function handleLogin() {
    router.push('/(auth)/log-in');
  }

  const currentWin = recentWins[winnerIdx % recentWins.length];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} bounces={false} showsVerticalScrollIndicator={false}>
      {/* Dot-grid texture background */}
      <Svg
        style={styles.dotGrid}
        width={screenW}
        height={screenH * 2}
        pointerEvents="none"
      >
        <Defs>
          <Pattern id="dotGrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <SvgCircle cx="12" cy="12" r="1" fill={Colors.lilac} fillOpacity="0.08" />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#dotGrid)" />
      </Svg>

      <View style={styles.logoRow}>
        <TicketLogo size="lg" />
      </View>

      <Text style={styles.headline}>Their loss.{'\n'}Your win.</Text>
      <Text style={styles.sub}>Win designer things for pennies.{'\n'}Sell what you don't wear. Get paid in 24h.</Text>

      {/* Animated social proof ticker */}
      <View style={styles.proofTicker}>
        <View style={styles.proofDot} />
        <RNAnimated.Text style={[styles.proofText, { opacity: proofOpacity }]}>
          {SOCIAL_PROOF[proofIdx]}
        </RNAnimated.Text>
      </View>

      {/* Live winner showcase */}
      <View style={styles.winnerShowcase}>
        <View style={styles.winnerShowcaseHeader}>
          <View style={styles.winnerDot} />
          <Text style={styles.winnerShowcaseLabel}>LATEST WIN</Text>
          <Text style={styles.winnerDots}>
            {recentWins.map((_, i) => i === winnerIdx % recentWins.length ? '●' : '○').join(' ')}
          </Text>
        </View>

        <RNAnimated.View style={{ opacity: winnerOpacity }}>
          <View style={styles.winnerRow}>
            <View style={styles.winnerEmojiBox}>
              <Text style={styles.winnerEmoji}>{currentWin.emoji}</Text>
            </View>
            <View style={styles.winnerInfo}>
              <Text style={styles.winnerHandle}>{currentWin.handle}</Text>
              <Text style={styles.winnerItem}>{currentWin.item}</Text>
            </View>
            <View style={styles.winnerRight}>
              <Text style={styles.winnerMultiple}>{Math.round(currentWin.retailValue / currentWin.ticketPrice)}×</Text>
              <Text style={styles.winnerMultipleSub}>return</Text>
            </View>
          </View>

          <View style={styles.winnerDivider} />

          <View style={styles.winnerValueRow}>
            <View style={styles.winnerValueStat}>
              <Text style={styles.winnerValueStatVal}>{currentWin.ticketPrice}p</Text>
              <Text style={styles.winnerValueStatLabel}>ticket price</Text>
            </View>
            <View style={styles.winnerValueArrowBox}>
              <Text style={styles.winnerValueArrow}>→</Text>
            </View>
            <View style={styles.winnerValueStat}>
              <Text style={[styles.winnerValueStatVal, { color: Colors.gold }]}>£{currentWin.retailValue.toLocaleString()}</Text>
              <Text style={styles.winnerValueStatLabel}>retail value</Text>
            </View>
          </View>
        </RNAnimated.View>
      </View>

      {/* Latest payout */}
      <View style={styles.payoutCard}>
        <View style={styles.payoutLeft}>
          <View style={styles.payoutLabelRow}>
            <View style={[styles.proofDot, { backgroundColor: Colors.lilac }]} />
            <Text style={[styles.winnerShowcaseLabel, { color: Colors.lilac }]}>LATEST PAYOUT</Text>
          </View>
          <Text style={styles.payoutTitle}>Wardrobe drop · 28 pieces</Text>
          <Text style={styles.payoutSeller}>@sophiestyle · paid out today</Text>
          <Text style={styles.payoutTime}>Listed in under 5 minutes →</Text>
        </View>
        <View style={styles.payoutEarned}>
          <Text style={styles.payoutAmount}>£876</Text>
          <Text style={styles.payoutLabel}>she earned</Text>
        </View>
      </View>

      {/* Countdown */}
      <View style={styles.countdown}>
        <View style={styles.countdownLeft}>
          <View style={[styles.proofDot, { backgroundColor: Colors.pink }]} />
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

      {/* Trust badges */}
      <View style={styles.trustRow}>
        {[
          { icon: 'shield-checkmark-outline', label: 'Verified items' },
          { icon: 'lock-closed-outline', label: 'Secure checkout' },
          { icon: 'mail-outline', label: 'Free entry option' },
        ].map(b => (
          <View key={b.label} style={styles.trustBadge}>
            <Ionicons name={b.icon as any} size={14} color={Colors.lilac} />
            <Text style={styles.trustLabel}>{b.label}</Text>
          </View>
        ))}
      </View>

      <PrimaryButton label="Get started — it's free" onPress={handleGetStarted} style={styles.btn} />
      <GhostButton label="Log in" onPress={handleLogin} style={styles.ghostBtn} />
      <Text style={styles.noCard}>No card needed to browse · Free postal entry available</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.violet },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  dotGrid: { position: 'absolute', top: 0, left: 0 },
  logoRow: { alignItems: 'center', paddingTop: 16, paddingBottom: 16 },

  headline: {
    fontFamily: Fonts.serif, fontSize: 38, color: Colors.white,
    textAlign: 'center', lineHeight: 40, marginBottom: 8,
  },
  sub: { fontSize: FontSizes.sm, color: '#C9B3EF', textAlign: 'center', lineHeight: 20, marginBottom: 14 },

  proofTicker: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 7, marginBottom: 14,
    alignSelf: 'center',
  },
  proofDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },
  proofText: { fontSize: FontSizes.xs, color: '#E9D5FF', fontWeight: '600' },

  winnerShowcase: {
    backgroundColor: Colors.ink, borderRadius: Radius.lg, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)',
  },
  winnerShowcaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  winnerDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: Colors.gold },
  winnerShowcaseLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, color: Colors.gold, flex: 1 },
  winnerDots: { fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 },
  winnerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  winnerEmojiBox: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: 'rgba(249,200,70,0.08)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.15)',
  },
  winnerEmoji: { fontSize: 28 },
  winnerInfo: { flex: 1 },
  winnerHandle: { fontFamily: Fonts.serif, fontSize: FontSizes.base, color: Colors.white, lineHeight: 18 },
  winnerItem: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  winnerTime: { fontSize: 9, color: Colors.textTertiary, marginTop: 2 },
  winnerRight: { alignItems: 'center' },
  winnerMultiple: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.gold },
  winnerMultipleSub: { fontSize: 8, color: Colors.textTertiary },
  winnerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 12 },
  winnerValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  winnerValueStat: { flex: 1, alignItems: 'center' },
  winnerValueStatVal: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white },
  winnerValueStatLabel: { fontSize: 9, color: Colors.textTertiary, marginTop: 3 },
  winnerValueArrowBox: { paddingHorizontal: 8 },
  winnerValueArrow: { fontSize: 20, color: 'rgba(255,255,255,0.3)' },

  payoutCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.ink, borderRadius: Radius.lg, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
  },
  payoutLeft: { flex: 1 },
  payoutLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  payoutTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600' },
  payoutSeller: { fontSize: 9, color: Colors.textTertiary, marginTop: 2 },
  payoutTime: { fontSize: 9, color: Colors.lilac, fontWeight: '600', marginTop: 4 },
  payoutEarned: { alignItems: 'center', paddingLeft: 12 },
  payoutAmount: { fontFamily: Fonts.serif, fontSize: 22, color: Colors.lilac },
  payoutLabel: { fontSize: 8, color: Colors.textTertiary, marginTop: 2 },

  countdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 13, padding: 12, marginBottom: Spacing.md,
  },
  countdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  countdownLabel: { fontSize: 9, color: '#C9B3EF' },
  countdownRight: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  countdownNum: { fontFamily: Fonts.serif, fontSize: 20, color: Colors.white, lineHeight: 22 },
  countdownColon: { fontSize: 13, color: Colors.lilac, fontWeight: '700', marginHorizontal: 1 },

  trustRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustLabel: { fontSize: 9, color: '#C9B3EF' },

  btn: { marginBottom: Spacing.sm },
  ghostBtn: { marginBottom: Spacing.sm },
  noCard: { textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.25)' },
});
