import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { Draw } from '../mocks';
import { Colors, Radius, FontSizes, Spacing } from '../theme';
import { formatTicketPrice, getCountdownTo9pm } from '../utils/countdown';
import ProgressBar from './ProgressBar';

interface Props {
  draw: Draw;
  wide?: boolean;
  saved?: boolean;
  onSave?: (id: string) => void;
}

const URGENCY_COLORS = {
  closing_tonight: Colors.pink,
  live: Colors.gold,
  open: Colors.lilac,
  completed: Colors.textTertiary,
  cancelled: Colors.textTertiary,
};

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  new:      { label: 'New',       color: Colors.lilac },
  like_new: { label: 'Like new',  color: Colors.lilac },
  good:     { label: 'Good',      color: Colors.textSecondary },
  fair:     { label: 'Fair',      color: Colors.textTertiary },
};

export default function DrawCard({ draw, wide, saved = false, onSave }: Props) {
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
  const viewers = Math.floor(draw.ticketsSold * 0.08 + 12);
  const condition = CONDITION_LABELS[draw.condition] ?? CONDITION_LABELS.good;

  function handleSave() {
    const next = !isSaved;
    setIsSaved(next);
    heartScale.value = withSpring(1.4, { damping: 4 }, () => {
      heartScale.value = withSpring(1);
    });
    onSave?.(draw.id);
  }

  return (
    <TouchableOpacity
      style={[styles.card, wide && styles.wide, isUrgent && styles.urgentBorder]}
      onPress={() => router.push(`/draw/${draw.id}`)}
      activeOpacity={0.85}
    >
      {draw.isBundle ? (
        <View style={styles.bundleStrip}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="bundleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#1a0d35" stopOpacity="1" />
                <Stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.07" />
                <Stop offset="100%" stopColor="#0a0618" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#bundleGrad)" />
          </Svg>
          {(draw.bundleItems ?? []).slice(0, 3).map((item, i) => (
            <View key={i} style={[styles.bundleCell, { backgroundColor: `rgba(${45 + i * 25},15,${60 + i * 15},0.7)` }]}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.bundleImage} resizeMode="cover" />
              ) : (
                <View style={[styles.bundleImage, { backgroundColor: 'rgba(139,92,246,0.2)' }]} />
              )}
              {wide && <Text style={styles.bundleItemName} numberOfLines={1}>{item.name}</Text>}
            </View>
          ))}
          <View style={[styles.bundleCell, styles.bundleMore]}>
            <Text style={styles.bundleMoreText}>+{Math.max(0, (draw.bundleItems?.length ?? 0) - 3)}</Text>
            {wide && <Text style={styles.bundleMoreSub}>items</Text>}
          </View>
          <View style={styles.bundleBadgeAbsolute}>
            <Text style={styles.bundleBadgeText}>BUNDLE</Text>
          </View>
        </View>
      ) : (
        <View style={styles.imageBox}>
          {draw.image ? (
            <Image source={{ uri: draw.image }} style={styles.itemImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}

          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id={`imgGrad-${draw.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#1a0d35" stopOpacity="0.7" />
                <Stop offset="45%" stopColor="#120a2a" stopOpacity="0.3" />
                <Stop offset="55%" stopColor="#8B5CF6" stopOpacity="0.06" />
                <Stop offset="100%" stopColor="#0a0618" stopOpacity="0.8" />
              </LinearGradient>
              <LinearGradient id={`shimmer-${draw.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="48%" stopColor="#8B5CF6" stopOpacity="0" />
                <Stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.09" />
                <Stop offset="52%" stopColor="#8B5CF6" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#imgGrad-${draw.id})`} />
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#shimmer-${draw.id})`} />
          </Svg>

          {/* Prize value */}
          <View style={styles.valueBadge}>
            <Text style={styles.valueBadgeText}>£{draw.retailValue.toLocaleString()}</Text>
          </View>

          {/* Condition badge */}
          <View style={[styles.conditionBadge, { borderColor: condition.color + '60' }]}>
            <Text style={[styles.conditionText, { color: condition.color }]}>{condition.label}</Text>
          </View>

          {/* Live viewer count */}
          <View style={styles.viewerBadge}>
            <View style={[styles.viewerDot, { backgroundColor: urgentColor }]} />
            <Text style={styles.viewerText}>{viewers}</Text>
          </View>
        </View>
      )}

      <View style={styles.meta}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{draw.title}</Text>
          <Animated.View style={heartStyle}>
            <TouchableOpacity onPress={handleSave} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={13}
                color={isSaved ? Colors.pink : Colors.textTertiary}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.sellerRow}>
          <View style={styles.sellerDot}>
            <Text style={styles.sellerDotText}>{draw.sellerAvatar}</Text>
          </View>
          <Text style={styles.seller}>{draw.seller}</Text>
          {draw.verified && <Ionicons name="shield-checkmark" size={8} color={Colors.lilac} />}
        </View>

        <View style={styles.progressRow}>
          <ProgressBar progress={progress} height={3} color={isUrgent ? Colors.pink : Colors.lilac} />
          {isUrgent && <Text style={styles.urgentPct}>{Math.round(progress * 100)}%</Text>}
        </View>

        {remaining < 500 && (
          <Text style={styles.scarcity}>⚡ {remaining.toLocaleString()} left</Text>
        )}

        <View style={styles.footer}>
          <View style={[styles.pricePill, { backgroundColor: isLive ? Colors.gold : Colors.pink }]}>
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
              {isLive ? 'LIVE' : isTonight ? `${countdown.h}h ${countdown.m}m` : 'Open'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkCard, borderRadius: Radius.md,
    overflow: 'hidden', flex: 1, borderWidth: 1, borderColor: 'transparent',
  },
  wide: { flex: 1 },
  urgentBorder: { borderColor: 'rgba(244,114,182,0.35)' },

  imageBox: { height: 92, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bundleStrip: { flexDirection: 'row', height: 74, position: 'relative', overflow: 'hidden' },
  bundleCell: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  bundleImage: { width: 44, height: 44, borderRadius: 8 },
  bundleItemName: { fontSize: 6, color: Colors.textTertiary, textAlign: 'center', paddingHorizontal: 2 },
  bundleMore: { backgroundColor: 'rgba(15,10,30,0.7)' },
  bundleMoreText: { fontSize: 12, fontWeight: '800', color: Colors.gold },
  bundleMoreSub: { fontSize: 7, color: Colors.textTertiary },
  bundleBadgeAbsolute: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: Colors.gold, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2,
  },
  bundleBadgeText: { fontSize: 6.5, fontWeight: '800', color: Colors.violet },

  itemImage: { width: '100%', height: '100%', position: 'absolute' },
  imagePlaceholder: { width: 60, height: 60, borderRadius: 8, backgroundColor: 'rgba(139,92,246,0.2)' },
  valueBadge: {
    position: 'absolute', top: 5, right: 5,
    backgroundColor: 'rgba(249,200,70,0.9)', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  valueBadgeText: { fontSize: 7, fontWeight: '800', color: Colors.ink },
  conditionBadge: {
    position: 'absolute', top: 5, left: 5,
    borderRadius: 5, borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 4, paddingVertical: 2,
  },
  conditionText: { fontSize: 6.5, fontWeight: '700' },
  viewerBadge: {
    position: 'absolute', bottom: 5, left: 5,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  viewerDot: { width: 4, height: 4, borderRadius: 2 },
  viewerText: { fontSize: 7, color: Colors.white, fontWeight: '600' },

  meta: { padding: Spacing.sm, paddingBottom: 10, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: Colors.white, fontSize: 11, fontWeight: '700', flex: 1, marginRight: 4 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sellerDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.royal, alignItems: 'center', justifyContent: 'center',
  },
  sellerDotText: { fontSize: 6, color: Colors.white, fontWeight: '800' },
  seller: { color: Colors.textSecondary, fontSize: 8, flex: 1 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  urgentPct: { fontSize: 7, color: Colors.pink, fontWeight: '700' },
  scarcity: { fontSize: 7.5, color: Colors.gold, fontWeight: '600', marginTop: 1 },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 },
  pricePill: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  priceText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  timingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  timingDot: { width: 4, height: 4, borderRadius: 2 },
  timing: { fontSize: 8, color: Colors.textSecondary, fontWeight: '600' },
  timingTonight: { color: Colors.pink },
  timingLive: { color: Colors.gold },
});
