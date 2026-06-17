import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import PrimaryButton from '../../src/components/PrimaryButton';

const CATEGORIES = ['Bags', 'Trainers', 'Watches', 'Streetwear', 'Jewellery', 'Sunglasses', 'Bundles', 'Vintage'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'One size'];
const MAX_PRICES = ['10p', '25p', '50p', '£1', 'Any'];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected ? styles.chipOn : styles.chipOff]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function InterestsScreen() {
  const router = useRouter();
  const [cats, setCats] = useState(['Bags', 'Trainers', 'Streetwear', 'Bundles']);
  const [sizes, setSizes] = useState(['M', 'L']);
  const [price, setPrice] = useState('25p');
  const [reminders, setReminders] = useState(true);

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>What are you into?</Text>
      <Text style={styles.sub}>We'll show you the draws you'll actually want to enter.</Text>

      <Text style={styles.sectionLabel}>CATEGORIES</Text>
      <View style={styles.chips}>
        {CATEGORIES.map(c => <Chip key={c} label={c} selected={cats.includes(c)} onPress={() => toggle(cats, setCats, c)} />)}
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>YOUR SIZE</Text>
      <View style={styles.chips}>
        {SIZES.map(s => <Chip key={s} label={s} selected={sizes.includes(s)} onPress={() => toggle(sizes, setSizes, s)} />)}
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>MAX TICKET PRICE</Text>
      <View style={styles.chips}>
        {MAX_PRICES.map(p => <Chip key={p} label={p} selected={price === p} onPress={() => setPrice(p)} />)}
      </View>

      <View style={styles.divider} />

      <View style={styles.toggle}>
        <View>
          <Text style={styles.toggleTitle}>Draw reminders</Text>
          <Text style={styles.toggleSub}>8:50pm when your draw is tonight</Text>
        </View>
        <Switch
          value={reminders}
          onValueChange={setReminders}
          trackColor={{ true: Colors.lilac, false: '#3a2480' }}
          thumbColor={Colors.white}
        />
      </View>

      <PrimaryButton label="Take me to the draws" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 20 }} />
      <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipRow}>
        <Text style={styles.skip}>Skip</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white, marginBottom: 4 },
  sub: { fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 18, marginBottom: 20 },
  sectionLabel: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.6, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  chipOn: { backgroundColor: Colors.lilac },
  chipOff: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.darkBorder },
  chipText: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.textSecondary },
  chipTextOn: { color: Colors.white },
  divider: { height: 1, backgroundColor: Colors.darkBorder, marginVertical: 14 },
  toggle: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  toggleTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '500' },
  toggleSub: { fontSize: 9, color: Colors.textTertiary, marginTop: 2 },
  skipRow: { alignItems: 'center', marginTop: 12 },
  skip: { fontSize: FontSizes.xs, color: Colors.lilac },
});
