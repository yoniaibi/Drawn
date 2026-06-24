import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing } from '../../src/theme';
import { useGrandDrawStore } from '../../src/store';
import PrizeWheel from '../../src/components/PrizeWheel';

export default function GrandDrawLiveScreen() {
  const router = useRouter();
  const { grandDraw } = useGrandDrawStore();

  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.4, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
    );
    // Navigate to winner after spin (8s) + 2s pause
    const timer = setTimeout(() => {
      router.replace('/grand-draw/winner' as any);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.kicker}>GRAND DRAW · {grandDraw.month.toUpperCase()}</Text>
        <View style={styles.liveRow}>
          <Animated.View style={[styles.liveDot, dotStyle]} />
          <Text style={styles.liveText}>LIVE NOW</Text>
        </View>
      </View>

      {/* Prize */}
      <View style={styles.prizeArea}>
        <Text style={styles.prizeEmoji}>{grandDraw.prize.emoji}</Text>
        <Text style={styles.prizeTitle}>{grandDraw.prize.title}</Text>
        <Text style={styles.prizeValue}>£{grandDraw.prize.retailValue.toLocaleString()} prize</Text>
      </View>

      {/* Wheel */}
      <View style={styles.wheelArea}>
        <PrizeWheel spinning size={300} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          {grandDraw.totalTickets.toLocaleString()} entries · your odds: 1 in {grandDraw.myOdds.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.violet,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: Spacing.lg,
  },
  header: { alignItems: 'center', gap: 8 },
  kicker: {
    fontSize: 10, fontWeight: '800', color: Colors.gold, letterSpacing: 2,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.pink },
  liveText: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.pink, letterSpacing: 1 },

  prizeArea: { alignItems: 'center', gap: 6 },
  prizeEmoji: { fontSize: 42 },
  prizeTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white, textAlign: 'center' },
  prizeValue: { fontSize: FontSizes.md, color: Colors.gold, fontWeight: '800' },

  wheelArea: {
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 20,
  },

  statsRow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  statsText: { fontSize: FontSizes.xs, color: 'rgba(210,195,240,0.8)', fontWeight: '600' },
});
