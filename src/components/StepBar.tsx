import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing } from '../theme';

interface Props {
  current: number;
  total: number;
}

export default function StepBar({ current, total }: Props) {
  return (
    <>
      <View style={styles.bar}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[styles.segment, i + 1 <= current ? styles.active : styles.inactive]} />
        ))}
      </View>
      <Text style={styles.label}>Step {current} of {total}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', gap: 4, paddingHorizontal: Spacing.lg, marginBottom: 6 },
  segment: { flex: 1, height: 3, borderRadius: 2 },
  active: { backgroundColor: Colors.lilac },
  inactive: { backgroundColor: Colors.darkBorder },
  label: { fontSize: 10, color: Colors.textTertiary, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, letterSpacing: 0.5 },
});
