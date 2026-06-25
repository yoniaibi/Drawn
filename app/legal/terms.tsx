import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';

export default function TermsScreen() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Player Terms & Conditions</Text>
        <Text style={styles.updated}>Last updated: 25 June 2026 · drawn.app/terms</Text>

        <View style={styles.solicitorNote}>
          <Text style={styles.solicitorNoteText}>⚖️ This document is a near-complete draft. Items requiring solicitor review before publication: (1) confirm ADR provider details in Section 9, (2) confirm the free entry structure complies with Section 339 Gambling Act, (3) review wallet terms against FCA e-money regulations, (4) confirm DCMS Code references are current.</Text>
        </View>

        <Text style={styles.sectionHead}>1. Who can use DRAWN</Text>
        <Text style={styles.body}>Must be 18+. We may verify age and suspend accounts if we believe a user is under 18.</Text>
        <Text style={styles.body}>Must be UK resident. DRAWN is not available to residents of other countries.</Text>
        <Text style={styles.body}>Must provide accurate information including real name and valid email. False information may result in suspension and forfeiture of winnings.</Text>
        <Text style={styles.body}>DRAWN employees, contractors, officers, directors and their immediate family may not enter draws.</Text>
        <Text style={styles.body}>You may hold only one DRAWN account. Multiple accounts breach these terms.</Text>

        <Text style={styles.sectionHead}>2. Your account</Text>
        <Text style={styles.body}>You are responsible for maintaining the confidentiality of your password and all activity under your account.</Text>
        <Text style={styles.body}>Notify us immediately at support@drawn.app if you suspect unauthorised access.</Text>
        <Text style={styles.body}>You can close your account at any time by contacting support@drawn.app. Any wallet balance will be refunded within 5 working days. Entries in pending draws are forfeited on account closure.</Text>
        <Text style={styles.body}>We may suspend or close your account if you breach these terms, if we suspect fraud, or if required by law.</Text>

        <Text style={styles.sectionHead}>3. Entering a draw</Text>
        <Text style={styles.body}>3.1 Paid entry: Purchase tickets using your DRAWN wallet balance. One ticket equals one entry. You may purchase multiple tickets subject to any per-draw maximum.</Text>
        <Text style={styles.body}>3.2 Free entry — no purchase necessary: You can enter any draw for free by post with identical odds to paid entry.</Text>
        <Text style={styles.bullet}>• Write your full name, email address, and draw ID on a piece of paper.</Text>
        <Text style={styles.bullet}>• Post it to: [Postal Address — update on PO Box setup]</Text>
        <Text style={styles.bullet}>• One free postal entry per person per draw. Multiple postal entries from the same person for the same draw are treated as one entry.</Text>
        <Text style={styles.bullet}>• Entry must arrive before the draw closes. Allow at least 3 working days. Royal Mail Tracked recommended.</Text>
        <Text style={styles.bullet}>• Free postal entries have identical odds to paid entries. One postal entry = one paid ticket entry.</Text>
        <Text style={styles.bullet}>• No purchase is necessary to enter or to win.</Text>

        <Text style={styles.sectionHead}>4. Draw mechanics</Text>
        <Text style={styles.body}>Every draw closes at 9pm UK time, set by the seller. No draw may close fewer than 7 calendar days after listing.</Text>
        <Text style={styles.body}>A draw resolves only if it has met its minimum ticket threshold. If not met, the draw rolls over to the following night at 9pm. Your entries remain valid.</Text>
        <Text style={styles.body}>Winners are selected by RANDOM.ORG, an independent certified randomness service, which generates a random integer within the range of valid entries. The entry in that position in the draw entry log is the winner.</Text>
        <Text style={styles.body}>The entry log is ordered by: paid tickets in purchase time order, then postal entries in receipt time order.</Text>
        <Text style={styles.body}>The RANDOM.ORG request parameters and returned integer are logged permanently and available on request.</Text>
        <Text style={styles.body}>The draw result is final.</Text>

        <Text style={styles.sectionHead}>5. Prizes</Text>
        <Text style={styles.body}>Prizes are physical items listed by third-party sellers. DRAWN is not responsible for seller descriptions except where we have authenticated an item.</Text>
        <Text style={styles.body}>Items with a retail value above £200 are independently authenticated before dispatch.</Text>
        <Text style={styles.body}>If an item FAILS authentication: you receive a cash payment equal to the total ticket pool minus DRAWN's platform fee, paid to your wallet within 24 hours.</Text>
        <Text style={styles.body}>If an item CANNOT BE VERIFIED: all paid ticket purchases are refunded to your wallet within 24 hours.</Text>
        <Text style={styles.body}>Prizes are dispatched to your registered delivery address. You are responsible for ensuring your address is correct.</Text>
        <Text style={styles.body}>You must confirm receipt within 48 hours of delivery.</Text>
        <Text style={styles.body}>If your prize is lost in transit, contact support@drawn.app within 7 days of the expected delivery date.</Text>
        <Text style={styles.body}>Prizes are non-transferable before confirming receipt.</Text>

        <Text style={styles.sectionHead}>6. The DRAWN wallet</Text>
        <Text style={styles.body}>Wallet funds are held by Stripe on DRAWN's behalf.</Text>
        <Text style={styles.body}>You can deposit by debit card, credit card, or Apple Pay. Credit card deposits are capped at £250 per calendar month per account, in line with the DCMS Voluntary Code of Good Practice for Prize Draw Operators.</Text>
        <Text style={styles.body}>Wallet funds are refundable at any time. Contact support@drawn.app. Withdrawals processed within 5 working days via Stripe.</Text>
        <Text style={styles.body}>Ticket purchases are non-refundable once entered, except where the draw is cancelled by DRAWN.</Text>
        <Text style={styles.body}>Bonus tickets have no cash value and cannot be withdrawn.</Text>
        <Text style={styles.body}>Grand Draw tickets earned through daily login cannot be converted to cash.</Text>

        <Text style={styles.sectionHead}>7. Safer play</Text>
        <Text style={styles.body}>DRAWN is strictly 18+. We operate in line with the DCMS Voluntary Code of Good Practice for Prize Draw Operators (November 2025).</Text>
        <Text style={styles.body}>You can set a monthly spending limit in Account &gt; Safer Play.</Text>
        <Text style={styles.body}>You can suspend your account for a minimum of 6 months in Account &gt; Safer Play.</Text>
        <Text style={styles.body}>You can permanently close your account at any time by contacting support@drawn.app.</Text>
        <Text style={styles.body}>We monitor account activity for patterns that may indicate potential harm.</Text>
        <Text style={styles.body}>If concerned about gambling behaviour, contact GamCare on 0808 8020 133 (free, 24/7) or gamcare.org.uk.</Text>

        <Text style={styles.sectionHead}>8. Prohibited conduct</Text>
        <Text style={styles.bullet}>• Entering draws using false identities or multiple accounts.</Text>
        <Text style={styles.bullet}>• Attempting to manipulate the draw process or RANDOM.ORG's systems.</Text>
        <Text style={styles.bullet}>• Using DRAWN for money laundering or any other unlawful purpose.</Text>
        <Text style={styles.bullet}>• Submitting multiple free postal entries for the same draw under different names.</Text>
        <Text style={styles.bullet}>• Using automated scripts, bots, or other methods to purchase tickets or submit entries.</Text>
        <Text style={styles.bullet}>• Listing, purchasing, or facilitating draws for counterfeit or stolen items.</Text>

        <Text style={styles.sectionHead}>9. Complaints and disputes</Text>
        <Text style={styles.body}>9.1 How to raise a complaint: Contact support@drawn.app. Include your account handle, draw ID, and description. We will acknowledge within 24 hours, aim to resolve within 7 working days, and issue a final response within 28 days.</Text>
        <Text style={styles.body}>9.2 Disputing a draw result: Contact us within 48 hours. We will provide the RANDOM.ORG certificate and the draw entry log (with other users' data anonymised).</Text>
        <Text style={styles.body}>9.3 Alternative dispute resolution: If not resolved within 28 days, you may refer to The Chartered Trading Standards Institute (CTSI) at ctsi.org.uk/adr. Use is free to you. Nothing in these terms affects your statutory rights as a consumer under UK law.</Text>

        <Text style={styles.sectionHead}>10. Our liability</Text>
        <Text style={styles.body}>Our total liability per draw shall not exceed the total amount you paid in tickets for that draw.</Text>
        <Text style={styles.body}>We are not liable for: loss of profit, loss of data, indirect or consequential loss, or events outside our reasonable control.</Text>
        <Text style={styles.body}>Nothing limits our liability for: death or personal injury caused by our negligence, fraud, or liability that cannot be excluded by law.</Text>

        <Text style={styles.sectionHead}>11. General</Text>
        <Text style={styles.body}>Governed by the laws of England and Wales.</Text>
        <Text style={styles.body}>We may update these terms with 14 days' notice by email.</Text>
        <Text style={styles.body}>If any part is found unenforceable, the remainder continues in full force.</Text>
        <Text style={styles.body}>These terms, together with our Privacy Policy and Seller Terms, constitute the entire agreement.</Text>

        <Text style={styles.body}>DRAWN Ltd · Company No. [update on Companies House registration] · support@drawn.app · 25 June 2026</Text>
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
  solicitorNote: { fontSize: FontSizes.xs, backgroundColor: 'rgba(249,200,70,0.08)', borderRadius: Radius.sm, padding: Spacing.sm, marginTop: 8, marginBottom: 8 },
  solicitorNoteText: { fontSize: FontSizes.xs, color: Colors.gold, lineHeight: 18 },
});
