import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Text as SvgText, Defs, RadialGradient, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Colors } from '../theme';

const NAMES = ['sophie_k', 'you', 'marcus', 'em.w', 'jay_99', 'priya', 'alex_b', 'nina'];
const SEGMENT_ANGLE = 360 / NAMES.length;

interface Props {
  spinning?: boolean;
  size?: number;
}

// Two alternating colour pairs — lighter outer, darker centre
const SEG_OUTER = ['#7C4DDC', '#6339C8'];
const SEG_INNER = ['#3d2080', '#2d1660'];

export default function PrizeWheel({ spinning = true, size = 220 }: Props) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (spinning) {
      rotation.value = withRepeat(
        withTiming(1080, { duration: 5000, easing: Easing.out(Easing.cubic) }),
        -1,
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [spinning]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const cx = 150, cy = 150, r = 130;

  function segmentPath(index: number): string {
    const startAngle = (index * SEGMENT_ANGLE - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    return `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  }

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 300 300">
        <Defs>
          <LinearGradient id="rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FCE08A" />
            <Stop offset="50%" stopColor={Colors.gold} />
            <Stop offset="100%" stopColor="#FCE08A" />
          </LinearGradient>
          <RadialGradient id="hub" cx="38%" cy="32%" r="80%">
            <Stop offset="0%" stopColor={Colors.royal} />
            <Stop offset="100%" stopColor={Colors.violet} />
          </RadialGradient>
          {/* Per-segment gradients: outer lighter → centre darker */}
          {NAMES.map((_, i) => (
            <RadialGradient
              key={`sg${i}`}
              id={`sg${i}`}
              cx={`${cx}`}
              cy={`${cy}`}
              r={`${r}`}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor={SEG_INNER[i % 2]} stopOpacity="1" />
              <Stop offset="100%" stopColor={SEG_OUTER[i % 2]} stopOpacity="1" />
            </RadialGradient>
          ))}
        </Defs>

        {/* Glow ring around the wheel */}
        <Circle cx={cx} cy={cy} r={136} fill="none" stroke={Colors.gold} strokeWidth={3} opacity={0.3} />

        <Circle cx={cx} cy={cy} r={142} fill="url(#rim)" />
        <Circle cx={cx} cy={cy} r={134} fill="#2a1a5e" />

        <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
          <Svg width={size} height={size} viewBox="0 0 300 300" style={StyleSheet.absoluteFill}>
            <G>
              {NAMES.map((name, i) => {
                const midAngle = (i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2 - 90) * (Math.PI / 180);
                const tr = r * 0.65;
                const tx = cx + tr * Math.cos(midAngle);
                const ty = cy + tr * Math.sin(midAngle);
                const textAngle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
                return (
                  <React.Fragment key={i}>
                    <Path
                      d={segmentPath(i)}
                      fill={`url(#sg${i})`}
                      stroke={Colors.gold}
                      strokeWidth={0.5}
                    />
                    <SvgText
                      x={tx} y={ty}
                      textAnchor="middle"
                      fill={name === 'you' ? Colors.gold : '#fff'}
                      fontSize={11}
                      fontStyle="italic"
                      fontWeight={name === 'you' ? 'bold' : 'normal'}
                      transform={`rotate(${textAngle} ${tx} ${ty})`}
                    >
                      {name}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </G>
          </Svg>
        </Animated.View>

        <Circle cx={cx} cy={cy} r={36} fill={Colors.gold} />
        <Circle cx={cx} cy={cy} r={31} fill="url(#hub)" />
        <SvgText
          x={cx} y={cy + 5}
          textAnchor="middle"
          fill="#fff"
          fontSize={26}
          fontWeight="bold"
          fontStyle="italic"
        >
          d.
        </SvgText>

        {/* Shadow pointer (offset slightly darker) */}
        <Path d="M151 11 L144 31 L158 31 Z" fill="rgba(0,0,0,0.45)" />
        {/* Gold pointer */}
        <Path d="M150 8 L143 28 L157 28 Z" fill={Colors.gold} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
});
