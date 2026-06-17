import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_MY_TICKETS } from '../../src/mocks';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import ProgressBar from '../../src/components/ProgressBar';
import { formatTicketPrice } from '../../src/utils/countdown';

export default function TicketsScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.heading}>My Tickets</Text>
        <Text style={styles.sub}>You're in {MOCK_MY_TICKETS.length} draws</Text>
      </View>

      <FlatList
        data={MOCK_MY_TICKETS}
        keyExtractor={d => d.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const progress = item.ticketsSold / item.totalTickets;
          const isTonight = item.status === 'closing_tonight';
          return (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/draw/${item.id}`)}>
              <View style={styles.cardTop}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <View style={styles.info}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.seller}>{item.seller}</Text>
                  <ProgressBar progress={progress} height={4} />
                  <Text style={styles.threshold}>
                    {Math.round(progress * 100)}% sold · {isTonight ? '🔴 Tonight' : 'Tomorrow'}
                  </Text>
                </View>
                <View style={styles.right}>
                  <View style={styles.valueBadge}>
                    <Text style={styles.valueText}>£{item.retailValue.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.cardBottom}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{item.myTickets}</Text>
                  <Text style={styles.statLabel}>your tickets</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{formatTicketPrice(item.ticketPrice)}</Text>
                  <Text style={styles.statLabel}>each</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statVal, { color: Colors.lilac }]}>
                    {((item.myTickets / item.totalTickets) * 100).toFixed(2)}%
                  </Text>
                  <Text style={styles.statLabel}>your odds</Text>
                </View>
                <TouchableOpacity style={styles.addMore} onPress={() => router.push(`/purchase/${item.id}`)}>
                  <Text style={styles.addMoreText}>+ More</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  heading: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  list: { padding: Spacing.lg, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, padding: Spacing.md },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  emoji: { fontSize: 32, marginTop: 4 },
  info: { flex: 1, gap: 4 },
  title: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  seller: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  threshold: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: 2 },
  right: {},
  valueBadge: { backgroundColor: Colors.gold, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  valueText: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.ink },
  divider: { height: 1, backgroundColor: Colors.darkBorder, marginVertical: Spacing.sm },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  addMore: { backgroundColor: Colors.lilac, borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
  addMoreText: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '700' },
});
