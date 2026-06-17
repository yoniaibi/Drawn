import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { word: 13, height: 22, stubPad: 6, dotSize: 3 },
  md: { word: 18, height: 30, stubPad: 8, dotSize: 4 },
  lg: { word: 24, height: 40, stubPad: 11, dotSize: 5 },
};

export default function TicketLogo({ size = 'md' }: Props) {
  const s = sizes[size];
  return (
    <View style={[styles.wrap, { height: s.height }]}>
      <View style={[styles.main, { borderRadius: s.height * 0.22 }]}>
        <Text style={[styles.word, { fontSize: s.word }]}>drawn</Text>
      </View>
      <View style={styles.perf}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.dot, { width: s.dotSize, height: s.dotSize }]} />
        ))}
      </View>
      <View style={[styles.stub, { paddingHorizontal: s.stubPad, borderRadius: s.height * 0.22 }]}>
        <Text style={styles.stubLine1}>9PM</Text>
        <Text style={styles.stubLine2}>LIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'stretch' },
  main: {
    backgroundColor: Colors.ink,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  word: {
    fontFamily: Fonts.serif,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  perf: {
    backgroundColor: Colors.ink,
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 2,
  },
  dot: { borderRadius: 999, backgroundColor: Colors.violet },
  stub: {
    backgroundColor: Colors.lilac,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stubLine1: { fontSize: 7, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  stubLine2: { fontSize: 7, fontWeight: '800', color: Colors.gold, letterSpacing: 0.5 },
});
