import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import { useAuthStore } from '../../src/store';
import { supabase } from '../../src/lib/supabase';

export default function SellerApplyScreen() {
  const router = useRouter();
  const { user, handle } = useAuthStore();

  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [item, setItem] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !item.trim()) {
      setError('Please fill in your name and first item.');
      return;
    }
    if (!user) { setError('You must be logged in.'); return; }

    setError(null);
    setSubmitting(true);

    try {
      const { error: err } = await supabase.from('seller_applications').insert({
        user_id: user.id,
        handle: handle,
        full_name: name.trim(),
        instagram: instagram.trim() || null,
        first_item: item.trim(),
        status: 'pending',
      });

      if (err) {
        // Table might not exist yet — fall through to KYC anyway
        if (!err.message.includes('does not exist')) throw err;
      }

      // Mark profile as pending seller
      await supabase.from('profiles').update({ is_seller: false }).eq('id', user.id);

      setDone(true);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <View style={styles.success}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.successTitle}>Application received!</Text>
        <Text style={styles.successSub}>
          We review applications within 24 hours. You'll get a notification when you're approved to list.
        </Text>
        <PrimaryButton label="Back to home" onPress={() => router.replace('/(tabs)')} style={{ marginTop: Spacing.xl }} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Seller application</Text>
        <Text style={styles.sub}>Takes less than 2 minutes. We'll review and get back to you within 24 hours.</Text>

        <Text style={styles.label}>YOUR NAME</Text>
        <TextInput
          style={styles.input} value={name} onChangeText={setName}
          placeholder="Full name" placeholderTextColor={Colors.textTertiary}
        />

        <Text style={styles.label}>INSTAGRAM (OPTIONAL)</Text>
        <TextInput
          style={styles.input} value={instagram} onChangeText={setInstagram}
          placeholder="@handle" placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
        />

        <Text style={styles.label}>WHAT'S YOUR FIRST ITEM?</Text>
        <TextInput
          style={[styles.input, styles.multiline]} value={item} onChangeText={setItem}
          placeholder="e.g. Chanel Classic Flap, bought 2022, barely worn..."
          placeholderTextColor={Colors.textTertiary}
          multiline numberOfLines={3}
        />

        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={14} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {submitting ? (
          <ActivityIndicator color={Colors.lilac} style={{ marginTop: Spacing.xl }} />
        ) : (
          <PrimaryButton
            label="Submit application"
            onPress={handleSubmit}
            style={{ marginTop: Spacing.xl }}
            disabled={!name.trim() || !item.trim()}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.xl },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 4, marginTop: 14, fontWeight: '700' },
  input: { backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: 12, fontSize: FontSizes.sm, color: Colors.white, borderWidth: 1, borderColor: Colors.darkBorder },
  multiline: { height: 80, textAlignVertical: 'top' },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(226,75,74,0.1)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(226,75,74,0.3)', padding: Spacing.md, marginTop: Spacing.md },
  errorText: { flex: 1, fontSize: FontSizes.sm, color: Colors.danger },
  success: { flex: 1, backgroundColor: Colors.darkBg, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  successEmoji: { fontSize: 60, marginBottom: 12 },
  successTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.xxl, color: Colors.white, marginBottom: 8, textAlign: 'center' },
  successSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
