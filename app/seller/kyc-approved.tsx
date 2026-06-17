import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';

export default function KycApprovedScreen() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.tick}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
        </View>
        <Text style={styles.title}>You're approved.</Text>
        <Text style={styles.sub}>Your seller account is live. List your first item and it'll go into tonight's 9pm draw.</Text>
        <PrimaryButton label="List my first item" onPress={() => router.push('/seller/list/type')} style={{ marginBottom: Spacing.sm }} />
        <PrimaryButton label="Go to seller dashboard" onPress={() => router.push('/seller/dashboard')} variant="lilac" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, justifyContent: 'center' },
  content: { padding: Spacing.xxl, alignItems: 'center' },
  tick: { marginBottom: Spacing.xl },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xxl, color: Colors.white, textAlign: 'center', marginBottom: 12 },
  sub: { fontSize: FontSizes.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
});
