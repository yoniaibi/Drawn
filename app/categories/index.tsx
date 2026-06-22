import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { CATEGORIES } from '../../src/constants/categories';

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.sub}>Browse every category on DRAWN</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Established categories */}
        <Text style={styles.sectionLabel}>AVAILABLE NOW</Text>
        <View style={styles.grid}>
          {CATEGORIES.filter(c => !c.isNew).map(cat => (
            <TouchableOpacity
              key={cat.slug}
              style={[styles.card, { borderColor: cat.color + '40', backgroundColor: cat.bgColor }]}
              onPress={() => router.push(`/categories/${cat.slug}` as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardEmoji}>{cat.emoji}</Text>
              <Text style={[styles.cardLabel, { color: cat.color }]}>{cat.label}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{cat.description}</Text>
              <View style={styles.cardArrow}>
                <Ionicons name="arrow-forward" size={12} color={cat.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coming soon / expansion categories */}
        <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>COMING SOON</Text>
        <Text style={styles.expandSub}>
          We're expanding DRAWN beyond fashion. These categories are launching soon — want first access?
        </Text>

        <View style={styles.grid}>
          {CATEGORIES.filter(c => c.isNew).map(cat => (
            <TouchableOpacity
              key={cat.slug}
              style={[styles.card, styles.cardSoon, { borderColor: cat.color + '25' }]}
              onPress={() => router.push(`/categories/${cat.slug}` as any)}
              activeOpacity={0.8}
            >
              <View style={styles.soonBadge}>
                <Text style={styles.soonBadgeText}>SOON</Text>
              </View>
              <Text style={[styles.cardEmoji, styles.cardEmojiDim]}>{cat.emoji}</Text>
              <Text style={[styles.cardLabel, { color: Colors.textSecondary }]}>{cat.label}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{cat.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Suggest a category */}
        <View style={styles.suggestCard}>
          <Text style={styles.suggestEmoji}>💡</Text>
          <View style={styles.suggestText}>
            <Text style={styles.suggestTitle}>Don't see what you want?</Text>
            <Text style={styles.suggestSub}>
              We add new categories based on demand. Every draw goes live at 9pm sharp.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(139,92,246,0.12)',
  },
  back: { padding: 4 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white },
  sub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  content: { padding: Spacing.md, paddingBottom: 48 },

  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.textTertiary,
    letterSpacing: 1.2, marginBottom: Spacing.sm, marginTop: 4,
    paddingHorizontal: 4,
  },
  expandSub: {
    fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 18,
    marginBottom: Spacing.md, paddingHorizontal: 4,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  cardSoon: { backgroundColor: 'rgba(255,255,255,0.02)', opacity: 0.75 },
  cardEmoji: { fontSize: 30, marginBottom: 2 },
  cardEmojiDim: { opacity: 0.5 },
  cardLabel: {
    fontSize: FontSizes.base, fontWeight: '700',
  },
  cardDesc: {
    fontSize: FontSizes.xs, color: Colors.textTertiary, lineHeight: 16,
  },
  cardArrow: {
    position: 'absolute', bottom: Spacing.sm, right: Spacing.sm,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

  soonBadge: {
    position: 'absolute', top: Spacing.sm, right: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.pill,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  soonBadgeText: { fontSize: 8, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 0.8 },

  suggestCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    marginTop: Spacing.xl,
    backgroundColor: 'rgba(139,92,246,0.06)',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.18)',
    padding: Spacing.md,
  },
  suggestEmoji: { fontSize: 24, marginTop: 2 },
  suggestText: { flex: 1 },
  suggestTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700', marginBottom: 4 },
  suggestSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 17 },
});
