import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CountdownTimer } from '@/components/giveaway/CountdownTimer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, ShieldCheck, Users, Ticket, Star, Lock, Package } from 'lucide-react';
import heroImg from '@/assets/images/hero.png';
import { getGiveawayImage, daysUntil, COLLECTION_BOTTLES } from '@/data/giveaways';
import { useListEntries, useListGiveaways } from '@workspace/api-client-react';

const WINNERS = [
  { name: "Sarah M.", location: "Austin, TX", prize: "Blanton's Gold Edition", date: "Apr 2026" },
  { name: "James K.", location: "Nashville, TN", prize: "Yamazaki 18", date: "Mar 2026" },
  { name: "Linda P.", location: "Denver, CO", prize: "Knob Creek 25th Anniv.", date: "Mar 2026" },
  { name: "Marcus R.", location: "Chicago, IL", prize: "Dalmore King Alexander III", date: "Feb 2026" }
];

const FAQS = [
  {
    q: "Is this legal?",
    a: "Yes. All draws are skill-testing question giveaways, fully compliant with Canadian and UK promotional contest law. No purchase necessary — free entry by mail-in is always available."
  },
  {
    q: "How are winners selected?",
    a: "Winners are selected via a cryptographically secure RNG at the exact draw close time. The process is independently witnessed and recorded."
  },
  {
    q: "How is the bottle delivered?",
    a: "Every bottle is professionally packed with insurance and shipped via tracked courier. We cover all applicable duties and taxes to your door."
  },
  {
    q: "How do I know the bottle is authentic?",
    a: "Every bottle in our inventory is sourced directly from distilleries or authorised retailers and verified by our expert authentication team before listing."
  }
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

export function Home() {
  const [, setLocation] = useLocation();
  const { data: entries = [] } = useListEntries();
  const { data: giveaways = [] } = useListGiveaways();

  const featured = giveaways[0];
  const liveEntries = entries.length;
  const liveRevenue = entries.reduce((s, e) => s + parseFloat(e.amountPaid), 0);
  const liveTickets = entries.reduce((s, e) => s + e.ticketQty, 0);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar onScrollTo={scrollTo} />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="Whiskey Bar" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            className="space-y-8"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest">Featured Draw Ends Soon</span>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-serif leading-tight">
              Hunt the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-200">Unattainable.</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Exclusive giveaways for the world's most sought-after whiskies. Join the club of collectors securing the impossible.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider" onClick={() => featured && setLocation(`/giveaway/${featured.id}`)}>
                Enter Featured Draw
              </Button>
              <Button size="lg" variant="outline" className="border-border hover:bg-white/5 uppercase tracking-wider" onClick={() => scrollTo('giveaways')}>
                View All Draws
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-card border border-border p-6 rounded-sm shadow-2xl">
              <div className="aspect-[3/4] relative mb-6 overflow-hidden rounded-sm group">
                {featured ? (
                  getGiveawayImage(featured.id, featured.imageUrl) ? (
                    <img src={getGiveawayImage(featured.id, featured.imageUrl)} alt={featured.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-amber-900/60 to-black flex items-center justify-center">
                      <Package className="w-24 h-24 text-primary/40" />
                    </div>
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-amber-900/60 to-black flex items-center justify-center">
                    <Package className="w-24 h-24 text-primary/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary/90 text-primary-foreground text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-sm">Full Collection · 6 Expressions</span>
                </div>
                {featured && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-serif text-white mb-2">{featured.name}</h3>
                    <div className="flex justify-between items-end">
                      <p className="text-primary font-mono">{featured.prizeValue} Value</p>
                      <p className="text-sm text-gray-400 font-mono">{featured.entryCount.toLocaleString()} Entries</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                {featured && <CountdownTimer daysToAdd={daysUntil(featured.drawDate)} />}
                <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => featured && setLocation(`/giveaway/${featured.id}`)}>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <section className="border-y border-border bg-card/50 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50">
          <div className="text-center px-4">
            <p className="text-3xl md:text-4xl font-serif text-primary mb-2">
              {liveEntries > 0 ? liveEntries.toLocaleString() : '47k+'}
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {liveEntries > 0 ? 'Live Entries' : 'Members'}
            </p>
          </div>
          <div className="text-center px-4">
            <p className="text-3xl md:text-4xl font-serif text-primary mb-2">
              {liveRevenue > 0 ? `£${liveRevenue.toFixed(0)}` : '£2.1M'}
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {liveRevenue > 0 ? 'Revenue' : 'Prizes Awarded'}
            </p>
          </div>
          <div className="text-center px-4">
            <p className="text-3xl md:text-4xl font-serif text-primary mb-2">
              {liveTickets > 0 ? liveTickets.toLocaleString() : '850+'}
            </p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {liveTickets > 0 ? 'Tickets Sold' : 'Past Draws'}
            </p>
          </div>
          <div className="text-center px-4">
            <p className="text-3xl md:text-4xl font-serif text-primary mb-2">£2.99</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Avg Entry</p>
          </div>
        </div>
      </section>

      {/* ── The Draw ── */}
      <section id="giveaways" className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Live Raffle</p>
          <h2 className="text-4xl font-serif mb-4">One Winner. The Whole Collection.</h2>
          <p className="text-muted-foreground max-w-xl">Enter once for a chance to win all six Clonakilty expressions — worth £481 combined, shipped insured to your door.</p>
        </div>

        {!featured ? (
          <div className="text-center py-20 text-muted-foreground font-mono text-sm">
            No active draws at the moment. Check back soon.
          </div>
        ) : (
          (() => {
            const pct = Math.min((featured.entryCount / featured.maxEntries) * 100, 100);
            const remaining = featured.maxEntries - featured.entryCount;
            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-card border border-border rounded-sm overflow-hidden grid lg:grid-cols-2 hover:border-primary/40 transition-colors"
              >
                {/* Left: 2×3 bottle grid */}
                <div className="grid grid-cols-3 gap-px bg-border/30">
                  {COLLECTION_BOTTLES.map((bottle, i) => (
                    <div key={i} className="aspect-[3/4] relative overflow-hidden bg-black group/bottle">
                      <img
                        src={bottle.image}
                        alt={bottle.name}
                        className="w-full h-full object-cover opacity-75 group-hover/bottle:opacity-100 transition-opacity duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-[10px] font-mono text-primary leading-tight">{bottle.value}</p>
                        <p className="text-[9px] text-white/60 leading-tight line-clamp-1">{bottle.name}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: info panel */}
                <div className="p-8 lg:p-10 flex flex-col justify-between gap-8">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-mono text-primary uppercase tracking-widest">Combined Prize</span>
                      <h3 className="text-3xl font-serif mt-2 mb-1">{featured.name}</h3>
                      <p className="text-4xl font-serif text-primary">{featured.prizeValue}</p>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{featured.description}</p>

                    <div className="space-y-1.5 pt-2">
                      {COLLECTION_BOTTLES.map((bottle, i) => (
                        <div key={i} className="flex justify-between items-center text-xs font-mono py-1 border-b border-border/30 last:border-0">
                          <span className="text-foreground/70">{bottle.name}</span>
                          <span className="text-primary">{bottle.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center text-xs font-mono mb-2">
                        <span className="text-muted-foreground">{featured.entryCount} / {featured.maxEntries} tickets sold</span>
                        <span className={remaining <= 20 ? 'text-red-400' : 'text-primary'}>{remaining} remaining</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : 'bg-primary'}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2 }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <CountdownTimer daysToAdd={daysUntil(featured.drawDate)} />
                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <Ticket className="w-3.5 h-3.5 text-primary" />
                        {pct.toFixed(0)}% sold
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest text-sm font-mono"
                      onClick={() => setLocation(`/giveaway/${featured.id}`)}
                    >
                      Enter the Draw — from £2.99
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })()
        )}
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">The Process</p>
            <h2 className="text-4xl font-serif mb-4">Simple. Transparent. Fair.</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Every draw follows the same iron-clad process, independently verified at each step.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Ticket, step: '1', title: 'Secure Entry', body: 'Choose your coveted bottle and secure your entries. Each draw has a strict capacity limit to protect your odds.' },
              { icon: ShieldCheck, step: '2', title: 'Verified Draw', body: 'Winners are selected via a cryptographically secure RNG upon timer expiry, independently witnessed and recorded.' },
              { icon: Package, step: '3', title: 'Doorstep Delivery', body: 'Bottles are professionally packed with full insurance and shipped tracked to your door. Duties covered.' },
            ].map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="text-center space-y-4 relative">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center relative">
                  <Icon className="w-8 h-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center">{step}</span>
                </div>
                <h3 className="text-xl font-serif">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Winners ── */}
      <section id="winners" className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px bg-border flex-1" />
          <p className="text-xs font-mono text-primary uppercase tracking-widest px-4">Hall of Winners</p>
          <div className="h-px bg-border flex-1" />
        </div>
        <h2 className="text-3xl font-serif text-center mb-16">Recent Additions to Collections</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WINNERS.map((winner, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-card border border-border/50 rounded-sm text-center space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/20 to-transparent opacity-50" />
              <Trophy className="w-8 h-8 text-primary/60 mx-auto" />
              <div>
                <p className="font-serif text-lg text-primary leading-tight">{winner.prize}</p>
                <p className="text-sm text-foreground mt-2 font-medium">{winner.name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{winner.location}</p>
                <p className="text-xs text-muted-foreground/60 font-mono mt-1">{winner.date}</p>
              </div>
              <div className="flex justify-center gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Why PrizePour ── */}
      <section className="py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Why Us</p>
              <h2 className="text-4xl font-serif mb-6 leading-tight">The collector's edge you've been looking for.</h2>
              <p className="text-muted-foreground leading-relaxed mb-10">
                PrizePour was built by collectors for collectors. We source direct from distilleries and authorised retailers — no grey-market bottles, ever. Every draw is independently verified and every winner notified within 24 hours.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: Lock, title: 'Cryptographic Draws', body: 'Winners selected by auditable RNG — no human involvement possible.' },
                  { icon: ShieldCheck, title: 'Authenticated Bottles', body: 'Every bottle verified by our expert team before it enters the draw.' },
                  { icon: Package, title: 'Fully Insured Shipping', body: 'Door-to-door tracked shipping with full replacement value covered.' },
                  { icon: Users, title: 'Community of Collectors', body: 'Join 47,000+ enthusiasts who take their collections seriously.' },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm mb-1">{title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full" />
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-amber-950 via-amber-900/50 to-stone-950 flex items-center justify-center">
                  <svg viewBox="0 0 80 160" className="w-24 h-48 opacity-15 fill-amber-400" xmlns="http://www.w3.org/2000/svg">
                    <rect x="28" y="0" width="24" height="20" rx="4" />
                    <rect x="20" y="18" width="40" height="8" rx="2" />
                    <rect x="16" y="24" width="48" height="110" rx="6" />
                    <rect x="20" y="134" width="40" height="26" rx="4" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-background/80 backdrop-blur-sm border border-border rounded-sm p-4">
                  <p className="text-xs font-mono text-primary uppercase tracking-widest mb-1">Currently Live</p>
                  <p className="font-serif text-lg">{giveaways.length} Active {giveaways.length === 1 ? 'Draw' : 'Draws'}</p>
                  <p className="text-xs text-muted-foreground mt-1">From £2.99 entry · Draw closes soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About / FAQ ── */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">About PrizePour</p>
          <h2 className="text-4xl font-serif mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Everything you need to know before entering your first draw.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-sm p-6"
            >
              <h4 className="font-serif text-lg mb-3 text-foreground">{faq.q}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider" onClick={() => scrollTo('giveaways')}>
            Browse Active Draws
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
