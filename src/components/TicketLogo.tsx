import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../theme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { word: 13, height: 22, stubPad: 6, dot: 3, stubFontMain: 6.5, stubFontSub: 6.5 },
  md: { word: 18, height: 30, stubPad: 9, dot: 4, stubFontMain: 8, stubFontSub: 8 },
  lg: { word: 24, height: 42, stubPad: 12, dot: 5, stubFontMain: 10, stubFontSub: 10 },
};

export default function TicketLogo({ size = 'md' }: Props) {
  const s = sizes[size];
  const perfCount = 5;
  const radius = s.height * 0.22;

  return (
    <View style={[styles.wrap, { height: s.height }]}>
      {/* Left "drawn" section */}
      <View style={[
        styles.main,
        { paddingHorizontal: s.stubPad, borderRadius: radius, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
      ]}>
        <Text style={[styles.word, { fontSize: s.word }]}>drawn</Text>
      </View>

      {/* Perforation seam */}
      <View style={[styles.perf, { width: s.dot + 6 }]}>
        {Array.from({ length: perfCount }).map((_, i) => (
          <View
            key={i}
            style={[styles.hole, { width: s.dot, height: s.dot, borderRadius: s.dot / 2 }]}
          />
        ))}
      </View>

      {/* Stub (9PM LIVE) */}
      <View style={[
        styles.stub,
        { paddingHorizontal: s.stubPad, borderRadius: radius, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
      ]}>
        <Text style={[styles.stubLine1, { fontSize: s.stubFontMain }]}>9PM</Text>
        <Text style={[styles.stubLine2, { fontSize: s.stubFontSub }]}>LIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'stretch' },

  main: {
    backgroundColor: '#1e1040',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
    borderRightWidth: 0,
  },
  word: {
    fontFamily: Fonts.serif,
    color: Colors.white,
    letterSpacing: -0.5,
  },

  perf: {
    backgroundColor: '#18102e',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
  },
  hole: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  stub: {
    backgroundColor: Colors.lilac,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stubLine1: { fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  stubLine2: { fontWeight: '800', color: Colors.gold, letterSpacing: 0.5 },
});
