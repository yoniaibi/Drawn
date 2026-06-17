import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import PrimaryButton from '../../../src/components/PrimaryButton';
import { useSellerDraft } from '../../../src/store/sellerDraft';

const EMOJI_OPTIONS = [
  '👜', '👛', '🎒', '👟', '👠', '👗', '🧥', '⌚', '💍', '🕶️',
  '💻', '📱', '🎮', '📷', '🎸', '🛍️', '🏋️', '⛷️', '🎾', '🏀',
];

const CONDITIONS = [
  { label: 'New', value: 'new' },
  { label: 'Like new', value: 'like_new' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
];

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepBar}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.stepSegment, i + 1 <= current ? styles.stepActive : styles.stepInactive]} />
      ))}
    </View>
  );
}

export default function ListPhotosScreen() {
  const router = useRouter();
  const { setDetails, setEmoji: storeSetEmoji } = useSellerDraft((s) => ({
    setDetails: s.setDetails,
    setEmoji: s.setEmoji,
  }));
  const draft = useSellerDraft((s) => ({
    title: s.title,
    description: s.description,
    condition: s.condition,
    emoji: s.emoji,
  }));

  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [condition, setCondition] = useState<string | null>(draft.condition);
  const [selectedEmoji, setSelectedEmoji] = useState(draft.emoji);

  const handleNext = () => {
    setDetails(title, description, condition ?? '');
    storeSetEmoji(selectedEmoji);
    router.push('/seller/list/pricing');
  };

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <StepBar current={2} total={4} />
      <Text style={styles.stepLabel}>Step 2 of 4</Text>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Details</Text>
        <Text style={styles.sub}>Tell buyers exactly what they could win. Specific descriptions sell faster.</Text>

        {/* Emoji picker */}
        <Text style={styles.label}>ITEM EMOJI</Text>
        <View style={styles.emojiGrid}>
          {EMOJI_OPTIONS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiBtn, selectedEmoji === e && styles.emojiBtnOn]}
              onPress={() => setSelectedEmoji(e)}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Photo slots — placeholder until camera integration */}
        <Text style={styles.label}>PHOTOS <Text style={styles.labelSub}>(coming soon — upload via web for now)</Text></Text>
        <View style={styles.photoGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.photoSlot}>
              <Ionicons name="camera-outline" size={24} color={Colors.textTertiary} />
              {i === 0 && <Text style={styles.mainPhotoLabel}>Main</Text>}
            </View>
          ))}
        </View>

        <Text style={styles.label}>ITEM TITLE</Text>
        <TextInput
          style={styles.inputField}
          placeholder="e.g. Chanel Classic Flap Bag"
          placeholderTextColor={Colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
        />

        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput
          style={[styles.inputField, { height: 90, textAlignVertical: 'top' }]}
          placeholder="Size, colour, what's included, any wear or marks..."
          placeholderTextColor={Colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>CONDITION</Text>
        <View style={styles.condRow}>
          {CONDITIONS.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.condChip, condition === c.value && styles.condChipOn]}
              onPress={() => setCondition(c.value)}
            >
              <Text style={[styles.condText, condition === c.value && styles.condTextOn]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          label="Next: Set price →"
          onPress={handleNext}
          style={{ marginTop: Spacing.xl }}
          disabled={!title.trim() || !condition}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { paddingHorizontal: Spacing.lg, marginBottom: 12 },
  stepBar: { flexDirection: 'row', gap: 4, paddingHorizontal: Spacing.lg, marginBottom: 6 },
  stepSegment: { flex: 1, height: 3, borderRadius: 2 },
  stepActive: { backgroundColor: Colors.lilac },
  stepInactive: { backgroundColor: Colors.darkBorder },
  stepLabel: { fontSize: 10, color: Colors.textTertiary, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, letterSpacing: 0.5 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8, marginTop: 14, fontWeight: '700' },
  labelSub: { fontWeight: '400', color: Colors.textTertiary },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  emojiBtn: {
    width: 44, height: 44, borderRadius: Radius.sm,
    backgroundColor: Colors.darkCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.darkBorder,
  },
  emojiBtnOn: { borderColor: Colors.lilac, backgroundColor: 'rgba(139,92,246,0.15)' },
  emojiText: { fontSize: 22 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  photoSlot: {
    width: '47%', aspectRatio: 1.4, backgroundColor: Colors.darkCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.darkBorder, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  mainPhotoLabel: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  inputField: { backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: 12, fontSize: FontSizes.sm, color: Colors.white, borderWidth: 1, borderColor: Colors.darkBorder },
  condRow: { flexDirection: 'row', gap: 8 },
  condChip: { flex: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.darkBorder },
  condChipOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  condText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  condTextOn: { color: Colors.white },
});
