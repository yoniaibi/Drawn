import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import PrimaryButton from '../../../src/components/PrimaryButton';
import { supabase } from '../../../src/lib/supabase';
import { useAuthStore } from '../../../src/store';

export default function EditListingScreen() {
  const router = useRouter();
  const { drawId } = useLocalSearchParams<{ drawId: string }>();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!drawId) return;
    supabase
      .from('draws')
      .select('title, description, status, seller_id')
      .eq('id', drawId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError('Draw not found.'); setLoading(false); return; }
        if (data.seller_id !== user?.id) { setError('You do not own this draw.'); setLoading(false); return; }
        setTitle(data.title ?? '');
        setDescription(data.description ?? '');
        setStatus(data.status ?? '');
        setCanEdit(data.status === 'pending');
        setLoading(false);
      });
  }, [drawId]);

  async function save() {
    if (!drawId || !canEdit) return;
    setError(null);
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from('draws')
        .update({ title: title.trim(), description: description.trim() })
        .eq('id', drawId);
      if (err) throw new Error(err.message);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Edit listing</Text>

        {loading ? (
          <ActivityIndicator color={Colors.lilac} style={{ marginTop: Spacing.xl }} />
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={14} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {!canEdit && (
              <View style={styles.lockedBanner}>
                <Ionicons name="lock-closed-outline" size={14} color={Colors.gold} />
                <Text style={styles.lockedText}>
                  This draw is {status} — only pending draws can be edited before they go live.
                </Text>
              </View>
            )}

            <Text style={styles.label}>TITLE</Text>
            <TextInput
              style={[styles.input, !canEdit && styles.inputDisabled]}
              value={title}
              onChangeText={setTitle}
              editable={canEdit}
              placeholder="Item title"
              placeholderTextColor={Colors.textTertiary}
              maxLength={80}
            />

            <Text style={[styles.label, { marginTop: Spacing.md }]}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.inputMulti, !canEdit && styles.inputDisabled]}
              value={description}
              onChangeText={setDescription}
              editable={canEdit}
              placeholder="Describe the item…"
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />

            <Text style={styles.lockedNote}>
              Ticket price and quantity cannot be changed once submitted. Contact us at{' '}
              <Text style={{ color: Colors.lilac }}>support@drawn.co.uk</Text>
              {' '}if you need to cancel a listing.
            </Text>

            {saved && (
              <View style={styles.savedCard}>
                <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
                <Text style={styles.savedText}>Saved</Text>
              </View>
            )}

            {canEdit && (
              saving ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={Colors.lilac} />
                  <Text style={styles.loadingText}>Saving…</Text>
                </View>
              ) : (
                <PrimaryButton
                  label="Save changes"
                  onPress={save}
                  style={{ marginTop: Spacing.xl }}
                  disabled={!title.trim()}
                />
              )
            )}
          </>
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
  input: { backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: 12, fontSize: FontSizes.sm, color: Colors.white, borderWidth: 1, borderColor: Colors.darkBorder },
  inputMulti: { height: 100, paddingTop: 12 },
  inputDisabled: { opacity: 0.5 },
  lockedBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(249,200,70,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)', padding: Spacing.md, marginBottom: Spacing.lg },
  lockedText: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 18 },
  lockedNote: { fontSize: FontSizes.xs, color: Colors.textTertiary, lineHeight: 17, marginTop: Spacing.md },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(226,75,74,0.1)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(226,75,74,0.3)', padding: Spacing.md },
  errorText: { flex: 1, fontSize: FontSizes.sm, color: Colors.danger },
  savedCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(29,158,117,0.1)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(29,158,117,0.3)', padding: Spacing.md, marginTop: Spacing.md },
  savedText: { fontSize: FontSizes.sm, color: Colors.success, fontWeight: '600' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: Spacing.xl },
  loadingText: { fontSize: FontSizes.base, color: Colors.textSecondary, fontStyle: 'italic' },
});
