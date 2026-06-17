import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_DRAWS } from '../../src/mocks';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import PrizeWheel from '../../src/components/PrizeWheel';
import { getCountdownTo9pm } from '../../src/utils/countdown';

export default function LiveScreen() {
  const router = useRouter();
  const [time, setTime] = useState(getCountdownTo9pm());
  const tonightDraws = MOCK_DRAWS.filter(d => d.status === 'closing_tonight');

  useEffect(() => {
    const id = setInterval(() => setTime(getCountdownTo9pm()), 1000);
    return () => clearInterval(id);
  }, []);

  const isPast9 = parseInt(time.h) === 0 && parseInt(time.m) < 5;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.liveRow}>
          <View style={[styles.dot, { backgroundColor: Colors.pink }]} />
          <Text style={styles.liveLabel}>{isPast9 ? 'LIVE NOW' : 'TONIGHT'}</Text>
        </View>
        <Text style={styles.heading}>The 9pm Draw</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Wheel preview */}
        <View style={styles.wheelWrap}>
          <PrizeWheel spinning={isPast9} size={240} />
        </View>

        {/* Countdown or live */}
        {!isPast9 ? (
          <View style={styles.countdownCard}>
            <Text style={styles.countdownLabel}>Draw starts in</Text>
            <View style={styles.countdownRow}>
              <Text style={styles.cdNum}>{time.h}</Text>
              <Text style={styles.cdColon}>:</Text>
              <Text style={styles.cdNum}>{time.m}</Text>
              <Text style={styles.cdColon}>:</Text>
              <Text style={styles.cdNum}>{time.s}</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.watchLive} onPress={() => router.push(`/live/wheel/${tonightDraws[0]?.id}`)}>
            <Text style={styles.watchLiveText}>Watch Live Now →</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionLabel}>TONIGHT'S DRAWS</Text>
        {tonightDraws.map((draw, i) => (
          <TouchableOpacity
            key={draw.id}
            style={styles.drawRow}
            onPress={() => router.push(`/live/wheel/${draw.id}`)}
          >
            <Text style={styles.drawNum}>{i + 1}</Text>
            <Text style={styles.drawEmoji}>{draw.emoji}</Text>
            <View style={styles.drawInfo}>
              <Text style={styles.drawTitle}>{draw.title}</Text>
              <Text style={styles.drawSub}>{draw.seller} · {draw.ticketsSold.toLocaleString()} tickets</Text>
            </View>
            {draw.myTickets > 0 && (
              <View style={styles.youBadge}>
                <Text style={styles.youText}>You: {draw.myTickets}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 99 },
  liveLabel: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.pink, letterSpacing: 1 },
  heading: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white },
  scroll: { paddingBottom: 40 },
  wheelWrap: { alignItems: 'center', paddingVertical: Spacing.lg },
  countdownCard: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.lg,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, alignItems: 'center',
  },
  countdownLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 8, letterSpacing: 0.5 },
  countdownRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  cdNum: { fontFamily: Fonts.serif, fontSize: 40, color: Colors.white, lineHeight: 42 },
  cdColon: { fontSize: 30, color: Colors.lilac, fontWeight: '700' },
  watchLive: {
    backgroundColor: Colors.pink, borderRadius: Radius.md, padding: 14,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, alignItems: 'center',
  },
  watchLiveText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.base },
  sectionLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, letterSpacing: 0.8, paddingHorizontal: Spacing.lg, marginBottom: 8 },
  drawRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.darkBorder,
  },
  drawNum: { fontSize: FontSizes.sm, color: Colors.textTertiary, width: 20, textAlign: 'right' },
  drawEmoji: { fontSize: 22 },
  drawInfo: { flex: 1 },
  drawTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  drawSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  youBadge: { backgroundColor: Colors.pink, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  youText: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '700' },
});
