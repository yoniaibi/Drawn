import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share, Animated, Image, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated2, {
  useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming, withSequence,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import Confetti from '../../src/components/Confetti';
import { getCountdownTo9pm, formatTicketPrice } from '../../src/utils/countdown';

const RECENT_WINNERS = [
  { handle: '@chloe_j', value: '£2,400', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=100&q=80' },
  { handle: '@marcus_t', value: '£8,500', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80' },
  { handle: '@priya__', value: '£8,600', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=100&q=80' },
];

type DrawData = {
  id: string;
  title: string;
  image: string;
  retailValue: number;
  totalTickets: number;
  ticketPrice: number;
  seller: string;
  condition: string;
};

export default function PurchaseSuccessScreen() {
  const { drawId, qty, total } = useLocalSearchParams<{ drawId: string; qty: string; total: string }>();
  const router = useRouter();
  const [draw, setDraw] = useState<DrawData | null>(null);
  const [fetchDone, setFetchDone] = useState(false);
  const [time, setTime] = useState(getCountdownTo9pm());

  useEffect(() => {
    const id = setInterval(() => setTime(getCountdownTo9pm()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!drawId) { setFetchDone(true); return; }
    supabase
      .from('draws')
      .select('id, title, image_url, retail_value, total_tickets, ticket_price, seller_handle, condition')
      .eq('id', drawId)
      .single()
      .then(({ data }) => {
        if (data) {
          setDraw({
            id: data.id,
            title: data.title,
            image: data.image_url ?? '',
            retailValue: Math.round((data.retail_value ?? 0) / 100),
            totalTickets: data.total_tickets ?? 1000,
            ticketPrice: data.ticket_price ?? 10,
            seller: data.seller_handle ?? '',
            condition: data.condition ?? 'new',
          });
        }
        setFetchDone(true);
      });
  }, [drawId]);

  // Entrance animations
  const emojiScale = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(40);
  const oddsScale = useSharedValue(0.8);
  const oddsOpacity = useSharedValue(0);

  useEffect(() => {
    emojiScale.value = withDelay(100, withSpring(1, { damping: 10, stiffness: 150 }));
    cardOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    cardTranslateY.value = withDelay(400, withSpring(0));
    oddsOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    oddsScale.value = withDelay(700, withSpring(1, { damping: 12 }));
  }, []);

  const emojiStyle = useAnimatedStyle(() => ({ transform: [{ scale: emojiScale.value }] }));
  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value, transform: [{ translateY: cardTranslateY.value }] }));
  const oddsStyle = useAnimatedStyle(() => ({ opacity: oddsOpacity.value, transform: [{ scale: oddsScale.value }] }));

  if (!fetchDone) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.lilac} size="large" />
      </View>
    );
  }

  if (!draw) {
    return (
      <View style={styles.screen}>
        <Confetti />
        <Text style={styles.heading}>You're in!</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Back to draws</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const qtyNum = parseInt(qty ?? '1');
  const totalNum = parseInt(total ?? String(draw.ticketPrice));
  const oddsPercent = ((qtyNum / draw.totalTickets) * 100).toFixed(2);
  const returnMultiple = Math.round(draw.retailValue * 100 / totalNum);

  function handleShare() {
    Share.share({
      message: `I just entered the ${draw!.title} draw on Drawn for ${formatTicketPrice(totalNum)}. Could win £${draw!.retailValue.toLocaleString()} tonight at 9pm — drawn.app`,
    });
  }

  return (
    <View style={styles.screen}>
      <Confetti />

      {/* Close */}
      <TouchableOpacity style={styles.close} onPress={() => router.replace('/(tabs)')}>
        <Ionicons name="close" size={20} color={Colors.textTertiary} />
      </TouchableOpacity>

      {/* Kicker */}
      <View style={styles.kickerRow}>
        <View style={styles.kickerDot} />
        <Text style={styles.kicker}>ENTRY CONFIRMED</Text>
      </View>

      {/* Big item image */}
      <Animated2.View style={emojiStyle}>
        {draw.image ? (
          <Image source={{ uri: draw.image }} style={styles.bigImage} resizeMode="cover" />
        ) : (
          <View style={styles.bigImage} />
        )}
      </Animated2.View>

      <Text style={styles.heading}>You're in!</Text>
      <Text style={styles.subHeading}>{draw.title}</Text>
      <Text style={styles.seller}>{draw.seller} · {draw.condition.replace('_', ' ')}</Text>

      {/* Odds card */}
      <Animated2.View style={[styles.oddsCard, oddsStyle]}>
        <View style={styles.oddsRow}>
          <View style={styles.oddsStat}>
            <Text style={styles.oddsStatVal}>{qtyNum}</Text>
            <Text style={styles.oddsStatLabel}>tickets</Text>
          </View>
          <View style={styles.oddsDivider} />
          <View style={styles.oddsStat}>
            <Text style={[styles.oddsStatVal, { color: Colors.lilac }]}>{oddsPercent}%</Text>
            <Text style={styles.oddsStatLabel}>your odds</Text>
          </View>
          <View style={styles.oddsDivider} />
          <View style={styles.oddsStat}>
            <Text style={[styles.oddsStatVal, { color: Colors.gold }]}>{returnMultiple}×</Text>
            <Text style={styles.oddsStatLabel}>potential return</Text>
          </View>
        </View>
        <View style={styles.oddsValueRow}>
          <Text style={styles.oddsValueText}>
            Paid <Text style={styles.oddsValueBold}>{formatTicketPrice(totalNum)}</Text>
            {'  ·  '}could win <Text style={[styles.oddsValueBold, { color: Colors.gold }]}>£{draw.retailValue.toLocaleString()}</Text>
          </Text>
        </View>
      </Animated2.View>

      {/* Countdown card */}
      <Animated2.View style={[styles.countdownCard, cardStyle]}>
        <View style={styles.countdownLeft}>
          <View style={[styles.countdownDot, { backgroundColor: Colors.pink }]} />
          <Text style={styles.countdownLabel}>Draw closes in</Text>
        </View>
        <View style={styles.countdownRight}>
          <Text style={styles.countdownTime}>{time.h}:{time.m}:{time.s}</Text>
        </View>
      </Animated2.View>

      {/* Recent winners */}
      <Animated2.View style={[styles.winnersRow, cardStyle]}>
        <Text style={styles.winnersLabel}>Recent winners on Drawn</Text>
        <View style={styles.winnersChips}>
          {RECENT_WINNERS.map((w, i) => (
            <View key={i} style={styles.winnerChip}>
              <Image source={{ uri: w.image }} style={styles.winnerChipImage} resizeMode="cover" />
              <Text style={styles.winnerChipHandle}>{w.handle}</Text>
              <Text style={styles.winnerChipVal}>{w.value}</Text>
            </View>
          ))}
        </View>
      </Animated2.View>

      {/* CTAs */}
      <Animated2.View style={[styles.ctaRow, cardStyle]}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={16} color={Colors.white} />
          <Text style={styles.shareBtnText}>Share your entry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.browseBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.browseBtnText}>Keep browsing</Text>
        </TouchableOpacity>
      </Animated2.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.darkBg,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
  },
  close: {
    position: 'absolute',
    top: 52,
    right: Spacing.lg,
    padding: 6,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.pink,
  },
  kicker: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.pink,
    letterSpacing: 1.5,
  },
  bigImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(139,92,246,0.2)',
  },
  heading: {
    fontFamily: Fonts.serif,
    fontSize: FontSizes.xxl,
    color: Colors.white,
    marginBottom: 4,
  },
  subHeading: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  seller: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginBottom: 20,
  },
  oddsCard: {
    width: '100%',
    backgroundColor: 'rgba(109,40,217,0.15)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    padding: Spacing.lg,
    marginBottom: 12,
  },
  oddsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  oddsStat: {
    flex: 1,
    alignItems: 'center',
  },
  oddsStatVal: {
    fontFamily: Fonts.serif,
    fontSize: FontSizes.xl,
    color: Colors.white,
    lineHeight: 28,
  },
  oddsStatLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  oddsDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  oddsValueRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
    alignItems: 'center',
  },
  oddsValueText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  oddsValueBold: {
    color: Colors.white,
    fontWeight: '700',
  },
  countdownCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  countdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  countdownDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  countdownLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  countdownRight: {},
  countdownTime: {
    fontFamily: Fonts.serif,
    fontSize: FontSizes.lg,
    color: Colors.white,
  },
  winnersRow: {
    width: '100%',
    marginBottom: 16,
  },
  winnersLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginBottom: 6,
    textAlign: 'center',
  },
  winnersChips: {
    flexDirection: 'row',
    gap: 6,
  },
  winnerChip: {
    flex: 1,
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(249,200,70,0.12)',
  },
  winnerChipImage: { width: 36, height: 36, borderRadius: 6 },
  winnerChipHandle: { fontSize: 8, color: Colors.textSecondary, fontWeight: '600' },
  winnerChipVal: { fontSize: 9, color: Colors.gold, fontWeight: '800' },
  ctaRow: {
    width: '100%',
    gap: 10,
    marginTop: 'auto',
    paddingBottom: 40,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.lilac,
    borderRadius: Radius.md,
    padding: 14,
  },
  shareBtnText: {
    fontSize: FontSizes.base,
    color: Colors.white,
    fontWeight: '700',
  },
  browseBtn: {
    alignItems: 'center',
    padding: 12,
  },
  browseBtnText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  secondaryBtn: {
    marginTop: Spacing.xl,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  secondaryBtnText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
