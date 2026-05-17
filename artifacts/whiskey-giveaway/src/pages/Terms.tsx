import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-serif text-primary uppercase tracking-widest">Legal</p>
            <h1 className="text-4xl font-serif">Competition Terms &amp; Conditions</h1>
            <p className="text-muted-foreground text-sm font-serif">Effective Date: 16 May 2026</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              These Terms &amp; Conditions govern participation in competitions operated by Prize Pour ("Prize Pour", "we", "our", "us").
              By entering any competition on Prize Pour, you agree to these Terms &amp; Conditions.
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">1. Eligibility</h2>
              <p>1.1 Entrants must be:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>aged 18 years or over; and</li>
                <li>residents of the United Kingdom unless otherwise stated.</li>
              </ul>
              <p>1.2 Employees, contractors, or immediate family members of Prize Pour may not enter competitions unless explicitly permitted.</p>
              <p>1.3 Proof of identity, age, and address may be required before a prize is awarded.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">2. Competition Format</h2>
              <p>2.1 Prize Pour operates skill-based prize competitions.</p>
              <p>2.2 To enter a competition, participants must:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>complete the entry process; and</li>
                <li>correctly answer the skill-based question presented.</li>
              </ul>
              <p>2.3 Only entries with the correct answer will qualify for inclusion in the draw.</p>
              <p>2.4 Competitions are intended to comply with the requirements of the Gambling Act 2005 relating to skill-based competitions.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">3. Paid Entry</h2>
              <p>3.1 Paid entry fees are displayed clearly on each competition page.</p>
              <p>3.2 Entry fees are non-refundable except:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>where required by law;</li>
                <li>where a competition is cancelled by Prize Pour; or</li>
                <li>where a payment error occurs.</li>
              </ul>
              <p>3.3 Entry does not guarantee winning.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">4. Free Postal Entry Route</h2>
              <p>4.1 Free postal entries are available for all competitions.</p>
              <p>4.2 To enter for free, participants must send:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>full name</li>
                <li>date of birth</li>
                <li>email address</li>
                <li>phone number</li>
                <li>competition name</li>
                <li>correct answer to the skill question</li>
              </ul>
              <p>to the postal address specified on the relevant competition page.</p>
              <p>4.3 Postal entries must:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>be sent individually;</li>
                <li>be legible;</li>
                <li>arrive before the competition closing date.</li>
              </ul>
              <p>4.4 Incomplete, illegible, bulk, automated, or late entries will not be accepted.</p>
              <p>4.5 Postal entrants have equal chance of winning as paid entrants.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">5. Competition Closing</h2>
              <p>5.1 Each competition has a stated closing date and/or maximum number of entries.</p>
              <p>5.2 Prize Pour reserves the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>extend competitions;</li>
                <li>shorten competitions;</li>
                <li>amend draw dates; where reasonably necessary.</li>
              </ul>
              <p>5.3 Any material changes will be communicated through the platform.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">6. Winner Selection</h2>
              <p>6.1 Winners are selected at random from all eligible correct entries after the competition closes.</p>
              <p>6.2 Draws may be conducted electronically using random selection software.</p>
              <p>6.3 The result of the draw is final.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">7. Winner Notification</h2>
              <p>7.1 Winners will be contacted using the details provided during entry.</p>
              <p>7.2 If a winner cannot be contacted within 14 days, Prize Pour reserves the right to redraw the prize.</p>
              <p>7.3 Winners may be required to provide proof of identity and age before prizes are released.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">8. Prizes</h2>
              <p>8.1 All prizes are physical products only.</p>
              <p>8.2 No cash alternatives are offered.</p>
              <p>8.3 Prize Pour reserves the right to substitute a prize with an item of equal or greater value if necessary due to circumstances beyond our control.</p>
              <p>8.4 Delivery is limited to locations specified on the competition page.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">9. Delivery</h2>
              <p>9.1 Prize delivery times may vary.</p>
              <p>9.2 Prize Pour is not liable for delays caused by:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>couriers;</li>
                <li>customs;</li>
                <li>weather;</li>
                <li>events outside our control.</li>
              </ul>
              <p>9.3 Risk in the prize passes to the winner upon confirmed delivery.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">10. Prohibited Conduct</h2>
              <p>Entrants must not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>use automated systems or bots;</li>
                <li>create multiple accounts fraudulently;</li>
                <li>manipulate competitions;</li>
                <li>provide false information.</li>
              </ul>
              <p>Prize Pour reserves the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>disqualify entrants;</li>
                <li>void entries;</li>
                <li>suspend accounts; where fraudulent or abusive behaviour is suspected.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">11. Account Suspension</h2>
              <p>Prize Pour may suspend or terminate accounts where:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>these Terms are breached;</li>
                <li>fraud is suspected;</li>
                <li>abusive behaviour occurs;</li>
                <li>payment disputes arise.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">12. Limitation of Liability</h2>
              <p>12.1 To the fullest extent permitted by law, Prize Pour shall not be liable for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>technical failures;</li>
                <li>interrupted access;</li>
                <li>lost entries;</li>
                <li>indirect or consequential losses.</li>
              </ul>
              <p>12.2 Nothing in these Terms excludes liability for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>fraud;</li>
                <li>death or personal injury caused by negligence;</li>
                <li>liabilities that cannot legally be excluded.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">13. Privacy</h2>
              <p>13.1 Personal data is processed in accordance with our Privacy Policy.</p>
              <p>13.2 Entrants consent to Prize Pour using personal information for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>administering competitions;</li>
                <li>contacting winners;</li>
                <li>fraud prevention;</li>
                <li>legal compliance.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">14. Publicity</h2>
              <p>14.1 Winners may be asked to participate in reasonable promotional activity.</p>
              <p>14.2 Prize Pour may publish:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>first name;</li>
                <li>county/location;</li>
                <li>prize won; unless prohibited by law or requested otherwise for legitimate privacy reasons.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">15. Responsible Participation</h2>
              <p>15.1 Prize Pour promotes responsible participation.</p>
              <p>15.2 Entrants should only participate within their financial means.</p>
              <p>15.3 Prize Pour reserves the right to refuse service where harmful or compulsive behaviour is suspected.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">16. Changes to Terms</h2>
              <p>Prize Pour may amend these Terms from time to time where necessary for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>legal compliance;</li>
                <li>operational reasons;</li>
                <li>security;</li>
                <li>fraud prevention.</li>
              </ul>
              <p>Updated Terms will be published on the platform.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">17. Governing Law</h2>
              <p>These Terms are governed by the laws of:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>England and Wales;</li>
                <li>Scotland; or</li>
                <li>Northern Ireland, as applicable to the entrant's residence within the United Kingdom.</li>
              </ul>
              <p>Any disputes shall be subject to the jurisdiction of the UK courts.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">Contact</h2>
              <p>For questions regarding these terms, contact us at <a href="mailto:legal@prizepour.com" className="text-primary hover:underline">legal@prizepour.com</a>.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
