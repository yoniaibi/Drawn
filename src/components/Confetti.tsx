import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors } from '../theme';

const { width, height } = Dimensions.get('window');
const PIECES = 20;
const COLORS = [Colors.pink, Colors.gold, Colors.white, Colors.lilac, '#C4B5FD'];

function ConfettiPiece({ delay }: { delay: number }) {
  const y = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const left = Math.random() * width;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const duration = 2000 + Math.random() * 1400;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(y, { toValue: height, duration, useNativeDriver: false }),
          Animated.timing(y, { toValue: -20, duration: 0, useNativeDriver: false }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: false }),
          Animated.timing(opacity, { toValue: 0, duration: 400, delay: duration - 600, useNativeDriver: false }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(rotate, { toValue: 1, duration, useNativeDriver: false }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '340deg'] });

  return (
    <Animated.View
      style={[
        styles.piece,
        { left, backgroundColor: color, opacity, transform: [{ translateY: y }, { rotate: spin }] },
      ]}
    />
  );
}

export default function Confetti() {
  const delays = Array.from({ length: PIECES }, (_, i) => Math.random() * 2000);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {delays.map((d, i) => <ConfettiPiece key={i} delay={d} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', width: 7, height: 10, borderRadius: 2, top: -10 },
});
