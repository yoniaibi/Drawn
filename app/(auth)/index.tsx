import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated as RNAnimated,
  TouchableOpacity, useWindowDimensions, Image, ImageBackground, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import TicketLogo from '../../src/components/TicketLogo';
import PrimaryButton from '../../src/components/PrimaryButton';
import GhostButton from '../../src/components/GhostButton';
import { getCountdownTo9pm } from '../../src/utils/countdown';
import { requestNotificationPermission } from '../../src/services/notifications';

// Curated luxury item images — always load reliably
const HERO_ITEMS = [
  {
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
    label: 'Chanel Classic Flap', price: '25p', value: '£2,400',
    bg: 'rgba(180,100,160,0.55)', icon: '👜',
  },
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    label: 'Rolex Submariner', price: '50p', value: '£8,500',
    bg: 'rgba(80,120,160,0.55)', icon: '⌚',
  },
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    label: 'Air Jordan 1', price: '10p', value: '£450',
    bg: 'rgba(200,80,80,0.55)', icon: '👟',
  },
  {
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80',
    label: 'Tennis Bracelet', price: '25p', value: '£1,200',
    bg: 'rgba(100,180,200,0.55)', icon: '💎',
  },
  {
    image: 'https://images.unsplash.com/photo-1614179924047-e1ab49a0a0cf?auto=format&fit=crop&w=400&q=80',
    label: 'Bottega Veneta', price: '25p', value: '£1,800',
    bg: 'rgba(160,140,80,0.55)', icon: '👛',
  },
  {
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=400&q=80',
    label: 'Nike Tech Bundle', price: '10p', value: '£380',
    bg: 'rgba(80,160,120,0.55)', icon: '🧥',
  },
];

const RECENT_WINS = [
  { handle: '@sophie_k', item: 'Chanel Classic Flap', ticketPrice: 25, retailValue: 2400, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=120&q=80' },
  { handle: '@dan.west', item: 'Rolex Submariner', ticketPrice: 50, retailValue: 8500, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=120&q=80' },
  { handle: '@chloe_j', item: 'Designer Closet Bundle', ticketPrice: 40, retailValue: 1800, image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=120&q=80' },
];

const HOW_IT_WORKS = [
  { icon: 'ticket-outline' as const, title: 'Buy a ticket', sub: 'From 10p per ticket. No subscription.' },
  { icon: 'time-outline' as const, title: 'Draw at 9pm', sub: 'Every night. Winner chosen at random.' },
  { icon: 'gift-outline' as const, title: 'Win & receive', sub: 'We ship straight to you, tracked & insured.' },
];

export default function SplashScreen() {
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();
  const [time, setTime] = useState(getCountdownTo9pm());
  const [starting, setStarting] = useState(false);
  const [winnerIdx, setWinnerIdx] = useState(0);
  const winnerOpacity = useRef(new RNAnimated.Value(1)).current;
  const heroScale = useRef(new RNAnimated.Value(1)).current;

  const tileW = (screenW - Spacing.lg * 2 - 8) / 3;

  useEffect(() => {
    const id = setInterval(() => setTime(getCountdownTo9pm()), 1000);
    return () => clearInterval(id);
  }, []);

  // Subtle pulse on hero grid
  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(heroScale, { toValue: 1.015, duration: 4000, useNativeDriver: false }),
        RNAnimated.timing(heroScale, { toValue: 1, duration: 4000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  // Rotate winner card
  useEffect(() => {
    const id = setInterval(() => {
      RNAnimated.timing(winnerOpacity, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
        setWinnerIdx(i => (i + 1) % RECENT_WINS.length);
        RNAnimated.timing(winnerOpacity, { toValue: 1, duration: 300, useNativeDriver: false }).start();
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  async function handleGetStarted() {
    setStarting(true);
    await requestNotificationPermission();
    router.push('/(auth)/sign-up');
    setStarting(false);
  }

  const win = RECENT_WINS[winnerIdx];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <View style={styles.logoRow}>
        <TicketLogo size="lg" />
      </View>

      {/* ── Headline ─────────────────────────────────────────────────── */}
      <Text style={styles.headline}>Win designer things{'\n'}for pennies.</Text>
      <Text style={styles.sub}>
        Real luxury. Verified sellers. Every night at 9pm.
      </Text>

      {/* ── Live countdown pill ──────────────────────────────────────── */}
      <View style={styles.countdownPill}>
        <View style={styles.pulseDot} />
        <Text style={styles.countdownLabel}>Next draw closes in</Text>
        <Text style={styles.countdownTime}>
          {time.h}:{time.m}:{time.s}
        </Text>
      </View>

      {/* ── Item grid ────────────────────────────────────────────────── */}
      <View style={styles.grid}>
        {HERO_ITEMS.map((item, i) => (
          <RNAnimated.View
            key={item.label}
            style={[styles.gridTile, { width: tileW, height: tileW * 1.25, backgroundColor: item.bg }, { transform: [{ scale: heroScale }] }]}
          >
            {/* Fallback icon — shows behind image when it fails */}
            <View style={styles.gridFallback}>
              <Text style={styles.gridFallbackIcon}>{item.icon}</Text>
              <Text style={styles.gridFallbackLabel} numberOfLines={1}>{item.label}</Text>
            </View>
            <Image
              source={{ uri: item.image }}
              style={styles.gridImage}
              resizeMode="cover"
            />
            {/* Gradient overlay */}
            <View style={styles.gridOverlay} />
            {/* Price badge */}
            <View style={styles.gridPriceBadge}>
              <Text style={styles.gridPrice}>{item.price}</Text>
            </View>
            {/* Value */}
            <View style={styles.gridBottom}>
              <Text style={styles.gridValue}>{item.value}</Text>
            </View>
          </RNAnimated.View>
        ))}
      </View>

      <Text style={styles.gridCaption}>
        Tickets from 10p · Retail value guaranteed
      </Text>

      {/* ── Recent winner card ───────────────────────────────────────── */}
      <RNAnimated.View style={[styles.winnerCard, { opacity: winnerOpacity }]}>
        <View style={styles.winnerHeader}>
          <View style={styles.winnerDot} />
          <Text style={styles.winnerHeaderLabel}>LATEST WIN</Text>
          <View style={styles.winnerDots}>
            {RECENT_WINS.map((_, i) => (
              <View key={i} style={[styles.winnerDotSmall, i === winnerIdx && styles.winnerDotActive]} />
            ))}
          </View>
        </View>
        <View style={styles.winnerBody}>
          <Image source={{ uri: win.image }} style={styles.winnerImg} resizeMode="cover" />
          <View style={styles.winnerMeta}>
            <Text style={styles.winnerHandle}>{win.handle}</Text>
            <Text style={styles.winnerItem} numberOfLines={1}>{win.item}</Text>
            <View style={styles.winnerPriceRow}>
              <Text style={styles.winnerPaid}>{win.ticketPrice}p ticket</Text>
              <Text style={styles.winnerArrow}>→</Text>
              <Text style={styles.winnerValue}>£{win.retailValue.toLocaleString()} prize</Text>
            </View>
          </View>
          <View style={styles.winnerMultipleBox}>
            <Text style={styles.winnerMultiple}>{Math.round(win.retailValue / (win.ticketPrice / 100))}×</Text>
            <Text style={styles.winnerMultipleSub}>return</Text>
          </View>
        </View>
      </RNAnimated.View>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <View style={styles.howCard}>
        <Text style={styles.howTitle}>How it works</Text>
        {HOW_IT_WORKS.map((s, i) => (
          <View key={s.title} style={styles.howRow}>
            <View style={styles.howNum}>
              <Text style={styles.howNumText}>{i + 1}</Text>
            </View>
            <View style={styles.howIconBox}>
              <Ionicons name={s.icon} size={18} color={Colors.lilac} />
            </View>
            <View style={styles.howText}>
              <Text style={styles.howStepTitle}>{s.title}</Text>
              <Text style={styles.howStepSub}>{s.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Trust badges ─────────────────────────────────────────────── */}
      <View style={styles.trustRow}>
        {[
          { icon: 'shield-checkmark-outline' as const, label: 'Every item verified' },
          { icon: 'lock-closed-outline' as const, label: 'Secure checkout' },
          { icon: 'mail-outline' as const, label: 'Free entry option' },
        ].map(b => (
          <View key={b.label} style={styles.trustBadge}>
            <Ionicons name={b.icon} size={13} color={Colors.lilac} />
            <Text style={styles.trustLabel}>{b.label}</Text>
          </View>
        ))}
      </View>

      {/* ── CTAs ─────────────────────────────────────────────────────── */}
      <PrimaryButton
        label={starting ? 'Starting…' : "Get started — it's free"}
        onPress={handleGetStarted}
        disabled={starting}
        style={styles.btn}
      />
      <GhostButton label="Log in" onPress={() => router.push('/(auth)/log-in')} style={styles.ghostBtn} />
      <Text style={styles.noCard}>No card needed to browse · Free postal entry on every draw</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.violet },
  content: { paddingBottom: 48 },

  logoRow: { alignItems: 'center', paddingTop: 20, paddingBottom: 12 },

  headline: {
    fontFamily: Fonts.serif, fontSize: 36, color: Colors.white,
    textAlign: 'center', lineHeight: 42, marginBottom: 10,
    paddingHorizontal: Spacing.lg,
  },
  sub: {
    fontSize: FontSizes.sm, color: 'rgba(210,195,240,0.9)',
    textAlign: 'center', lineHeight: 20, marginBottom: 16,
    paddingHorizontal: Spacing.xl,
  },

  countdownPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 8, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(244,114,182,0.3)',
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },
  countdownLabel: { fontSize: FontSizes.xs, color: 'rgba(210,195,240,0.8)' },
  countdownTime: { fontFamily: Fonts.serif, fontSize: FontSizes.base, color: Colors.white, letterSpacing: 1 },

  // Item grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 4,
    paddingHorizontal: Spacing.lg, marginBottom: 8,
  },
  gridTile: { borderRadius: 10, overflow: 'hidden', position: 'relative' },
  gridFallback: {
    ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 4, padding: 6,
  },
  gridFallbackIcon: { fontSize: 28 },
  gridFallbackLabel: { fontSize: 8, color: 'rgba(255,255,255,0.8)', fontWeight: '700', textAlign: 'center' },
  gridImage: { ...StyleSheet.absoluteFillObject as any },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,11,30,0.35)',
  },
  gridPriceBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: Colors.lilac, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  gridPrice: { fontSize: 9, color: Colors.white, fontWeight: '800' },
  gridBottom: {
    position: 'absolute', bottom: 6, left: 6, right: 6,
  },
  gridValue: { fontSize: 10, color: Colors.gold, fontWeight: '700' },

  gridCaption: {
    textAlign: 'center', fontSize: 10, color: 'rgba(210,195,240,0.6)',
    marginBottom: 20, paddingHorizontal: Spacing.lg,
  },

  // Winner card
  winnerCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: 'rgba(10,6,24,0.7)', borderRadius: Radius.lg,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.25)', padding: Spacing.md,
  },
  winnerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  winnerDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: Colors.gold },
  winnerHeaderLabel: { flex: 1, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, color: Colors.gold },
  winnerDots: { flexDirection: 'row', gap: 4 },
  winnerDotSmall: { width: 5, height: 5, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.2)' },
  winnerDotActive: { backgroundColor: Colors.gold },
  winnerBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  winnerImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: 'rgba(180,100,160,0.4)' },
  winnerMeta: { flex: 1 },
  winnerHandle: { fontFamily: Fonts.serif, fontSize: FontSizes.base, color: Colors.white },
  winnerItem: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  winnerPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  winnerPaid: { fontSize: 10, color: Colors.textTertiary },
  winnerArrow: { fontSize: 10, color: Colors.textTertiary },
  winnerValue: { fontSize: 10, color: Colors.gold, fontWeight: '700' },
  winnerMultipleBox: { alignItems: 'center', paddingLeft: 4 },
  winnerMultiple: { fontFamily: Fonts.serif, fontSize: 22, color: Colors.gold },
  winnerMultipleSub: { fontSize: 8, color: Colors.textTertiary, marginTop: 1 },

  // How it works
  howCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: 'rgba(10,6,24,0.5)', borderRadius: Radius.lg,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', padding: Spacing.md, gap: 14,
  },
  howTitle: { fontSize: FontSizes.xs, color: 'rgba(210,195,240,0.7)', letterSpacing: 0.8, fontWeight: '700', marginBottom: 2 },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  howNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(139,92,246,0.2)', alignItems: 'center', justifyContent: 'center' },
  howNumText: { fontSize: 9, color: Colors.lilac, fontWeight: '800' },
  howIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(139,92,246,0.12)', alignItems: 'center', justifyContent: 'center' },
  howText: { flex: 1 },
  howStepTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '700' },
  howStepSub: { fontSize: FontSizes.xs, color: 'rgba(210,195,240,0.65)', marginTop: 1 },

  // Trust
  trustRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustLabel: { fontSize: 9, color: 'rgba(210,195,240,0.7)' },

  btn: { marginHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  ghostBtn: { marginHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  noCard: { textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.22)', paddingHorizontal: Spacing.lg },
});
