import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontSizes, Radius, Spacing } from '../theme';

const ACTIVITIES = [
  { handle: '@chloe_j', action: 'bought 10 tickets', item: 'Chanel Flap 👜' },
  { handle: '@dan.west', action: 'grabbed 5 tickets', item: 'Rolex Submariner ⌚' },
  { handle: '@priya__', action: 'added 15 tickets', item: 'Designer Closet 👗' },
  { handle: '@marcus_t', action: 'just joined', item: 'Rolex Submariner ⌚' },
  { handle: '@sophie_r', action: 'bought 8 tickets', item: 'MacBook Pro 💻' },
  { handle: '@ryan.k', action: 'grabbed 20 tickets', item: 'Chanel Flap 👜' },
  { handle: '@jade_m', action: 'added 3 tickets', item: 'Jordan 1 OG 👟' },
  { handle: '@tom_w', action: 'bought 12 tickets', item: 'Designer Closet 👗' },
  { handle: '@ellie.b', action: 'just entered', item: 'MacBook Pro 💻' },
  { handle: '@kian_j', action: 'grabbed 6 tickets', item: 'Rolex Submariner ⌚' },
];

export default function PurchaseToast() {
  const [visible, setVisible] = useState(false);
  const [activity, setActivity] = useState(ACTIVITIES[0]);
  const slideY = useRef(new Animated.Value(-70)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    const pick = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
    setActivity(pick);
    setVisible(true);

    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideY, { toValue: -70, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }, 3800);
  }, []);

  useEffect(() => {
    const schedule = () => {
      const delay = 7000 + Math.random() * 9000; // 7–16s between toasts
      timerId.current = setTimeout(() => {
        show();
        schedule();
      }, delay);
    };

    // First toast after 5s
    timerId.current = setTimeout(() => {
      show();
      schedule();
    }, 5000);

    return () => { if (timerId.current) clearTimeout(timerId.current); };
  }, [show]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: slideY }], opacity }]}>
      <View style={styles.dot} />
      <Text style={styles.text} numberOfLines={1}>
        <Text style={styles.handle}>{activity.handle}</Text>
        {' '}{activity.action} · {activity.item}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 56,
    left: 12,
    right: 12,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(20,15,40,0.96)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.pink,
  },
  text: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  handle: {
    color: Colors.white,
    fontWeight: '700',
  },
});
