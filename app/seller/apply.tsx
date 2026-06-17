import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';

export default function SellerApplyScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [item, setItem] = useState('');

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Seller application</Text>
        <Text style={styles.sub}>Takes less than 2 minutes. We'll review and get back to you within 24 hours.</Text>

        <Text style={styles.label}>YOUR NAME</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={Colors.textTertiary} />

        <Text style={styles.label}>INSTAGRAM (OPTIONAL)</Text>
        <TextInput style={styles.input} value={instagram} onChangeText={setInstagram} placeholder="@handle" placeholderTextColor={Colors.textTertiary} autoCapitalize="none" />

        <Text style={styles.label}>WHAT'S YOUR FIRST ITEM?</Text>
        <TextInput
          style={[styles.input, styles.multiline]} value={item} onChangeText={setItem}
          placeholder="e.g. Chanel Classic Flap, bought 2022, barely worn..." placeholderTextColor={Colors.textTertiary}
          multiline numberOfLines={3}
        />

        <PrimaryButton label="Submit application" onPress={() => router.push('/seller/kyc')} style={{ marginTop: Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.xl },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 4, marginTop: 14 },
  input: { backgroundColor: Colors.darkBorder, borderRadius: Radius.sm, padding: 12, fontSize: FontSizes.sm, color: Colors.white },
  multiline: { height: 80, textAlignVertical: 'top' },
});
