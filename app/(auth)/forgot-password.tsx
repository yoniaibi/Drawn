import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import { supabase } from '../../src/lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSend() {
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.darkBg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.replace('/(auth)/log-in')}>
          <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.hero}>
          <View style={styles.heroIconOuter}>
            <View style={styles.heroIconInner}>
              <Ionicons name="lock-closed" size={32} color={Colors.lilac} />
            </View>
          </View>
          <View style={styles.heroDot1} />
          <View style={styles.heroDot2} />
          <View style={styles.heroDot3} />
        </View>

        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.sub}>
          Enter your email and we'll send you a secure link to set a new password.
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <View style={styles.successIconWrap}>
              <Ionicons name="mail" size={28} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Check your inbox</Text>
            <Text style={styles.successText}>
              We've sent a reset link to{'\n'}<Text style={{ color: Colors.white }}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>Didn't get it? Check your spam folder or try again.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <PrimaryButton
              label={loading ? 'Sending…' : 'Send reset link'}
              onPress={handleSend}
              disabled={loading || !email.trim()}
              style={{ marginTop: Spacing.xl }}
            />
            {errorMsg && (
              <Text style={{ fontSize: FontSizes.xs, color: Colors.danger, marginTop: 8 }}>{errorMsg}</Text>
            )}
          </>
        )}

        <TouchableOpacity onPress={() => router.replace('/(auth)/log-in')} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back to log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingBottom: 40 },
  back: { marginBottom: 8, alignSelf: 'flex-start' },

  hero: { alignItems: 'center', justifyContent: 'center', height: 120, marginBottom: 8, position: 'relative' },
  heroIconOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(139,92,246,0.15)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)',
  },
  heroIconInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(139,92,246,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  heroDot1: { position: 'absolute', top: 16, right: '25%', width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.pink, opacity: 0.6 },
  heroDot2: { position: 'absolute', bottom: 14, left: '22%', width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.gold, opacity: 0.5 },
  heroDot3: { position: 'absolute', top: 30, left: '18%', width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.lilac, opacity: 0.4 },

  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 4, marginTop: 14 },
  input: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.darkBorder,
    padding: 12, fontSize: FontSizes.sm, color: Colors.white, marginBottom: 2,
  },
  successBox: {
    alignItems: 'center', backgroundColor: 'rgba(29,158,117,0.08)', borderRadius: Radius.lg,
    padding: Spacing.xl, borderWidth: 1, borderColor: 'rgba(29,158,117,0.25)', marginTop: 8, gap: 8,
  },
  successIconWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(29,158,117,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  successTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white },
  successText: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  successHint: { fontSize: FontSizes.xs, color: Colors.textTertiary, textAlign: 'center', marginTop: 4 },

  backLink: { marginTop: 24, alignItems: 'center' },
  backLinkText: { fontSize: FontSizes.xs, color: Colors.lilac },
});
