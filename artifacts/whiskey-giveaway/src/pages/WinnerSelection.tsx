import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const STEPS = [
  {
    n: '01',
    title: 'Entries Close',
    body: 'When a draw sells out or reaches its scheduled close time, the entry pool is locked. No further tickets can be issued for that draw — the list is final.',
  },
  {
    n: '02',
    title: 'Entry Pool Verified',
    body: 'Every paid, age-verified entry is stamped with a unique ticket number. Duplicate, unpaid, or invalidated entries are removed before the draw begins.',
  },
  {
    n: '03',
    title: 'Random Draw',
    body: 'A cryptographically random number between 1 and the total ticket count is generated using a verifiable RNG. The ticket number that matches is the winner.',
  },
  {
    n: '04',
    title: 'Live Reveal',
    body: 'The draw is broadcast live on the draw page so anyone can watch the result in real time. The winning ticket number and first name are shown the moment the draw lands.',
  },
  {
    n: '05',
    title: 'Winner Contacted',
    body: 'The winner is emailed within 24 hours. They confirm shipping details and verify age before the prize is dispatched, fully insured, to their address.',
  },
];

export function WinnerSelection() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-14">
          <div className="space-y-3">
            <p className="text-xs font-serif text-primary uppercase tracking-widest">Transparency</p>
            <h1 className="text-3xl sm:text-4xl font-serif">How Winners Are Selected</h1>
            <p className="text-muted-foreground text-sm sm:text-base font-serif">
              Every PrizePour draw follows the same provably-fair process — no curation, no favouritism, no exceptions.
            </p>
          </div>

          <ol className="space-y-6">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="relative rounded-sm border border-border bg-card/40 p-5 sm:p-6 flex gap-5 hover:border-primary/40 transition-colors"
              >
                <div className="shrink-0">
                  <span className="font-serif text-2xl sm:text-3xl text-primary/80">{s.n}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-lg sm:text-xl text-foreground">{s.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <section className="space-y-4 rounded-sm border border-primary/30 bg-primary/5 p-6 sm:p-8">
            <h2 className="font-serif text-xl text-foreground">Our Guarantees</h2>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground leading-relaxed list-disc pl-5">
              <li>Every draw uses the same random selection method — no human pick.</li>
              <li>Every draw is broadcast live and recorded.</li>
              <li>Unsold tickets do <strong className="text-foreground">not</strong> win — only valid entries are eligible.</li>
              <li>If a winner cannot be contacted or verified within 14 days, a re-draw is performed under the same rules.</li>
              <li>Full audit details for any past draw are available on request — email <a href="mailto:legal@prizepour.com" className="text-primary hover:underline">legal@prizepour.com</a>.</li>
            </ul>
          </section>

          <p className="text-xs text-muted-foreground/70 font-serif text-center">
            For the full legal framework, see our <a href="/rules" className="text-primary hover:underline">Contest Rules</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
