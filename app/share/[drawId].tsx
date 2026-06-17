import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_WINNER } from '../../src/mocks';
import PrimaryButton from '../../src/components/PrimaryButton';
import { supabase } from '../../src/lib/supabase';

interface ShareData {
  emoji: string;
  item: string;
  retailValue: number; // display-pounds
  ticketPrice: number; // pence
  winnerHandle: string;
}

export default function ShareCardScreen() {
  const { drawId } = useLocalSearchParams<{ drawId: string }>();
  const router = useRouter();

  const [data, setData] = useState<ShareData | null>(null);

  useEffect(() => {
    if (!drawId) {
      setData({
        emoji: MOCK_WINNER.emoji,
        item: MOCK_WINNER.item,
        retailValue: MOCK_WINNER.retailValue,
        ticketPrice: MOCK_WINNER.ticketPrice,
        winnerHandle: MOCK_WINNER.winnerHandle,
      });
      return;
    }
    supabase
      .from('draws')
      .select('emoji, title, retail_value, ticket_price, winner_handle')
      .eq('id', drawId)
      .single()
      .then(({ data: d }) => {
        if (d) {
          setData({
            emoji: d.emoji ?? '🎁',
            item: d.title,
            retailValue: Math.round((d.retail_value ?? 0) / 100),
            ticketPrice: d.ticket_price ?? 10,
            winnerHandle: d.winner_handle ?? '@winner',
          });
        } else {
          setData({
            emoji: MOCK_WINNER.emoji,
            item: MOCK_WINNER.item,
            retailValue: MOCK_WINNER.retailValue,
            ticketPrice: MOCK_WINNER.ticketPrice,
            winnerHandle: MOCK_WINNER.winnerHandle,
          });
        }
      });
  }, [drawId]);

  const shareText = data
    ? `I just won ${data.item} worth £${data.retailValue.toLocaleString()} for just ${data.ticketPrice}p on DRAWN! drawn.app`
    : 'I just won on DRAWN! drawn.app';

  if (!data) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.close} onPress={() => router.back()}>
        <Ionicons name="close" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.heading}>Your share card</Text>
      <Text style={styles.sub}>Auto-generated. Post it anywhere.</Text>

      {/* Share card visual */}
      <View style={styles.card}>
        <View style={styles.cardLogoRow}>
          <View style={styles.logoMain}><Text style={styles.logoWord}>drawn</Text></View>
          <View style={styles.logoStub}><Text style={styles.logoStubText}>9PM</Text></View>
        </View>
        <Text style={styles.cardKicker}>I JUST WON</Text>
        <Text style={styles.cardHead}>
          a £{data.retailValue.toLocaleString()} prize{'\n'}
          <Text style={styles.cardHeadGold}>for {data.ticketPrice}p</Text>
        </Text>
        <Text style={styles.cardEmoji}>{data.emoji}</Text>
        <Text style={styles.cardItem}>{data.item}</Text>
        <Text style={styles.cardVs}>1 ticket · worth £{data.retailValue.toLocaleString()}</Text>
        <View style={styles.cardFoot}>
          <View style={styles.cardFootDot} />
          <Text style={styles.cardFootText}>win designer pieces from 10p · drawn.app</Text>
        </View>
      </View>

      <PrimaryButton label="Share on Instagram" onPress={() => Share.share({ message: shareText })} style={{ marginBottom: Spacing.sm }} />
      <PrimaryButton label="Share on TikTok" onPress={() => Share.share({ message: shareText })} variant="lilac" style={{ marginBottom: Spacing.sm }} />
      <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => Share.share({ message: shareText })}>
        <Text style={{ fontSize: FontSizes.sm, color: Colors.textSecondary }}>Copy link</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, padding: Spacing.lg, paddingTop: 56 },
  close: { position: 'absolute', top: 56, right: Spacing.lg },
  heading: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 4, marginTop: 8 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  card: {
    backgroundColor: Colors.royal, borderRadius: Radius.xl, padding: Spacing.xxl,
    marginBottom: Spacing.xl, alignItems: 'flex-start',
  },
  cardLogoRow: { flexDirection: 'row', marginBottom: 24 },
  logoMain: { backgroundColor: Colors.ink, borderTopLeftRadius: 6, borderBottomLeftRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  logoWord: { fontFamily: Fonts.serif, fontSize: 16, color: Colors.white },
  logoStub: { backgroundColor: Colors.lilac, borderTopRightRadius: 6, borderBottomRightRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  logoStubText: { fontSize: 8, fontWeight: '800', color: Colors.gold },
  cardKicker: { fontSize: FontSizes.xs, fontWeight: '800', letterSpacing: 2, color: '#E9D5FF', marginBottom: 6 },
  cardHead: { fontFamily: Fonts.serif, fontSize: 30, color: Colors.white, lineHeight: 32, marginBottom: 14 },
  cardHeadGold: { color: Colors.gold, fontStyle: 'italic' },
  cardEmoji: { fontSize: 52, marginBottom: 10 },
  cardItem: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700', marginBottom: 4 },
  cardVs: { fontSize: FontSizes.sm, color: '#c9b3ef', marginBottom: 14 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardFootDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },
  cardFootText: { fontSize: FontSizes.xs, color: '#E9D5FF' },
});
