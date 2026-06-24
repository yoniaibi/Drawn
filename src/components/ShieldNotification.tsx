import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, FontSizes, Spacing, Radius } from '../theme';

interface Props {
  streakCount: number;
  onDismiss: () => void;
}

export default function ShieldNotification({ streakCount, onDismiss }: Props) {
  const translateY = useSharedValue(-60);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 16, stiffness: 200 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  function dismiss() {
    translateY.value = withSpring(-80, { damping: 14, stiffness: 200 });
    setTimeout(onDismiss, 300);
  }

  return (
    <Animated.View style={[styles.banner, animStyle]}>
      <Ionicons name="shield-checkmark" size={20} color={Colors.gold} />
      <Text style={styles.text}>
        Your streak shield activated last night — your{' '}
        <Text style={styles.bold}>{streakCount}-day streak</Text> is protected.
      </Text>
      <TouchableOpacity onPress={dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={16} color={Colors.gold} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(249,200,70,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(249,200,70,0.3)',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  text: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  bold: { color: Colors.gold, fontWeight: '700' },
});
