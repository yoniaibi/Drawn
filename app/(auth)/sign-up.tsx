import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import { supabase } from '../../src/lib/supabase';

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

    const handle = '@' + name.trim().toLowerCase().replace(/\s+/g, '_');

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { handle, avatar_letter: name.trim()[0].toUpperCase() },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.replace('/(auth)/interests');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.darkBg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
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

        {error ? <Text style={styles.error}>{error}</Text> : null}

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
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="••••••••" placeholderTextColor={Colors.textTertiary}
            value={password} onChangeText={t => { setPassword(t); setError(''); }}
            secureTextEntry={!showPw}
          />
          <TouchableOpacity style={styles.eye} onPress={() => setShowPw(v => !v)}>
            <Ionicons name={showPw ? 'eye-off' : 'eye'} size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* T&Cs checkbox */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => { setAgreedToTerms(v => !v); setError(''); }}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxOn]}>
            {agreedToTerms && <Ionicons name="checkmark" size={13} color={Colors.white} />}
          </View>
          <Text style={styles.termsText}>
            I agree to DRAWN's{' '}
            <Text
              style={styles.termsLink}
              onPress={() => Linking.openURL('https://yoniaibi.github.io/Drawn/terms.html')}
            >
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text
              style={styles.termsLink}
              onPress={() => Linking.openURL('https://yoniaibi.github.io/Drawn/privacy.html')}
            >
              Privacy Policy
            </Text>
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
  content: { padding: Spacing.lg, paddingBottom: 40 },
  back: { marginBottom: 20, alignSelf: 'flex-start' },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 4 },
  sub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  stat: {
    flex: 1, backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', padding: Spacing.sm, alignItems: 'center',
  },
  statVal: { fontFamily: Fonts.serif, fontSize: FontSizes.md, color: Colors.lilac, fontWeight: '700' },
  statLabel: { fontSize: 9, color: Colors.textTertiary, marginTop: 2, textAlign: 'center' },
  error: {
    fontSize: FontSizes.xs, color: Colors.danger, marginBottom: 12,
    backgroundColor: 'rgba(226,75,74,0.1)', padding: 10, borderRadius: Radius.sm,
  },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.darkBorder,
    padding: 12, fontSize: FontSizes.sm, color: Colors.white, marginBottom: 2,
  },
  pwWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
