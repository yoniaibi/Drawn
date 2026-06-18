import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated as RNAnimated, TextInput, KeyboardAvoidingView,
  Platform, Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSequence, Easing, withSpring, runOnJS,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_DRAWS, Draw } from '../../src/mocks';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import PrizeWheel from '../../src/components/PrizeWheel';
import { getCountdownTo9pm } from '../../src/utils/countdown';
import { fetchDraws } from '../../src/services/draws';
import { useAuthStore } from '../../src/store';
import { supabase } from '../../src/lib/supabase';

const HYPE_MESSAGES = [
  '@chloe_j is watching 👀',
  '@marcus just bought 5 more tickets',
  '12 new people joined in the last minute',
  '@priya__ is ready for tonight',
  'Threshold hit on Chanel draw! 🔥',
  '3 draws close in under 2 hours',
  '@dan.west going BIG tonight 🎯',
  'Rolex is 97% sold — last few tickets!',
  '@jade_m: omg I actually need that Chanel 😭',
  '✅ Draw confirmed — all thresholds met',
];

// Seed messages shown before any real chat arrives
const SEED_CHAT = [
  { handle: '@chloe_j', msg: 'omg I need that Chanel so bad 🙏', color: Colors.pink },
  { handle: '@marcus_t', msg: 'just bought 5 more on the Rolex 👀', color: Colors.gold },
  { handle: '@priya__', msg: 'my first time on here — this is insane', color: Colors.lilac },
  { handle: '@tom_w', msg: 'won a Jordan 1 last week btw 👟', color: Colors.gold },
];

const QUICK_REACTIONS = ['🔥', '❤️', '😍', '🏆', '💜', '🎉'];

// Handle colour pool for real users
const HANDLE_COLORS = [Colors.pink, Colors.gold, Colors.lilac, '#7DD3FC', '#86EFAC', '#FCA5A5'];
function colorForHandle(handle: string) {
  let hash = 0;
  for (const c of handle) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return HANDLE_COLORS[Math.abs(hash) % HANDLE_COLORS.length];
}

interface ChatMsg { id: number; handle: string; msg: string; color: string; isReal?: boolean; }
interface FloatingReaction { id: number; emoji: string; x: number; }

// Individual floating reaction that animates upward then disappears
function FloatEmoji({ emoji, x, onDone }: { emoji: string; x: number; onDone: () => void }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 200 });
    translateY.value = withTiming(-120, { duration: 1800, easing: Easing.out(Easing.quad) });
    opacity.value = withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 1000 }),
    );
    const t = setTimeout(() => runOnJS(onDone)(), 1800);
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
    <Animated.View style={style}>
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
    </Animated.View>
  );
}

export default function LiveScreen() {
  const router = useRouter();
  const { handle: myHandle } = useAuthStore();

  const [time, setTime] = useState(getCountdownTo9pm());
  const [viewerCount, setViewerCount] = useState(1247);
  const [hypeIdx, setHypeIdx] = useState(0);
  const hypeOpacity = useRef(new RNAnimated.Value(1)).current;

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>(
    SEED_CHAT.map((m, i) => ({ ...m, id: i }))
  );
  const chatRef = useRef<ScrollView>(null);
  const msgIdRef = useRef(100);

  const [inputText, setInputText] = useState('');
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const floatIdRef = useRef(0);
  const reactionAreaRef = useRef<View>(null);

  const [allDraws, setAllDraws] = useState<Draw[]>(MOCK_DRAWS);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    fetchDraws().then(d => setAllDraws(d));
  }, []);

  const tonightDraws = allDraws.filter(d => d.status === 'closing_tonight');

  // ── Supabase Realtime broadcast channel ────────────────────────────────────
  useEffect(() => {
    const channel = supabase.channel('drawn-live-chat', {
      config: { broadcast: { self: true } },
    });

    channel
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        const msg: ChatMsg = {
          id: msgIdRef.current++,
          handle: payload.handle ?? '@anon',
          msg: payload.msg ?? '',
          color: colorForHandle(payload.handle ?? ''),
          isReal: true,
        };
        setChatMessages(prev => [...prev.slice(-30), msg]);
        setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 50);
      })
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        const emoji = payload.emoji ?? '🔥';
        const x = 20 + Math.random() * 180;
        setFloatingReactions(prev => [...prev, { id: floatIdRef.current++, emoji, x }]);
        // Also pop a chat message for big reactions
        if (Math.random() < 0.3) {
          const msg: ChatMsg = {
            id: msgIdRef.current++,
            handle: payload.handle ?? '@anon',
            msg: emoji,
            color: colorForHandle(payload.handle ?? ''),
            isReal: true,
          };
          setChatMessages(prev => [...prev.slice(-30), msg]);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, []);

  // ── Send chat ───────────────────────────────────────────────────────────────
  const sendChat = useCallback(() => {
    const text = inputText.trim();
    if (!text || !channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'chat',
      payload: { handle: myHandle ?? '@you', msg: text },
    });
    setInputText('');
    Keyboard.dismiss();
  }, [inputText, myHandle]);

  // ── Send emoji reaction ─────────────────────────────────────────────────────
  const sendReaction = useCallback((emoji: string) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { handle: myHandle ?? '@you', emoji },
    });
  }, [myHandle]);

  // ── Pulse animation ─────────────────────────────────────────────────────────
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 700, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.in(Easing.ease) }),
      ), -1,
    );
    pulseOpacity.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 700 }), withTiming(1, { duration: 700 })), -1,
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

  // Viewer count drift
  useEffect(() => {
    const base = Math.max(800, tonightDraws.reduce((s, d) => s + d.ticketsSold, 0));
    setViewerCount(Math.round(base * 0.08 + 100));
    const id = setInterval(() => setViewerCount(v => Math.max(800, v + Math.floor(Math.random() * 5) - 2)), 4000);
    return () => clearInterval(id);
  }, [tonightDraws.length]);

  // Hype ticker
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Wheel */}
          <View style={styles.wheelWrap}>
            <PrizeWheel spinning={isPast9} size={240} />
            {!isPast9 && (
              <View style={styles.wheelOverlay}>
                <Text style={styles.wheelOverlayText}>Draw starts in</Text>
              </View>
            )}
          </View>

          {/* Countdown or live button */}
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

          {/* ── Live chat + reactions ── */}
          <View style={styles.chatBox}>
            <View style={styles.chatHeader}>
              <View style={styles.chatDot} />
              <Text style={styles.chatLabel}>LIVE CHAT</Text>
              <Text style={styles.chatCount}>{viewerCount.toLocaleString()} watching</Text>
            </View>

            {/* Chat feed */}
            <ScrollView
              ref={chatRef}
              style={styles.chatScroll}
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.map(m => (
                <View key={m.id} style={styles.chatRow}>
                  <Text style={[styles.chatHandle, { color: m.color }]}>{m.handle}</Text>
                  <Text style={styles.chatMsg}>{m.msg}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Floating reactions layer */}
            <View style={styles.reactionFloatArea} pointerEvents="none">
              {floatingReactions.map(r => (
                <FloatEmoji
                  key={r.id}
                  emoji={r.emoji}
                  x={r.x}
                  onDone={() => setFloatingReactions(prev => prev.filter(f => f.id !== r.id))}
                />
              ))}
            </View>

            {/* Quick reaction row */}
            <View style={styles.reactionRow}>
              {QUICK_REACTIONS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={styles.reactionBtn}
                  onPress={() => sendReaction(e)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.reactionEmoji}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Chat input */}
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Say something…"
                placeholderTextColor={Colors.textTertiary}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={sendChat}
                returnKeyType="send"
                maxLength={120}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                onPress={sendChat}
                disabled={!inputText.trim()}
              >
                <Ionicons name="send" size={15} color={inputText.trim() ? Colors.white : Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tonight's draws */}
          <Text style={styles.sectionLabel}>TONIGHT'S DRAWS</Text>

          {tonightDraws.length === 0 && (
            <View style={styles.noDrawsCard}>
              <Text style={styles.noDrawsEmoji}>🌙</Text>
              <Text style={styles.noDrawsTitle}>No draws tonight</Text>
              <Text style={styles.noDrawsSub}>New draws go live every evening. Check back soon — something good is always on the way.</Text>
            </View>
          )}

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
    </KeyboardAvoidingView>
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

  // ── Chat box ──────────────────────────────────────────────────────────────
  chatBox: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.darkBorder,
    backgroundColor: 'rgba(139,92,246,0.06)',
  },
  chatDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },
  chatLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.8, flex: 1 },
  chatCount: { fontSize: 9, color: Colors.textTertiary },
  chatScroll: { maxHeight: 150, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  chatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6, alignItems: 'flex-start' },
  chatHandle: { fontSize: FontSizes.xs, fontWeight: '700' },
  chatMsg: { fontSize: FontSizes.xs, color: Colors.textSecondary, flex: 1 },

  // Floating reactions layer
  reactionFloatArea: {
    position: 'absolute', left: 0, right: 0, bottom: 100, height: 140,
    overflow: 'hidden',
  },

  // Quick reaction buttons
  reactionRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 8,
    gap: 4, borderTopWidth: 1, borderTopColor: Colors.darkBorder,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  reactionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 5,
    backgroundColor: Colors.darkBg, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.darkBorder,
  },
  reactionEmoji: { fontSize: 18 },

  // Text input row
  chatInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.sm, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: Colors.darkBorder,
  },
  chatInput: {
    flex: 1, backgroundColor: Colors.darkBg, borderRadius: Radius.md,
    paddingHorizontal: 12, paddingVertical: 8,
    fontSize: FontSizes.sm, color: Colors.white,
    borderWidth: 1, borderColor: Colors.darkBorder,
    maxHeight: 60,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.lilac, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.darkBg, borderWidth: 1, borderColor: Colors.darkBorder },

  // Tonight's draws
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

  noDrawsCard: { alignItems: 'center', padding: Spacing.xl, marginHorizontal: Spacing.lg, gap: 8 },
  noDrawsEmoji: { fontSize: 40, marginBottom: 4 },
  noDrawsTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  noDrawsSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },

  legalNote: { padding: Spacing.lg, alignItems: 'center' },
  legalText: { fontSize: 9, color: Colors.textTertiary, textAlign: 'center', lineHeight: 14 },
});
