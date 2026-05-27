import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useLocation } from 'wouter';

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'What is PrizePour?',
    a: 'PrizePour is a premium prize-draw platform for rare and collectible spirits, distillery experiences and high-end bar equipment. Each draw is capped, transparent, and drawn live.',
  },
  {
    q: 'Is PrizePour live yet?',
    a: 'PrizePour is currently in beta. You can browse the full experience, but checkout is disabled until our public launch. No real charges are made during beta.',
  },
  {
    q: 'Who can enter?',
    a: 'You must be aged 18 or over and resident in a jurisdiction where prize draws of this kind are permitted. Full eligibility is set out in the Contest Rules.',
  },
  {
    q: 'How much does a ticket cost?',
    a: 'Tickets are £4.99 each. The number of tickets available for each draw is capped at 140% of the prize value ÷ £4.99, so revenue always covers the prize plus a small operating margin.',
  },
  {
    q: 'How are winners chosen?',
    a: (
      <>
        Winners are picked at random from the verified entry pool using a provably-fair live draw. See the full process on the{' '}
        <a href="/how-winners-are-selected" className="text-primary hover:underline">How Winners Are Selected</a> page.
      </>
    ),
  },
  {
    q: 'How will I be notified if I win?',
    a: 'Winners are announced live on the draw page and contacted by email within 24 hours. You will need to confirm your shipping details and verify your age before the prize is released.',
  },
  {
    q: 'How are prizes delivered?',
    a: 'Prizes are shipped fully insured to the winner\'s verified address. Age-restricted spirits require an adult signature on delivery. International shipping is offered where the destination country permits.',
  },
  {
    q: 'Can I get a refund?',
    a: 'During beta no real payments are taken, so no refunds apply. Once payments are live, entries are non-refundable except where required by consumer law or where a draw is cancelled.',
  },
  {
    q: 'How do I contact you?',
    a: (
      <>
        Email <a href="mailto:hello@prizepour.com" className="text-primary hover:underline">hello@prizepour.com</a> for general questions, or{' '}
        <a href="mailto:legal@prizepour.com" className="text-primary hover:underline">legal@prizepour.com</a> for legal enquiries.
      </>
    ),
  },
];

export function Faq() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-serif text-primary uppercase tracking-widest">Help Centre</p>
            <h1 className="text-3xl sm:text-4xl font-serif">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-sm font-serif">Quick answers to the questions we hear most often.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((item, i) => (
              <details
                key={i}
                className="group rounded-sm border border-border bg-card/40 open:border-primary/40 open:bg-card/70 transition-colors"
              >
                <summary className="list-none cursor-pointer px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4">
                  <span className="font-serif text-base sm:text-lg text-foreground">{item.q}</span>
                  <span className="shrink-0 text-primary font-serif text-xl transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div className="pt-6 border-t border-border/50 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Didn't find what you were looking for?</p>
            <button
              onClick={() => setLocation('/how-it-works')}
              className="text-sm font-serif tracking-widest text-primary hover:text-amber-300 uppercase transition-colors"
            >
              Read How It Works →
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
