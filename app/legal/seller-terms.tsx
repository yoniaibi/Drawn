import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';

export default function SellerTermsScreen() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Seller Terms & Conditions</Text>
        <Text style={styles.updated}>Last updated: 25 June 2026 · drawn.app/seller-terms</Text>

        <View style={styles.solicitorNote}>
          <Text style={styles.solicitorNoteText}>⚖️ CRITICAL: This document requires solicitor review before use. Key items: (1) Section 7 liquidated damages clause must be confirmed as proportionate and separately accepted at listing time via dedicated checkbox, (2) confirm platform fee arrangement requires no FCA/HMRC registration, (3) confirm escrow via Stripe does not require FCA authorisation, (4) review Section 9 for Consumer Rights Act 2015 compliance.</Text>
        </View>

        <Text style={styles.body}>These Seller Terms form a binding contract between you ('the seller') and DRAWN Ltd. They apply in addition to the DRAWN Player Terms and Conditions. By submitting a listing you confirm that you have read, understood, and agree to these terms in their entirety, including the liquidated damages clause in Section 7.</Text>

        <Text style={styles.sectionHead}>1. Eligibility to sell</Text>
        <Text style={styles.bullet}>• Must be 18 or over.</Text>
        <Text style={styles.bullet}>• Must be a UK resident.</Text>
        <Text style={styles.bullet}>• Must complete Stripe Identity KYC verification before listing.</Text>
        <Text style={styles.bullet}>• Must hold sole legal title to the item being listed.</Text>
        <Text style={styles.bullet}>• DRAWN employees, contractors, officers, and directors may not list items.</Text>

        <Text style={styles.sectionHead}>2. Your listing</Text>
        <Text style={styles.bullet}>• You warrant that all item descriptions, photographs, and provenance claims are accurate and not misleading.</Text>
        <Text style={styles.bullet}>• DRAWN reserves the right to edit, remove, or decline any listing that does not meet our standards or policies.</Text>
        <Text style={styles.bullet}>• Draw duration is between 7 and 60 calendar days.</Text>
        <Text style={styles.bullet}>• Once any tickets have been sold, you may not withdraw your listing.</Text>

        <Text style={styles.sectionHead}>3. Authentication deposit</Text>
        <Text style={styles.bullet}>• Required for all items with a retail value above £200.</Text>
        <Text style={styles.bullet}>• The deposit is non-refundable except on a PASS result.</Text>
        <Text style={styles.bullet}>• The deposit is credited back to your payout after the winner confirms delivery.</Text>

        <Text style={styles.sectionHead}>4. Ticket threshold and draw resolution</Text>
        <Text style={styles.bullet}>• A draw resolves only if it reaches a minimum of 60% of available tickets sold.</Text>
        <Text style={styles.bullet}>• If the threshold is not met, the draw rolls over to the following night at 9pm.</Text>
        <Text style={styles.bullet}>• If the threshold is not met after 60 days, the draw is cancelled, all buyers are refunded, and your authentication deposit is forfeited.</Text>

        <Text style={styles.sectionHead}>5. Shipping</Text>
        <Text style={styles.bullet}>• You must ship the item to DRAWN's authentication partner within 48 hours of draw resolution.</Text>
        <Text style={styles.bullet}>• A prepaid shipping label will be sent to you within 30 minutes of resolution.</Text>
        <Text style={styles.bullet}>• You must package the item securely and provide tracking information.</Text>

        <Text style={styles.sectionHead}>6. Seller no-ship consequences</Text>
        <Text style={styles.bullet}>• We will contact you for 48 hours to resolve non-shipment.</Text>
        <Text style={styles.bullet}>• If the item is not shipped, the draw is cancelled at T+96 hours.</Text>
        <Text style={styles.bullet}>• Your authentication deposit is forfeited.</Text>
        <Text style={styles.bullet}>• Your account is suspended.</Text>
        <Text style={styles.bullet}>• DRAWN may pursue recovery of costs and compensation paid to buyers.</Text>

        <Text style={styles.sectionHead}>7. Authentication and liquidated damages</Text>

        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Result</Text>
          <Text style={styles.tableCell}>Outcome</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>PASS</Text>
          <Text style={styles.tableCell}>Item ships to winner, escrow released to seller.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>FAIL</Text>
          <Text style={styles.tableCell}>See Section 7.2 — Liquidated Damages.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>UNABLE TO VERIFY</Text>
          <Text style={styles.tableCell}>See Section 7.3.</Text>
        </View>

        <View style={styles.damagesBox}>
          <Text style={styles.damagesHead}>7.2 LIQUIDATED DAMAGES — AUTHENTICATION FAILURE</Text>
          <Text style={styles.damagesBody}>Where an item submitted for a DRAWN draw fails independent authentication, the following consequences apply automatically and without further notice:</Text>
          <Text style={styles.damagesBody}>{'\n'}• You will receive no payout from the draw.</Text>
          <Text style={styles.damagesBody}>• The winner will receive a cash payment equal to the total ticket pool minus DRAWN's platform fee, paid from escrow within 24 hours.</Text>
          <Text style={styles.damagesBody}>• Any remaining escrow balance after buyer compensation is retained by DRAWN Ltd as liquidated damages, reflecting DRAWN's costs including authentication, platform operation, reputational harm, and buyer compensation.</Text>
          <Text style={styles.damagesBody}>• Your authentication deposit is forfeited in full.</Text>
          <Text style={styles.damagesBody}>• Your DRAWN seller account is permanently suspended.</Text>
          <Text style={styles.damagesBody}>• DRAWN may report the matter to Trading Standards, the Police, or other relevant authorities.</Text>
          <Text style={styles.damagesBody}>• DRAWN reserves the right to pursue further recovery via civil proceedings.</Text>
          <Text style={styles.damagesBody}>{'\n'}By submitting a listing, you acknowledge: (a) you have read and understood this clause; (b) you have separately confirmed acceptance via the liquidated damages checkbox at listing time; (c) you believe the liquidated damages amount to be a genuine pre-estimate of DRAWN's loss; and (d) you confirm this item is genuine and accurately described to the best of your knowledge.</Text>
        </View>

        <Text style={styles.body}>7.3 Unable to verify: The draw is cancelled, all buyers are refunded in full, your authentication deposit is forfeited. You may relist the item with alternative or additional supporting documentation.</Text>

        <Text style={styles.sectionHead}>8. Payout</Text>
        <Text style={styles.bullet}>• Payouts are made via Stripe Connect to your verified bank account.</Text>
        <Text style={styles.bullet}>• DRAWN charges a 12% platform fee on the total ticket pool.</Text>
        <Text style={styles.bullet}>• Approximately £17–20 in processing and shipping costs are also deducted.</Text>
        <Text style={styles.bullet}>• Payout is initiated within 24 hours of the winner confirming delivery.</Text>
        <Text style={styles.bullet}>• Funds typically arrive in your bank account within 2–5 working days.</Text>
        <Text style={styles.bullet}>• You are solely responsible for reporting income to HMRC and paying any applicable tax.</Text>

        <Text style={styles.sectionHead}>9. Warranties</Text>
        <Text style={styles.body}>By listing an item, you make the following ongoing warranties:</Text>
        <Text style={styles.bullet}>• All item descriptions, photographs, and provenance claims are accurate and not misleading.</Text>
        <Text style={styles.bullet}>• You hold sole legal title to the item. It is free from encumbrances, liens, or third-party claims.</Text>
        <Text style={styles.bullet}>• The item is not subject to any manufacturer warranty claim, product recall, or safety notice that has not been disclosed.</Text>
        <Text style={styles.bullet}>• Listing and selling the item complies with all applicable UK laws and regulations.</Text>
        <Text style={styles.bullet}>• You have not engaged in any misleading conduct in connection with the item or its listing.</Text>

        <Text style={styles.sectionHead}>10. General</Text>
        <Text style={styles.bullet}>• Governed by the laws of England and Wales.</Text>
        <Text style={styles.bullet}>• We may update these terms with 14 days' notice by email.</Text>
        <Text style={styles.bullet}>• Force majeure: neither party is liable for delays or failures caused by events outside their reasonable control.</Text>

        <Text style={styles.body}>DRAWN Ltd · drawn.app/seller-terms · 25 June 2026</Text>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>I've read this</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.darkBg, paddingTop: 56 },
  back: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, marginBottom: 8 },
  backText: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginLeft: 4 },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 24 },
  footer: { padding: Spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  doneBtn: { backgroundColor: Colors.lilac, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  doneBtnText: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700' },
  title: { fontFamily: Fonts.serif, fontSize: FontSizes.xl, color: Colors.white, marginBottom: 4 },
  updated: { fontSize: FontSizes.xs, color: Colors.textTertiary, marginBottom: Spacing.xl },
  sectionHead: { fontSize: FontSizes.base, color: Colors.white, fontWeight: '700', marginTop: Spacing.lg, marginBottom: 6 },
  body: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 22, marginBottom: 8 },
  bullet: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 22, marginBottom: 4, paddingLeft: 12 },
  solicitorNote: { backgroundColor: 'rgba(249,200,70,0.08)', borderRadius: Radius.sm, padding: Spacing.sm, marginTop: 8, marginBottom: 8 },
  solicitorNoteText: { fontSize: FontSizes.xs, color: Colors.gold, lineHeight: 18 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', paddingVertical: 8 },
  tableHead: { fontSize: FontSizes.xs, color: Colors.white, fontWeight: '700', flex: 1 },
  tableCell: { fontSize: FontSizes.xs, color: Colors.textSecondary, flex: 2, lineHeight: 18 },
  damagesBox: { backgroundColor: 'rgba(226,75,74,0.1)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(226,75,74,0.3)', padding: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.md },
  damagesHead: { fontSize: FontSizes.sm, color: '#E24B4A', fontWeight: '700', marginBottom: 6 },
  damagesBody: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
});
