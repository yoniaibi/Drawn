import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withSequence, Easing, runOnJS,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../theme';
import PrimaryButton from './PrimaryButton';
import { useGrandDrawStore } from '../store';

const DAYS_IN_MONTH = 30;

export default function DailyTicketClaim() {
  const { todayTicketClaimed, claimTodayTicket, streak, grandDraw } = useGrandDrawStore();

  const ticketY = useSharedValue(0);
  const ticketOpacity = useSharedValue(0);
  const counterScale = useSharedValue(1);

  const ticketStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ticketY.value }],
    opacity: ticketOpacity.value,
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  }));

  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: counterScale.value }],
  }));

  const handleClaim = useCallback(() => {
    // Ticket fly-up animation
    ticketOpacity.value = withTiming(1, { duration: 80 });
    ticketY.value = withTiming(-80, { duration: 600, easing: Easing.out(Easing.quad) });
    ticketOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 120 }),
    );

    // Counter pulse
    counterScale.value = withSequence(
      withTiming(1.15, { duration: 150 }),
      withSpring(1, { stiffness: 300 }),
    );

    runOnJS(claimTodayTicket)();
  }, []);

  const daysLeft = DAYS_IN_MONTH - streak.monthTickets;
  const shieldLine = streak.shieldAvailable
    ? { text: 'Streak shield: available', color: Colors.success }
    : streak.shieldUsedAt
    ? { text: `Streak shield: used · refreshes next month`, color: Colors.warning }
    : { text: 'Streak shield: refreshes 1 Jul', color: Colors.textTertiary };

  if (todayTicketClaimed) {
    return (
      <View style={styles.card}>
        <View style={styles.claimedRow}>
          <View style={styles.claimedIcon}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
          </View>
          <View style={styles.claimedInfo}>
            <Text style={styles.claimedTitle}>Ticket claimed · streak: {streak.current} days 🔥</Text>
            <Text style={styles.claimedSub}>Come back tomorrow for another ticket.</Text>
          </View>
        </View>
        <View style={styles.shieldRow}>
          <Ionicons name="shield-checkmark" size={12} color={shieldLine.color} />
          <Text style={[styles.shieldText, { color: shieldLine.color }]}>{shieldLine.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.unclaimedHeader}>
        <Ionicons name="gift" size={18} color={Colors.gold} />
        <Text style={styles.unclaimedTitle}>Your daily ticket</Text>
        <Animated.View style={counterStyle}>
          <Text style={styles.ticketCount}>{grandDraw.myTickets}</Text>
        </Animated.View>
      </View>
      <Text style={styles.unclaimedSub}>
        Log in today to earn a Grand Draw entry. {daysLeft} days left this month.
      </Text>

      <View style={{ position: 'relative' }}>
        <PrimaryButton
          label="Claim today's ticket"
          onPress={handleClaim}
          variant="gold"
          style={{ marginTop: Spacing.sm }}
        />
        <Animated.View style={ticketStyle} pointerEvents="none">
          <Ionicons name="ticket" size={22} color={Colors.gold} />
        </Animated.View>
      </View>

      <View style={[styles.shieldRow, { marginTop: Spacing.sm }]}>
        <Ionicons name="shield-checkmark" size={12} color={shieldLine.color} />
        <Text style={[styles.shieldText, { color: shieldLine.color }]}>{shieldLine.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(249,200,70,0.3)',
    padding: Spacing.md,
    gap: 6,
  },
  unclaimedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unclaimedTitle: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.white,
    fontWeight: '700',
  },
  ticketCount: {
    fontSize: FontSizes.md,
    color: Colors.gold,
    fontWeight: '800',
  },
  unclaimedSub: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  claimedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  claimedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(29,158,117,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimedInfo: { flex: 1 },
  claimedTitle: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: '700',
  },
  claimedSub: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  shieldText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});
