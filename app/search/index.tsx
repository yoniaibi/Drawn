import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_DRAWS } from '../../src/mocks';
import type { Draw } from '../../src/mocks';
import { fetchDraws } from '../../src/services/draws';
import DrawCard from '../../src/components/DrawCard';

const CHIPS = ['All', 'Tonight', 'Bundles', 'High Value'];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState('All');
  const [allDraws, setAllDraws] = useState<Draw[]>(MOCK_DRAWS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDraws().then(d => { setAllDraws(d); setLoading(false); });
  }, []);

  const results = useMemo(() => {
    let pool = allDraws;

    if (chip === 'Tonight') pool = pool.filter(d => d.status === 'closing_tonight');
    else if (chip === 'Bundles') pool = pool.filter(d => d.isBundle);
    else if (chip === 'High Value') pool = pool.filter(d => d.retailValue >= 500);

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
            style={styles.input}
            placeholder="Search draws, sellers…"
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={setQuery}
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
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

      {/* Results */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {loading && (
          <ActivityIndicator color={Colors.lilac} style={{ marginTop: 40 }} />
        )}
        {!loading && results.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No draws match your search</Text>
            <Text style={styles.emptySub}>Try a different keyword or filter</Text>
          </View>
        ) : !loading && (
          results.map((draw, i) => {
            if (draw.isBundle) {
              return (
                <View key={draw.id} style={styles.wideCard}>
                  <DrawCard draw={draw} wide />
                </View>
              );
            }
            if (i % 2 === 0) {
              const next = results[i + 1];
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
            if (results[i - 1] && !results[i - 1].isBundle) return null;
            return (
              <View key={draw.id} style={styles.wideCard}>
                <DrawCard draw={draw} />
              </View>
            );
          })
        )}
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
    borderWidth: 1, borderColor: Colors.darkBorder,
    paddingHorizontal: Spacing.sm,
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

  grid: { padding: Spacing.md, gap: 8, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  wideCard: {},

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  emptySub: { fontSize: FontSizes.sm, color: Colors.textSecondary },
});
