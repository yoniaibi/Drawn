import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSequence, withSpring, Easing, runOnJS,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import { MOCK_DRAWS, Draw } from '../../../src/mocks';
import PrizeWheel from '../../../src/components/PrizeWheel';
import { fetchDrawById } from '../../../src/services/draws';
import { useAuthStore } from '../../../src/store';
import { supabase } from '../../../src/lib/supabase';

const QUICK_REACTIONS = ['🔥', '💜', '😮', '🙏', '🎉', '🏆'];

function colorForHandle(handle: string) {
  const pool = [Colors.pink, Colors.gold, Colors.lilac, '#7DD3FC', '#86EFAC'];
  let hash = 0;
  for (const c of handle) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return pool[Math.abs(hash) % pool.length];
}

interface FloatingReaction { id: number; emoji: string; x: number; }

function FloatEmoji({ emoji, x, onDone }: { emoji: string; x: number; onDone: () => void }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 6, stiffness: 250 });
    translateY.value = withTiming(-160, { duration: 2000, easing: Easing.out(Easing.quad) });
    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 1200 }),
    );
    const t = setTimeout(() => runOnJS(onDone)(), 2000);
    return () => clearTimeout(t);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
    position: 'absolute',
    bottom: 0,
    left: x,
  }));

  return (
    <Animated.View style={style} pointerEvents="none">
      <Text style={{ fontSize: 32 }}>{emoji}</Text>
    </Animated.View>
  );
}

export default function LiveWheelScreen() {
  const { drawId } = useLocalSearchParams<{ drawId: string }>();
  const router = useRouter();
  const { handle: myHandle } = useAuthStore();

  const [draw, setDraw] = useState<Draw>(MOCK_DRAWS.find(d => d.id === drawId) ?? MOCK_DRAWS[0]);
  const [phase, setPhase] = useState<'spinning' | 'slowing' | 'done'>('spinning');
  const [viewers, setViewers] = useState(312);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const floatIdRef = useRef(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Pulse for live dot
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.in(Easing.ease) }),
      ), -1,
    );
  }, []);
  const pulseDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 1 - (pulseScale.value - 1) / 0.8 * 0.7,
  }));

  // Fetch draw
  useEffect(() => {
    if (!drawId) return;
    fetchDrawById(drawId).then(d => { if (d) setDraw(d); });
  }, [drawId]);

  // Spin → slow → winner
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('slowing'), 4000);
    const t2 = setTimeout(() => {
      setPhase('done');
      router.replace(`/live/winner/${drawId}`);
    }, 6500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [drawId]);

  // Viewer drift
  useEffect(() => {
    const id = setInterval(() => setViewers(v => Math.max(200, v + Math.floor(Math.random() * 9) - 4)), 3000);
    return () => clearInterval(id);
  }, []);

  // ── Supabase Realtime broadcast — same channel as live tab ─────────────────
  useEffect(() => {
    const channel = supabase.channel('drawn-live-chat', {
      config: { broadcast: { self: true } },
    });

    channel
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        const emoji = payload.emoji ?? '🔥';
        const x = 30 + Math.random() * 220;
        setFloatingReactions(prev => [...prev, { id: floatIdRef.current++, emoji, x }]);
      })
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { handle: myHandle ?? '@you', emoji },
    });
  }, [myHandle]);

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.close} onPress={() => router.back()}>
        <Ionicons name="close" size={22} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>

      {/* Live badge + viewer count */}
      <View style={styles.liveRow}>
        <View style={styles.pulseWrap}>
          <Animated.View style={[styles.pulseDot, pulseDotStyle]} />
          <View style={styles.dotCore} />
        </View>
        <Text style={styles.liveText}>LIVE NOW</Text>
        <View style={styles.viewerChip}>
          <Ionicons name="eye" size={9} color={Colors.textSecondary} />
          <Text style={styles.viewerNum}>{viewers.toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.title}>{draw.title}</Text>
      <Text style={styles.sub}>{draw.seller} · {draw.ticketsSold.toLocaleString()} tickets in the draw</Text>

      {/* Wheel */}
      <View style={styles.wheelWrap}>
        <PrizeWheel spinning={phase === 'spinning'} size={260} />
        {phase === 'slowing' && (
          <Text style={styles.slowing}>Picking the winner…</Text>
        )}
      </View>

      {/* Prize row */}
      <View style={styles.prizeRow}>
        <View style={styles.prizeIcon}>
          {draw.image
            ? <Image source={{ uri: draw.image }} style={styles.prizeImg} />
            : <Ionicons name="gift-outline" size={28} color={Colors.lilac} />}
        </View>
        <View style={styles.prizeInfo}>
          <Text style={styles.prizeTitle}>{draw.title}</Text>
          <Text style={styles.prizeSub}>£{draw.retailValue.toLocaleString()} prize · {draw.ticketPrice}p per ticket</Text>
        </View>
        {draw.myTickets > 0 && (
          <View style={styles.youBadge}>
            <Text style={styles.youText}>You: {draw.myTickets}</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.counters}>
        <View style={styles.counter}>
          <Text style={styles.counterVal}>{viewers.toLocaleString()}</Text>
          <Text style={styles.counterLabel}>watching</Text>
        </View>
        <View style={styles.counter}>
          <Text style={styles.counterVal}>{draw.ticketsSold.toLocaleString()}</Text>
          <Text style={styles.counterLabel}>tickets</Text>
        </View>
        <View style={styles.counter}>
          <Text style={[styles.counterVal, { color: Colors.gold }]}>
            £{draw.retailValue.toLocaleString()}
          </Text>
          <Text style={styles.counterLabel}>prize value</Text>
        </View>
      </View>

      {/* Reaction buttons */}
      <View style={styles.reactionsWrap}>
        {/* Floating layer */}
        <View style={styles.floatLayer} pointerEvents="none">
          {floatingReactions.map(r => (
            <FloatEmoji
              key={r.id}
              emoji={r.emoji}
              x={r.x}
              onDone={() => setFloatingReactions(prev => prev.filter(f => f.id !== r.id))}
            />
          ))}
        </View>

        <Text style={styles.reactLabel}>React with everyone</Text>
        <View style={styles.reactionRow}>
          {QUICK_REACTIONS.map(e => (
            <TouchableOpacity
              key={e}
              style={styles.reactionBtn}
              onPress={() => sendReaction(e)}
              activeOpacity={0.55}
            >
              <Text style={styles.reactionEmoji}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.violet, paddingHorizontal: Spacing.lg, paddingTop: 56 },
  close: { position: 'absolute', top: 56, right: Spacing.lg, zIndex: 10 },

  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 7, justifyContent: 'center', marginBottom: 8 },
  pulseWrap: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  pulseDot: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.pink },
  dotCore: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.pink },
  liveText: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.pink, letterSpacing: 1.2 },
  viewerChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.pill,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  viewerNum: { fontSize: 9, color: Colors.textSecondary, fontWeight: '600' },

  title: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white, textAlign: 'center' },
  sub: { fontSize: FontSizes.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: 2, marginBottom: 4 },

  wheelWrap: { alignItems: 'center', paddingVertical: Spacing.sm, position: 'relative' },
  slowing: { position: 'absolute', bottom: Spacing.sm, fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '700' },

  prizeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.royal, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10,
  },
  prizeIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  prizeImg: { width: 44, height: 44, borderRadius: 10 },
  prizeInfo: { flex: 1 },
  prizeTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '700' },
  prizeSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  youBadge: { backgroundColor: Colors.pink, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  youText: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '700' },

  counters: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  counter: { flex: 1, backgroundColor: Colors.ink, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  counterVal: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '800' },
  counterLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  reactionsWrap: { position: 'relative' },
  floatLayer: { position: 'absolute', left: 0, right: 0, bottom: 60, height: 160, overflow: 'hidden' },
  reactLabel: { fontSize: 9, color: Colors.textTertiary, textAlign: 'center', marginBottom: 8, letterSpacing: 0.5 },
  reactionRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  reactionBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  reactionEmoji: { fontSize: 22 },
});
