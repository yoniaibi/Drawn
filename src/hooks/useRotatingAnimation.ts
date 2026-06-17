import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

export function useRotatingAnimation<T>(items: T[], intervalMs = 3000) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setIndex(i => (i + 1) % items.length);
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [items.length, intervalMs]);

  return { current: items[index], index, opacity };
}
