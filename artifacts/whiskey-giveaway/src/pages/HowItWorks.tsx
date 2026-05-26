import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Search, CreditCard, Trophy, ShieldCheck, Lock, Package, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    icon: Search,
    step: '01',
    title: 'Choose a Draw',
    body: 'Browse our curated selection of premium whisky, tequila and spirit giveaways. Every draw has a fixed entry cap shown up front, so you always know your odds.',
  },
  {
    icon: CreditCard,
    step: '02',
    title: 'Buy Your Entries',
    body: 'Select your entries and complete checkout when payments are enabled. PrizePour is currently in beta — checkout will go live during launch with secure card payments.',
  },
  {
    icon: Trophy,
    step: '03',
    title: 'Winner Selected',
    body: 'Once the draw closes, a winner is chosen fairly and announced clearly on the site. Prizes are dispatched with insured delivery and tracking.',
  },
] as const;

export function HowItWorks() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-24">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[60%] bg-primary/[0.05] blur-3xl rounded-full" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-serif text-primary uppercase tracking-[0.25em]">The Process</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-200">How It Works</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Three simple steps from browsing to winning — fair, transparent, and built for collectors.
              </p>
              <p className="mt-4 text-[11px] sm:text-xs font-serif text-primary/70 uppercase tracking-[0.25em]">
                Currently in beta — payments enable at launch
              </p>
            </motion.div>
          </div>
        </section>

        {/* Steps */}
        <section className="relative mt-14 sm:mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="relative">
              {/* Connecting line — desktop only */}
              <div aria-hidden className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-6 relative">
                {STEPS.map(({ icon: Icon, step, title, body }, idx) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="group relative"
                  >
                    <div className="relative h-full text-center bg-card/60 backdrop-blur-sm border border-border rounded-sm p-6 sm:p-8 transition-all duration-500 hover:border-primary/60 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(234,146,55,0.3)]">
                      <div className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-primary/20 group-hover:border-primary/50 transition-colors duration-500" />
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/40 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-500">
                          <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                        </div>
                        <div aria-hidden className="absolute inset-0 rounded-full bg-primary/30 blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 -z-10" />
                      </div>
                      <p className="font-serif text-[11px] tracking-[0.3em] text-primary/70 uppercase mb-3">Step {step}</p>
                      <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-3 leading-tight">{title}</h2>
                      <div className="mx-auto w-10 h-px bg-primary/40 mb-4 group-hover:w-16 group-hover:bg-primary/70 transition-all duration-500" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trust strip */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] font-serif text-muted-foreground uppercase tracking-[0.2em]"
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Independently verified
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="inline-flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Secure payment at launch
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="inline-flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-primary" />
                Insured delivery
              </span>
            </motion.div>
          </div>
        </section>

        {/* FAQ-lite */}
        <section className="relative mt-20 sm:mt-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12">
              <p className="text-[10px] font-serif text-primary uppercase tracking-[0.3em] mb-3">Good to know</p>
              <h2 className="text-2xl sm:text-3xl font-serif">A few quick details</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Is the site live for payments?',
                  a: 'PrizePour is currently in beta. You can browse all draws and explore the platform now — paid entries will be enabled during our public launch.',
                },
                {
                  q: 'How are winners chosen?',
                  a: 'Each draw uses a fair, verifiable selection method. Winners are announced publicly on the site once the draw closes, and contacted directly for delivery details.',
                },
                {
                  q: 'Who can enter?',
                  a: 'Entrants must be 18 or over and meet the eligibility rules for each individual draw. Full details are in our Contest Rules.',
                },
                {
                  q: 'What if a draw doesn\u2019t sell out?',
                  a: 'Every draw has a fixed cap. If a draw does not reach its cap by the closing date, the rules for that draw will apply — see the listing for specifics.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="border border-border rounded-sm bg-card/40 p-5 sm:p-6">
                  <h3 className="font-serif text-base sm:text-lg text-foreground mb-2">{q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative mt-20 sm:mt-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif mb-4">Ready to browse the draws?</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-lg mx-auto">
              Explore current giveaways and add yourself to the list — checkout opens when payments go live.
            </p>
            <Button
              onClick={() => setLocation('/')}
              size="lg"
              className="group"
            >
              View Active Draws
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
