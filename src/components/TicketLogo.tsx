import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { word: 15, dot: 5, gap: 4 },
  md: { word: 20, dot: 6, gap: 5 },
  lg: { word: 28, dot: 8, gap: 7 },
};

export default function TicketLogo({ size = 'md' }: Props) {
  const s = sizes[size];
  return (
    <View style={styles.wrap}>
      <Text style={[styles.word, { fontSize: s.word }]}>DRAWN</Text>
      <View style={[styles.dot, { width: s.dot, height: s.dot, borderRadius: s.dot / 2, marginLeft: s.gap }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  word: {
    fontFamily: Fonts.serif,
    color: Colors.white,
    letterSpacing: 2,
  },
  dot: { backgroundColor: Colors.pink },
});
