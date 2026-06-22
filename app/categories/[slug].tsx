import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { getCategoryBySlug, CATEGORIES } from '../../src/constants/categories';
import { Draw } from '../../src/mocks';
import { fetchDrawsByCategory } from '../../src/services/draws';
import DrawCard from '../../src/components/DrawCard';

export default function CategoryScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const cat = getCategoryBySlug(slug ?? '');

  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchDrawsByCategory(slug).then(result => {
      setDraws(result);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (!cat) {
    return (
      <View style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Category not found</Text>
        </View>
      </View>
    );
  }

  const activeDraws = draws.filter(d => d.status !== 'completed');
  const completedDraws = draws.filter(d => d.status === 'completed');

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: cat.color + '30' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerTop}>
            <Text style={styles.headerEmoji}>{cat.emoji}</Text>
            {cat.isNew && (
              <View style={[styles.newBadge, { backgroundColor: cat.color + '20', borderColor: cat.color + '50' }]}>
                <Text style={[styles.newBadgeText, { color: cat.color }]}>COMING SOON</Text>
              </View>
            )}
          </View>
          <Text style={[styles.headerTitle, { color: cat.color }]}>{cat.label}</Text>
          <Text style={styles.headerSub}>{cat.description}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {cat.isNew ? (
          <ComingSoon cat={cat} router={router} />
        ) : loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.lilac} />
          </View>
        ) : draws.length === 0 ? (
          <EmptyState cat={cat} router={router} />
        ) : (
          <>
            {activeDraws.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>ACTIVE DRAWS</Text>
                <View style={styles.grid}>
                  {activeDraws.map((draw, i) => {
                    if (draw.isBundle || i % 2 === 0) {
                      const next = !draw.isBundle ? activeDraws[i + 1] : null;
                      if (!next || next.isBundle || draw.isBundle) {
                        return (
                          <View key={draw.id} style={styles.wideCard}>
                            <DrawCard draw={draw} wide={draw.isBundle} />
                          </View>
                        );
                      }
                      return (
                        <View key={draw.id} style={styles.row}>
                          <View style={styles.halfCard}><DrawCard draw={draw} /></View>
                          <View style={styles.halfCard}><DrawCard draw={next} /></View>
                        </View>
                      );
                    }
                    if (activeDraws[i - 1] && !activeDraws[i - 1].isBundle) return null;
                    return (
                      <View key={draw.id} style={styles.wideCard}>
                        <DrawCard draw={draw} />
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {completedDraws.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>PAST DRAWS</Text>
                <View style={styles.grid}>
                  {completedDraws.map(draw => (
                    <View key={draw.id} style={styles.wideCard}>
                      <DrawCard draw={draw} />
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* Related categories */}
        <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>EXPLORE MORE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRow}>
          {CATEGORIES.filter(c => c.slug !== slug).slice(0, 6).map(c => (
            <TouchableOpacity
              key={c.slug}
              style={[styles.relatedChip, { borderColor: c.color + '40', backgroundColor: c.bgColor }]}
              onPress={() => router.replace(`/categories/${c.slug}` as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.relatedEmoji}>{c.emoji}</Text>
              <Text style={[styles.relatedLabel, { color: c.color }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

function EmptyState({ cat, router }: { cat: ReturnType<typeof getCategoryBySlug>; router: any }) {
  if (!cat) return null;
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyEmoji}>{cat.emoji}</Text>
      <Text style={styles.emptyTitle}>No {cat.label.toLowerCase()} draws yet</Text>
      <Text style={styles.emptySub}>
        We're curating the best {cat.label.toLowerCase()} draws right now. Check back tonight at 9pm.
      </Text>
      <TouchableOpacity
        style={[styles.emptyBtn, { backgroundColor: cat.color }]}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.emptyBtnText}>Browse all draws →</Text>
      </TouchableOpacity>
    </View>
  );
}

function ComingSoon({ cat, router }: { cat: ReturnType<typeof getCategoryBySlug>; router: any }) {
  if (!cat) return null;
  return (
    <View style={styles.comingSoonCard}>
      <Text style={styles.comingSoonEmoji}>{cat.emoji}</Text>
      <Text style={[styles.comingSoonTitle, { color: cat.color }]}>{cat.label} draws</Text>
      <Text style={styles.comingSoonSub}>
        We're bringing {cat.label.toLowerCase()} to DRAWN very soon. Every draw will go live at 9pm — one chance, one winner.
      </Text>
      <View style={[styles.comingSoonBadge, { borderColor: cat.color + '40', backgroundColor: cat.bgColor }]}>
        <Text style={[styles.comingSoonBadgeText, { color: cat.color }]}>
          Launching soon · stay tuned
        </Text>
      </View>
      <TouchableOpacity style={styles.backToHome} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.backToHomeText}>Browse what's live now →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.darkCard,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4, flexShrink: 0,
  },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  headerInfo: { flex: 1 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  headerEmoji: { fontSize: 28 },
  newBadge: {
    borderRadius: Radius.pill, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  newBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  headerTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, fontWeight: '700' },
  headerSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 17, marginTop: 3 },

  content: { padding: Spacing.md, paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },

  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.textTertiary,
    letterSpacing: 1.2, marginBottom: Spacing.sm, paddingHorizontal: 2,
  },

  grid: { gap: 8, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8 },
  halfCard: { flex: 1 },
  wideCard: {},

  relatedRow: { gap: 8, paddingBottom: 4 },
  relatedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  relatedEmoji: { fontSize: 16 },
  relatedLabel: { fontSize: FontSizes.xs, fontWeight: '700' },

  emptyCard: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyEmoji: { fontSize: 48, marginBottom: 6 },
  emptyTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white },
  emptySub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  emptyBtn: {
    marginTop: 8, borderRadius: Radius.pill,
    paddingHorizontal: 28, paddingVertical: 12,
  },
  emptyBtnText: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },

  comingSoonCard: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: Spacing.lg, gap: 12 },
  comingSoonEmoji: { fontSize: 64 },
  comingSoonTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, textAlign: 'center' },
  comingSoonSub: {
    fontSize: FontSizes.sm, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },
  comingSoonBadge: {
    borderWidth: 1, borderRadius: Radius.pill,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  comingSoonBadgeText: { fontSize: FontSizes.xs, fontWeight: '700' },
  backToHome: { marginTop: 8 },
  backToHomeText: { fontSize: FontSizes.sm, color: Colors.lilac, fontWeight: '600' },
});
