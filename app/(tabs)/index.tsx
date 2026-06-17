import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_DRAWS } from '../../src/mocks';
import TicketLogo from '../../src/components/TicketLogo';
import DrawCard from '../../src/components/DrawCard';
import WalletBadge from '../../src/components/WalletBadge';
import ScreenWrapper from '../../src/components/ScreenWrapper';

const FILTERS = ['Tonight', 'High value', 'Bundles', 'Just listed'];

export default function HomeScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('Tonight');
  const tonightCount = MOCK_DRAWS.filter(d => d.status === 'closing_tonight').length;
  const myCount = MOCK_DRAWS.filter(d => d.myTickets > 0).length;

  const filtered = MOCK_DRAWS.filter(d => {
    if (filter === 'Tonight') return d.status === 'closing_tonight';
    if (filter === 'Bundles') return d.isBundle;
    if (filter === 'High value') return d.retailValue >= 500;
    return true;
  });

  return (
    <ScreenWrapper>
      {/* Nav */}
      <View style={styles.nav}>
        <TicketLogo size="md" />
        <View style={styles.navRight}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <WalletBadge />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tonight banner */}
        <View style={styles.tonightBanner}>
          <View style={styles.tonightTop}>
            <View style={styles.liveRow}>
              <View style={[styles.dot, { backgroundColor: Colors.pink }]} />
              <Text style={styles.liveText}>LIVE TONIGHT</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/live')} style={styles.watchBtn}>
              <Text style={styles.watchText}>Watch</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.tonightTitle}>{tonightCount} draws resolve at 9pm</Text>
          <Text style={styles.tonightSub}>You're entered in {myCount} of them</Text>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipOn]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextOn]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Closing soon</Text>

        {/* 2-col grid */}
        <View style={styles.grid}>
          {filtered.map((draw, i) => {
            if (draw.isBundle) {
              return (
                <View key={draw.id} style={styles.wideCard}>
                  <DrawCard draw={draw} wide />
                </View>
              );
            }
            if (i % 2 === 0) {
              const next = filtered[i + 1];
              if (!next || next.isBundle) {
                return (
                  <View key={draw.id} style={styles.wideCard}>
                    <DrawCard draw={draw} />
                  </View>
                );
              }
              return (
                <View key={draw.id} style={styles.row}>
                  <View style={styles.halfCard}><DrawCard draw={draw} /></View>
                  {next && !next.isBundle && (
                    <View style={styles.halfCard}><DrawCard draw={next} /></View>
                  )}
                </View>
              );
            }
            if (filtered[i - 1] && !filtered[i - 1].isBundle) return null;
            return (
              <View key={draw.id} style={styles.wideCard}>
                <DrawCard draw={draw} />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.darkDeep, borderBottomWidth: 1, borderBottomColor: Colors.darkCard,
  },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tonightBanner: {
    backgroundColor: Colors.royal, margin: Spacing.md, borderRadius: Radius.md, padding: Spacing.md,
  },
  tonightTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 99 },
  liveText: { fontSize: 9, fontWeight: '700', color: Colors.white, letterSpacing: 0.6 },
  watchBtn: { backgroundColor: Colors.pink, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  watchText: { fontSize: 9, fontWeight: '600', color: Colors.white },
  tonightTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600' },
  tonightSub: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '600', marginTop: 2 },
  filterRow: { paddingHorizontal: Spacing.md, gap: 8, paddingBottom: 4 },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.darkBorder },
  chipOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  chipText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  chipTextOn: { color: Colors.white },
  sectionTitle: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '600', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 6 },
  grid: { paddingHorizontal: Spacing.md, gap: 8, paddingBottom: 20 },
  row: { flexDirection: 'row', gap: 8 },
  halfCard: { flex: 1 },
  wideCard: { flex: 1 },
});
