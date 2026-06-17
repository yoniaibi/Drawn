import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';

const CATEGORIES: { label: string; emoji: string }[] = [
  { label: 'Fashion', emoji: '👗' },
  { label: 'Sneakers', emoji: '👟' },
  { label: 'Watches', emoji: '⌚' },
  { label: 'Bags', emoji: '👜' },
  { label: 'Jewellery', emoji: '💎' },
  { label: 'Tech', emoji: '📱' },
  { label: 'Art', emoji: '🎨' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

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
      style={[styles.chip, selected ? styles.chipOn : styles.chipOff]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {prefix ? <Text style={styles.chipEmoji}>{prefix}</Text> : null}
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i + 1 === current ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  );
}

function PillToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <TouchableOpacity
      style={[styles.pillTrack, value ? styles.pillTrackOn : styles.pillTrackOff]}
      onPress={() => onChange(!value)}
      activeOpacity={0.8}
    >
      <View style={[styles.pillThumb, value ? styles.pillThumbRight : styles.pillThumbLeft]} />
    </TouchableOpacity>
  );
}

export default function InterestsScreen() {
  const router = useRouter();
  const [cats, setCats] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [price, setPrice] = useState('any');
  const [notify, setNotify] = useState(true);

  const hasFashion = cats.some((c) =>
    ['Fashion', 'Sneakers', 'Bags', 'Jewellery'].includes(c)
  );

  const toggleMulti = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const canProceed = cats.length > 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <StepDots current={2} total={2} />

      <Text style={styles.title}>What are you into?</Text>
      <Text style={styles.sub}>We'll show you the best draws for you.</Text>

      <Text style={styles.sectionLabel}>CATEGORIES</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.label}
            label={c.label}
            prefix={c.emoji}
            selected={cats.includes(c.label)}
            onPress={() => toggleMulti(cats, setCats, c.label)}
          />
        ))}
      </View>

      {hasFashion && (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>YOUR SIZE</Text>
          <View style={styles.chips}>
            {SIZES.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={sizes.includes(s)}
                onPress={() => toggleMulti(sizes, setSizes, s)}
              />
            ))}
          </View>
        </>
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>TICKET PRICE RANGE</Text>
      <View style={styles.chips}>
        {PRICE_RANGES.map((p) => (
          <Chip
            key={p.value}
            label={p.label}
            selected={price === p.value}
            onPress={() => setPrice(p.value)}
          />
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleTitle}>Notify me before tonight's draw closes</Text>
          <Text style={styles.toggleSub}>We'll ping you at 8:50pm so you never miss out</Text>
        </View>
        <PillToggle value={notify} onChange={setNotify} />
      </View>

      <PrimaryButton
        label="Let's go →"
        onPress={() => router.replace('/(tabs)')}
        style={{ marginTop: Spacing.xl, opacity: canProceed ? 1 : 0.4 }}
        disabled={!canProceed}
      />

      <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipRow}>
        <Text style={styles.skip}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg },
  content: { padding: Spacing.lg, paddingBottom: 48 },

  dots: { flexDirection: 'row', gap: 6, marginBottom: Spacing.xl, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: Colors.lilac },
  dotInactive: { backgroundColor: Colors.darkBorder },

  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 6 },
  sub: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.xl },

  sectionLabel: {
    fontSize: 9,
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
