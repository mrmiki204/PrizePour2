import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function ResponsibleDrinking() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-serif text-primary uppercase tracking-widest">Drink Aware</p>
            <h1 className="text-3xl sm:text-4xl font-serif">Responsible Drinking &amp; 18+</h1>
            <p className="text-muted-foreground text-sm font-serif">PrizePour is for adults who enjoy fine spirits with care.</p>
          </div>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">Strictly 18+</h2>
              <p>You must be aged <strong className="text-foreground">18 or over</strong> to enter any PrizePour draw. We verify age at the point of entry and reserve the right to refuse or void entries where age cannot be confirmed. Winners may be asked to verify age before any prize is released or shipped.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">Drink Responsibly</h2>
              <p>The spirits we feature are made to be enjoyed slowly, in good company, and in moderation. We encourage every winner — and every visitor — to drink thoughtfully, never drive after drinking, and to know their limits. If you choose not to drink, prizes may be gifted, kept as collectibles, or shared with friends of legal age.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">Need Support?</h2>
              <p>If you or someone you know is concerned about alcohol use, free and confidential help is available:</p>
              <ul className="space-y-2 list-disc pl-5">
                <li><a href="https://www.drinkaware.co.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Drinkaware (UK)</a> — independent advice and a free self-assessment tool.</li>
                <li><a href="https://www.nhs.uk/live-well/alcohol-advice/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NHS Alcohol Support</a> — guidance, units, and treatment options.</li>
                <li><a href="https://www.alcoholics-anonymous.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Alcoholics Anonymous (UK)</a> — local meetings and 24-hour helpline.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-serif text-foreground">Our Commitment</h2>
              <p>We will never market PrizePour to under-18s, never glamorise excess, and never imply that alcohol enhances personal, social or professional success. Every campaign we run is reviewed against the <a href="https://www.portmangroup.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Portman Group Code</a> for responsible marketing of alcohol.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
