import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '../../../src/theme';
import { MOCK_WINNER } from '../../../src/mocks';
import Confetti from '../../../src/components/Confetti';
import PrimaryButton from '../../../src/components/PrimaryButton';
import { supabase } from '../../../src/lib/supabase';

interface WinnerData {
  winnerHandle: string;
  image: string;
  item: string;
  retailValue: number;
  ticketPrice: number;
  sellerEarned: number;
  sellerHandle: string;
}

function mapToWinner(db: any): WinnerData {
  const earned = Math.round((db.tickets_sold ?? 0) * (db.ticket_price ?? 0) * 0.846);
  return {
    winnerHandle: db.winner_handle ?? '@winner',
    image: db.image_url ?? db.image ?? '',
    item: db.title ?? 'Prize',
    retailValue: Math.round((db.retail_value ?? 0) / 100), // pence → display-pounds
    ticketPrice: db.ticket_price ?? 10,
    sellerEarned: earned,
    sellerHandle: db.seller_handle ?? '@seller',
  };
}

export default function WinnerScreen() {
  const { drawId } = useLocalSearchParams<{ drawId: string }>();
  const router = useRouter();

  const [winner, setWinner] = useState<WinnerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!drawId) { setWinner(mapToWinner(MOCK_WINNER)); setLoading(false); return; }
    supabase
      .from('draws')
      .select('title, image, retail_value, ticket_price, tickets_sold, winner_handle, seller_handle')
      .eq('id', drawId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setWinner(mapToWinner(MOCK_WINNER));
        } else {
          setWinner(mapToWinner(data));
        }
        setLoading(false);
      });
  }, [drawId]);

  // Entrance animations
  const kickerOpacity = useSharedValue(0);
  const nameScale = useSharedValue(0.3);
  const nameOpacity = useSharedValue(0);
  const cardTranslate = useSharedValue(60);
  const cardOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (!winner) return;
    kickerOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    nameOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    nameScale.value = withDelay(600, withSpring(1, { damping: 10, stiffness: 120 }));
    cardTranslate.value = withDelay(1000, withSpring(0, { damping: 14, stiffness: 100 }));
    cardOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));
    glowOpacity.value = withDelay(1400, withTiming(1, { duration: 600 }));
    pulseScale.value = withDelay(1700, withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    ));
  }, [winner]);

  const kickerStyle = useAnimatedStyle(() => ({ opacity: kickerOpacity.value }));
  const nameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    transform: [{ scale: nameScale.value }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslate.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  if (loading) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  if (!winner) return null;

  const valueMultiple = Math.round(winner.retailValue / winner.ticketPrice);

  return (
    <View style={styles.screen}>
      <Confetti />

      <TouchableOpacity style={styles.close} onPress={() => router.replace('/(tabs)')}>
        <Ionicons name="close" size={22} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>

      <View style={styles.body}>
        <Animated.Text style={[styles.kicker, kickerStyle]}>WINNER ANNOUNCED</Animated.Text>

        <Animated.Text style={[styles.name, nameStyle]}>
          {winner.winnerHandle}<Text style={styles.dot}>.</Text>
        </Animated.Text>
        <Animated.Text style={[styles.won, kickerStyle]}>won tonight's 9pm draw</Animated.Text>

        <Animated.View style={[styles.prizeCardWrap, cardStyle]}>
          <Animated.View style={[styles.prizeGlow, glowStyle]} />
          <Animated.View style={[styles.prizeCard, pulseStyle]}>
            <Image source={{ uri: winner.image }} style={{ width: 80, height: 80, borderRadius: 12, marginBottom: 8 }} resizeMode="cover" />
            <Text style={styles.prizeTitle}>{winner.item}</Text>

            <View style={styles.valueRatioHero}>
              <View style={styles.valueRatioSide}>
                <Text style={styles.valueRatioAmount}>{winner.ticketPrice}p</Text>
                <Text style={styles.valueRatioSubLabel}>ticket price</Text>
              </View>
              <View style={styles.valueRatioMiddle}>
                <Text style={styles.valueRatioArrow}>→</Text>
                <Text style={styles.valueMultiple}>{valueMultiple}×</Text>
              </View>
              <View style={styles.valueRatioSide}>
                <Text style={[styles.valueRatioAmount, { color: Colors.gold }]}>
                  £{winner.retailValue.toLocaleString()}
                </Text>
                <Text style={styles.valueRatioSubLabel}>retail value</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.Text style={[styles.sellerNote, glowStyle]}>
          {winner.sellerHandle} earned £{(winner.sellerEarned / 100).toFixed(0)} on this draw
        </Animated.Text>

        <Animated.View style={[glowStyle, styles.shareRow]}>
          <TouchableOpacity style={styles.shareBtn} onPress={() => router.push(`/share/${drawId}`)}>
            <Ionicons name="share-social" size={16} color={Colors.royal} />
            <Text style={styles.shareText}>Share this win</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaHint}>More draws close tomorrow at 9pm</Text>
        <PrimaryButton label="Browse more draws" onPress={() => router.replace('/(tabs)')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.royal },
  close: { position: 'absolute', top: 56, right: Spacing.lg, zIndex: 20 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl, zIndex: 2, gap: 8 },
  kicker: { fontSize: FontSizes.xs, fontWeight: '800', letterSpacing: 2, color: '#E9D5FF', textAlign: 'center' },
  name: { fontFamily: Fonts.serif, fontSize: 46, color: Colors.white, lineHeight: 48, textAlign: 'center' },
  dot: { color: Colors.pink },
  won: { fontSize: FontSizes.sm, color: '#E9D5FF', textAlign: 'center', marginBottom: 12 },
  prizeCardWrap: { width: '100%', position: 'relative', marginBottom: 8 },
  prizeGlow: {
    position: 'absolute', top: -20, left: -20, right: -20, bottom: -20,
    borderRadius: Radius.xl + 20, backgroundColor: 'rgba(249,200,70,0.12)',
  },
  prizeCard: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.xl,
    padding: Spacing.xl, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.3)',
  },
  prizeTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '800', marginBottom: 18, textAlign: 'center' },
  valueRatioHero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  valueRatioSide: { alignItems: 'center' },
  valueRatioAmount: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white },
  valueRatioSubLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  valueRatioMiddle: { alignItems: 'center' },
  valueRatioArrow: { fontSize: 20, color: 'rgba(255,255,255,0.4)' },
  valueMultiple: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '800', letterSpacing: 0.5, marginTop: 2 },
  sellerNote: { fontSize: FontSizes.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  shareRow: { width: '100%', alignItems: 'center' },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: Radius.md,
    paddingVertical: 12, paddingHorizontal: 24,
    ...Shadows.glow,
  },
  shareText: { fontSize: FontSizes.base, color: Colors.royal, fontWeight: '800' },
  cta: { padding: Spacing.lg, zIndex: 2, gap: 8 },
  ctaHint: { textAlign: 'center', fontSize: FontSizes.xs, color: Colors.textSecondary },
});
