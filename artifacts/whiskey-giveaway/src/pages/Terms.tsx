import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-mono text-primary uppercase tracking-widest">Legal</p>
            <h1 className="text-4xl font-serif">Terms of Service</h1>
            <p className="text-muted-foreground text-sm font-mono">Last updated: May 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">1. Acceptance of Terms</h2>
              <p>By accessing or using PrizePour ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. PrizePour reserves the right to update these terms at any time; continued use constitutes acceptance of changes.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">2. Eligibility</h2>
              <p>You must be at least 19 years of age (or the legal drinking age in your jurisdiction, whichever is higher) to participate in any draw. Employees and immediate family members of PrizePour and its partners are ineligible. Void where prohibited by law.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">3. No Purchase Necessary</h2>
              <p>No purchase is necessary to enter or win. A skill-testing question must be answered correctly to qualify. To enter without purchase, mail a handwritten request including your name, address, email, and the draw name to: PrizePour, Attn: Free Entry, [Address]. One free entry per person per draw.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">4. Ticket Purchases</h2>
              <p>Purchasing additional tickets increases your probability of winning but does not guarantee a win. All ticket sales are final. Ticket packages are: 1 ticket ($2.99), 4 tickets ($9.99), 10 tickets ($24.99), and 25 tickets ($64.99). Maximum 25 tickets per person per draw.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">5. Draw Process</h2>
              <p>Winners are selected using a verifiable random number generator after a draw closes. The draw is conducted live and recorded. PrizePour's determination of the winner is final and binding. All draws are operated in compliance with applicable promotional contest regulations.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">6. Prize Delivery</h2>
              <p>Prizes are delivered insured and tracked within 14 business days of the winner being verified and confirmed. PrizePour is not responsible for lost or damaged packages once handed to the shipping carrier. Winners are responsible for all applicable taxes and import duties.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">7. Refund Policy</h2>
              <p>All ticket purchases are non-refundable once a draw has commenced. In the event PrizePour cancels a draw, full refunds will be issued to all ticket holders within 10 business days. PrizePour reserves the right to cancel any draw at its sole discretion.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">8. Limitation of Liability</h2>
              <p>PrizePour shall not be liable for any indirect, incidental, or consequential damages arising from use of the Platform. Our aggregate liability for any claim shall not exceed the amount paid by you in ticket purchases in the three months preceding the claim.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">9. Governing Law</h2>
              <p>These terms are governed by the laws of the jurisdiction in which PrizePour is registered. Any disputes shall be resolved by binding arbitration in that jurisdiction.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">10. Contact</h2>
              <p>For questions regarding these terms, contact us at <a href="mailto:legal@prizepour.com" className="text-primary hover:underline">legal@prizepour.com</a>.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
