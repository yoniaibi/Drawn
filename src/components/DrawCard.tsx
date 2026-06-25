import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { Draw, STYLE_SHORT } from '../mocks';
import { Colors, Fonts, Radius, FontSizes, Spacing } from '../theme';
import { formatTicketPrice, getCountdownTo9pm } from '../utils/countdown';
import ProgressBar from './ProgressBar';

interface Props {
  draw: Draw;
  wide?: boolean;
  saved?: boolean;
  onSave?: (id: string) => void;
  variant?: 'grid' | 'mini';
}

const URGENCY_COLORS = {
  closing_tonight: Colors.pink,
  live: Colors.gold,
  open: Colors.lilac,
  pending: Colors.textTertiary,
  completed: Colors.textTertiary,
  cancelled: Colors.textTertiary,
};

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  new:      { label: 'New',       color: '#a78bfa' },
  like_new: { label: 'Like new',  color: Colors.lilac },
  good:     { label: 'Good',      color: Colors.textSecondary },
  fair:     { label: 'Fair',      color: Colors.textTertiary },
};

// Seller avatar gradient colours per letter
const AVATAR_COLORS: Record<string, string> = {
  A: '#e879f9', B: '#818cf8', C: '#f472b6', D: '#8B5CF6',
  E: '#34d399', F: '#fb923c', G: '#a78bfa', H: '#60a5fa',
  K: '#f9c846', L: '#4ade80', M: '#f87171', N: '#38bdf8',
  P: '#c084fc', R: '#fb7185', S: '#f472b6', T: '#fbbf24',
};

function avatarColor(letter: string) {
  return AVATAR_COLORS[letter?.toUpperCase()] ?? Colors.royal;
}

export default function DrawCard({ draw, wide, saved = false, onSave, variant = 'grid' }: Props) {
  const isMini = variant === 'mini';
  const router = useRouter();
  const [countdown, setCountdown] = useState(getCountdownTo9pm());
  const [isSaved, setIsSaved] = useState(saved);

  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  useEffect(() => {
    if (draw.status !== 'closing_tonight') return;
    const id = setInterval(() => setCountdown(getCountdownTo9pm()), 60000);
    return () => clearInterval(id);
  }, [draw.status]);

  const progress = draw.ticketsSold / draw.totalTickets;
  const remaining = draw.totalTickets - draw.ticketsSold;
  const isTonight = draw.status === 'closing_tonight';
  const isLive = draw.status === 'live';
  const isUrgent = isTonight && progress > 0.7;
  const urgentColor = URGENCY_COLORS[draw.status];
  const viewers = Math.floor(draw.ticketsSold * 0.012 + 4);
  const condition = CONDITION_LABELS[draw.condition] ?? CONDITION_LABELS.good;
  const accentColor = avatarColor(draw.sellerAvatar?.[0] ?? 'D');

  function handleSave() {
    const next = !isSaved;
    setIsSaved(next);
    heartScale.value = withSpring(1.5, { damping: 4 }, () => {
      heartScale.value = withSpring(1, { damping: 10 });
    });
    onSave?.(draw.id);
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        wide && styles.wide,
        isUrgent && styles.urgentBorder,
        isLive && styles.liveBorder,
      ]}
      onPress={() => router.push(`/draw/${draw.id}`)}
      activeOpacity={0.88}
    >
      {draw.isBundle ? (
        <View style={styles.bundleStrip}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="bundleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#1a0d35" stopOpacity="1" />
                <Stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.08" />
                <Stop offset="100%" stopColor="#0a0618" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#bundleGrad)" />
          </Svg>
          {(draw.bundleItems ?? []).slice(0, 3).map((item, i) => (
            <View key={i} style={[styles.bundleCell, { backgroundColor: `rgba(${45 + i * 22},15,${55 + i * 18},0.75)` }]}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.bundleImage} resizeMode="cover" />
              ) : (
                <View style={[styles.bundleImage, { backgroundColor: 'rgba(139,92,246,0.25)', borderRadius: 10 }]} />
              )}
              {wide && <Text style={styles.bundleItemName} numberOfLines={1}>{item.name}</Text>}
            </View>
          ))}
          <View style={[styles.bundleCell, styles.bundleMore]}>
            <Text style={styles.bundleMoreText}>+{Math.max(0, (draw.bundleItems?.length ?? 0) - 3)}</Text>
            {wide && <Text style={styles.bundleMoreSub}>more</Text>}
          </View>
          <View style={styles.bundleBadgeAbsolute}>
            <Text style={styles.bundleBadgeText}>BUNDLE</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.imageBox, isMini && styles.imageBoxMini]}>
          {draw.image ? (
            <Image source={{ uri: draw.image }} style={styles.itemImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={[styles.placeholderEmoji, isMini && { fontSize: 32 }]}>{(draw as any).emoji ?? '🎁'}</Text>
            </View>
          )}

          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id={`imgGrad-${draw.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#0f0b1e" stopOpacity="0.55" />
                <Stop offset="35%" stopColor="#120a2a" stopOpacity="0.15" />
                <Stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.04" />
                <Stop offset="100%" stopColor="#0a0618" stopOpacity="0.82" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#imgGrad-${draw.id})`} />
          </Svg>

          {/* Retail value badge */}
          <View style={styles.valueBadge}>
            <Text style={styles.valueBadgeText}>£{draw.retailValue.toLocaleString()}</Text>
          </View>

          {/* Condition */}
          <View style={[styles.conditionBadge, { borderColor: condition.color + '55' }]}>
            <Text style={[styles.conditionText, { color: condition.color }]}>{condition.label}</Text>
          </View>

          {/* Live viewer count */}
          {!isMini && (
            <View style={styles.viewerBadge}>
              <View style={[styles.viewerDot, { backgroundColor: urgentColor }]} />
              <Text style={styles.viewerText}>{viewers}</Text>
            </View>
          )}

          {/* Style badge (mini variant only) */}
          {isMini && draw.style && (
            <View style={styles.styleBadgeMini}>
              <Text style={styles.styleBadgeMiniText}>{STYLE_SHORT[draw.style]}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.meta}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isMini && { fontSize: FontSizes.xs }]} numberOfLines={1}>{draw.title}</Text>
          {!isMini && (
            <Animated.View style={heartStyle}>
              <TouchableOpacity onPress={handleSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons
                  name={isSaved ? 'heart' : 'heart-outline'}
                  size={15}
                  color={isSaved ? Colors.pink : Colors.textTertiary}
                />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {!isMini && (
          <View style={styles.sellerRow}>
            <View style={[styles.sellerDot, { backgroundColor: accentColor + '28', borderColor: accentColor + '60', borderWidth: 1 }]}>
              <Text style={[styles.sellerDotText, { color: accentColor }]}>{draw.sellerAvatar?.[0] ?? '?'}</Text>
            </View>
            <Text style={styles.seller} numberOfLines={1}>{draw.seller}</Text>
            {draw.verified && <Ionicons name="shield-checkmark" size={9} color={Colors.lilac} style={{ marginLeft: 1 }} />}
          </View>
        )}

        <View style={styles.progressRow}>
          <ProgressBar
            progress={progress}
            height={3.5}
            color={isUrgent ? Colors.pink : isLive ? Colors.gold : Colors.lilac}
          />
          {isUrgent && <Text style={styles.urgentPct}>{Math.round(progress * 100)}%</Text>}
        </View>

        {remaining < 500 && (
          <Text style={styles.scarcity}>⚡ {remaining.toLocaleString()} left</Text>
        )}

        <View style={styles.footer}>
          <View style={[
            styles.pricePill,
            isLive
              ? { backgroundColor: Colors.gold }
              : { backgroundColor: Colors.pink },
          ]}>
            <Text style={[styles.priceText, isLive && { color: Colors.ink }]}>
              {formatTicketPrice(draw.ticketPrice)}
            </Text>
          </View>
          <View style={styles.timingRow}>
            {(isTonight || isLive) && (
              <View style={[styles.timingDot, { backgroundColor: isLive ? Colors.gold : Colors.pink }]} />
            )}
            <Text style={[
              styles.timing,
              isTonight && styles.timingTonight,
              isLive && styles.timingLive,
            ]}>
              {isLive ? 'LIVE NOW' : isTonight ? `${countdown.h}h ${countdown.m}m` : 'Open'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  wide: { flex: 1 },
  urgentBorder: {
    borderColor: 'rgba(244,114,182,0.55)',
    shadowColor: '#F472B6',
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  liveBorder: {
    borderColor: 'rgba(249,200,70,0.5)',
    shadowColor: '#F9C846',
    shadowOpacity: 0.2,
    shadowRadius: 14,
  },

  imageBox: { height: 128, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  imageBoxMini: { height: 90 },
  styleBadgeMini: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  styleBadgeMiniText: { fontSize: 7, color: Colors.white, fontWeight: '700' },
  bundleStrip: { flexDirection: 'row', height: 104, position: 'relative', overflow: 'hidden' },
  bundleCell: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  bundleImage: { width: 52, height: 52, borderRadius: 10 },
  bundleItemName: { fontSize: 6.5, color: Colors.textTertiary, textAlign: 'center', paddingHorizontal: 2 },
  bundleMore: { backgroundColor: 'rgba(15,10,30,0.75)' },
  bundleMoreText: { fontSize: 13, fontWeight: '800', color: Colors.gold },
  bundleMoreSub: { fontSize: 7.5, color: Colors.textTertiary },
  bundleBadgeAbsolute: {
    position: 'absolute', top: 7, left: 7,
    backgroundColor: Colors.gold, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2.5,
  },
  bundleBadgeText: { fontSize: 7, fontWeight: '800', color: Colors.violet, letterSpacing: 0.5 },

  itemImage: { width: '100%', height: '100%', position: 'absolute' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: 'rgba(45,27,105,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 38 },

  valueBadge: {
    position: 'absolute', top: 7, right: 7,
    backgroundColor: 'rgba(249,200,70,0.93)',
    borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2.5,
  },
  valueBadgeText: { fontSize: 8, fontWeight: '800', color: '#1A1040', letterSpacing: 0.2 },

  conditionBadge: {
    position: 'absolute', top: 7, left: 7,
    borderRadius: 6, borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 5, paddingVertical: 2,
  },
  conditionText: { fontSize: 7, fontWeight: '700', letterSpacing: 0.2 },

  viewerBadge: {
    position: 'absolute', bottom: 7, left: 7,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20,
    paddingHorizontal: 6, paddingVertical: 2.5,
  },
  viewerDot: { width: 4.5, height: 4.5, borderRadius: 2.5 },
  viewerText: { fontSize: 7.5, color: Colors.white, fontWeight: '600' },

  meta: { padding: 10, paddingBottom: 11, gap: 4 },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: Colors.white, fontSize: 12.5, fontWeight: '700', flex: 1, marginRight: 5, letterSpacing: 0.1 },

  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sellerDot: {
    width: 15, height: 15, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  sellerDotText: { fontSize: 7, fontWeight: '900' },
  seller: { color: Colors.textSecondary, fontSize: 9, flex: 1 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  urgentPct: { fontSize: 7.5, color: Colors.pink, fontWeight: '700' },
  scarcity: { fontSize: 8, color: Colors.gold, fontWeight: '600' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  pricePill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  priceText: { color: Colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.1 },

  timingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timingDot: { width: 4.5, height: 4.5, borderRadius: 2.5 },
  timing: { fontSize: 9, color: Colors.textSecondary, fontWeight: '600' },
  timingTonight: { color: Colors.pink },
  timingLive: { color: Colors.gold, fontWeight: '800' },
});
