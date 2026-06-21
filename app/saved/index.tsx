import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { Draw } from '../../src/mocks';
import { mapDraw } from '../../src/services/draws';
import DrawCard from '../../src/components/DrawCard';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store';

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    loadSaved();
  }, [user?.id]);

  async function loadSaved() {
    setLoading(true);
    try {
      const { data: watchRows, error: watchErr } = await supabase
        .from('draw_watches')
        .select('draw_id')
        .eq('user_id', user!.id);

      if (watchErr || !watchRows || watchRows.length === 0) {
        setDraws([]);
        setSavedIds(new Set());
        setLoading(false);
        return;
      }

      const ids: string[] = watchRows.map((r: any) => r.draw_id);
      setSavedIds(new Set(ids));

      const { data: drawRows, error: drawErr } = await supabase
        .from('draws')
        .select('*')
        .in('id', ids);

      if (drawErr || !drawRows) {
        setDraws([]);
        setLoading(false);
        return;
      }

      setDraws(drawRows.map((row: any) => mapDraw(row)));
    } catch {
      setDraws([]);
    } finally {
      setLoading(false);
    }
  }

  const handleUnsave = useCallback(async (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDraws(prev => prev.filter(d => d.id !== id));
    if (user?.id) {
      await supabase
        .from('draw_watches')
        .delete()
        .eq('user_id', user.id)
        .eq('draw_id', id);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.back}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.lilac} />
        </View>
      </View>
    );
  }

  if (draws.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.back}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={52} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No saved draws yet</Text>
          <Text style={styles.emptySub}>
            Tap the bookmark on any draw to save it for later
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.replace('/(tabs)' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.browseBtnText}>Browse draws</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.back}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved</Text>
        <Text style={styles.headerCount}>{draws.length}</Text>
      </View>

      <FlatList
        data={draws}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <DrawCard
              draw={item}
              saved={savedIds.has(item.id)}
              onSave={handleUnsave}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.darkBg,
    paddingTop: 56,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: 8,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.darkCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
  },
  headerCount: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  emptySub: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.lilac,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: 12,
  },
  browseBtnText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 32,
    paddingTop: Spacing.sm,
  },
  row: {
    gap: 8,
    marginBottom: 8,
  },
  cell: {
    width: '50%',
    flex: 1,
  },
});
