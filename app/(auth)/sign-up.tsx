import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import { useAuthStore } from '../../src/store';

export default function SignUpScreen() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  function handleCreate() {
    login();
    router.replace('/(auth)/interests');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.darkBg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.title}>Join DRAWN</Text>
        <Text style={styles.sub}>Win things worth hundreds for pennies.</Text>

        {/* Apple SSO */}
        <TouchableOpacity style={styles.appleBt}>
          <Ionicons name="logo-apple" size={16} color={Colors.white} />
          <Text style={styles.appleText}>Continue with Apple</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerOr}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.label}>FULL NAME</Text>
        <TextInput
          style={styles.input} placeholder="Your name" placeholderTextColor={Colors.textTertiary}
          value={name} onChangeText={setName} autoCapitalize="words"
        />

        <Text style={styles.label}>EMAIL ADDRESS</Text>
        <TextInput
          style={styles.input} placeholder="you@example.com" placeholderTextColor={Colors.textTertiary}
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
        />

        <Text style={styles.label}>PASSWORD</Text>
        <View style={styles.pwWrap}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="••••••••" placeholderTextColor={Colors.textTertiary}
            value={password} onChangeText={setPassword}
            secureTextEntry={!showPw}
          />
          <TouchableOpacity style={styles.eye} onPress={() => setShowPw(v => !v)}>
            <Ionicons name={showPw ? 'eye-off' : 'eye'} size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <PrimaryButton label="Create my account" onPress={handleCreate} style={{ marginTop: Spacing.lg }} />

        <TouchableOpacity onPress={() => router.replace('/(auth)/log-in')} style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Log in</Text></Text>
        </TouchableOpacity>

        <Text style={styles.legal}>By creating an account you agree to our{'\n'}Terms of Service and Privacy Policy</Text>
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
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: Colors.darkBorder, borderRadius: Radius.sm,
    padding: 10, fontSize: 11, color: Colors.white, marginBottom: 2,
  },
  pwWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eye: { padding: 8 },
  loginRow: { marginTop: 14, alignItems: 'center' },
  loginText: { fontSize: FontSizes.xs, color: Colors.lilac },
  loginLink: { color: Colors.pink, fontWeight: '600' },
  legal: { fontSize: 9, color: Colors.textTertiary, textAlign: 'center', marginTop: 14, lineHeight: 15 },
});
