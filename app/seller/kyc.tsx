import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';

const STEPS = [
  { icon: 'card-outline', title: 'Photo ID', sub: 'Passport or driving licence' },
  { icon: 'person-outline', title: 'Liveness check', sub: 'Quick selfie to match your ID' },
  { icon: 'checkmark-circle-outline', title: 'Done', sub: 'Usually approved in minutes' },
];

export default function KycScreen() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>One quick ID check</Text>
        <Text style={styles.sub}>We're required to verify every seller. It takes about 2 minutes and only happens once.</Text>
        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepIcon}><Ionicons name={s.icon as any} size={22} color={Colors.lilac} /></View>
              <View><Text style={styles.stepTitle}>{s.title}</Text><Text style={styles.stepSub}>{s.sub}</Text></View>
            </View>
          ))}
        </View>
        <PrimaryButton label="Start ID check" onPress={() => router.push('/seller/kyc-approved')} />
        <Text style={styles.note}>Your data is encrypted and never shared with third parties.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { flex: 1, padding: Spacing.lg },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 8 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.xl },
  steps: { gap: 16, marginBottom: Spacing.xl },
  stepRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  stepIcon: { width: 44, height: 44, borderRadius: Radius.sm, backgroundColor: Colors.darkCard, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  stepSub: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  note: { fontSize: FontSizes.xs, color: Colors.textTertiary, textAlign: 'center', marginTop: 14 },
});
