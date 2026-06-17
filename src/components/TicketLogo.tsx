import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
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
  const perfCount = 5;
  // Perforation holes: evenly spaced along height
  const perfHoles = Array.from({ length: perfCount }, (_, i) => ({
    cy: ((i + 1) / (perfCount + 1)) * s.height,
  }));
  const holeR = s.dotSize * 0.55;

  return (
    <View style={[styles.wrap, { height: s.height }]}>
      {/* Left "drawn" section with radial gradient */}
      <View style={[styles.main, { borderRadius: s.height * 0.22 }]}>
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <RadialGradient id="mainGrad" cx="40%" cy="40%" r="80%">
              <Stop offset="0%" stopColor="#3d2580" stopOpacity="1" />
              <Stop offset="100%" stopColor="#120b30" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#mainGrad)" />
        </Svg>
        <Text style={[styles.word, { fontSize: s.word }]}>drawn</Text>
      </View>

      {/* Perforation join — SVG circles overlaid on the seam */}
      <View style={[styles.perf, { width: s.dotSize + 4 }]}>
        <Svg width={s.dotSize + 4} height={s.height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="perfBg" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#120b30" stopOpacity="1" />
              <Stop offset="100%" stopColor="#1e1535" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#perfBg)" />
          {perfHoles.map((h, i) => (
            <Circle
              key={i}
              cx={(s.dotSize + 4) / 2}
              cy={h.cy}
              r={holeR}
              fill="rgba(0,0,0,0.55)"
            />
          ))}
        </Svg>
      </View>

      {/* Stub (9PM) with lilac gradient */}
      <View style={[styles.stub, { paddingHorizontal: s.stubPad, borderRadius: s.height * 0.22 }]}>
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient id="stubGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
              <Stop offset="100%" stopColor="#7c3aed" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#stubGrad)" />
        </Svg>
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
    overflow: 'hidden',
  },
  word: {
    fontFamily: Fonts.serif,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  perf: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stub: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stubLine1: { fontSize: 7, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  stubLine2: { fontSize: 7, fontWeight: '800', color: Colors.gold, letterSpacing: 0.5 },
});
