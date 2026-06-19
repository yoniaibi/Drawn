import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';
import { MOCK_DRAWS, Draw } from '../../src/mocks';
import { fetchDrawById } from '../../src/services/draws';

export default function ShareScreen() {
  const { drawId } = useLocalSearchParams<{ drawId: string }>();
  const router = useRouter();
  const [draw, setDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Try mock first
      const mock = MOCK_DRAWS.find(d => d.id === drawId);
      if (mock) {
        setDraw(mock);
        setLoading(false);
        return;
      }
      // Fallback to Supabase
      if (drawId) {
        try {
          const remote = await fetchDrawById(drawId);
          if (remote) {
            setDraw(remote);
            setLoading(false);
            return;
          }
        } catch (_) {}
      }
      // Final fallback: first mock draw
      setDraw(MOCK_DRAWS[0] ?? null);
      setLoading(false);
    }
    load();
  }, [drawId]);

  if (loading || !draw) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  const fillPct = Math.round((draw.ticketsSold / draw.totalTickets) * 100);
  const ticketsLeft = draw.totalTickets - draw.ticketsSold;
  const priceStr = draw.ticketPrice < 100
    ? `${draw.ticketPrice}p`
    : `£${(draw.ticketPrice / 100).toFixed(2)}`;
  const shareUrl = `https://drawn.app/draw/${draw.id}`;
  const shareMessage = `Win a ${draw.title} worth £${draw.retailValue.toLocaleString()} for just ${priceStr} on DRAWN! ${shareUrl}`;

  function handleShareVia() {
    Share.share({
      message: shareMessage,
      url: shareUrl,
      title: `Win ${draw!.title} on DRAWN`,
    });
  }

  function handleCopyLink() {
    Share.share({
      message: shareUrl,
      url: shareUrl,
    });
  }

  const closesLabel =
    draw.status === 'closing_tonight' ? 'Closes tonight' : 'Closes soon';

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share this draw</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Share card preview */}
        <View style={styles.card}>
          {/* Branding */}
          <Text style={styles.cardBrand}>drawn.app</Text>

          {/* Emoji */}
          <Text style={styles.cardEmoji}>{draw.emoji}</Text>

          {/* Title */}
          <Text style={styles.cardTitle}>{draw.title}</Text>

          {/* Price → value */}
          <View style={styles.cardPriceRow}>
            <Text style={styles.cardPriceLabel}>
              Enter from{' '}
              <Text style={styles.cardPriceValue}>{priceStr}</Text>
            </Text>
            <View style={styles.cardDivider} />
            <Text style={styles.cardValueLabel}>
              Worth{' '}
              <Text style={styles.cardValueGold}>£{draw.retailValue.toLocaleString()}</Text>
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(fillPct, 100)}%` as any }]} />
          </View>
          <Text style={styles.progressLabel}>{fillPct}% filled</Text>

          {/* CTA text */}
          <View style={styles.cardCta}>
            <View style={styles.ctaDot} />
            <Text style={styles.ctaText}>
              Enter from {priceStr} · {closesLabel}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{fillPct}%</Text>
            <Text style={styles.statLabel}>filled</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{ticketsLeft.toLocaleString()}</Text>
            <Text style={styles.statLabel}>tickets left</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.gold }]}>
              £{draw.retailValue.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>retail value</Text>
          </View>
        </View>

        {/* Share buttons */}
        <TouchableOpacity style={styles.btnPrimary} onPress={handleShareVia}>
          <Ionicons name="share-outline" size={18} color={Colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.btnPrimaryText}>Share via…</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={handleCopyLink}>
          <Ionicons name="link-outline" size={18} color={Colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.btnSecondaryText}>Copy link</Text>
        </TouchableOpacity>

        {/* Stories — coming soon */}
        <TouchableOpacity style={styles.btnDisabled} disabled>
          <Ionicons name="logo-instagram" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <Text style={styles.btnDisabledText}>Share to Stories</Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Coming soon</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: FontSizes.lg,
    color: Colors.white,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },

  // Share card
  card: {
    backgroundColor: '#1C1040',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    marginBottom: Spacing.lg,
  },
  cardBrand: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: Spacing.lg,
    textTransform: 'lowercase',
  },
  cardEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 30,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.md,
  },
  cardPriceLabel: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  cardPriceValue: {
    color: Colors.white,
    fontWeight: '700',
  },
  cardDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardValueLabel: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  cardValueGold: {
    color: Colors.gold,
    fontWeight: '700',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.lilac,
  },
  progressLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: Spacing.md,
  },
  cardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ctaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.pink,
  },
  ctaText: {
    fontSize: FontSizes.xs,
    color: '#E9D5FF',
    fontWeight: '600',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Fonts.serif,
    fontSize: FontSizes.lg,
    color: Colors.white,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statSep: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Buttons
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lilac,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    marginBottom: Spacing.sm,
  },
  btnPrimaryText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSizes.base,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 15,
    marginBottom: Spacing.sm,
  },
  btnSecondaryText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSizes.base,
  },
  btnDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 15,
  },
  btnDisabledText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: FontSizes.base,
  },
  comingSoonBadge: {
    marginLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  comingSoonText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
