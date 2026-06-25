import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';
import { supabase } from '../../src/lib/supabase';
import type { DrawStyle } from '../../src/mocks';

const STYLE_CHIPS: { label: string; value: DrawStyle }[] = [
  { label: 'Womenswear & accessories', value: 'womenswear' },
  { label: 'Menswear & streetwear', value: 'menswear' },
  { label: 'Unisex & everything else', value: 'unisex' },
];

const ITEM_CATEGORY_CHIPS = [
  { label: 'Bags', emoji: '👜' },
  { label: 'Trainers', emoji: '👟' },
  { label: 'Watches', emoji: '⌚' },
  { label: 'Streetwear', emoji: '🧢' },
  { label: 'Clothing', emoji: '👗' },
  { label: 'Jewellery', emoji: '💎' },
  { label: 'Accessories', emoji: '🕶️' },
  { label: 'Wardrobe bundles', emoji: '🛍️' },
  { label: 'Vintage', emoji: '🏷️' },
];

const PRICE_RANGES: { label: string; value: string }[] = [
  { label: 'Under 25p', value: 'under25' },
  { label: '25–50p', value: '25to50' },
  { label: '50p–£1', value: '50to100' },
  { label: 'Any', value: 'any' },
];

function Chip({
  label,
  selected,
  onPress,
  prefix,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  prefix?: string;
}) {
  return (
    <TouchableOpacity
      style={[screenStyles.chip, selected ? screenStyles.chipOn : screenStyles.chipOff]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {prefix ? <Text style={screenStyles.chipEmoji}>{prefix}</Text> : null}
      <Text style={[screenStyles.chipText, selected && screenStyles.chipTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={screenStyles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[screenStyles.dot, i + 1 === current ? screenStyles.dotActive : screenStyles.dotInactive]} />
      ))}
    </View>
  );
}

function PillToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <TouchableOpacity
      style={[screenStyles.pillTrack, value ? screenStyles.pillTrackOn : screenStyles.pillTrackOff]}
      onPress={() => onChange(!value)}
      activeOpacity={0.8}
    >
      <View style={[screenStyles.pillThumb, value ? screenStyles.pillThumbRight : screenStyles.pillThumbLeft]} />
    </TouchableOpacity>
  );
}

export default function InterestsScreen() {
  const router = useRouter();
  const [styles, setStyles] = useState<DrawStyle[]>(['womenswear', 'menswear', 'unisex']);
  const [cats, setCats] = useState<string[]>([]);
  const [price, setPrice] = useState('any');
  const [notify, setNotify] = useState(true);

  const toggleMulti = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const toggleStyle = (val: DrawStyle) =>
    setStyles(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]);

  const canProceed = cats.length > 0;

  return (
    <ScrollView style={screenStyles.screen} contentContainerStyle={screenStyles.content}>
      <StepDots current={2} total={2} />


      <Text style={screenStyles.title}>What are you into?</Text>
      <Text style={screenStyles.sub}>We'll show you the best draws for you.</Text>

      <Text style={screenStyles.sectionLabel}>WHAT DO YOU SHOP FOR?</Text>
      <Text style={screenStyles.sectionSub}>We use this to show you the most relevant draws. You can always see everything.</Text>
      <View style={screenStyles.chips}>
        {STYLE_CHIPS.map((s) => (
          <Chip
            key={s.value}
            label={s.label}
            selected={styles.includes(s.value)}
            onPress={() => toggleStyle(s.value)}
          />
        ))}
      </View>
      {styles.length === 0 && (
        <Text style={screenStyles.styleNote}>Select at least one to see draws in your feed.</Text>
      )}

      <View style={screenStyles.divider} />

      <Text style={screenStyles.sectionLabel}>CATEGORIES</Text>
      <View style={screenStyles.chips}>
        {ITEM_CATEGORY_CHIPS.map((c) => (
          <Chip
            key={c.label}
            label={c.label}
            prefix={c.emoji}
            selected={cats.includes(c.label)}
            onPress={() => toggleMulti(cats, setCats, c.label)}
          />
        ))}
      </View>

      <View style={screenStyles.divider} />

      <Text style={screenStyles.sectionLabel}>TICKET PRICE RANGE</Text>
      <View style={screenStyles.chips}>
        {PRICE_RANGES.map((p) => (
          <Chip
            key={p.value}
            label={p.label}
            selected={price === p.value}
            onPress={() => setPrice(p.value)}
          />
        ))}
      </View>

      <View style={screenStyles.divider} />

      <View style={screenStyles.toggleRow}>
        <View style={screenStyles.toggleText}>
          <Text style={screenStyles.toggleTitle}>Notify me before tonight's draw closes</Text>
          <Text style={screenStyles.toggleSub}>We'll ping you at 8:50pm so you never miss out</Text>
        </View>
        <PillToggle value={notify} onChange={setNotify} />
      </View>

      <PrimaryButton
        label="Let's go →"
        onPress={async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').update({
              interests: cats,
              style_preferences: styles,
              price_range: price,
              notify_before_close: notify,
            }).eq('id', user.id);
          }
          router.replace('/(tabs)');
        }}
        style={{ marginTop: Spacing.xl, opacity: canProceed ? 1 : 0.4 }}
        disabled={!canProceed}
      />

      <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={screenStyles.skipRow}>
        <Text style={screenStyles.skip}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const screenStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg },
  content: { padding: Spacing.lg, paddingBottom: 48 },

  dots: { flexDirection: 'row', gap: 8, marginBottom: Spacing.xl, marginTop: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotActive: { backgroundColor: Colors.lilac },
  dotInactive: { backgroundColor: Colors.darkBorder },

  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.xl },
  sectionSub: { fontSize: FontSizes.xs, color: Colors.textTertiary, lineHeight: 17, marginBottom: 10, marginTop: -4 },
  styleNote: { fontSize: FontSizes.xs, color: Colors.gold, marginTop: 6 },

  sectionLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: Colors.lilac },
  chipOff: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.darkBorder },
  chipEmoji: { fontSize: 14 },
  chipText: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  chipTextOn: { color: Colors.white },

  divider: { height: 1, backgroundColor: Colors.darkBorder, marginVertical: 18 },

  toggleRow: {
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  toggleText: { flex: 1 },
  toggleTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '600' },
  toggleSub: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginTop: 3, lineHeight: 17 },

  pillTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  pillTrackOn: { backgroundColor: Colors.lilac },
  pillTrackOff: { backgroundColor: Colors.darkBorder },
  pillThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
  },
  pillThumbLeft: { alignSelf: 'flex-start' },
  pillThumbRight: { alignSelf: 'flex-end' },

  skipRow: { alignItems: 'center', marginTop: 14 },
  skip: { fontSize: FontSizes.sm, color: Colors.textTertiary },
});
