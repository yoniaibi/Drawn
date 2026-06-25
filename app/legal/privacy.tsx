import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../../src/theme';

export default function PrivacyScreen() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: 25 June 2026 · drawn.app/privacy</Text>

        <View style={styles.solicitorNote}>
          <Text style={styles.solicitorNoteText}>⚖️ This document requires solicitor review before publication. Key items: (1) confirm legal bases for each processing activity, (2) confirm ICO registration requirement, (3) confirm analytics provider data processing agreement, (4) confirm international transfer mechanisms.</Text>
        </View>

        <Text style={styles.sectionHead}>1. What data we collect and why</Text>

        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Email address (waitlist sign-up)</Text>
          <Text style={styles.tableCell}>Voluntary. Legal basis: legitimate interest. Used only for DRAWN launch communications. Unsubscribe anytime via email link.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Name, email address, date of birth (account creation)</Text>
          <Text style={styles.tableCell}>Required to create a DRAWN account. Legal basis: contract. Date of birth used solely to verify you are 18+.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Identity documents (seller KYC only)</Text>
          <Text style={styles.tableCell}>Processed exclusively by Stripe Identity — we never see or store your documents. Legal basis: legal obligation (anti-money laundering and fraud prevention).</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Payment information</Text>
          <Text style={styles.tableCell}>Processed exclusively by Stripe Payments. We never store card numbers or CVV codes. Legal basis: contract.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Draw entry records</Text>
          <Text style={styles.tableCell}>Required to operate draws, identify winners, and maintain audit log. Retained 7 years. Legal basis: contract and legitimate interest.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Postal entry letters</Text>
          <Text style={styles.tableCell}>Physical letters logged (name, email, draw ID) then destroyed securely after logging. Legal basis: contract.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Wallet and transaction records</Text>
          <Text style={styles.tableCell}>Retained 7 years as required by HMRC. Legal basis: legal obligation.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>App usage data</Text>
          <Text style={styles.tableCell}>Anonymised, via PostHog. Legal basis: legitimate interest. Opt out in Account Settings &gt; Privacy.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Support communications</Text>
          <Text style={styles.tableCell}>Retained 3 years from last contact. Legal basis: legitimate interest.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Spend and safety data</Text>
          <Text style={styles.tableCell}>Used for safer play tools. Legal basis: legal obligation and legitimate interest.</Text>
        </View>

        <Text style={styles.sectionHead}>2. Who we share your data with</Text>
        <Text style={styles.body}>We do not sell or share your data with advertisers. We share with:</Text>
        <Text style={styles.bullet}>• Stripe Inc (stripe.com): payment processing and seller identity verification. Data processed in US under Standard Contractual Clauses.</Text>
        <Text style={styles.bullet}>• Authentication partners (Legit App / WatchCertify): item details and draw ID only for authentication. No buyer data shared.</Text>
        <Text style={styles.bullet}>• Royal Mail / postal carrier: handles your free postal entries.</Text>
        <Text style={styles.bullet}>• RANDOM.ORG: receives only draw ID and total entry count. No personal data.</Text>
        <Text style={styles.bullet}>• PostHog: anonymised app usage data only. No names, emails, or contact details.</Text>
        <Text style={styles.bullet}>• UK courts and law enforcement: where required by law.</Text>

        <Text style={styles.sectionHead}>3. Your rights under UK GDPR</Text>

        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Right of access</Text>
          <Text style={styles.tableCell}>Request a copy of all personal data we hold (Subject Access Request). Provided within one month.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Right to rectification</Text>
          <Text style={styles.tableCell}>Ask us to correct inaccurate or incomplete data.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Right to erasure</Text>
          <Text style={styles.tableCell}>Ask us to delete your personal data, unless we're required to retain it by law.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Right to restriction</Text>
          <Text style={styles.tableCell}>Ask us to stop processing your data in certain circumstances.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Right to portability</Text>
          <Text style={styles.tableCell}>Request your data in machine-readable format (JSON or CSV).</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Right to object</Text>
          <Text style={styles.tableCell}>Object to processing based on legitimate interest. We'll stop unless we have compelling legitimate grounds.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Right to withdraw consent</Text>
          <Text style={styles.tableCell}>Where processing is based on consent (e.g. marketing), you can withdraw at any time.</Text>
        </View>

        <Text style={styles.body}>Contact: support@drawn.app. We respond within one calendar month. If unsatisfied, complain to the ICO: ico.org.uk or 0303 123 1113.</Text>

        <Text style={styles.sectionHead}>4. Data retention</Text>

        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Account data</Text>
          <Text style={styles.tableCell}>Retained while active and 30 days after closure, then deleted. Exception: ongoing disputes retained until resolution.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Waitlist emails</Text>
          <Text style={styles.tableCell}>Until you unsubscribe or request deletion. Deleted within 7 days of request.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Draw entry records</Text>
          <Text style={styles.tableCell}>7 years from draw date.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Payment and wallet records</Text>
          <Text style={styles.tableCell}>7 years from transaction date (HMRC requirement).</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>KYC data</Text>
          <Text style={styles.tableCell}>Held by Stripe Identity. We hold only a pass/fail confirmation.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Support communications</Text>
          <Text style={styles.tableCell}>3 years from last contact.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>App usage data</Text>
          <Text style={styles.tableCell}>Anonymised after 90 days. Aggregated data retained indefinitely.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableHead}>Postal entry letters</Text>
          <Text style={styles.tableCell}>Physical letters destroyed within 14 days of draw closing. Logged data retained 7 years.</Text>
        </View>

        <Text style={styles.sectionHead}>5. Security</Text>
        <Text style={styles.bullet}>• All data in transit encrypted using TLS 1.2 or higher.</Text>
        <Text style={styles.bullet}>• Payment data handled exclusively by Stripe (PCI DSS Level 1 compliant).</Text>
        <Text style={styles.bullet}>• Identity documents processed by Stripe Identity, not stored by DRAWN.</Text>
        <Text style={styles.bullet}>• Access to personal data restricted to personnel who need it.</Text>
        <Text style={styles.bullet}>• If we become aware of a breach likely to affect your rights, we will notify you and the ICO within 72 hours as required by UK GDPR Article 33.</Text>

        <Text style={styles.sectionHead}>6. Cookies</Text>
        <Text style={styles.body}>The DRAWN mobile app does not use cookies.</Text>
        <Text style={styles.body}>The drawn.app website uses:</Text>
        <Text style={styles.bullet}>• Strictly necessary cookies: required for the site to function. No consent required.</Text>
        <Text style={styles.bullet}>• Analytics cookies: from PostHog to understand how visitors use the site. Consent required via cookie banner.</Text>
        <Text style={styles.body}>We do not use advertising, targeting, or tracking cookies.</Text>

        <Text style={styles.sectionHead}>7. International data transfers</Text>
        <Text style={styles.bullet}>• Stripe Inc (United States): covered by Stripe's Standard Contractual Clauses with the UK ICO. See stripe.com/en-gb/legal/dpa.</Text>
        <Text style={styles.bullet}>• PostHog: data processing agreement applies. See posthog.com/privacy.</Text>

        <Text style={styles.sectionHead}>8. Children</Text>
        <Text style={styles.body}>DRAWN is for users aged 18 or over. We do not knowingly collect data from anyone under 18. If you believe we may have data relating to a minor, contact support@drawn.app.</Text>

        <Text style={styles.sectionHead}>9. Changes to this policy</Text>
        <Text style={styles.body}>We will notify registered users of material changes by email at least 14 days before they take effect.</Text>

        <Text style={styles.sectionHead}>10. Contact us</Text>
        <Text style={styles.body}>Data controller: DRAWN Ltd · support@drawn.app</Text>
        <Text style={styles.body}>Post: [Postal Address — update on PO Box setup]</Text>
        <Text style={styles.body}>For data protection queries: support@drawn.app (subject: "Data Protection")</Text>
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
});
