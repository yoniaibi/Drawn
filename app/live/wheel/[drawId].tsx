import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import { MOCK_DRAWS } from '../../../src/mocks';
import PrizeWheel from '../../../src/components/PrizeWheel';

export default function LiveWheelScreen() {
  const { drawId } = useLocalSearchParams<{ drawId: string }>();
  const router = useRouter();
  const draw = MOCK_DRAWS.find(d => d.id === drawId) ?? MOCK_DRAWS[0];
  const [phase, setPhase] = useState<'spinning' | 'slowing' | 'done'>('spinning');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('slowing'), 4000);
    const t2 = setTimeout(() => {
      setPhase('done');
      router.replace(`/live/winner/${drawId}`);
    }, 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.close} onPress={() => router.back()}>
        <Ionicons name="close" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.liveRow}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE NOW</Text>
      </View>
      <Text style={styles.title}>{draw.title}</Text>
      <Text style={styles.sub}>{draw.seller} · {draw.ticketsSold.toLocaleString()} tickets</Text>

      <View style={styles.wheelWrap}>
        <PrizeWheel spinning={phase === 'spinning'} size={260} />
      </View>

      <View style={styles.prizeRow}>
        <View style={styles.prizeIcon}><Text style={styles.prizeEmoji}>{draw.emoji}</Text></View>
        <View style={styles.prizeInfo}>
          <Text style={styles.prizeTitle}>{draw.title}</Text>
          <Text style={styles.prizeSub}>{draw.seller}</Text>
        </View>
        {draw.myTickets > 0 && (
          <View style={styles.youBadge}>
            <Text style={styles.youText}>You: {draw.myTickets}</Text>
          </View>
        )}
      </View>

      <View style={styles.counters}>
        <View style={styles.counter}><Text style={styles.counterVal}>312</Text><Text style={styles.counterLabel}>watching</Text></View>
        <View style={styles.counter}><Text style={styles.counterVal}>{draw.ticketsSold.toLocaleString()}</Text><Text style={styles.counterLabel}>tickets</Text></View>
        <View style={styles.counter}><Text style={styles.counterVal}>{draw.totalTickets - draw.ticketsSold}</Text><Text style={styles.counterLabel}>to go</Text></View>
      </View>

      <View style={styles.reacts}>
        {['🔥', '💜', '😮', '🙏'].map(e => (
          <Text key={e} style={styles.react}>{e}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.violet, padding: Spacing.lg, paddingTop: 56 },
  close: { position: 'absolute', top: 56, right: Spacing.lg, zIndex: 10 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.pink },
  liveText: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.pink, letterSpacing: 1 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white, textAlign: 'center' },
  sub: { fontSize: FontSizes.xs, color: '#b9a8e8', textAlign: 'center', marginBottom: 8 },
  wheelWrap: { alignItems: 'center', paddingVertical: Spacing.md },
  prizeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.royal, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12,
  },
  prizeIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#F3EFFB', alignItems: 'center', justifyContent: 'center' },
  prizeEmoji: { fontSize: 22 },
  prizeInfo: { flex: 1 },
  prizeTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '700' },
  prizeSub: { fontSize: FontSizes.xs, color: '#b9a8e8', marginTop: 2 },
  youBadge: { backgroundColor: Colors.pink, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  youText: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '700' },
  counters: { flexDirection: 'row', gap: 8 },
  counter: { flex: 1, backgroundColor: Colors.ink, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  counterVal: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '800' },
  counterLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  reacts: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingTop: Spacing.md },
  react: { fontSize: 22 },
});
