import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-mono text-primary uppercase tracking-widest">Legal</p>
            <h1 className="text-4xl font-serif">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm font-mono">Last updated: May 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">1. Information We Collect</h2>
              <p>When you use PrizePour, we collect: (a) <strong className="text-foreground">Account data</strong> — name, email address, and age verification; (b) <strong className="text-foreground">Transaction data</strong> — ticket purchase records, ticket numbers, and payment information (processed and stored securely by Stripe — we never store raw card data); (c) <strong className="text-foreground">Usage data</strong> — IP address, browser type, pages visited, and referral source.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">2. How We Use Your Information</h2>
              <p>We use your information to: process ticket purchases and entries; communicate draw results and winner announcements; send transactional emails (purchase receipts, winner notifications); improve the Platform and detect fraud; comply with legal obligations; and send optional marketing communications (you may unsubscribe at any time).</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">3. Sharing of Information</h2>
              <p>We do not sell your personal data. We share data only with: (a) <strong className="text-foreground">Payment processors</strong> (Stripe) for secure payment handling; (b) <strong className="text-foreground">Shipping carriers</strong> for prize delivery (winner's name and address only); (c) <strong className="text-foreground">Service providers</strong> who operate the Platform under confidentiality agreements; (d) <strong className="text-foreground">Legal authorities</strong> when required by law.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">4. Winner Publicity</h2>
              <p>By participating, winners agree that PrizePour may use their first name and location (city, country) for publicity purposes, including announcement posts on social media and the Platform. Full name and contact details are never published without explicit written consent.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">5. Data Retention</h2>
              <p>We retain your personal data for as long as necessary to fulfil the purposes described in this policy, or as required by law. Transaction records are kept for a minimum of 7 years for tax and legal compliance. You may request deletion of non-essential data at any time.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">6. Cookies</h2>
              <p>We use essential cookies to maintain session state and security. We may use analytics cookies (with your consent) to understand how visitors use the Platform. You can disable cookies in your browser settings, though some functionality may be affected.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">7. Your Rights</h2>
              <p>You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your data (subject to legal retention requirements); withdraw consent for marketing communications; and lodge a complaint with your local data protection authority.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">8. Security</h2>
              <p>We implement industry-standard security measures including TLS encryption, secure data storage, and access controls. However, no internet transmission is 100% secure. We encourage you to use a strong, unique password and to report any suspected security issues immediately.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">9. Contact</h2>
              <p>For privacy-related inquiries, email <a href="mailto:privacy@prizepour.com" className="text-primary hover:underline">privacy@prizepour.com</a>. We aim to respond within 5 business days.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
