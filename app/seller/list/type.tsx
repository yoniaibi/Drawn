import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import StepBar from '../../../src/components/StepBar';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import { useSellerDraft } from '../../../src/store/sellerDraft';

export default function ListTypeScreen() {
  const router = useRouter();
  const setType = useSellerDraft((s) => s.setType);

  const pick = (t: 'single' | 'bundle') => {
    setType(t);
    router.push('/seller/list/photos');
  };

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <StepBar current={1} total={4} />

      <View style={styles.content}>
        <Text style={styles.title}>What are you listing?</Text>
        <Text style={styles.sub}>
          Single items and bundles go into the same 9pm draw — but a wardrobe drop gets way more attention.
        </Text>

        <TouchableOpacity style={styles.option} onPress={() => pick('single')}>
          <View style={styles.optIcon}>
            <Text style={{ fontSize: 28 }}>👜</Text>
          </View>
          <View style={styles.optText}>
            <Text style={styles.optTitle}>Single item</Text>
            <Text style={styles.optSub}>One bag, watch, pair of trainers, etc.</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => pick('bundle')}>
          <View style={styles.optIcon}>
            <Text style={{ fontSize: 28 }}>🛍️</Text>
          </View>
          <View style={styles.optText}>
            <Text style={styles.optTitle}>Wardrobe bundle</Text>
            <Text style={styles.optSub}>Multiple items in one draw. Bigger prize = bigger crowd.</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 12 },

  stepBar: { flexDirection: 'row', gap: 4, paddingHorizontal: Spacing.lg, marginBottom: 6 },
  stepSegment: { flex: 1, height: 3, borderRadius: 2 },
  stepActive: { backgroundColor: Colors.lilac },
  stepInactive: { backgroundColor: Colors.darkBorder },
  stepLabel: {
    fontSize: 10, color: Colors.textTertiary,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, letterSpacing: 0.5,
  },

  content: { flex: 1, padding: Spacing.lg },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 8 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.xl },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: 12,
  },
  optIcon: {
    width: 52, height: 52, borderRadius: Radius.md, backgroundColor: Colors.darkBg,
    alignItems: 'center', justifyContent: 'center',
  },
  optText: { flex: 1 },
  optTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  optSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
});
