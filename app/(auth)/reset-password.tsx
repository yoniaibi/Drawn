import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import { supabase } from '../../src/lib/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleReset() {
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    setDone(true);
  }

  if (done) {
    return (
      <View style={styles.screen}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
        </View>
        <Text style={styles.title}>Password updated</Text>
        <Text style={styles.sub}>You're all set. Log in with your new password.</Text>
        <PrimaryButton label="Go to log in" onPress={() => router.replace('/(auth)/log-in')} style={{ marginTop: Spacing.xl }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.darkBg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.screen}>
        <View style={styles.hero}>
          <Ionicons name="lock-closed" size={36} color={Colors.lilac} />
        </View>
        <Text style={styles.title}>Set new password</Text>
        <Text style={styles.sub}>Choose a strong password for your account.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>NEW PASSWORD</Text>
        <View style={styles.pwWrap}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="At least 8 characters"
            placeholderTextColor={Colors.textTertiary}
            value={password}
            onChangeText={t => { setPassword(t); setError(''); }}
            secureTextEntry={!showPw}
          />
          <TouchableOpacity style={styles.eye} onPress={() => setShowPw(v => !v)}>
            <Ionicons name={showPw ? 'eye-off' : 'eye'} size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 14 }]}>CONFIRM PASSWORD</Text>
        <TextInput
          style={styles.input}
          placeholder="Repeat your new password"
          placeholderTextColor={Colors.textTertiary}
          value={confirm}
          onChangeText={t => { setConfirm(t); setError(''); }}
          secureTextEntry={!showPw}
        />

        <PrimaryButton
          label={loading ? 'Saving…' : 'Save new password'}
          onPress={handleReset}
          disabled={loading}
          style={{ marginTop: Spacing.lg }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, padding: Spacing.lg, paddingTop: 80 },
  hero: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(139,92,246,0.12)',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
  },
  successIcon: { alignItems: 'center', justifyContent: 'center', marginTop: 120, marginBottom: Spacing.lg },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6, textAlign: 'center' },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, textAlign: 'center', marginBottom: Spacing.xl },
  error: {
    fontSize: FontSizes.xs, color: Colors.danger, marginBottom: 12,
    backgroundColor: 'rgba(226,75,74,0.1)', padding: 10, borderRadius: Radius.sm,
  },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 4 },
  input: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.darkBorder,
    padding: 12, fontSize: FontSizes.sm, color: Colors.white, marginBottom: 2,
  },
  pwWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eye: { padding: 8 },
});
