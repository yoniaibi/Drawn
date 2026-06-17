import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import PrimaryButton from '../../../src/components/PrimaryButton';

export default function ListPhotosScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Photos & details</Text>
        <Text style={styles.sub}>Add at least 3 photos. Clear, well-lit shots get more ticket buyers.</Text>

        <View style={styles.photoGrid}>
          {[0, 1, 2, 3].map(i => (
            <TouchableOpacity key={i} style={styles.photoSlot}>
              <Ionicons name="camera-outline" size={24} color={Colors.textTertiary} />
              {i === 0 && <Text style={styles.mainPhotoLabel}>Main photo</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>ITEM TITLE</Text>
        <View style={styles.input}><Text style={styles.inputPlaceholder}>e.g. Chanel Classic Flap Bag</Text></View>

        <Text style={styles.label}>DESCRIPTION</Text>
        <View style={[styles.input, { height: 80 }]}><Text style={styles.inputPlaceholder}>Condition, size, what's included...</Text></View>

        <Text style={styles.label}>CONDITION</Text>
        <View style={styles.condRow}>
          {['New', 'Like new', 'Good', 'Fair'].map(c => (
            <TouchableOpacity key={c} style={styles.condChip}>
              <Text style={styles.condText}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton label="Next: Set price →" onPress={() => router.push('/seller/list/pricing')} style={{ marginTop: Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 8 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  photoSlot: {
    width: '47%', aspectRatio: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.darkBorder, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  mainPhotoLabel: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: 4 },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: Colors.darkBorder, borderRadius: Radius.sm, padding: 12, justifyContent: 'center' },
  inputPlaceholder: { fontSize: FontSizes.sm, color: Colors.textTertiary },
  condRow: { flexDirection: 'row', gap: 8 },
  condChip: { flex: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.darkBorder },
  condText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
});
