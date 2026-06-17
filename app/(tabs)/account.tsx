import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { useAuthStore } from '../../src/store';
import ScreenWrapper from '../../src/components/ScreenWrapper';
import { formatTicketPrice } from '../../src/utils/countdown';

const MENU = [
  { label: 'My wallet', icon: 'wallet-outline', route: '/wallet' },
  { label: 'Notifications', icon: 'notifications-outline', route: null },
  { label: 'Become a seller', icon: 'storefront-outline', route: '/seller/gate' },
  { label: 'Seller dashboard', icon: 'bar-chart-outline', route: '/seller/dashboard' },
  { label: 'Privacy policy', icon: 'shield-outline', route: null },
  { label: 'Terms of service', icon: 'document-text-outline', route: null },
];

export default function AccountScreen() {
  const router = useRouter();
  const { handle, avatar, walletBalance, logout } = useAuthStore();

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile */}
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatar}</Text>
          </View>
          <Text style={styles.handle}>{handle}</Text>
          <View style={styles.balancePill}>
            <Text style={styles.balanceText}>{formatTicketPrice(walletBalance)}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>3</Text>
            <Text style={styles.statLabel}>Draws entered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>23</Text>
            <Text style={styles.statLabel}>Tickets held</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>1</Text>
            <Text style={styles.statLabel}>Won</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU.map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuRow}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <Ionicons name={item.icon as any} size={18} color={Colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => { logout(); router.replace('/(auth)'); }}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingBottom: 40 },
  profile: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.royal, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarText: { fontSize: 24, color: Colors.white, fontWeight: '700' },
  handle: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white, marginBottom: 8 },
  balancePill: { backgroundColor: Colors.darkCard, borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 5 },
  balanceText: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.darkCard, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.darkBorder },
  menu: { backgroundColor: Colors.darkCard, borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.lg },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.darkBorder,
  },
  menuLabel: { flex: 1, fontSize: FontSizes.base, color: Colors.white },
  logoutBtn: { alignItems: 'center', padding: Spacing.md },
  logoutText: { fontSize: FontSizes.base, color: Colors.danger, fontWeight: '600' },
});
