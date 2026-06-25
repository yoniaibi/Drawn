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
      .on('broadcast', { event: 'reaction' }, ({ payload }: { payload: any }) => {
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
            : <Ionicons name="gift-outline" size={28} color={Colors.gold} />}
        </View>
        <View style={styles.prizeInfo}>
          <Text style={styles.prizeTitle}>{draw.title}</Text>
          <Text style={styles.prizeSub}>{draw.ticketPrice}p per ticket</Text>
        </View>
        <View style={styles.prizeValueBox}>
          <Text style={styles.prizeValueLabel}>VALUE</Text>
          <Text style={styles.prizeValue}>£{draw.retailValue.toLocaleString()}</Text>
        </View>
        {draw.myTickets > 0 && (
          <View style={styles.youBadge}>
            <Text style={styles.youText}>🎟 {draw.myTickets}</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.counters}>
        <View style={[styles.counter, styles.counterPink]}>
          <View style={styles.counterIcon}>
            <Ionicons name="eye" size={14} color={Colors.pink} />
          </View>
          <Text style={[styles.counterVal, { color: Colors.pink }]}>{viewers.toLocaleString()}</Text>
          <Text style={styles.counterLabel}>watching</Text>
        </View>
        <View style={[styles.counter, styles.counterLilac]}>
          <View style={styles.counterIcon}>
            <Ionicons name="ticket" size={14} color={Colors.lilac} />
          </View>
          <Text style={[styles.counterVal, { color: Colors.lilac }]}>{draw.ticketsSold.toLocaleString()}</Text>
          <Text style={styles.counterLabel}>tickets</Text>
        </View>
        <View style={[styles.counter, styles.counterGold]}>
          <View style={styles.counterIcon}>
            <Ionicons name="trophy" size={14} color={Colors.gold} />
          </View>
          <Text style={[styles.counterVal, { color: Colors.gold }]}>
            £{draw.retailValue.toLocaleString()}
          </Text>
          <Text style={styles.counterLabel}>prize</Text>
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

        <Text style={styles.reactLabel}>React live with everyone</Text>
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
    backgroundColor: 'rgba(249,200,70,0.06)', borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.25)',
  },
  prizeIcon: { width: 52, height: 52, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)' },
  prizeImg: { width: 52, height: 52, borderRadius: 12 },
  prizeInfo: { flex: 1 },
  prizeTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '700' },
  prizeSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  prizeValueBox: { alignItems: 'flex-end' },
  prizeValueLabel: { fontSize: 8, color: Colors.gold, letterSpacing: 0.8, fontWeight: '700', opacity: 0.7 },
  prizeValue: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.gold },
  youBadge: { position: 'absolute', top: -8, right: 8, backgroundColor: Colors.pink, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  youText: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '700' },

  counters: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  counter: { flex: 1, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', gap: 2, borderWidth: 1 },
  counterPink: { backgroundColor: 'rgba(244,114,182,0.08)', borderColor: 'rgba(244,114,182,0.2)' },
  counterLilac: { backgroundColor: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.2)' },
  counterGold: { backgroundColor: 'rgba(249,200,70,0.08)', borderColor: 'rgba(249,200,70,0.2)' },
  counterIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  counterVal: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '800' },
  counterLabel: { fontSize: 9, color: Colors.textTertiary },

  reactionsWrap: { position: 'relative' },
  floatLayer: { position: 'absolute', left: 0, right: 0, bottom: 60, height: 160, overflow: 'hidden' },
  reactLabel: { fontSize: 9, color: Colors.textTertiary, textAlign: 'center', marginBottom: 8, letterSpacing: 0.8, textTransform: 'uppercase' },
  reactionRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  reactionBtn: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  reactionEmoji: { fontSize: 24 },
});
