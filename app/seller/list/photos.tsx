import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import StepBar from '../../../src/components/StepBar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';
import PrimaryButton from '../../../src/components/PrimaryButton';
import { useSellerDraft } from '../../../src/store/sellerDraft';
import type { DrawStyle, ItemCategory } from '../../../src/mocks';

const CONDITIONS = [
  { label: 'New', value: 'new' },
  { label: 'Like new', value: 'like_new' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
];

const STYLE_OPTIONS: { label: string; value: DrawStyle }[] = [
  { label: 'Womenswear & accessories', value: 'womenswear' },
  { label: 'Menswear & streetwear', value: 'menswear' },
  { label: 'Unisex / not sure', value: 'unisex' },
];

const CATEGORY_ROW1: { label: string; value: ItemCategory }[] = [
  { label: 'Bags', value: 'bags' },
  { label: 'Trainers', value: 'trainers' },
  { label: 'Watches', value: 'watches' },
  { label: 'Streetwear', value: 'streetwear' },
];

const CATEGORY_ROW2: { label: string; value: ItemCategory }[] = [
  { label: 'Clothing', value: 'clothing' },
  { label: 'Jewellery', value: 'jewellery' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Vintage', value: 'vintage' },
];

const MAX_PHOTOS = 4;

export default function ListPhotosScreen() {
  const router = useRouter();
  const { setDetails, setImages, setStyle, setItemCategory } = useSellerDraft((s) => ({
    setDetails: s.setDetails,
    setImages: s.setImages,
    setStyle: s.setStyle,
    setItemCategory: s.setItemCategory,
  }));
  const draft = useSellerDraft((s) => ({
    title: s.title,
    description: s.description,
    condition: s.condition,
    images: s.images,
    type: s.type,
    style: s.style,
    itemCategory: s.itemCategory,
  }));

  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [condition, setCondition] = useState<string | null>(draft.condition);
  const [photos, setPhotos] = useState<string[]>(draft.images);
  const [styleVal, setStyleVal] = useState<DrawStyle | null>(draft.style);
  const [categoryVal, setCategoryVal] = useState<ItemCategory | null>(
    draft.type === 'bundle' ? 'bundles' : draft.itemCategory
  );
  const [styleError, setStyleError] = useState<string | null>(null);

  async function pickPhoto(index: number) {
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = uri;
        return next;
      });
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }

  const handleNext = () => {
    if (!styleVal) {
      setStyleError('Please choose a style for your item.');
      return;
    }
    setStyleError(null);
    setDetails(title, description, condition ?? '');
    setImages(photos);
    setStyle(styleVal);
    if (categoryVal) setItemCategory(categoryVal);
    router.push('/seller/list/pricing');
  };

  const slots = Array.from({ length: MAX_PHOTOS });

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <StepBar current={2} total={4} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Details & photos</Text>
        <Text style={styles.sub}>Clear photos help buyers trust you. Add up to 4 images.</Text>

        <Text style={styles.label}>PHOTOS</Text>
        <View style={styles.photoGrid}>
          {slots.map((_, i) => {
            const uri = photos[i];
            return uri ? (
              <View key={i} style={styles.photoSlot}>
                <Image source={{ uri }} style={styles.photoImg} resizeMode="cover" />
                {i === 0 && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>MAIN</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(i)}>
                  <Ionicons name="close-circle" size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity key={i} style={styles.photoSlot} onPress={() => pickPhoto(i)}>
                <Ionicons name="camera-outline" size={24} color={Colors.textTertiary} />
                <Text style={styles.addPhotoText}>{i === 0 ? 'Add main photo' : 'Add photo'}</Text>
              </TouchableOpacity>
            );
          })}
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

        <Text style={styles.label}>WHO IS THIS FOR?</Text>
        <View style={styles.condRow}>
          {STYLE_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.condChip, styleVal === s.value && styles.condChipOn, { flex: undefined, paddingHorizontal: 10 }]}
              onPress={() => { setStyleVal(s.value); setStyleError(null); }}
            >
              <Text style={[styles.condText, styleVal === s.value && styles.condTextOn]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.helperText}>Choose the style that best fits your item. This helps buyers find it.</Text>
        {styleError && <Text style={styles.errorText}>{styleError}</Text>}

        {draft.type !== 'bundle' && (
          <>
            <Text style={styles.label}>ITEM TYPE</Text>
            <View style={[styles.condRow, { flexWrap: 'wrap' }]}>
              {[...CATEGORY_ROW1, ...CATEGORY_ROW2].map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.condChip, categoryVal === c.value && styles.condChipOn, { flex: undefined, marginBottom: 6 }]}
                  onPress={() => setCategoryVal(c.value)}
                >
                  <Text style={[styles.condText, categoryVal === c.value && styles.condTextOn]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

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
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg },
  label: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8, marginTop: 14, fontWeight: '700' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  photoSlot: {
    width: '47%', aspectRatio: 1.4, backgroundColor: Colors.darkCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.darkBorder, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%', borderRadius: Radius.md },
  addPhotoText: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  mainBadge: {
    position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  mainBadgeText: { fontSize: 9, color: Colors.white, fontWeight: '700', letterSpacing: 0.5 },
  removeBtn: { position: 'absolute', top: 4, right: 4 },
  inputField: { backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: 12, fontSize: FontSizes.sm, color: Colors.white, borderWidth: 1, borderColor: Colors.darkBorder },
  condRow: { flexDirection: 'row', gap: 8 },
  condChip: { flex: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.darkBorder },
  condChipOn: { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
  condText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  condTextOn: { color: Colors.white },
  helperText: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: 6, marginBottom: 4, lineHeight: 17 },
  errorText: { fontSize: FontSizes.xs, color: Colors.danger, marginTop: 4 },
});
