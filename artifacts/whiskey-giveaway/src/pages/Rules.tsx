import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function Rules() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-serif text-primary uppercase tracking-widest">Legal</p>
            <h1 className="text-3xl sm:text-4xl font-serif">Official Contest Rules</h1>
            <p className="text-muted-foreground text-sm font-serif">Effective May 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">1. Sponsor</h2>
              <p>PrizePour ("Sponsor") operates skill-based prize competitions on the PrizePour platform. Each draw is a separate promotional contest governed by these Official Rules.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">2. Eligibility</h2>
              <p>Open to legal residents of eligible jurisdictions who are at least 18 years of age (or the legal drinking age in their jurisdiction, whichever is higher) at time of entry. Employees, officers, directors, agents, and representatives of PrizePour, and their immediate family members, are not eligible. Void in jurisdictions where such promotions are prohibited.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">3. Entry Period</h2>
              <p>Each draw has a published entry period displayed on the draw's page. Entries submitted after the draw closes will not be accepted. PrizePour reserves the right to extend any draw period at its sole discretion.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">4. How to Enter</h2>
              <p><strong className="text-foreground">Method A — Online (Free):</strong> Visit prizepour.com, select a draw, choose a ticket quantity, complete the entry form with your details, and answer the skill-testing question correctly. Entry is free of charge. Each submission earns one entry per ticket selected.</p>
              <p><strong className="text-foreground">Method B — Email (No Internet Required):</strong> Send an email to <a href="mailto:competitions@prizepour.com" className="text-primary hover:underline">competitions@prizepour.com</a> with the subject line "Free Entry — [Draw Name]". Include your full name, date of birth, email address, the draw name, and your correct answer to the skill-testing question (available on the draw page). Limit one (1) free email entry per person per draw. Email entries must be received before the draw close date.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">5. Skill-Testing Question</h2>
              <p>To qualify for entry, all entrants must correctly answer a mathematical or general-knowledge skill-testing question. The question is presented during the entry process. An incorrect answer disqualifies the entry for that attempt; entrants may try again.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">6. Maximum Entries</h2>
              <p>Each draw has a maximum ticket capacity, displayed on the draw page. Once the maximum is reached, entries cease. The draw proceeds at the published close date regardless of whether capacity is reached. Maximum entries: 25 tickets per person per draw unless otherwise stated.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">7. Draw and Winner Selection</h2>
              <p>On the draw close date, a winner is selected using a tamper-proof, independently verifiable random number generator (RNG). Each ticket number has an equal probability of selection. The draw is conducted live and the recording is made available publicly. PrizePour's selection is final.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">8. Odds of Winning</h2>
              <p>Odds of winning depend on the total number of eligible entries at draw time. With the maximum ticket capacity, the minimum odds are 1 in the total number of tickets sold. Purchasing more tickets improves your odds proportionally.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">9. Prize Details</h2>
              <p>Each draw's prize is the specific item described on the draw page. All prizes are verified, sealed where applicable, and shipped insured and tracked within 14 business days of winner confirmation. Prize values shown are approximate retail values. No cash equivalent will be offered. Prizes are non-transferable. Winners are responsible for applicable taxes, duties, and import fees.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">10. Winner Notification and Verification</h2>
              <p>Winners will be notified by email within 48 hours of the draw. Winners must respond within 72 hours and provide proof of identity and age verification. Failure to respond or verify within the stated period may result in forfeiture and selection of an alternate winner.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">11. Publicity</h2>
              <p>By accepting a prize, winners grant PrizePour the right to use their first name and general location (city, region) for promotional purposes across all media, without additional compensation.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">12. General Conditions</h2>
              <p>PrizePour reserves the right to cancel, modify, or suspend any draw in the event of fraud, technical failure, or circumstances beyond its control. In the event of cancellation, all ticket holders will receive a full refund. These rules are subject to all applicable federal, provincial, and local laws.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">13. Contact</h2>
              <p>Questions about the rules: <a href="mailto:rules@prizepour.com" className="text-primary hover:underline">rules@prizepour.com</a></p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
