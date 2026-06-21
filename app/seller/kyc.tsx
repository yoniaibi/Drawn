import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import { useAuthStore } from '../../src/store';
import { supabase } from '../../src/lib/supabase';

function isValidDob(raw: string) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(raw);
}

export default function KycScreen() {
  const router = useRouter();
  const { user, handle } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function pickId() {
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setIdPhoto(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!fullName.trim()) { setError('Please enter your full legal name.'); return; }
    if (!isValidDob(dob)) { setError('Please enter your date of birth as DD/MM/YYYY.'); return; }
    if (!user) { setError('You must be logged in.'); return; }

    setError(null);
    setSubmitting(true);

    try {
      const { error: insertErr } = await supabase.from('kyc_submissions').insert({
        user_id: user.id,
        handle,
        full_name: fullName.trim(),
        date_of_birth: dob.trim(),
        id_photo_uploaded: !!idPhoto,
        status: 'pending',
      });

      if (insertErr) throw new Error(insertErr.message);

      await supabase.from('profiles').update({ kyc_submitted: true } as any).eq('id', user.id);
      setDone(true);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successIconBox}>
          <Ionicons name="shield-checkmark" size={48} color={Colors.lilac} />
        </View>
        <Text style={styles.successHeading}>Identity submitted</Text>
        <Text style={styles.successSub}>
          We'll review your details within 1 business day. Once approved, your draws will go live automatically.
        </Text>
        {!idPhoto && (
          <View style={styles.emailNote}>
            <Ionicons name="mail-outline" size={16} color={Colors.gold} />
            <Text style={styles.emailNoteText}>
              Please email a clear photo of your government-issued ID to{' '}
              <Text style={styles.emailNoteLink}>verify@drawn.co.uk</Text>
              {' '}with your handle {handle} in the subject line.
            </Text>
          </View>
        )}
        <View style={styles.stepsCard}>
          {([
            { icon: 'time-outline' as const, label: 'Under review', sub: 'Usually within 1 business day' },
            { icon: 'notifications-outline' as const, label: 'You get notified', sub: 'Email confirmation when approved' },
            { icon: 'rocket-outline' as const, label: 'Start listing', sub: 'Your items go live as verified' },
          ]).map(s => (
            <View key={s.label} style={styles.step}>
              <Ionicons name={s.icon} size={20} color={Colors.lilac} />
              <View>
                <Text style={styles.stepLabel}>{s.label}</Text>
                <Text style={styles.stepSub}>{s.sub}</Text>
              </View>
            </View>
          ))}
        </View>
        <PrimaryButton label="Back to dashboard" onPress={() => router.replace('/seller/dashboard')} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconBox}>
          <Ionicons name="shield-outline" size={32} color={Colors.lilac} />
        </View>
        <Text style={styles.title}>Verify your identity</Text>
        <Text style={styles.sub}>
          We verify all sellers before their draws go live. This protects buyers and builds trust in every listing.
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="lock-closed-outline" size={14} color={Colors.lilac} />
          <Text style={styles.infoText}>
            Your details are used only for seller verification and are never shared with buyers.
          </Text>
        </View>

        <Text style={styles.label}>FULL LEGAL NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="As it appears on your ID"
          placeholderTextColor={Colors.textTertiary}
          value={fullName}
          onChangeText={t => { setFullName(t); setError(null); }}
          autoCapitalize="words"
        />

        <Text style={styles.label}>DATE OF BIRTH</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={Colors.textTertiary}
          value={dob}
          onChangeText={t => { setDob(t); setError(null); }}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />

        <Text style={styles.label}>ID DOCUMENT PHOTO <Text style={styles.optional}>(optional — see below)</Text></Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickId}>
          {idPhoto ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={[styles.uploadText, { color: Colors.success }]}>Photo selected</Text>
              <TouchableOpacity onPress={() => setIdPhoto(null)}>
                <Ionicons name="close-circle-outline" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Ionicons name="camera-outline" size={20} color={Colors.lilac} />
              <Text style={styles.uploadText}>Upload passport or driving licence</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </>
          )}
        </TouchableOpacity>

        {!idPhoto && (
          <View style={styles.emailAlt}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.emailAltText}>
              Alternatively, email your ID photo to{' '}
              <Text style={{ color: Colors.lilac }}>verify@drawn.co.uk</Text>
              {' '}with your handle {handle} as the subject.
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={14} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {submitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={Colors.lilac} />
            <Text style={styles.loadingText}>Submitting…</Text>
          </View>
        ) : (
          <PrimaryButton
            label="Submit for verification"
            onPress={handleSubmit}
            style={{ marginTop: Spacing.lg }}
            disabled={!fullName.trim() || !isValidDob(dob)}
          />
        )}

        <Text style={styles.footNote}>
          By submitting you confirm these details are accurate and belong to you.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { padding: Spacing.lg, paddingBottom: 48 },
  iconBox: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(139,92,246,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', marginBottom: Spacing.lg,
  },
  infoText: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 18 },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, fontWeight: '700', marginBottom: 4, marginTop: 14 },
  optional: { fontWeight: '400', color: Colors.textTertiary, letterSpacing: 0 },
  input: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.sm,
    padding: 12, fontSize: FontSizes.sm, color: Colors.white,
    borderWidth: 1, borderColor: Colors.darkBorder,
  },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.darkCard, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)',
    borderStyle: 'dashed',
  },
  uploadText: { flex: 1, fontSize: FontSizes.sm, color: Colors.lilac, fontWeight: '600' },
  emailAlt: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8 },
  emailAltText: { flex: 1, fontSize: FontSizes.xs, color: Colors.textTertiary, lineHeight: 17 },
  errorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(226,75,74,0.1)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(226,75,74,0.3)',
    padding: Spacing.md, marginTop: Spacing.md,
  },
  errorText: { flex: 1, fontSize: FontSizes.sm, color: Colors.danger },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', paddingVertical: Spacing.xl },
  loadingText: { fontSize: FontSizes.base, color: Colors.textSecondary, fontStyle: 'italic' },
  footNote: { fontSize: 10, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 15 },

  // Success
  successScreen: { flex: 1, backgroundColor: Colors.darkBg, alignItems: 'center', padding: Spacing.xl, paddingTop: 80 },
  successIconBox: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(139,92,246,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  successHeading: { fontFamily: Fonts.serif, fontSize: FontSizes.xxl, color: Colors.white, textAlign: 'center', marginBottom: 8 },
  successSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
  emailNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(249,200,70,0.08)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(249,200,70,0.2)',
    padding: Spacing.md, marginBottom: Spacing.lg, width: '100%',
  },
  emailNoteText: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 18 },
  emailNoteLink: { color: Colors.gold, fontWeight: '700' },
  stepsCard: { width: '100%', gap: 10, marginBottom: Spacing.xl },
  step: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md,
  },
  stepLabel: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  stepSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
});
