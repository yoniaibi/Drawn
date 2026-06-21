import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Switch, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import { useAuthStore } from '../../src/store';
import { supabase } from '../../src/lib/supabase';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { user, handle, notifyBeforeClose, refreshProfile } = useAuthStore();

  const [newHandle, setNewHandle] = useState(handle.replace('@', ''));
  const [notifyToggle, setNotifyToggle] = useState(notifyBeforeClose);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleChanged = newHandle.trim() !== handle.replace('@', '');
  const anyChange = handleChanged || notifyToggle !== notifyBeforeClose;

  async function save() {
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      const updates: Record<string, unknown> = { notify_before_close: notifyToggle };
      if (handleChanged) {
        const clean = newHandle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (clean.length < 3) { setError('Handle must be at least 3 characters.'); return; }
        updates.handle = `@${clean}`;
      }
      const { error: err } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (err) throw new Error(err.message);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function requestPasswordReset() {
    if (!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email);
    setError(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Account settings</Text>

        {/* Handle */}
        <Text style={styles.label}>HANDLE</Text>
        <View style={styles.inputRow}>
          <Text style={styles.atSign}>@</Text>
          <TextInput
            style={styles.input}
            value={newHandle}
            onChangeText={t => { setNewHandle(t); setError(null); }}
            placeholder="yourhandle"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
        </View>
        <Text style={styles.hint}>Lowercase letters, numbers and underscores only. Min 3 characters.</Text>

        {/* Email (read-only) */}
        <Text style={[styles.label, { marginTop: Spacing.lg }]}>EMAIL</Text>
        <View style={styles.readonlyRow}>
          <Text style={styles.readonlyVal}>{user?.email ?? '—'}</Text>
          <TouchableOpacity onPress={requestPasswordReset}>
            <Text style={styles.changeLink}>Change password</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <Text style={[styles.label, { marginTop: Spacing.xl }]}>NOTIFICATIONS</Text>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Closing-night reminders</Text>
            <Text style={styles.toggleSub}>Get notified 1 hour before draws you've entered close</Text>
          </View>
          <Switch
            value={notifyToggle}
            onValueChange={setNotifyToggle}
            trackColor={{ false: Colors.darkBorder, true: Colors.lilac }}
            thumbColor={Colors.white}
          />
        </View>

        {/* Danger zone */}
        <Text style={[styles.label, { marginTop: Spacing.xl }]}>ACCOUNT</Text>
        <TouchableOpacity style={styles.dangerRow} onPress={() => router.push('/account/delete' as any)}>
          <Ionicons name="trash-outline" size={16} color={Colors.danger} />
          <Text style={styles.dangerText}>Delete my account</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>

        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={14} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {saved && (
          <View style={styles.savedCard}>
            <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
            <Text style={styles.savedText}>Saved</Text>
          </View>
        )}

        {saving ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={Colors.lilac} />
            <Text style={styles.loadingText}>Saving…</Text>
          </View>
        ) : (
          <PrimaryButton
            label="Save changes"
            onPress={save}
            style={{ marginTop: Spacing.xl }}
            disabled={!anyChange}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { padding: Spacing.lg, paddingBottom: 48 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: Spacing.xl },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.8, fontWeight: '700', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.darkCard, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.darkBorder },
  atSign: { paddingHorizontal: 12, fontSize: FontSizes.sm, color: Colors.textTertiary },
  input: { flex: 1, paddingVertical: 12, paddingRight: 12, fontSize: FontSizes.sm, color: Colors.white },
  hint: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: 4, lineHeight: 16 },
  readonlyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.darkCard, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.darkBorder, padding: 12 },
  readonlyVal: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  changeLink: { fontSize: FontSizes.xs, color: Colors.lilac, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.darkCard, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.darkBorder, padding: Spacing.md },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '600' },
  toggleSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(226,75,74,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(226,75,74,0.2)', padding: Spacing.md },
  dangerText: { flex: 1, fontSize: FontSizes.sm, color: Colors.danger, fontWeight: '600' },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(226,75,74,0.1)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(226,75,74,0.3)', padding: Spacing.md, marginTop: Spacing.md },
  errorText: { flex: 1, fontSize: FontSizes.sm, color: Colors.danger },
  savedCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(29,158,117,0.1)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(29,158,117,0.3)', padding: Spacing.md, marginTop: Spacing.md },
  savedText: { fontSize: FontSizes.sm, color: Colors.success, fontWeight: '600' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: Spacing.xl },
  loadingText: { fontSize: FontSizes.base, color: Colors.textSecondary, fontStyle: 'italic' },
});
