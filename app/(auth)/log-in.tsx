import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import { supabase } from '../../src/lib/supabase';

export default function LogInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError('Incorrect email or password.');
      return;
    }
    // Auth listener in _layout.tsx redirects to /(tabs) automatically
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.darkBg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Log in to check your tickets and tonight's draw.</Text>

        <TouchableOpacity style={styles.appleBt}>
          <Ionicons name="logo-apple" size={16} color={Colors.white} />
          <Text style={styles.appleText}>Continue with Apple</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerOr}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>EMAIL ADDRESS</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={Colors.textTertiary}
          value={email}
          onChangeText={t => { setEmail(t); setError(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>PASSWORD</Text>
        <View style={styles.pwWrap}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="••••••••"
            placeholderTextColor={Colors.textTertiary}
            value={password}
            onChangeText={t => { setPassword(t); setError(''); }}
            secureTextEntry={!showPw}
          />
          <TouchableOpacity style={styles.eye} onPress={() => setShowPw(v => !v)}>
            <Ionicons name={showPw ? 'eye-off' : 'eye'} size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotRow} onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <PrimaryButton
          label={loading ? 'Logging in…' : 'Log in'}
          onPress={handleLogin}
          disabled={loading}
          style={{ marginTop: Spacing.md }}
        />

        <TouchableOpacity onPress={() => router.replace('/(auth)/sign-up')} style={styles.signUpRow}>
          <Text style={styles.signUpText}>Don't have an account? <Text style={styles.signUpLink}>Sign up</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingBottom: 40 },
  back: { marginBottom: 20, alignSelf: 'flex-start' },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 4 },
  sub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 20 },
  appleBt: {
    backgroundColor: '#000', borderRadius: Radius.md, padding: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16,
  },
  appleText: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.darkBorder },
  dividerOr: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  error: { fontSize: FontSizes.xs, color: Colors.danger, marginBottom: 12, backgroundColor: 'rgba(226,75,74,0.1)', padding: 10, borderRadius: Radius.sm },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 4, marginTop: 14 },
  input: {
    backgroundColor: Colors.darkBorder, borderRadius: Radius.sm,
    padding: 10, fontSize: 11, color: Colors.white, marginBottom: 2,
  },
  pwWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eye: { padding: 8 },
  forgotRow: { alignSelf: 'flex-end', marginTop: 8 },
  forgotText: { fontSize: FontSizes.xs, color: Colors.lilac },
  signUpRow: { marginTop: 20, alignItems: 'center' },
  signUpText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  signUpLink: { color: Colors.pink, fontWeight: '600' },
});
