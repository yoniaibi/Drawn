import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../src/lib/supabase';
import { mapDraw } from '../../../src/services/draws';
import DrawCard from '../../../src/components/DrawCard';
import { Draw } from '../../../src/mocks';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../../src/theme';

interface SellerProfile {
  handle: string;
  seller_verified: boolean;
  avatar_letter: string;
  is_seller: boolean;
  created_at: string;
}

export default function SellerProfileScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [activeDraws, setActiveDraws] = useState<Draw[]>([]);
  const [pastDraws, setPastDraws] = useState<Draw[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!handle) return;
    fetchAll();
  }, [handle]);

  async function fetchAll() {
    setLoading(true);
    const fullHandle = '@' + handle;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('handle', fullHandle)
      .single();

    if (profileError || !profileData || !profileData.is_seller) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: drawsData } = await supabase
      .from('draws')
      .select('*')
      .eq('seller_handle', fullHandle)
      .in('status', ['open', 'closing_tonight', 'completed'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (drawsData) {
      const mapped: Draw[] = (drawsData as any[]).map((d: any) => mapDraw(d));
      const active = mapped.filter(
        (d) => d.status === 'open' || d.status === 'closing_tonight',
      );
      const past = mapped.filter((d) => d.status === 'completed');
      setActiveDraws(active);
      setPastDraws(past);
      setCompletedCount(past.length);
    }

    setLoading(false);
  }

  function memberSinceYear(isoDate: string) {
    return new Date(isoDate).getFullYear().toString();
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.lilac} size="large" />
      </View>
    );
  }

  if (notFound || !profile) {
    return (
      <View style={styles.centered}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Ionicons name="person-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.notFoundTitle}>Profile not found</Text>
        <Text style={styles.notFoundSub}>
          This seller doesn't exist or hasn't set up their profile yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.heroSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{profile.avatar_letter}</Text>
          </View>

          <Text style={styles.handleText}>{profile.handle}</Text>

          {profile.seller_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={13} color={Colors.gold} />
              <Text style={styles.verifiedText}>VERIFIED SELLER</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeDraws.length}</Text>
              <Text style={styles.statLabel}>Active draws</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {memberSinceYear(profile.created_at)}
              </Text>
              <Text style={styles.statLabel}>Member since</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active draws</Text>

          {activeDraws.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No active draws right now — follow to get notified when they
                list something new.
              </Text>
            </View>
          ) : (
            activeDraws.map((draw) => (
              <DrawCard key={draw.id} draw={draw} wide />
            ))
          )}
        </View>

        {pastDraws.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past draws</Text>
            {pastDraws.map((draw) => (
              <PastDrawRow key={draw.id} draw={draw} />
            ))}
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

function PastDrawRow({ draw }: { draw: Draw }) {
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <View style={styles.pastRow}>
      <View style={styles.pastRowLeft}>
        <Text style={styles.pastTitle} numberOfLines={1}>
          {draw.title}
        </Text>
        <Text style={styles.pastSub}>{formatDate(draw.closesAt)}</Text>
      </View>
      <Text style={styles.pastWinner} numberOfLines={1}>
        Winner: {draw.seller}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.darkCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.darkCard,
    borderWidth: 2,
    borderColor: Colors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarLetter: {
    fontSize: 36,
    color: Colors.textPrimary,
  },
  handleText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249,200,70,0.12)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginBottom: Spacing.lg,
  },
  verifiedText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.gold,
    letterSpacing: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.darkBorder,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pastRowLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  pastTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  pastSub: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  pastWinner: {
    fontSize: FontSizes.sm,
    color: Colors.lilac,
    fontWeight: '600',
    maxWidth: 120,
    textAlign: 'right',
  },
  notFoundTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  notFoundSub: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomPad: {
    height: 40,
  },
});
