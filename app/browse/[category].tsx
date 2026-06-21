import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { Draw } from '../../src/mocks';
import { fetchDraws } from '../../src/services/draws';
import DrawCard from '../../src/components/DrawCard';

const CATEGORIES = [
  { label: 'Fashion',   emoji: '👗', keywords: ['dress', 'shirt', 'jacket', 'coat', 'skirt', 'jeans', 'top'] },
  { label: 'Sneakers',  emoji: '👟', keywords: ['trainer', 'sneaker', 'shoe', 'nike', 'adidas', 'jordan', 'yeezy'] },
  { label: 'Watches',   emoji: '⌚', keywords: ['watch', 'rolex', 'omega', 'tudor', 'seiko', 'ap', 'cartier'] },
  { label: 'Bags',      emoji: '👜', keywords: ['bag', 'handbag', 'purse', 'tote', 'chanel', 'lv', 'louis', 'gucci', 'prada'] },
  { label: 'Jewellery', emoji: '💎', keywords: ['ring', 'necklace', 'bracelet', 'earring', 'gold', 'diamond', 'silver'] },
  { label: 'Tech',      emoji: '📱', keywords: ['iphone', 'macbook', 'ipad', 'airpod', 'sony', 'samsung', 'laptop', 'phone'] },
  { label: 'Art',       emoji: '🎨', keywords: ['print', 'painting', 'artwork', 'poster', 'canvas', 'illustration'] },
];

const STATUS_ORDER: Record<string, number> = {
  closing_tonight: 0,
  live: 1,
  open: 2,
  completed: 3,
  cancelled: 4,
};

export default function CategoryBrowseScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [allDraws, setAllDraws] = useState<Draw[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const categoryDef = CATEGORIES.find(
    c => c.label.toLowerCase() === (category ?? '').toLowerCase(),
  );

  useEffect(() => {
    fetchDraws()
      .then(data => {
        setAllDraws(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!categoryDef) return allDraws;
    const { keywords } = categoryDef;
    const matched = allDraws.filter(d =>
      keywords.some(kw => d.title.toLowerCase().includes(kw)),
    );
    const result = matched.length > 0 ? matched : allDraws;
    return [...result].sort(
      (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
    );
  }, [allDraws, categoryDef]);

  const activeCount = filtered.filter(
    d => d.status === 'open' || d.status === 'closing_tonight' || d.status === 'live',
  ).length;

  const handleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const emoji = categoryDef?.emoji ?? '';
  const label = categoryDef?.label ?? (category ?? 'Browse');
  const pageTitle = `${emoji} ${label}`.trim();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pageTitle}</Text>
      </View>

      {!loading && (
        <View style={styles.statsStrip}>
          <View style={styles.statsDot} />
          <Text style={styles.statsText}>
            {activeCount} active {activeCount === 1 ? 'draw' : 'draws'} in {label}
          </Text>
        </View>
      )}

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.lilac} />
        </View>
      )}

      {!loading && filtered.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No {label} draws right now</Text>
          <Text style={styles.emptySub}>
            Check back tonight at 9pm for new listings.
          </Text>
        </View>
      )}

      {!loading && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <DrawCard
                draw={item}
                saved={savedIds.has(item.id)}
                onSave={handleSave}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.darkBg,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: 8,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.darkCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.18)',
  },
  statsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.lilac,
  },
  statsText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.white,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 32,
  },
  row: {
    gap: 6,
    marginBottom: 6,
  },
  cell: {
    width: '50%',
    padding: 6,
  },
});
