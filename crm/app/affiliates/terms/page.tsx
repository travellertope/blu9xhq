import Link from "next/link";

const LOGO =
  "https://mlgepubil2mw.i.optimole.com/w:742/h:157/q:mauto/g:sm/f:best/https://bluuhq.com/wp-content/uploads/2026/05/cropped-bluuhq.png";

export const metadata = {
  title: "Affiliate Terms — BluuHQ",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function AffiliateTermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/affiliate-register">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="BluuHQ" className="h-8" />
        </Link>
        <Link href="/affiliate-register" className="text-sm font-medium text-[#1875F2] hover:underline">
          Back to sign up
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bluu Affiliate Program — Terms</h1>
          <p className="text-sm text-slate-400 mt-1">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <Section title="1. Eligibility">
          Anyone may join the Bluu affiliate program free of charge. No approval process is required to
          receive a referral link, though Bluu reserves the right to suspend or reject an account for
          fraudulent activity, spam, or violation of these terms.
        </Section>

        <Section title="2. Commission structure">
          <p>Commissions are earned as a percentage of the gross amount paid by a referred customer, per the rates published on the affiliate program page:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>BluuAudit, Client Portal, Hosting &amp; Management — 30% recurring, for the life of the subscription</li>
            <li>Content Operations — 15% recurring, for the life of the retainer</li>
            <li>Web / Mobile Development, AI Systems Integration — 10% of contract value, plus a $75 bonus per completed discovery call</li>
          </ul>
          <p>Commission rates may change for future referrals with 30 days&apos; notice. Rates already locked in for existing active referrals will not be reduced retroactively.</p>
        </Section>

        <Section title="3. Attribution">
          Referrals are tracked via a cookie set when someone visits a Bluu domain through your referral
          link, valid for 60 days. Attribution is first-touch — if a visitor already has an active referral
          cookie from another affiliate, your link will not overwrite it.
        </Section>

        <Section title="4. Payouts">
          <p>Commissions are paid out monthly, provided your approved balance is at least $50. Commissions are subject to a 30-day cooling period after the underlying payment to account for refunds or chargebacks before becoming eligible for payout.</p>
          <p>Payouts are made via Stripe, PayPal, or bank transfer, according to the payout method you configure in your affiliate dashboard.</p>
        </Section>

        <Section title="5. Restrictions">
          <ul className="list-disc pl-5 space-y-1">
            <li>You may not use your own referral link to purchase Bluu products or services for yourself.</li>
            <li>You may not earn a commission on clients you are already personally managing through Bluu at the time of referral.</li>
            <li>You may not engage in spam, misleading advertising, trademark bidding, or any activity that could damage Bluu&apos;s reputation.</li>
            <li>You may not misrepresent your relationship with Bluu (e.g. claiming to be an employee or official representative unless true).</li>
          </ul>
        </Section>

        <Section title="6. Term and termination">
          Either party may terminate participation in the affiliate program at any time. Commissions already
          earned and approved prior to termination remain payable per the standard payout schedule.
          Bluu may suspend or terminate an affiliate account immediately for violation of these terms.
        </Section>

        <Section title="7. Changes to these terms">
          Bluu may update these terms from time to time. Continued participation in the affiliate program
          after changes are posted constitutes acceptance of the revised terms.
        </Section>

        <Section title="8. Contact">
          Questions about the affiliate program or these terms can be sent to{" "}
          <a href="mailto:hello@bluuhq.com" className="text-[#1875F2] hover:underline">hello@bluuhq.com</a>.
        </Section>
      </main>
    </div>
  );
}
