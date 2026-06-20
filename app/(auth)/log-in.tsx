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
      setError('Incorrect email or password. Try again or reset your password.');
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
        <Text style={styles.sub}>Tonight's draw closes at 9pm — log in to check your tickets.</Text>

        {/* Social proof strip */}
        <View style={styles.proofStrip}>
          <View style={styles.proofDot} />
          <Text style={styles.proofText}>Draw closes every night at 9pm</Text>
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
          autoComplete="email"
        />

        <View style={styles.passwordHeader}>
          <Text style={styles.label}>PASSWORD</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pwWrap}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="••••••••"
            placeholderTextColor={Colors.textTertiary}
            value={password}
            onChangeText={t => { setPassword(t); setError(''); }}
            secureTextEntry={!showPw}
            autoComplete="password"
          />
          <TouchableOpacity style={styles.eye} onPress={() => setShowPw(v => !v)}>
            <Ionicons name={showPw ? 'eye-off' : 'eye'} size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <PrimaryButton
          label={loading ? 'Logging in…' : 'Log in'}
          onPress={handleLogin}
          disabled={loading}
          style={{ marginTop: Spacing.lg }}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerOr}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.signUpBtn}
          onPress={() => router.replace('/(auth)/sign-up')}
        >
          <Text style={styles.signUpBtnText}>Create an account →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingBottom: 40 },
  back: { marginBottom: 20, alignSelf: 'flex-start' },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 4 },
  sub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 16, lineHeight: 18 },

  proofStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: Radius.sm,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', marginBottom: 20,
  },
  proofDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },
  proofText: { fontSize: FontSizes.xs, color: Colors.textSecondary },

  error: {
    fontSize: FontSizes.xs, color: Colors.danger, marginBottom: 12,
    backgroundColor: 'rgba(226,75,74,0.1)', padding: 10, borderRadius: Radius.sm,
    lineHeight: 16,
  },
  passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 4 },
  forgotText: { fontSize: FontSizes.xs, color: Colors.lilac },
  input: {
    backgroundColor: Colors.darkBorder, borderRadius: Radius.sm,
    padding: 10, fontSize: 11, color: Colors.white, marginBottom: 2,
  },
  pwWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eye: { padding: 8 },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.darkBorder },
  dividerOr: { fontSize: FontSizes.xs, color: Colors.textTertiary },

  signUpBtn: {
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.35)',
    borderRadius: Radius.md, padding: 13, alignItems: 'center',
  },
  signUpBtnText: { fontSize: FontSizes.sm, color: Colors.lilac, fontWeight: '600' },
});

