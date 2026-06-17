import React, { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { Colors, Radius, FontSizes } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'pink' | 'lilac' | 'dark' | 'gold';
}

const BG: Record<string, string> = {
  pink: Colors.pink,
  lilac: Colors.lilac,
  dark: Colors.ink,
  gold: Colors.gold,
};

const TEXT_COLOR: Record<string, string> = {
  pink: Colors.white,
  lilac: Colors.white,
  dark: Colors.white,
  gold: Colors.ink,
};

export default function PrimaryButton({ label, onPress, loading, disabled, style, variant = 'pink' }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const bg = BG[variant] ?? Colors.pink;
  const textColor = TEXT_COLOR[variant] ?? Colors.white;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(0.9, { duration: 80 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  }, []);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        style={[styles.btn, { backgroundColor: bg, opacity: disabled || loading ? 0.55 : 1 }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {loading
          ? <ActivityIndicator color={textColor} />
          : <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: { fontSize: FontSizes.base, fontWeight: '700', letterSpacing: 0.3 },
});
