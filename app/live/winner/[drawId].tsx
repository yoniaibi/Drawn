import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '../../../src/theme';
import { MOCK_WINNER } from '../../../src/mocks';
import Confetti from '../../../src/components/Confetti';
import PrimaryButton from '../../../src/components/PrimaryButton';

export default function WinnerScreen() {
  const { drawId } = useLocalSearchParams<{ drawId: string }>();
  const router = useRouter();
  const winner = MOCK_WINNER;

  return (
    <View style={styles.screen}>
      <Confetti />

      <TouchableOpacity style={styles.close} onPress={() => router.replace('/(tabs)')}>
        <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.kicker}>WINNER</Text>
        <Text style={styles.name}>{winner.winnerHandle}<Text style={styles.dot}>.</Text></Text>
        <Text style={styles.won}>won tonight's 9pm draw</Text>

        <View style={styles.prizeCard}>
          <Text style={styles.prizeEmoji}>{winner.emoji}</Text>
          <Text style={styles.prizeTitle}>{winner.item}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: Colors.gold }]}>{winner.ticketPrice}p</Text>
              <Text style={styles.statLabel}>ticket price</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>£{winner.retailValue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>retail value</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={() => router.push(`/share/${drawId}`)}>
          <Text style={styles.shareText}>Share this win</Text>
        </TouchableOpacity>

        <Text style={styles.sellerNote}>
          @sophiestyle earned £{winner.sellerEarned} clearing her wardrobe
        </Text>
      </View>

      <View style={styles.cta}>
        <PrimaryButton label="Back to draws" onPress={() => router.replace('/(tabs)')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.royal },
  close: { position: 'absolute', top: 56, right: Spacing.lg, zIndex: 20 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl, zIndex: 2 },
  kicker: { fontSize: FontSizes.xs, fontWeight: '800', letterSpacing: 2, color: '#E9D5FF', marginBottom: 8 },
  name: { fontFamily: Fonts.serif, fontSize: 44, color: Colors.white, lineHeight: 46 },
  dot: { color: Colors.pink },
  won: { fontSize: FontSizes.sm, color: '#E9D5FF', marginTop: 8, marginBottom: 24 },
  prizeCard: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.xl,
    padding: Spacing.xl, alignItems: 'center', width: '100%', marginBottom: Spacing.lg,
  },
  prizeEmoji: { fontSize: 52, marginBottom: 10 },
  prizeTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '800', marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 28 },
  stat: { alignItems: 'center' },
  statVal: { fontSize: FontSizes.lg, color: Colors.white, fontWeight: '800' },
  statLabel: { fontSize: FontSizes.xs, color: '#c9b3ef', marginTop: 2 },
  shareBtn: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    paddingVertical: 14, paddingHorizontal: 28, marginBottom: 14,
    ...Shadows.glow,
  },
  shareText: { fontSize: FontSizes.base, color: Colors.royal, fontWeight: '800' },
  sellerNote: { fontSize: FontSizes.xs, color: '#d9c7f5', textAlign: 'center' },
  cta: { padding: Spacing.lg, zIndex: 2 },
});
