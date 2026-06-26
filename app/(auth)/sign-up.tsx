import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Linking, ActivityIndicator } from 'react-native';
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
  const [handle, setHandle] = useState('');
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [showPw, setShowPw] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onHandleChange(text: string) {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setHandle(cleaned);
    setError('');
    setHandleStatus('idle');
    if (handleCheckTimer.current) clearTimeout(handleCheckTimer.current);
    if (cleaned.length >= 3) {
      setHandleStatus('checking');
      handleCheckTimer.current = setTimeout(async () => {
        const { data, error } = await supabase.rpc('is_handle_available', { candidate: '@' + cleaned });
        // If the RPC doesn't exist yet or errors, fall back to available (server enforces uniqueness via constraint)
        if (error || data === null) { setHandleStatus('available'); return; }
        setHandleStatus(data === true ? 'available' : 'taken');
      }, 500);
    }
  }

  async function handleCreate() {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (handle.length < 3) {
      setError('Handle must be at least 3 characters.');
      return;
    }
    if (handleStatus === 'taken') {
      setError('That handle is already taken. Please choose another.');
      return;
    }
    if (handleStatus === 'checking') {
      setError('Still checking handle availability — please wait a moment.');
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

    const fullHandle = '@' + handle;

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { handle: fullHandle, avatar_letter: name.trim()[0].toUpperCase(), full_name: name.trim() },
      },
    });

    setLoading(false);

    if (signUpError) {
      const msg = typeof signUpError.message === 'string' && signUpError.message
        ? signUpError.message
        : 'Sign up failed. Please try again.';
      setError(msg);
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

        <Text style={styles.label}>USERNAME (HANDLE)</Text>
        <View style={styles.pwWrap}>
          <Text style={[styles.input, { flex: 0, paddingRight: 0, marginBottom: 0, color: Colors.textSecondary }]}>@</Text>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="yourhandle"
            placeholderTextColor={Colors.textTertiary}
            value={handle}
            onChangeText={onHandleChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.eye}>
            {handleStatus === 'checking' && <ActivityIndicator size="small" color={Colors.textTertiary} />}
            {handleStatus === 'available' && <Ionicons name="checkmark-circle" size={18} color={Colors.success} />}
            {handleStatus === 'taken' && <Ionicons name="close-circle" size={18} color={Colors.danger} />}
          </View>
        </View>
        {handleStatus === 'taken' && <Text style={styles.handleHint}>Handle taken</Text>}
        {handleStatus === 'available' && <Text style={[styles.handleHint, { color: Colors.success }]}>Available!</Text>}

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
              onPress={() => router.push('/legal/terms' as any)}
            >
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text
              style={styles.termsLink}
              onPress={() => router.push('/legal/privacy' as any)}
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
    paddingHorizontal: 14, paddingVertical: 13, fontSize: FontSizes.sm, color: Colors.white, marginBottom: 2,
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
  handleHint: { fontSize: 9, color: Colors.danger, marginTop: 2, marginBottom: 4 },
});
