import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radius } from '../theme';

interface Props {
  progress: number; // 0–1
  height?: number;
}

export default function ProgressBar({ progress, height = 4 }: Props) {
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${Math.min(progress, 1) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: '#2D2050', borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill, background: undefined,
    backgroundColor: Colors.lilac },
});
