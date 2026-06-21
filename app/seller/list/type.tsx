import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import StepBar from '../../../src/components/StepBar';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import { CATEGORIES, type DrawCategory } from '../../../src/constants';
import { useSellerDraft } from '../../../src/store/sellerDraft';

export default function ListTypeScreen() {
  const router = useRouter();
  const { setCategory, setType } = useSellerDraft();
  const [selectedCategory, setSelectedCategory] = useState<DrawCategory | null>(null);

  const catMeta = CATEGORIES.find((c) => c.id === selectedCategory);

  const pick = (t: 'single' | 'bundle') => {
    setType(t);
    router.push('/seller/list/photos');
  };

  const handleCategory = (id: DrawCategory) => {
    setCategory(id);
    setSelectedCategory(id);
    const meta = CATEGORIES.find((c) => c.id === id);
    if (meta && !meta.allowBundle) {
      // Property / vehicles skip the bundle choice
      setType('single');
      router.push('/seller/list/photos');
    }
    // Otherwise scroll down to show single/bundle choice
  };

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <StepBar current={1} total={4} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What are you listing?</Text>
        <Text style={styles.sub}>
          Choose a category to unlock the right pricing options for your item.
        </Text>

        <Text style={styles.sectionLabel}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catTile, isSelected && styles.catTileOn]}
                onPress={() => handleCategory(cat.id)}
                activeOpacity={0.75}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catLabel, isSelected && styles.catLabelOn]} numberOfLines={2}>
                  {cat.label}
                </Text>
                <Text style={[styles.catSub, isSelected && { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>
                  {cat.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Single / Bundle choice — only shown for categories that allow bundles */}
        {selectedCategory && catMeta?.allowBundle && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>LISTING TYPE</Text>

            <TouchableOpacity style={styles.option} onPress={() => pick('single')}>
              <View style={styles.optIcon}>
                <Text style={{ fontSize: 26 }}>📦</Text>
              </View>
              <View style={styles.optText}>
                <Text style={styles.optTitle}>Single item</Text>
                <Text style={styles.optSub}>One item goes into the draw.</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => pick('bundle')}>
              <View style={styles.optIcon}>
                <Text style={{ fontSize: 26 }}>🛍️</Text>
              </View>
              <View style={styles.optText}>
                <Text style={styles.optTitle}>Bundle</Text>
                <Text style={styles.optSub}>Multiple items, one winner. Bigger prize = bigger crowd.</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 12 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 8 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.xl },
  sectionLabel: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.8, fontWeight: '700', marginBottom: 10 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catTile: {
    width: '47%', backgroundColor: Colors.darkCard, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.darkBorder,
  },
  catTileOn: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderColor: Colors.lilac,
  },
  catEmoji: { fontSize: 28, marginBottom: 6 },
  catLabel: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '700', marginBottom: 2 },
  catLabelOn: { color: Colors.lilac },
  catSub: { fontSize: FontSizes.xs, color: Colors.textTertiary, lineHeight: 16 },

  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.darkBorder,
  },
  optIcon: {
    width: 52, height: 52, borderRadius: Radius.md, backgroundColor: Colors.darkBg,
    alignItems: 'center', justifyContent: 'center',
  },
  optText: { flex: 1 },
  optTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  optSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
});
