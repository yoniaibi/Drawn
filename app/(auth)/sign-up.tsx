import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import { supabase } from '../../src/lib/supabase';

function generateHandle(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffix = Math.floor(Math.random() * 900 + 100);
  return base.slice(0, 12) + suffix;
}

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }
    setError('');
    setLoading(true);

    const handle = '@' + generateHandle(name);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { handle, avatar_letter: name.trim()[0].toUpperCase(), full_name: name.trim() },
        },
      });

      setLoading(false);

      if (signUpError) {
        const msg = typeof signUpError.message === 'string' && signUpError.message.trim()
          ? signUpError.message.trim()
          : 'Sign up failed. Please try again.';
        setError(msg);
        return;
      }

      router.replace('/(auth)/interests');
    } catch (e: any) {
      setLoading(false);
      const msg = typeof e?.message === 'string' && e.message.trim()
        ? e.message.trim()
        : 'Sign up failed. Please try again.';
      setError(msg);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.darkBg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={{ color: Colors.textSecondary, fontSize: 22 }}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Join DRAWN</Text>
        <Text style={styles.sub}>Win designer things for pennies.</Text>

        <View style={styles.statsRow}>
          {[
            { value: '9pm', label: 'every night' },
            { value: '10p', label: 'from per ticket' },
            { value: '100%', label: 'verified sellers' },
          ].map(s => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.label}>FULL NAME</Text>
        <TextInput
          style={styles.input} placeholder="Your name" placeholderTextColor={Colors.textTertiary}
          value={name} onChangeText={t => { setName(t); setError(''); }} autoCapitalize="words"
        />

        <Text style={styles.label}>EMAIL ADDRESS</Text>
        <TextInput
          style={styles.input} placeholder="you@example.com" placeholderTextColor={Colors.textTertiary}
          value={email} onChangeText={t => { setEmail(t); setError(''); }}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        />

        <Text style={styles.label}>PASSWORD</Text>
        <View style={styles.pwWrap}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="8+ characters" placeholderTextColor={Colors.textTertiary}
            value={password} onChangeText={t => { setPassword(t); setError(''); }}
            secureTextEntry={!showPw}
          />
          <TouchableOpacity style={styles.eye} onPress={() => setShowPw(v => !v)}>
            <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>{showPw ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => { setAgreedToTerms(v => !v); setError(''); }}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxOn]}>
            {agreedToTerms && <Text style={{ color: Colors.white, fontSize: 13, lineHeight: 16 }}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            I agree to DRAWN's{' '}
            <Text style={styles.termsLink} onPress={() => router.push('/legal/terms' as any)}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink} onPress={() => router.push('/legal/privacy' as any)}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        <PrimaryButton
          label={loading ? 'Creating account…' : 'Create my account'}
          onPress={handleCreate}
          disabled={loading}
          style={{ marginTop: Spacing.lg, opacity: agreedToTerms ? 1 : 0.5 }}
        />

        <TouchableOpacity onPress={() => router.replace('/(auth)/log-in')} style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Log in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingBottom: 48 },
  back: { marginBottom: 20, alignSelf: 'flex-start' },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 18, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  stat: {
    flex: 1, backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center',
  },
  statVal: { fontSize: FontSizes.md, color: Colors.lilac, fontWeight: '800' },
  statLabel: { fontSize: 9.5, color: Colors.textTertiary, marginTop: 3, textAlign: 'center' },
  error: {
    fontSize: FontSizes.xs, color: Colors.danger, marginBottom: 14,
    backgroundColor: 'rgba(226,75,74,0.1)', padding: 12, borderRadius: Radius.sm, lineHeight: 18,
  },
  label: { fontSize: 10, color: Colors.textSecondary, letterSpacing: 0.8, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.darkBorder,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: FontSizes.sm, color: Colors.white,
  },
  pwWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eye: { padding: 8 },
  termsRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginTop: Spacing.md, padding: Spacing.sm,
    backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: Radius.sm,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, marginTop: 1,
    borderWidth: 2, borderColor: Colors.lilac,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  termsText: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 18 },
  termsLink: { color: Colors.lilac, fontWeight: '600' },
  loginRow: { marginTop: 14, alignItems: 'center' },
  loginText: { fontSize: FontSizes.xs, color: Colors.lilac },
  loginLink: { color: Colors.pink, fontWeight: '600' },
});
