import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated as RNAnimated, Modal, Pressable, Share, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, Radius, Shadows } from '../../src/theme';
import { MOCK_DRAWS } from '../../src/mocks';
import type { Draw } from '../../src/mocks';
import ProgressBar from '../../src/components/ProgressBar';
import PrimaryButton from '../../src/components/PrimaryButton';
import { formatTicketPrice } from '../../src/utils/countdown';
import { fetchDrawById, fetchDraws } from '../../src/services/draws';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store';



export default function DrawDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [draw, setDraw] = useState<Draw | null>(MOCK_DRAWS.find(d => d.id === id) ?? null);
  const [similarDraws, setSimilarDraws] = useState<Draw[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchDrawById(id).then(d => { if (d) setDraw(d); });
    fetchDraws().then(all => {
      const others = all.filter(d => d.id !== id && d.status !== 'completed').slice(0, 5);
      setSimilarDraws(others);
    });

    // Real-time ticket count via Supabase Realtime postgres changes
    const channel = supabase
      .channel(`draw-detail-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'draws', filter: `id=eq.${id}` },
        (payload) => {
          if (payload.new && typeof payload.new.tickets_sold === 'number') {
            setDraw(prev => prev ? { ...prev, ticketsSold: payload.new.tickets_sold } : prev);
          }
        },
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [id]);

  if (!draw) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.darkBg, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.textTertiary} />
        <Text style={{ color: Colors.white, fontSize: FontSizes.base, fontWeight: '700' }}>Draw not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.lilac, fontSize: FontSizes.sm }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const progress = draw.ticketsSold / draw.totalTickets;
  const remaining = draw.totalTickets - draw.ticketsSold;
  const isVeryLow = remaining < 200;
  const isLow = remaining < 500;

  const heroBg = draw.isBundle ? '#2D1B00' : '#1A0D42';

  const [trustVisible, setTrustVisible] = useState(false);
  const [postalVisible, setPostalVisible] = useState(false);
  const [watching, setWatching] = useState(false);
  const { user, handle } = useAuthStore();

  // Pulse for scarcity
  const pulseOpacity = useSharedValue(1);
  useEffect(() => {
    if (isLow) {
      pulseOpacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
      );
    }
  }, [isLow]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));


  const viewers = Math.round(draw.ticketsSold * 0.012 + 4);

  const myOdds = draw.myTickets > 0
    ? ((draw.myTickets / draw.totalTickets) * 100).toFixed(2)
    : null;

  async function toggleWatch() {
    if (!user) return;
    const next = !watching;
    setWatching(next);
    if (next) {
      await supabase.from('draw_watches').upsert({ user_id: user.id, draw_id: id }, { onConflict: 'user_id,draw_id' });
    } else {
      await supabase.from('draw_watches').delete().eq('user_id', user.id).eq('draw_id', id);
    }
  }

  return (
    <View style={styles.screen}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: heroBg }]}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>

        {/* Viewer count badge */}
        <View style={styles.viewersBadge}>
          <View style={styles.viewersDot} />
          <Text style={styles.viewersText}>{viewers} viewing</Text>
        </View>

        {draw.image ? (
          <Image source={{ uri: draw.image }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={styles.heroImagePlaceholder} />
        )}

        {/* Value ratio overlay */}
        <View style={styles.heroValueBox}>
          <Text style={styles.heroValueLabel}>{formatTicketPrice(draw.ticketPrice)}</Text>
          <Text style={styles.heroValueArrow}>→</Text>
          <Text style={styles.heroValueAmount}>£{draw.retailValue.toLocaleString()}</Text>
        </View>

        {draw.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.white} />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{draw.title}</Text>
          <TouchableOpacity
            onPress={toggleWatch}
            style={[styles.watchBtn, watching && styles.watchBtnOn]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={watching ? 'notifications' : 'notifications-outline'}
              size={18}
              color={watching ? Colors.gold : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sellerRow} onPress={() => router.push(`/seller/profile/${draw.seller.replace('@', '')}` as any)} activeOpacity={0.7}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerAvatarText}>{draw.sellerAvatar}</Text>
          </View>
          <Text style={styles.sellerHandle}>{draw.seller}</Text>
          {draw.verified && (
            <View style={styles.verifiedChip}>
              <Ionicons name="checkmark-circle" size={10} color={Colors.lilac} />
              <Text style={styles.verifiedChipText}>VERIFIED</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={13} color={Colors.textTertiary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Scarcity warning */}
        {isLow && (
          <Animated.View style={[styles.scarcityCard, pulseStyle, { borderColor: isVeryLow ? Colors.danger : Colors.warning }]}>
            <Ionicons name="warning" size={14} color={isVeryLow ? Colors.danger : Colors.warning} />
            <Text style={[styles.scarcityText, { color: isVeryLow ? Colors.danger : Colors.warning }]}>
              {isVeryLow
                ? `Only ${remaining} tickets left — drawing soon`
                : `${remaining} tickets remaining · filling fast`}
            </Text>
          </Animated.View>
        )}

        {/* Threshold card */}
        <View style={styles.thresholdCard}>
          <View style={styles.thresholdTop}>
            <Text style={styles.thresholdLabel}>Tickets sold</Text>
            <Text style={styles.thresholdCount}>
              {draw.ticketsSold.toLocaleString()} / {draw.totalTickets.toLocaleString()}
            </Text>
          </View>
          <ProgressBar
            progress={progress}
            height={6}
            color={progress > 0.9 ? Colors.danger : progress > 0.7 ? Colors.warning : Colors.lilac}
          />
          <View style={styles.thresholdBottom}>
            <Text style={[styles.thresholdMet, { color: progress >= draw.minThreshold ? Colors.gold : Colors.textSecondary }]}>
              {progress >= draw.minThreshold ? 'Threshold met · draws tonight' : `${Math.round(draw.minThreshold * 100)}% needed to draw`}
            </Text>
            <Text style={styles.pctSold}>{Math.round(progress * 100)}% sold</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{formatTicketPrice(draw.ticketPrice)}</Text>
            <Text style={styles.statLabel}>per ticket</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: Colors.gold }]}>£{draw.retailValue.toLocaleString()}</Text>
            <Text style={styles.statLabel}>prize value</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{draw.condition.replace('_', ' ')}</Text>
            <Text style={styles.statLabel}>condition</Text>
          </View>
        </View>

        {/* My tickets / odds */}
        {draw.myTickets > 0 && (
          <View style={styles.myTicketsCard}>
            <Ionicons name="ticket" size={16} color={Colors.lilac} />
            <View style={{ flex: 1 }}>
              <Text style={styles.myTicketsText}>
                You hold {draw.myTickets} ticket{draw.myTickets > 1 ? 's' : ''}
              </Text>
              {myOdds && (
                <Text style={styles.myOddsText}>Your odds: {myOdds}% · add more to improve</Text>
              )}
            </View>
          </View>
        )}

        {/* Trust signal */}
        <TouchableOpacity style={styles.trustRow} onPress={() => setTrustVisible(true)} activeOpacity={0.8}>
          <Ionicons name="shield-checkmark-outline" size={14} color={Colors.lilac} />
          <Text style={styles.trustText}>How we verify authenticity</Text>
          <Ionicons name="chevron-forward" size={12} color={Colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.qaBtn} onPress={() => router.push(`/draw/qa/${id}` as any)}>
          <Ionicons name="chatbubble-outline" size={15} color={Colors.lilac} />
          <Text style={styles.qaBtnText}>Ask the seller a question</Text>
          <Ionicons name="chevron-forward" size={13} color={Colors.textTertiary} />
        </TouchableOpacity>

        <Text style={styles.desc}>{draw.description}</Text>

        {/* Bundle items */}
        {draw.isBundle && draw.bundleItems && (
          <View style={styles.bundleCard}>
            <Text style={styles.bundleTitle}>What's included ({draw.bundleItems.length} items)</Text>
            {draw.bundleItems.map((item, i) => (
              <View key={i} style={styles.bundleRow}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.bundleItemImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.bundleItemImage, { backgroundColor: 'rgba(139,92,246,0.2)' }]} />
                )}
                <Text style={styles.bundleName}>{item.name}</Text>
                <Text style={styles.bundleVal}>£{item.retailValue.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Similar draws */}
        {similarDraws.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={styles.similarTitle}>More draws you might like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarRow}>
              {similarDraws.map(d => (
                <TouchableOpacity key={d.id} style={styles.similarCard} onPress={() => router.push(`/draw/${d.id}` as any)}>
                  {d.image ? (
                    <Image source={{ uri: d.image }} style={styles.similarImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.similarImage, { backgroundColor: 'rgba(139,92,246,0.2)' }]} />
                  )}
                  <Text style={styles.similarName} numberOfLines={2}>{d.title}</Text>
                  <Text style={styles.similarPrice}>{d.ticketPrice}p → £{d.retailValue.toLocaleString()}</Text>
                  <View style={[styles.similarStatusDot, { backgroundColor: d.status === 'closing_tonight' ? Colors.pink : Colors.lilac }]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Trust modal */}
      <Modal visible={trustVisible} transparent animationType="slide" onRequestClose={() => setTrustVisible(false)}>
        <Pressable style={styles.trustOverlay} onPress={() => setTrustVisible(false)}>
          <Pressable style={styles.trustSheet} onPress={() => {}}>
            <View style={styles.trustHandle} />
            <Text style={styles.trustTitle}>How we verify</Text>
            {[
              { icon: 'cube-outline' as const, step: 'Seller ships to us', desc: 'Every item is sent to our London warehouse before going live.' },
              { icon: 'search-outline' as const, step: 'Authenticity check', desc: "Our team inspects condition, brand, and authenticates within 24 hours of receipt." },
              { icon: 'lock-closed-outline' as const, step: 'Secure storage', desc: 'The item is held in our secure facility until the draw completes.' },
              { icon: 'car-outline' as const, step: 'Direct to winner', desc: 'We ship straight to the winner — tracked, insured, next-day delivery.' },
            ].map(s => (
              <View key={s.step} style={styles.trustStep}>
                <View style={styles.trustStepIconBox}>
                  <Ionicons name={s.icon} size={20} color={Colors.lilac} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trustStepTitle}>{s.step}</Text>
                  <Text style={styles.trustStepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
            <View style={styles.trustFooter}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.lilac} />
              <Text style={styles.trustFooterText}>All draws are independently verified by DRAWN</Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* CTA */}
      <View style={styles.cta}>
        {isLow && (
          <Text style={styles.ctaScarcity}>
            {isVeryLow ? `Only ${remaining} tickets left` : `${remaining} remaining`}
          </Text>
        )}
        <PrimaryButton
          label={`Enter from ${formatTicketPrice(draw.ticketPrice)}`}
          onPress={() => router.push(`/purchase/${draw.id}`)}
        />
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => Share.share({
            message: `I'm entering to win ${draw.title} on DRAWN for just ${draw.ticketPrice}p a ticket. Use my link to get a free entry: https://drawn.app/draw/${draw.id}?ref=${handle}`,
          })}
          activeOpacity={0.8}
        >
          <Text style={styles.shareBtnText}>Share & get a free ticket</Text>
        </TouchableOpacity>
        <View style={styles.shareCallout}>
          <Text style={styles.shareCalloutText}>Share this draw with a friend — when they sign up, you both get 1 free ticket</Text>
        </View>
        <TouchableOpacity onPress={() => setPostalVisible(true)} activeOpacity={0.7}>
          <Text style={styles.ctaSub}>Enter for free by post — tap for instructions</Text>
        </TouchableOpacity>
      </View>

      {/* Postal entry modal */}
      <Modal visible={postalVisible} transparent animationType="slide" onRequestClose={() => setPostalVisible(false)}>
        <Pressable style={styles.trustOverlay} onPress={() => setPostalVisible(false)}>
          <Pressable style={styles.trustSheet} onPress={() => {}}>
            <View style={styles.trustHandle} />
            <Text style={styles.trustTitle}>Free Postal Entry</Text>
            <Text style={styles.postalIntro}>
              No purchase needed. Every draw has a free entry route — here's how to use it.
            </Text>

            {[
              {
                num: '1',
                title: 'Write a postcard',
                desc: `Include your full name, email address, the draw name ("${draw.title}"), and the draw date.`,
              },
              {
                num: '2',
                title: 'Post it to us',
                desc: 'DRAWN, PO Box 1000, London, EC1A 1BB\n\nA standard UK stamp is all you need.',
              },
              {
                num: '3',
                title: 'Must arrive by 5pm on draw day',
                desc: "We register your entry manually before the draw closes. Late arrivals can't be included.",
              },
              {
                num: '4',
                title: 'Same odds as paid entries',
                desc: 'One postcard = one entry. Your name goes into the same draw pool as ticket buyers.',
              },
            ].map(s => (
              <View key={s.num} style={styles.postalStep}>
                <View style={styles.postalNum}>
                  <Text style={styles.postalNumText}>{s.num}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trustStepTitle}>{s.title}</Text>
                  <Text style={styles.trustStepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}

            <View style={styles.postalLegal}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.postalLegalText}>
                Free entry is available on every DRAWN draw. This is what makes DRAWN a legal prize promotion under UK law, not a lottery.
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg },
  hero: {
    height: 260,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  back: { position: 'absolute', top: 52, left: 16, zIndex: 10, padding: 6, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  viewersBadge: {
    position: 'absolute', top: 52, right: 16, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  viewersDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.pink },
  viewersText: { fontSize: 9, color: Colors.white, fontWeight: '600' },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroImagePlaceholder: { width: '100%', height: '100%', backgroundColor: 'rgba(139,92,246,0.15)' },
  heroValueBox: {
    position: 'absolute', bottom: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  heroValueLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600' },
  heroValueArrow: { fontSize: FontSizes.xs, color: Colors.textTertiary },
  heroValueAmount: { fontSize: FontSizes.sm, color: Colors.gold, fontWeight: '800' },
  verifiedBadge: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: Colors.lilac, borderRadius: Radius.pill,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  verifiedText: { fontSize: 8, fontWeight: '700', color: Colors.white },

  qaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.darkCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.darkBorder,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  qaBtnText: { flex: 1, fontSize: FontSizes.sm, color: Colors.lilac, fontWeight: '600' },
  trustRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
    padding: Spacing.sm, marginBottom: Spacing.sm,
  },
  trustText: { flex: 1, fontSize: FontSizes.xs, color: Colors.lilac, fontWeight: '600' },
  trustOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  trustSheet: {
    backgroundColor: Colors.darkCard, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.xl, paddingBottom: 48,
  },
  trustHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.darkBorder, alignSelf: 'center', marginBottom: Spacing.lg },
  trustTitle: { fontFamily: Fonts.serif, fontSize: FontSizes.lg, color: Colors.white, marginBottom: Spacing.lg, textAlign: 'center' },
  trustStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: Spacing.md },
  trustStepIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(139,92,246,0.12)', alignItems: 'center', justifyContent: 'center' },
  trustStepTitle: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700', marginBottom: 3 },
  trustStepDesc: { fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 17 },
  trustFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.md,
    paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.darkBorder,
  },
  trustFooterText: { fontSize: FontSizes.xs, color: Colors.textTertiary, flex: 1 },

  body: { flex: 1 },
  bodyContent: { padding: Spacing.lg, paddingBottom: 120, gap: 14 },


  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, flex: 1, lineHeight: 30 },
  watchBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.darkCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.darkBorder, marginTop: 2,
  },
  watchBtnOn: { borderColor: 'rgba(249,200,70,0.4)', backgroundColor: 'rgba(249,200,70,0.1)' },

  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sellerAvatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.royal, alignItems: 'center', justifyContent: 'center' },
  sellerAvatarText: { fontSize: 9, color: Colors.white, fontWeight: '700' },
  sellerHandle: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(139,92,246,0.12)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedChipText: { fontSize: 7, color: Colors.lilac, fontWeight: '700' },

  scarcityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: Radius.md, padding: Spacing.sm,
    backgroundColor: 'rgba(226,75,74,0.08)', borderWidth: 1,
  },
  scarcityText: { fontSize: FontSizes.xs, fontWeight: '700', flex: 1 },

  thresholdCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md, gap: 8 },
  thresholdTop: { flexDirection: 'row', justifyContent: 'space-between' },
  thresholdLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  thresholdCount: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '700' },
  thresholdBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  thresholdMet: { fontSize: FontSizes.xs, fontWeight: '600' },
  pctSold: { fontSize: FontSizes.xs, color: Colors.pink, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: Colors.darkCard, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' },
  statVal: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '700' },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  myTicketsCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(139,92,246,0.12)', borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)',
  },
  myTicketsText: { fontSize: FontSizes.base, color: Colors.lilac, fontWeight: '600' },
  myOddsText: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },

  desc: { fontSize: FontSizes.base, color: Colors.textSecondary, lineHeight: 22 },

  bundleCard: { backgroundColor: Colors.darkCard, borderRadius: Radius.md, padding: Spacing.md },
  bundleTitle: { fontSize: FontSizes.sm, color: Colors.white, fontWeight: '700', marginBottom: 10 },
  bundleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: Colors.darkBorder },
  bundleItemImage: { width: 32, height: 32, borderRadius: 6 },
  bundleName: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary },
  bundleVal: { fontSize: FontSizes.xs, color: Colors.gold, fontWeight: '700' },

  similarSection: { marginTop: 4 },
  similarTitle: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
  similarRow: { gap: 10, paddingBottom: 4 },
  similarCard: {
    width: 130, backgroundColor: Colors.darkCard, borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: Colors.darkBorder, position: 'relative',
  },
  similarImage: { width: '100%', height: 70, borderRadius: 8, marginBottom: 6 },
  similarName: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '600', lineHeight: 15, marginBottom: 4 },
  similarPrice: { fontSize: 9, color: Colors.gold, fontWeight: '600' },
  similarStatusDot: { position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 3 },

  cta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.lg, backgroundColor: Colors.darkBg,
    borderTopWidth: 1, borderTopColor: Colors.darkBorder,
    gap: 6,
    ...Shadows.card,
  },
  ctaScarcity: { textAlign: 'center', fontSize: FontSizes.xs, color: Colors.danger, fontWeight: '700' },
  ctaSub: { textAlign: 'center', fontSize: 9, color: Colors.textTertiary },
  shareBtn: {
    backgroundColor: 'rgba(139,92,246,0.15)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.35)',
    paddingVertical: 11, alignItems: 'center',
  },
  shareBtnText: { fontSize: FontSizes.sm, color: Colors.lilac, fontWeight: '700' },
  shareCallout: {
    backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: Radius.sm,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
    padding: Spacing.sm,
  },
  shareCalloutText: { fontSize: FontSizes.xs, color: Colors.lilac, textAlign: 'center', lineHeight: 17 },

  postalIntro: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.lg, textAlign: 'center' },
  postalStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: Spacing.md },
  postalNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.royal, alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  postalNumText: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '800' },
  postalLegal: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: Spacing.md,
    paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.darkBorder,
  },
  postalLegalText: { fontSize: 10, color: Colors.textTertiary, flex: 1, lineHeight: 15 },
});
