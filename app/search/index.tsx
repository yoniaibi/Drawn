import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_DRAWS } from '../../src/mocks';
import type { Draw } from '../../src/mocks';
import { fetchDraws } from '../../src/services/draws';
import DrawCard from '../../src/components/DrawCard';

const CHIPS = ['All', 'Tonight 🔥', 'Bundles', 'High Value', 'Just listed'];

const TRENDING = [
  { label: 'Chanel', emoji: '👜' },
  { label: 'Rolex', emoji: '⌚' },
  { label: 'Jordan 1', emoji: '👟' },
  { label: 'Supreme', emoji: '🧢' },
  { label: 'Bottega', emoji: '💼' },
  { label: 'MacBook', emoji: '💻' },
];

const RECENT_SEARCHES_KEY = 'drawn_recent_searches';

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState('All');
  const [allDraws, setAllDraws] = useState<Draw[]>(MOCK_DRAWS);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoading(true);
    fetchDraws().then(d => { setAllDraws(d); setLoading(false); });
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  }, []);

  function handleSearch(term: string) {
    setQuery(term);
    if (term.trim() && !recentSearches.includes(term.trim())) {
      setRecentSearches(prev => [term.trim(), ...prev].slice(0, 5));
    }
  }

  const results = useMemo(() => {
    let pool = allDraws;
    if (chip === 'Tonight 🔥') pool = pool.filter(d => d.status === 'closing_tonight');
    else if (chip === 'Bundles') pool = pool.filter(d => d.isBundle);
    else if (chip === 'High Value') pool = pool.filter(d => d.retailValue >= 500);
    else if (chip === 'Just listed') pool = pool.filter(d => d.status === 'open');

    const q = query.trim().toLowerCase();
    if (q) {
      pool = pool.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.seller.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q),
      );
    }
    return pool;
  }, [query, chip, allDraws]);

  const showEmpty = query.trim() === '' && chip === 'All';

  return (
    <View style={styles.screen}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={15} color={Colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search draws, brands, sellers…"
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={handleSearch}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {CHIPS.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, chip === c && styles.chipOn]}
            onPress={() => setChip(c)}
          >
            <Text style={[styles.chipText, chip === c && styles.chipTextOn]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Discovery state — show trending + recent when no query */}
        {showEmpty && !loading && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <View style={styles.discoverySection}>
                <View style={styles.discoverySectionHeader}>
                  <Text style={styles.discoverySectionTitle}>RECENT</Text>
                  <TouchableOpacity onPress={() => setRecentSearches([])}>
                    <Text style={styles.clearAll}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.recentList}>
                  {recentSearches.map(s => (
                    <TouchableOpacity key={s} style={styles.recentItem} onPress={() => setQuery(s)}>
                      <Ionicons name="time-outline" size={13} color={Colors.textTertiary} />
                      <Text style={styles.recentText}>{s}</Text>
                      <Ionicons name="arrow-up-outline" size={12} color={Colors.textTertiary} style={{ marginLeft: 'auto', transform: [{ rotate: '45deg' }] }} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Trending now */}
            <View style={styles.discoverySection}>
              <View style={styles.discoverySectionHeader}>
                <Text style={styles.discoverySectionTitle}>TRENDING NOW</Text>
                <View style={styles.trendingDot} />
              </View>
              <View style={styles.trendingGrid}>
                {TRENDING.map((t, i) => (
                  <TouchableOpacity
                    key={t.label}
                    style={styles.trendingChip}
                    onPress={() => handleSearch(t.label)}
                  >
                    <Text style={styles.trendingEmoji}>{t.emoji}</Text>
                    <Text style={styles.trendingLabel}>{t.label}</Text>
                    {i < 3 && (
                      <View style={styles.hotBadge}>
                        <Text style={styles.hotBadgeText}>HOT</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* All draws browsable */}
            <Text style={styles.browseTitle}>All draws</Text>
          </Animated.View>
        )}

        {loading && (
          <ActivityIndicator color={Colors.lilac} style={{ marginTop: 40 }} />
        )}

        {!loading && !showEmpty && results.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No draws match</Text>
            <Text style={styles.emptySub}>Try "{query.split(' ')[0]}" or browse trending above</Text>
            <View style={styles.emptySuggestions}>
              {TRENDING.slice(0, 3).map(t => (
                <TouchableOpacity key={t.label} style={styles.emptySuggestionChip} onPress={() => handleSearch(t.label)}>
                  <Text style={styles.emptySuggestionText}>{t.emoji} {t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {!loading && (showEmpty ? allDraws : results).map((draw, i, arr) => {
          if (draw.isBundle) {
            return (
              <View key={draw.id} style={styles.wideCard}>
                <DrawCard draw={draw} wide />
              </View>
            );
          }
          if (i % 2 === 0) {
            const next = arr[i + 1];
            if (!next || next.isBundle) {
              return (
                <View key={draw.id} style={styles.wideCard}>
                  <DrawCard draw={draw} />
                </View>
              );
            }
            return (
              <View key={draw.id} style={styles.row}>
                <View style={styles.half}><DrawCard draw={draw} /></View>
                <View style={styles.half}><DrawCard draw={next} /></View>
              </View>
            );
          }
          if (arr[i - 1] && !arr[i - 1].isBundle) return null;
          return (
            <View key={draw.id} style={styles.wideCard}>
              <DrawCard draw={draw} />
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.darkBorder,
  },
  back: { padding: 4 },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.darkCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.darkBorder, paddingHorizontal: Spacing.sm,
  },
  searchIcon: { marginRight: 6 },
  input: { flex: 1, fontSize: FontSizes.sm, color: Colors.white, paddingVertical: 10 },
  clearBtn: { padding: 4 },

  chips: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 8 },
  chip: {
    borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.darkBorder,
  },
  chipOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  chipText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  chipTextOn: { color: Colors.white },

  grid: { padding: Spacing.md, gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  wideCard: {},

  discoverySection: { marginBottom: Spacing.xl },
  discoverySectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  discoverySectionTitle: { fontSize: 10, color: Colors.textTertiary, fontWeight: '700', letterSpacing: 1, flex: 1 },
  clearAll: { fontSize: FontSizes.xs, color: Colors.lilac, fontWeight: '600' },
  trendingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },

  recentList: { gap: 2 },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.darkCard, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.darkBorder,
  },
  recentText: { fontSize: FontSizes.sm, color: Colors.white },

  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trendingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.darkCard, borderRadius: Radius.md,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.darkBorder, position: 'relative',
  },
  trendingEmoji: { fontSize: 16 },
  trendingLabel: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600' },
  hotBadge: {
    backgroundColor: Colors.pink, borderRadius: 4,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  hotBadgeText: { fontSize: 6, color: Colors.white, fontWeight: '800' },

  browseTitle: {
    fontSize: FontSizes.xs, color: Colors.white, fontWeight: '600',
    marginBottom: 8, letterSpacing: 0.3,
  },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  emptySub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center' },
  emptySuggestions: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' },
  emptySuggestionChip: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: Colors.darkBorder,
  },
  emptySuggestionText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
});
