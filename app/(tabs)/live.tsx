import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_DRAWS } from '../../src/mocks';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import PrizeWheel from '../../src/components/PrizeWheel';
import { getCountdownTo9pm } from '../../src/utils/countdown';

const VIEWERS = [1247, 1253, 1241, 1258, 1264, 1249];

const HYPE_MESSAGES = [
  '@chloe_j is watching 👀',
  '@marcus just bought 5 more tickets',
  '12 new people joined in the last minute',
  '@priya__ is ready for tonight',
  'Threshold hit on Chanel draw! 🔥',
  '3 draws close in under 2 hours',
];

export default function LiveScreen() {
  const router = useRouter();
  const [time, setTime] = useState(getCountdownTo9pm());
  const [viewerCount, setViewerCount] = useState(VIEWERS[0]);
  const [hypeIdx, setHypeIdx] = useState(0);
  const hypeOpacity = useRef(new RNAnimated.Value(1)).current;

  const tonightDraws = MOCK_DRAWS.filter(d => d.status === 'closing_tonight');

  // Pulse animation for live dot
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 700, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.in(Easing.ease) }),
      ),
      -1,
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1,
    );
  }, []);

  const pulseDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  useEffect(() => {
    const id = setInterval(() => setTime(getCountdownTo9pm()), 1000);
    return () => clearInterval(id);
  }, []);

  // Rotate viewer count
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % VIEWERS.length;
      setViewerCount(VIEWERS[i]);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Rotate hype messages
  useEffect(() => {
    const id = setInterval(() => {
      RNAnimated.timing(hypeOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setHypeIdx(i => (i + 1) % HYPE_MESSAGES.length);
        RNAnimated.timing(hypeOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const isPast9 = parseInt(time.h) === 0 && parseInt(time.m) < 5;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.liveRow}>
          <View style={styles.pulseContainer}>
            <Animated.View style={[styles.pulseDot, pulseDotStyle]} />
            <View style={styles.dotCore} />
          </View>
          <Text style={styles.liveLabel}>{isPast9 ? 'LIVE NOW' : 'TONIGHT AT 9PM'}</Text>
          <View style={styles.viewersBadge}>
            <Ionicons name="eye" size={10} color={Colors.textSecondary} />
            <Text style={styles.viewersText}>{viewerCount.toLocaleString()}</Text>
          </View>
        </View>
        <Text style={styles.heading}>The 9pm Draw</Text>
        <RNAnimated.Text style={[styles.hypeMsg, { opacity: hypeOpacity }]} numberOfLines={1}>
          {HYPE_MESSAGES[hypeIdx]}
        </RNAnimated.Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Wheel preview */}
        <View style={styles.wheelWrap}>
          <PrizeWheel spinning={isPast9} size={240} />
          {!isPast9 && (
            <View style={styles.wheelOverlay}>
              <Text style={styles.wheelOverlayText}>Draw starts in</Text>
            </View>
          )}
        </View>

        {/* Countdown or live */}
        {!isPast9 ? (
          <View style={styles.countdownCard}>
            <View style={styles.countdownRow}>
              <View style={styles.cdBlock}>
                <Text style={styles.cdNum}>{time.h}</Text>
                <Text style={styles.cdLabel}>hrs</Text>
              </View>
              <Text style={styles.cdColon}>:</Text>
              <View style={styles.cdBlock}>
                <Text style={styles.cdNum}>{time.m}</Text>
                <Text style={styles.cdLabel}>min</Text>
              </View>
              <Text style={styles.cdColon}>:</Text>
              <View style={styles.cdBlock}>
                <Text style={styles.cdNum}>{time.s}</Text>
                <Text style={styles.cdLabel}>sec</Text>
              </View>
            </View>
            <Text style={styles.urgencyNote}>
              ⚡ {tonightDraws.length} draws · Don't miss the reveal
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.watchLive} onPress={() => router.push(`/live/wheel/${tonightDraws[0]?.id}`)}>
            <Ionicons name="radio" size={18} color={Colors.white} />
            <Text style={styles.watchLiveText}>Watch Live Now</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.white} />
          </TouchableOpacity>
        )}

        {/* Tonight's draws */}
        <Text style={styles.sectionLabel}>TONIGHT'S DRAWS</Text>

        {tonightDraws.map((draw, i) => {
          const remaining = draw.totalTickets - draw.ticketsSold;
          const valueRatio = `${draw.ticketPrice}p → £${draw.retailValue.toLocaleString()}`;
          return (
            <TouchableOpacity
              key={draw.id}
              style={styles.drawRow}
              onPress={() => router.push(`/live/wheel/${draw.id}`)}
            >
              <View style={styles.drawNumBox}>
                <Text style={styles.drawNum}>{i + 1}</Text>
              </View>
              <Text style={styles.drawEmoji}>{draw.emoji}</Text>
              <View style={styles.drawInfo}>
                <Text style={styles.drawTitle}>{draw.title}</Text>
                <Text style={styles.drawSub}>{draw.seller} · {draw.ticketsSold.toLocaleString()} tickets</Text>
                <Text style={styles.drawValueRatio}>{valueRatio}</Text>
              </View>
              <View style={styles.drawRight}>
                {draw.myTickets > 0 && (
                  <View style={styles.youBadge}>
                    <Text style={styles.youText}>You: {draw.myTickets}</Text>
                  </View>
                )}
                {remaining < 200 && (
                  <Text style={styles.scarceText}>{remaining} left!</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.legalNote}>
          <Text style={styles.legalText}>All draws are independently verified · Free postal entry available</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  pulseContainer: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  pulseDot: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.pink },
  dotCore: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.pink },
  liveLabel: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.pink, letterSpacing: 1, flex: 1 },
  viewersBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.darkCard, borderRadius: Radius.pill,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  viewersText: { fontSize: 9, color: Colors.textSecondary, fontWeight: '600' },
  heading: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 4 },
  hypeMsg: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontStyle: 'italic' },

  scroll: { paddingBottom: 40 },
  wheelWrap: { alignItems: 'center', paddingVertical: Spacing.lg, position: 'relative' },
  wheelOverlay: { position: 'absolute', bottom: Spacing.lg + 4 },
  wheelOverlayText: { fontSize: FontSizes.xs, color: Colors.textTertiary, textAlign: 'center' },

  countdownCard: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.lg,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.darkBorder,
  },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cdBlock: { alignItems: 'center' },
  cdNum: { fontFamily: Fonts.serif, fontSize: 44, color: Colors.white, lineHeight: 46 },
  cdLabel: { fontSize: 9, color: Colors.textTertiary, marginTop: 2 },
  cdColon: { fontSize: 32, color: Colors.lilac, fontWeight: '700', lineHeight: 50 },
  urgencyNote: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '600' },

  watchLive: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.pink, borderRadius: Radius.md, padding: 14,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
  },
  watchLiveText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.base, flex: 1, textAlign: 'center' },

  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, letterSpacing: 0.8, paddingHorizontal: Spacing.lg, marginBottom: 8, fontWeight: '700' },
  drawRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.darkBorder,
  },
  drawNumBox: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.darkCard, alignItems: 'center', justifyContent: 'center' },
  drawNum: { fontSize: FontSizes.xs, color: Colors.textTertiary, fontWeight: '700' },
  drawEmoji: { fontSize: 26 },
  drawInfo: { flex: 1 },
  drawTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  drawSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 1 },
  drawValueRatio: { fontSize: 9, color: Colors.gold, fontWeight: '600', marginTop: 2 },
  drawRight: { alignItems: 'flex-end', gap: 4 },
  youBadge: { backgroundColor: Colors.pink, borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  youText: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '700' },
  scarceText: { fontSize: 9, color: Colors.danger, fontWeight: '700' },

  legalNote: { padding: Spacing.lg, alignItems: 'center' },
  legalText: { fontSize: 9, color: Colors.textTertiary, textAlign: 'center', lineHeight: 14 },
});
