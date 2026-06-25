import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { useGrandDrawStore } from '../../src/store';
import { MOCK_LOGIN_HISTORY, MOCK_GRAND_DRAW_COMPLETE } from '../../src/mocks';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import TicketLogo from '../../src/components/TicketLogo';
import DailyTicketClaim from '../../src/components/DailyTicketClaim';
import ShieldNotification from '../../src/components/ShieldNotification';

function getCountdownParts(targetISO: string) {
  const diff = Math.max(0, new Date(targetISO).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return { d, h, m };
}

function LoginCalendar({ history }: { history: typeof MOCK_LOGIN_HISTORY }) {
  const today = new Date().toISOString().split('T')[0];
  return (
    <View style={calStyles.wrap}>
      <View style={calStyles.grid}>
        {history.map((day, i) => {
          const isToday = day.date === today;
          const isFuture = day.date > today;
          return (
            <View
              key={day.date}
              style={[
                calStyles.cell,
                day.loggedIn && !day.shieldUsed && calStyles.cellLoggedIn,
                day.shieldUsed && calStyles.cellShield,
                !day.loggedIn && !day.shieldUsed && !isFuture && calStyles.cellMissed,
                isFuture && calStyles.cellFuture,
                isToday && calStyles.cellToday,
              ]}
            >
              {day.shieldUsed
                ? <Ionicons name="shield-checkmark" size={9} color={Colors.gold} />
                : <Text style={[calStyles.cellNum, day.loggedIn && calStyles.cellNumOn]}>
                    {new Date(day.date).getDate()}
                  </Text>
              }
            </View>
          );
        })}
      </View>
      <View style={calStyles.legend}>
        <View style={calStyles.legendItem}><View style={[calStyles.legendDot, { backgroundColor: Colors.gold }]} /><Text style={calStyles.legendText}>Logged in</Text></View>
        <View style={calStyles.legendItem}><Ionicons name="shield-checkmark" size={10} color={Colors.gold} /><Text style={calStyles.legendText}>Shield used</Text></View>
        <View style={calStyles.legendItem}><View style={[calStyles.legendDot, { backgroundColor: Colors.darkBorder }]} /><Text style={calStyles.legendText}>Missed</Text></View>
      </View>
    </View>
  );
}

export default function GrandDrawScreen() {
  const router = useRouter();
  const { grandDraw, streak } = useGrandDrawStore();
  const [shieldBannerDismissed, setShieldBannerDismissed] = useState(false);
  const [countdown, setCountdown] = useState(getCountdownParts(grandDraw.drawDate));

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdownParts(grandDraw.drawDate)), 60000);
    return () => clearInterval(id);
  }, [grandDraw.drawDate]);

  const showShieldBanner = streak.shieldUsedAt !== null
    && streak.shieldUsedAt === new Date().toISOString().split('T')[0]
    && !shieldBannerDismissed;

  const progressPct = grandDraw.myTickets / grandDraw.totalTickets;

  return (
    <ScreenWrapper>
      {/* Nav */}
      <View style={styles.nav}>
        <TicketLogo size="md" />
        <Text style={styles.monthLabel}>{grandDraw.month}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {showShieldBanner && (
          <ShieldNotification
            streakCount={streak.current}
            onDismiss={() => setShieldBannerDismissed(true)}
          />
        )}

        {/* Prize card */}
        <View style={styles.prizeCard}>
          <View style={styles.prizeEyebrow}>
            <View style={styles.prizeLiveDot} />
            <Text style={styles.prizeEyebrowText}>GRAND DRAW</Text>
          </View>
          <Text style={styles.prizeEmoji}>{grandDraw.prize.emoji}</Text>
          <Text style={styles.prizeTitle}>{grandDraw.prize.title}</Text>
          <Text style={styles.prizeDesc}>{grandDraw.prize.description}</Text>
          <View style={styles.prizeValueRow}>
            <Text style={styles.prizeRetail}>Worth £{grandDraw.prize.retailValue.toLocaleString()}</Text>
            <View style={styles.prizeFundBadge}>
              <Text style={styles.prizeFundText}>Fund: £{grandDraw.fundTotal.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Countdown */}
        <View style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>Draw resolves in</Text>
          <View style={styles.countdownRow}>
            {[
              { val: countdown.d, unit: 'days' },
              { val: countdown.h, unit: 'hrs' },
              { val: countdown.m, unit: 'min' },
            ].map(({ val, unit }) => (
              <View key={unit} style={styles.countdownUnit}>
                <Text style={styles.countdownNum}>{String(val).padStart(2, '0')}</Text>
                <Text style={styles.countdownUnitLabel}>{unit}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.countdownSub}>Last day of {grandDraw.month} · 9pm</Text>
        </View>

        {/* Your tickets card */}
        <View style={styles.ticketsCard}>
          <View style={styles.ticketsTop}>
            <View>
              <Text style={styles.ticketsNum}>{grandDraw.myTickets}</Text>
              <Text style={styles.ticketsLabel}>your entries this month</Text>
            </View>
            <View style={styles.oddsBox}>
              <Text style={styles.oddsNum}>1 in {grandDraw.myOdds.toLocaleString()}</Text>
              <Text style={styles.oddsLabel}>your odds</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, progressPct * 100 * 20)}%` as any }]} />
          </View>
          <Text style={styles.totalEntries}>{grandDraw.totalTickets.toLocaleString()} total entries</Text>
        </View>

        {/* Daily ticket claim */}
        <Text style={styles.sectionTitle}>Today's ticket</Text>
        <DailyTicketClaim />

        {/* Streak */}
        <Text style={styles.sectionTitle}>Your streak</Text>
        <View style={styles.streakCard}>
          <View style={styles.streakMain}>
            <Text style={styles.streakFlame}>🔥</Text>
            <View>
              <Text style={styles.streakNum}>{streak.current}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>
            <View style={styles.streakDivider} />
            <View>
              <Text style={styles.streakNum}>{streak.longest}</Text>
              <Text style={styles.streakLabel}>longest</Text>
            </View>
            <View style={styles.streakDivider} />
            <View>
              <Text style={styles.streakNum}>{streak.totalEarned}</Text>
              <Text style={styles.streakLabel}>all time</Text>
            </View>
          </View>
          {streak.current >= 7 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>
                {streak.current >= 30 ? '🏅 Monthly Faithful' : '⭐ 7-day streak'}
              </Text>
            </View>
          )}
        </View>

        {/* Login calendar */}
        <Text style={styles.sectionTitle}>This month</Text>
        <LoginCalendar history={MOCK_LOGIN_HISTORY} />

        {/* Past draws */}
        <Text style={styles.sectionTitle}>Past draws</Text>
        <View style={styles.pastCard}>
          <View style={styles.pastTop}>
            <Text style={styles.pastEmoji}>{MOCK_GRAND_DRAW_COMPLETE.prize.emoji}</Text>
            <View style={styles.pastInfo}>
              <Text style={styles.pastMonth}>{MOCK_GRAND_DRAW_COMPLETE.month}</Text>
              <Text style={styles.pastTitle}>{MOCK_GRAND_DRAW_COMPLETE.prize.title}</Text>
              <Text style={styles.pastValue}>£{MOCK_GRAND_DRAW_COMPLETE.prize.retailValue.toLocaleString()}</Text>
            </View>
            <View style={styles.pastWinner}>
              <Text style={styles.pastWinnerLabel}>WINNER</Text>
              <Text style={styles.pastWinnerHandle}>{MOCK_GRAND_DRAW_COMPLETE.winner?.handle}</Text>
            </View>
          </View>
          <View style={styles.pastStats}>
            <Text style={styles.pastStatText}>
              {MOCK_GRAND_DRAW_COMPLETE.winner?.tickets} tickets held · {MOCK_GRAND_DRAW_COMPLETE.winner?.ticketPct}% of pool
            </Text>
          </View>
        </View>

        {__DEV__ && (
          <TouchableOpacity
            style={styles.devBtn}
            onPress={() => {
              useGrandDrawStore.getState().setStatus('drawing');
              router.push('/grand-draw/live' as any);
            }}
          >
            <Text style={styles.devBtnText}>⚙ Simulate draw (dev)</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </ScreenWrapper>
  );
}

const calStyles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  cell: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'transparent',
  },
  cellLoggedIn: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  cellShield: { backgroundColor: 'rgba(249,200,70,0.2)', borderColor: Colors.gold },
  cellMissed: { backgroundColor: 'rgba(226,75,74,0.1)', borderColor: 'rgba(226,75,74,0.2)' },
  cellFuture: { opacity: 0.3 },
  cellToday: { borderColor: Colors.pink, borderWidth: 2 },
  cellNum: { fontSize: 9, color: Colors.textTertiary, fontWeight: '600' },
  cellNumOn: { color: Colors.ink, fontWeight: '800' },
  legend: { flexDirection: 'row', gap: 12, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 9, color: Colors.textTertiary },
});

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    backgroundColor: '#100c20',
    borderBottomWidth: 1, borderBottomColor: 'rgba(249,200,70,0.15)',
  },
  monthLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 48 },

  // Prize card
  prizeCard: {
    backgroundColor: Colors.violet,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(249,200,70,0.35)',
    alignItems: 'center',
    gap: 6,
  },
  prizeEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  prizeLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gold },
  prizeEyebrowText: { fontSize: 10, fontWeight: '800', color: Colors.gold, letterSpacing: 1.5 },
  prizeEmoji: { fontSize: 56, marginVertical: 4 },
  prizeTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, textAlign: 'center' },
  prizeDesc: { fontSize: FontSizes.xs, color: 'rgba(210,195,240,0.7)', textAlign: 'center', lineHeight: 17 },
  prizeValueRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  prizeRetail: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '800' },
  prizeFundBadge: {
    backgroundColor: 'rgba(249,200,70,0.2)', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.4)',
  },
  prizeFundText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '700' },

  // Countdown
  countdownCard: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.darkBorder,
    padding: Spacing.md, alignItems: 'center', gap: 6,
  },
  countdownLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: '700', letterSpacing: 0.8 },
  countdownRow: { flexDirection: 'row', gap: 16 },
  countdownUnit: { alignItems: 'center' },
  countdownNum: { fontFamily: Fonts.serif, fontSize: FontSizes.xxl, color: Colors.gold, lineHeight: 36 },
  countdownUnitLabel: { fontSize: 9, color: Colors.textTertiary, fontWeight: '600', letterSpacing: 0.5 },
  countdownSub: { fontSize: FontSizes.xs, color: Colors.textTertiary },

  // Tickets card
  ticketsCard: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.darkBorder,
    padding: Spacing.md, gap: Spacing.sm,
  },
  ticketsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  ticketsNum: { fontFamily: Fonts.serif, fontSize: FontSizes.xxl, color: Colors.white },
  ticketsLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  oddsBox: { alignItems: 'flex-end' },
  oddsNum: { fontSize: FontSizes.base, color: Colors.lilac, fontWeight: '700' },
  oddsLabel: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: 2 },
  progressTrack: {
    height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: 5, backgroundColor: Colors.gold, borderRadius: 3 },
  totalEntries: { fontSize: FontSizes.xs, color: Colors.textTertiary },

  sectionTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.base, color: Colors.white, marginTop: 4 },

  // Streak
  streakCard: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.darkBorder,
    padding: Spacing.md, gap: Spacing.sm,
  },
  streakMain: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  streakFlame: { fontSize: 28 },
  streakNum: { fontSize: FontSizes.lg, color: Colors.white, fontWeight: '800' },
  streakLabel: { fontSize: 9, color: Colors.textTertiary, marginTop: 2 },
  streakDivider: { width: 1, height: 30, backgroundColor: Colors.darkBorder },
  streakBadge: {
    backgroundColor: 'rgba(249,200,70,0.1)', borderRadius: Radius.pill,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.25)',
    paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start',
  },
  streakBadgeText: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '700' },

  // Past draws
  pastCard: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.darkBorder,
    padding: Spacing.md, gap: Spacing.sm,
  },
  pastTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pastEmoji: { fontSize: 32 },
  pastInfo: { flex: 1 },
  pastMonth: { fontSize: 9, color: Colors.textTertiary, fontWeight: '700', letterSpacing: 0.8 },
  pastTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700', marginTop: 2 },
  pastValue: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '700', marginTop: 1 },
  pastWinner: { alignItems: 'flex-end' },
  pastWinnerLabel: { fontSize: 8, color: Colors.textTertiary, fontWeight: '800', letterSpacing: 1 },
  pastWinnerHandle: { fontSize: FontSizes.sm, color: Colors.lilac, fontWeight: '700', marginTop: 2 },
  pastStats: {
    backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: Radius.sm,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.15)',
    padding: Spacing.sm,
  },
  pastStatText: { fontSize: FontSizes.xs, color: Colors.textSecondary },

  devBtn: {
    borderWidth: 1, borderColor: Colors.darkBorder, borderRadius: Radius.md,
    padding: Spacing.sm, alignItems: 'center', marginTop: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  devBtnText: { fontSize: FontSizes.xs, color: Colors.textTertiary },
});
