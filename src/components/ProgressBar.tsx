import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, Radius } from '../theme';

interface Props {
  progress: number; // 0–1
  height?: number;
  color?: string;
}

export default function ProgressBar({ progress, height = 4, color = Colors.lilac }: Props) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(Math.max(progress, 0), 1) * 100, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fill, animatedStyle, { backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: '#2D2050', borderRadius: Radius.pill, overflow: 'hidden', width: '100%' },
  fill: { borderRadius: Radius.pill },
});
