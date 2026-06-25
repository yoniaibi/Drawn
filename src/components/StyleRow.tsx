import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Draw, DrawStyle } from '../mocks';
import { Colors, FontSizes, Spacing } from '../theme';
import DrawCard from './DrawCard';

interface StyleRowProps {
  style: DrawStyle;
  label: string;
  draws: Draw[];
}

export default function StyleRow({ style: styleProp, label, draws }: StyleRowProps) {
  const router = useRouter();
  if (draws.length < 2) return null;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/', params: { styleFilter: styleProp } } as any)}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={draws}
        keyExtractor={d => d.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: 10 }}
        renderItem={({ item }) => (
          <View style={{ width: 160 }}>
            <DrawCard draw={item} variant="mini" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, marginBottom: 10,
  },
  label: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
  seeAll: { fontSize: FontSizes.xs, color: Colors.lilac, fontWeight: '600' },
});
