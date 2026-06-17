import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_NOTIFICATIONS, Notification } from '../../src/mocks';

function iconForType(type: Notification['type']): { name: string; color: string } {
  switch (type) {
    case 'win':
      return { name: 'trophy', color: Colors.gold };
    case 'reminder':
      return { name: 'alarm', color: Colors.lilac };
    case 'threshold':
      return { name: 'checkmark-circle', color: Colors.lilac };
    case 'approved':
      return { name: 'shield-checkmark', color: Colors.pink };
    case 'payout':
      return { name: 'cash', color: Colors.pink };
    default:
      return { name: 'notifications', color: Colors.textSecondary };
  }
}

function bgForType(type: Notification['type']): string {
  switch (type) {
    case 'win':      return 'rgba(249,200,70,0.08)';
    case 'reminder':
    case 'threshold': return 'rgba(139,92,246,0.08)';
    case 'approved':
    case 'payout':   return 'rgba(244,114,182,0.08)';
    default:         return Colors.darkCard;
  }
}

function borderForType(type: Notification['type']): string {
  switch (type) {
    case 'win':      return 'rgba(249,200,70,0.2)';
    case 'reminder':
    case 'threshold': return 'rgba(139,92,246,0.2)';
    case 'approved':
    case 'payout':   return 'rgba(244,114,182,0.2)';
    default:         return Colors.darkBorder;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 34 }} />
      </View>

      {MOCK_NOTIFICATIONS.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySub}>Draw alerts and win announcements will appear here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {MOCK_NOTIFICATIONS.map(n => {
            const { name: iconName, color: iconColor } = iconForType(n.type);
            return (
              <View
                key={n.id}
                style={[
                  styles.row,
                  { backgroundColor: bgForType(n.type), borderColor: borderForType(n.type) },
                  !n.read && styles.rowUnread,
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: `${iconColor}22` }]}>
                  <Ionicons name={iconName as any} size={18} color={iconColor} />
                </View>
                <View style={styles.textBox}>
                  <Text style={styles.rowTitle}>{n.title}</Text>
                  <Text style={styles.rowBody}>{n.body}</Text>
                </View>
                <View style={styles.meta}>
                  <Text style={styles.time}>{n.time}</Text>
                  {!n.read && <View style={styles.unreadDot} />}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.darkBorder,
  },
  back: { padding: 4 },
  headerTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.md, color: Colors.white },

  list: { padding: Spacing.md, gap: 10, paddingBottom: 40 },
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1,
  },
  rowUnread: { borderLeftWidth: 3, borderLeftColor: Colors.lilac },
  iconBox: {
    width: 36, height: 36, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  textBox: { flex: 1 },
  rowTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600', marginBottom: 2 },
  rowBody: { fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 16 },
  meta: { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  time: { fontSize: 9, color: Colors.textTertiary },
  unreadDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: Colors.lilac },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: Spacing.xxl },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  emptySub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
});
