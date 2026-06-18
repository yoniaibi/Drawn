import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Modal, Pressable, Clipboard, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { useAuthStore } from '../../src/store';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import { formatTicketPrice } from '../../src/utils/countdown';
import { useStreak } from '../../src/hooks/useStreak';
import { fetchUserStats, checkForWins, UserStats, WinResult } from '../../src/services/draws';
import { supabase } from '../../src/lib/supabase';
import ProgressBar from '../../src/components/ProgressBar';

const AVATAR_EMOJIS = [
  '🦋','🌸','⭐','🔥','💜','🎯','🏆','💎','🦄','🌊',
  '🎸','🐆','🍀','🦅','🌙','🎭','🦁','🌺','💫','🎪',
  '🐉','🌈','⚡','🎀','🦊','🐺','🍉','🎵','🌟','🎃',
  '🦋','🐬','🎨','🏄','🧿','🌴','🦩','🎯','🔮','🌙',
];

const MENU = [
  { label: 'My wallet', icon: 'wallet-outline', route: '/wallet', sub: 'Top up & see transactions' },
  { label: 'Notifications', icon: 'notifications-outline', route: '/notifications', sub: 'Draw alerts & win notifications' },
  { label: 'Become a seller', icon: 'storefront-outline', route: '/seller/gate', sub: 'List items & earn cash' },
  { label: 'Seller dashboard', icon: 'bar-chart-outline', route: '/seller/dashboard', sub: 'Your draws & earnings' },
  { label: 'Privacy policy', icon: 'shield-outline', route: null, sub: null },
  { label: 'Terms of service', icon: 'document-text-outline', route: null, sub: null },
];

export default function AccountScreen() {
  const router = useRouter();
  const { user, handle, avatar, walletBalance, logout } = useAuthStore();
  const { streak } = useStreak();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [wins, setWins] = useState<WinResult[]>([]);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(avatar);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchUserStats(user.id), checkForWins(user.id)]).then(([s, w]) => {
      setStats(s);
      setWins(w.slice(0, 3));
    });
  }, [user]);

  const referralCode = 'DRAWN-' + (handle ?? 'YOU').replace('@', '').toUpperCase().slice(0, 5);
  const [copied, setCopied] = useState(false);

  function copyReferral() {
    Clipboard.setString(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function saveAvatar() {
    if (!user) return;
    await supabase.from('profiles').update({ avatar_letter: selectedEmoji }).eq('id', user.id);
    useAuthStore.getState().refreshProfile();
    setEditVisible(false);
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile hero */}
        <View style={styles.profile}>
          <TouchableOpacity onPress={() => { setSelectedEmoji(avatar); setEditVisible(true); }} activeOpacity={0.8}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatar}</Text>
              </View>
              <View style={styles.avatarEditBadge}>
                <Ionicons name="pencil" size={9} color={Colors.white} />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.handle}>{handle}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>✦ FOUNDING MEMBER</Text>
            </View>
            {streak >= 1 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeText}>🔥 {streak} day streak</Text>
              </View>
            )}
          </View>
          <View style={styles.balancePill}>
            <Ionicons name="wallet" size={12} color={Colors.gold} />
            <Text style={styles.balanceText}>{formatTicketPrice(walletBalance)}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats === null ? (
            <View style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ color: Colors.textTertiary, fontSize: FontSizes.xs }}>Loading…</Text>
            </View>
          ) : (
            <>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{stats.activeDraws}</Text>
                <Text style={styles.statLabel}>Active draws</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statVal}>{stats.totalTickets}</Text>
                <Text style={styles.statLabel}>Tickets</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={[styles.stat]}>
                <Text style={[styles.statVal, { color: Colors.gold }]}>{stats.wins}</Text>
                <Text style={styles.statLabel}>Won 🏆</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={[styles.statVal, { color: Colors.lilac }]}>
                  {stats.totalWon > 0 ? `£${(stats.totalWon / 100).toFixed(0)}` : '£0'}
                </Text>
                <Text style={styles.statLabel}>Won total</Text>
              </View>
            </>
          )}
        </View>

        {/* Achievement badges */}
        {stats !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={[styles.badgesGrid, { marginTop: 8 }]}>
              {[
                { emoji: '✦', label: 'Founding Member', unlocked: true, color: Colors.gold, progress: 1, max: 1, unit: '' },
                { emoji: '🎟️', label: 'First Entry', unlocked: (stats.totalTickets ?? 0) >= 1, color: Colors.lilac, progress: Math.min(stats.totalTickets ?? 0, 1), max: 1, unit: 'ticket' },
                { emoji: '🔥', label: '3-Day Streak', unlocked: streak >= 3, color: Colors.pink, progress: Math.min(streak, 3), max: 3, unit: 'days' },
                { emoji: '🏆', label: 'First Win', unlocked: (stats.wins ?? 0) >= 1, color: Colors.gold, progress: Math.min(stats.wins ?? 0, 1), max: 1, unit: 'win' },
                { emoji: '🎯', label: '25 Tickets', unlocked: (stats.totalTickets ?? 0) >= 25, color: Colors.lilac, progress: Math.min(stats.totalTickets ?? 0, 25), max: 25, unit: 'tickets' },
                { emoji: '💎', label: 'Big Winner', unlocked: (stats.totalWon ?? 0) >= 100000, color: Colors.gold, progress: Math.min(stats.totalWon ?? 0, 100000), max: 100000, unit: '' },
              ].map(b => (
                <View key={b.label} style={[styles.badge, !b.unlocked && styles.badgeLocked]}>
                  <Text style={[styles.badgeEmoji, !b.unlocked && { opacity: 0.3 }]}>{b.emoji}</Text>
                  <Text style={[styles.badgeLabel, !b.unlocked && { color: Colors.textTertiary }]} numberOfLines={1}>{b.label}</Text>
                  {!b.unlocked && (
                    <View style={{ width: '100%', marginTop: 4 }}>
                      <ProgressBar progress={b.progress / b.max} height={3} color={b.color} />
                      <Text style={styles.badgeProgress}>{b.progress}/{b.max} {b.unit}</Text>
                    </View>
                  )}
                  {b.unlocked && (
                    <View style={[styles.badgeCheck, { backgroundColor: b.color + '22' }]}>
                      <Ionicons name="checkmark" size={10} color={b.color} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent wins */}
        {stats !== null && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent wins</Text>
              {wins.length > 0 && (
                <TouchableOpacity onPress={() => router.push('/notifications' as any)}>
                  <Text style={styles.sectionLink}>View all →</Text>
                </TouchableOpacity>
              )}
            </View>
            {wins.length === 0 ? (
              <View style={styles.noWinsCard}>
                <Text style={styles.noWinsEmoji}>🎯</Text>
                <Text style={styles.noWinsTitle}>No wins yet</Text>
                <Text style={styles.noWinsSub}>Enter more draws to boost your chances. Winners are drawn every night at 9pm.</Text>
                <TouchableOpacity style={styles.noWinsBtn} onPress={() => router.push('/(tabs)' as any)}>
                  <Text style={styles.noWinsBtnText}>Browse draws →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              wins.map((w) => (
                <TouchableOpacity key={w.drawId} style={styles.winCard} onPress={() => router.push(`/live/winner/${w.drawId}` as any)}>
                  <Text style={styles.winEmoji}>{w.drawEmoji}</Text>
                  <View style={styles.winInfo}>
                    <Text style={styles.winItem}>{w.drawTitle}</Text>
                    <Text style={styles.winDate}>{w.completedAt ? new Date(w.completedAt).toLocaleDateString() : 'Recently'}</Text>
                  </View>
                  <View style={styles.winValueBadge}>
                    <Text style={styles.winValue}>£{(w.retailValue / 100).toFixed(0)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Referral CTA */}
        <View style={styles.referralCard}>
          <View style={styles.referralLeft}>
            <Text style={styles.referralTitle}>Invite friends, earn tickets 🎫</Text>
            <Text style={styles.referralSub}>
              Share your code and get <Text style={styles.referralBold}>£1 credit</Text> for every friend who joins
            </Text>
            <View style={styles.referralCodeRow}>
              <View style={styles.referralCodeBox}>
                <Text style={styles.referralCode}>{referralCode}</Text>
              </View>
              <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnDone]} onPress={copyReferral}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={12} color={copied ? Colors.success : Colors.lilac} />
                <Text style={[styles.copyBtnText, copied && { color: Colors.success }]}>{copied ? 'Copied!' : 'Copy'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={() => Share.share({ message: `Join DRAWN and win designer pieces from 10p! Use my code ${referralCode} · drawn.app` })}>
            <Ionicons name="share-social" size={22} color={Colors.lilac} />
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, idx === MENU.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name={item.icon as any} size={17} color={Colors.lilac} />
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/(auth)'); }}>
          <Ionicons name="log-out-outline" size={16} color={Colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Drawn · v1.0 · London, UK</Text>
      </ScrollView>

      {/* Avatar edit modal */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose your avatar</Text>
            <View style={styles.emojiGrid}>
              {AVATAR_EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiBtn, selectedEmoji === e && styles.emojiBtnOn]}
                  onPress={() => setSelectedEmoji(e)}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={saveAvatar}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingBottom: 40 },

  profile: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarRing: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 2, borderColor: Colors.lilac,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.royal, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 26, color: Colors.white, fontWeight: '700' },
  handle: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white, marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  memberBadge: {
    backgroundColor: 'rgba(249,200,70,0.12)', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.25)',
  },
  memberBadgeText: { fontSize: 8, color: Colors.gold, fontWeight: '800', letterSpacing: 1 },
  streakBadge: {
    backgroundColor: 'rgba(244,114,182,0.12)', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(244,114,182,0.25)',
  },
  streakBadgeText: { fontSize: 8, color: Colors.pink, fontWeight: '800' },
  balancePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.darkCard, borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)',
  },
  balanceText: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.darkCard, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white },
  statLabel: { fontSize: 9, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.darkBorder },

  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionLink: { fontSize: FontSizes.xs, color: Colors.lilac, fontWeight: '600' },

  noWinsCard: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.lg,
    alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.darkBorder,
  },
  noWinsEmoji: { fontSize: 32, marginBottom: 4 },
  noWinsTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
  noWinsSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 16 },
  noWinsBtn: {
    marginTop: 8, backgroundColor: Colors.lilac, borderRadius: Radius.md,
    paddingVertical: 8, paddingHorizontal: 20,
  },
  noWinsBtnText: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '700' },

  winCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.15)',
  },
  winEmoji: { fontSize: 28 },
  winInfo: { flex: 1 },
  winItem: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  winDate: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  winValueBadge: { backgroundColor: Colors.gold, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  winValue: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.ink },

  referralCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(109,40,217,0.15)', borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)',
  },
  referralLeft: { flex: 1 },
  referralTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700', marginBottom: 4 },
  referralSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 16 },
  referralBold: { color: Colors.gold, fontWeight: '700' },
  referralCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  referralCodeBox: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.darkBorder,
  },
  referralCode: { fontSize: FontSizes.xs, color: Colors.lilac, fontWeight: '700', letterSpacing: 1 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.4)', backgroundColor: 'rgba(139,92,246,0.1)',
  },
  copyBtnDone: { borderColor: 'rgba(16,185,129,0.4)', backgroundColor: 'rgba(16,185,129,0.1)' },
  copyBtnText: { fontSize: 9, color: Colors.lilac, fontWeight: '700' },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    width: '30%', flexGrow: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.md,
    padding: Spacing.sm, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.darkBorder, position: 'relative', minWidth: 90,
  },
  badgeLocked: { opacity: 0.6 },
  badgeEmoji: { fontSize: 22 },
  badgeLabel: { fontSize: 9, color: Colors.white, fontWeight: '700', textAlign: 'center', letterSpacing: 0.2 },
  badgeLockIcon: { position: 'absolute', top: 4, right: 4 },
  badgeLockText: { fontSize: 8 },
  badgeProgress: { fontSize: 7, color: Colors.textTertiary, marginTop: 2, textAlign: 'center' },
  badgeCheck: { borderRadius: 10, padding: 3, marginTop: 2 },

  menu: { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.lg },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.darkBorder,
  },
  menuIconBox: {
    width: 32, height: 32, borderRadius: Radius.sm,
    backgroundColor: 'rgba(139,92,246,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  menuTextBox: { flex: 1 },
  menuLabel: { fontSize: FontSizes.base, color: Colors.white },
  menuSub: { fontSize: 9, color: Colors.textTertiary, marginTop: 2 },

  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.lilac, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.darkBg,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.darkCard, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.xl, paddingBottom: 48,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.darkBorder, alignSelf: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white, textAlign: 'center', marginBottom: Spacing.lg },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: Spacing.xl },
  emojiBtn: {
    width: 52, height: 52, borderRadius: Radius.md,
    backgroundColor: Colors.darkBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.darkBorder,
  },
  emojiBtnOn: { borderColor: Colors.lilac, backgroundColor: 'rgba(139,92,246,0.15)' },
  emojiText: { fontSize: 26 },
  saveBtn: {
    backgroundColor: Colors.lilac, borderRadius: Radius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  saveBtnText: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: Spacing.md, marginBottom: 4 },
  logoutText: { fontSize: FontSizes.base, color: Colors.danger, fontWeight: '600' },

  version: { textAlign: 'center', fontSize: 9, color: Colors.textTertiary },
});
