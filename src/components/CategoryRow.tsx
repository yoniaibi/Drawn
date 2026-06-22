import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CATEGORIES } from '../constants/categories';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../theme';

interface Props {
  activeSlug?: string;
  onSelect?: (slug: string) => void;
}

export default function CategoryRow({ activeSlug, onSelect }: Props) {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {CATEGORIES.map(cat => {
        const isActive = activeSlug === cat.slug;
        return (
          <TouchableOpacity
            key={cat.slug}
            style={[
              styles.tile,
              { borderColor: isActive ? cat.color : 'rgba(255,255,255,0.08)' },
              isActive && { backgroundColor: cat.bgColor },
            ]}
            onPress={() => {
              if (onSelect) {
                onSelect(cat.slug);
              } else {
                router.push(`/categories/${cat.slug}` as any);
              }
            }}
            activeOpacity={0.75}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text style={[styles.label, isActive && { color: cat.color }]}>{cat.label}</Text>
            {cat.isNew && (
              <View style={[styles.newBadge, { backgroundColor: cat.color + '28', borderColor: cat.color + '50' }]}>
                <Text style={[styles.newBadgeText, { color: cat.color }]}>NEW</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.viewAllTile}
        onPress={() => router.push('/categories' as any)}
        activeOpacity={0.75}
      >
        <Text style={styles.viewAllEmoji}>✦</Text>
        <Text style={styles.viewAllLabel}>All</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 72,
    position: 'relative',
  },
  emoji: { fontSize: 22 },
  label: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  newBadgeText: { fontSize: 7, fontWeight: '800', letterSpacing: 0.5 },
  viewAllTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 72,
  },
  viewAllEmoji: { fontSize: 18, color: Colors.lilac },
  viewAllLabel: { fontSize: 10, color: Colors.lilac, fontWeight: '700' },
});
