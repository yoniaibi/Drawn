import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated as RNAnimated,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay, Easing,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { useGrandDrawStore } from '../../src/store';
import { MOCK_GRAND_DRAW_COMPLETE } from '../../src/mocks';
import PrimaryButton from '../../src/components/PrimaryButton';

// Deterministic confetti — seeded by index
const CONFETTI_COLORS = [Colors.gold, Colors.violet, Colors.pink, Colors.white, '#FCE08A', '#C084FC'];
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${(i * 37 + 11) % 90 + 5}%` as any,
  delay: (i * 33) % 800,
  size: 6 + (i % 5),
  endY: 300 + (i * 17) % 200,
}));

function ConfettiParticle({ color, left, delay, size, endY }: typeof CONFETTI[0]) {
  const ty = useSharedValue(0);
  const op = useSharedValue(0);

  useEffect(() => {
    ty.value = withDelay(delay, withTiming(endY, { duration: 1600, easing: Easing.out(Easing.quad) }));
    op.value = withDelay(delay,
      withTiming(1, { duration: 200 }, () => {
        op.value = withDelay(200, withTiming(0, { duration: 1200 }));
      })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute' as any,
    left,
    top: 60,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    transform: [{ translateY: ty.value }],
    opacity: op.value,
  }));

  return <Animated.View style={style} />;
}

export default function GrandDrawWinnerScreen() {
  const router = useRouter();
  const { grandDraw } = useGrandDrawStore();
  const userWon = false; // In real app: grandDraw.winner?.handle === currentUser handle

  const bgOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(0.5);

  useEffect(() => {
    bgOpacity.value = withTiming(1, { duration: 400 });
    emojiScale.value = withDelay(300, withSpring(1, { stiffness: 120, damping: 14 }));
  }, []);

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const emojiStyle = useAnimatedStyle(() => ({ transform: [{ scale: emojiScale.value }] }));

  if (userWon) {
    return (
      <Animated.View style={[styles.screenWon, bgStyle]}>
        {CONFETTI.map((c, i) => <ConfettiParticle key={i} {...c} />)}
        <ScrollView contentContainerStyle={styles.wonContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.wonHeadline}>YOU WON.</Text>
          <Animated.Text style={[styles.wonEmoji, emojiStyle]}>{grandDraw.prize.emoji}</Animated.Text>
          <Text style={styles.wonTitle}>{grandDraw.prize.title}</Text>
          <Text style={styles.wonValue}>Worth £{grandDraw.prize.retailValue.toLocaleString()}</Text>
          <Text style={styles.wonSub}>
            Out of {grandDraw.totalTickets.toLocaleString()} entries, your ticket was drawn.
          </Text>
          <PrimaryButton
            label="Share my win"
            onPress={() => {}}
            variant="dark"
            style={{ marginTop: Spacing.xl, backgroundColor: Colors.violet }}
          />
        </ScrollView>
      </Animated.View>
    );
  }

  // User did not win
  const winner = grandDraw.winner ?? MOCK_GRAND_DRAW_COMPLETE.winner;
  return (
    <Animated.View style={[styles.screenLost, bgStyle]}>
      <ScrollView contentContainerStyle={styles.lostContent} showsVerticalScrollIndicator={false}>
        {/* Winner announcement */}
        <View style={styles.winnerBox}>
          <Text style={styles.winnerKicker}>{grandDraw.month.toUpperCase()} GRAND DRAW WINNER</Text>
          <Animated.Text style={[styles.lostEmoji, emojiStyle]}>{grandDraw.prize.emoji}</Animated.Text>
          <Text style={styles.winnerHandle}>{winner?.handle}</Text>
          <Text style={styles.winnerPrize}>{grandDraw.prize.title}</Text>
          <View style={styles.winnerStats}>
            <Text style={styles.winnerStatText}>
              {winner?.tickets} tickets · {winner?.ticketPct}% of pool
            </Text>
          </View>
        </View>

        <Text style={styles.motiveSub}>
          They logged in {winner?.tickets} of 30 days. You had {grandDraw.myTickets} tickets.
          {'\n'}Next month's draw starts tomorrow.
        </Text>

        {/* Next month teaser */}
        <View style={styles.teaserCard}>
          <View style={styles.teaserLeft}>
            <Text style={styles.teaserKicker}>NEXT MONTH</Text>
            <Text style={styles.teaserTitle}>{MOCK_GRAND_DRAW_COMPLETE.prize.title}</Text>
            <Text style={styles.teaserValue}>£{MOCK_GRAND_DRAW_COMPLETE.prize.retailValue.toLocaleString()}</Text>
          </View>
          <Text style={styles.teaserEmoji}>{MOCK_GRAND_DRAW_COMPLETE.prize.emoji}</Text>
        </View>

        <PrimaryButton
          label="Keep my streak going"
          onPress={() => router.replace('/(tabs)/grand-draw' as any)}
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Won
  screenWon: {
    flex: 1,
    backgroundColor: Colors.gold,
  },
  wonContent: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: Spacing.xl,
    gap: 10,
  },
  wonHeadline: {
    fontFamily: Fonts.serif,
    fontSize: 52,
    color: Colors.violet,
    textAlign: 'center',
    lineHeight: 56,
  },
  wonEmoji: { fontSize: 72, marginVertical: 8 },
  wonTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.violet, textAlign: 'center' },
  wonValue: { fontSize: FontSizes.lg, color: Colors.violet, fontWeight: '800' },
  wonSub: { fontSize: FontSizes.sm, color: 'rgba(45,27,105,0.7)', textAlign: 'center', lineHeight: 20, marginTop: 4 },

  // Lost
  screenLost: {
    flex: 1,
    backgroundColor: Colors.violet,
  },
  lostContent: {
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  winnerBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(249,200,70,0.3)',
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 6,
  },
  winnerKicker: { fontSize: 9, fontWeight: '800', color: Colors.gold, letterSpacing: 1.5 },
  lostEmoji: { fontSize: 56, marginVertical: 6 },
  winnerHandle: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.gold },
  winnerPrize: { fontSize: FontSizes.sm, color: 'rgba(210,195,240,0.8)' },
  winnerStats: {
    backgroundColor: 'rgba(249,200,70,0.1)', borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.25)',
    marginTop: 4,
  },
  winnerStatText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '600' },

  motiveSub: {
    fontSize: FontSizes.sm,
    color: 'rgba(210,195,240,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },

  teaserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: Spacing.md,
    gap: 12,
  },
  teaserLeft: { flex: 1 },
  teaserKicker: { fontSize: 9, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 1 },
  teaserTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700', marginTop: 3 },
  teaserValue: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '700', marginTop: 2 },
  teaserEmoji: { fontSize: 40 },
});
