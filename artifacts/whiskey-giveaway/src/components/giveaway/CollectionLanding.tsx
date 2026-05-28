import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  ArrowRight,
  Ticket,
  ChevronDown,
  Calendar,
  Gem,
  ShieldCheck,
  Truck,
  Lock,
  Sparkles,
  Wine,
  Crown,
  Star,
  Award,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/giveaway/CountdownTimer';
import { getGiveawayImage, getGiveawayBottles, daysUntil } from '@/data/giveaways';
import { getCollectionContent } from '@/data/collectionContent';
import type { Giveaway } from '@/data/giveaways';

// Map serializable icon keys (from the content layer) to lucide components.
const ICONS: Record<string, LucideIcon> = {
  gem: Gem,
  shield: ShieldCheck,
  truck: Truck,
  lock: Lock,
  sparkles: Sparkles,
  wine: Wine,
  crown: Crown,
  star: Star,
  award: Award,
  calendar: Calendar,
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Gem;
  return <Cmp className={className} />;
}

interface Props {
  giveaway: Giveaway;
  /** Scrolls to the entry/ticket panel ("Preview Giveaway"). */
  onPreview: () => void;
  /** Scrolls to the beta waitlist section ("Join Beta List"). */
  onJoinWaitlist: () => void;
}

export function CollectionLanding({ giveaway, onPreview, onJoinWaitlist }: Props) {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const content = getCollectionContent(giveaway.name);
  const heroImg = getGiveawayImage(giveaway.id, giveaway.imageUrl, giveaway.name);
  const bottles = getGiveawayBottles(giveaway.id, giveaway.name);

  const entryCount = giveaway.entryCount;
  const pct = Math.min((entryCount / giveaway.maxEntries) * 100, 100);
  const remaining = giveaway.maxEntries - entryCount;
  const ticketPrice = parseFloat(giveaway.ticketPriceGbp);
  const blurb = content.shortDescription ?? giveaway.description;

  return (
    <div className="flex-1">
      {/* ── 1 · CINEMATIC HERO ── */}
      <section className="relative pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImg && (
            <img src={heroImg} alt="" className="w-full h-full object-cover opacity-40" loading="eager" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <Button
            variant="ghost"
            className="mb-6 -ml-3 text-muted-foreground hover:text-foreground font-serif text-xs uppercase tracking-widest"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Draws
          </Button>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Left: title + copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] sm:text-xs font-serif text-primary uppercase tracking-[0.25em]">
                  {giveaway.heroTagline?.trim() || content.kicker}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.05]">
                {giveaway.name}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                {blurb}
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={onPreview}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-[0.15em] text-sm h-12 min-h-[48px] px-6"
                >
                  Preview Giveaway <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onJoinWaitlist}
                  className="border-primary/40 hover:border-primary text-foreground font-serif uppercase tracking-[0.15em] text-sm h-12 min-h-[48px] px-6"
                >
                  Join Beta List
                </Button>
              </div>

              <p className="text-xs sm:text-sm font-serif text-muted-foreground/90 max-w-xl leading-relaxed">
                PrizePour is currently in beta. Checkout remains disabled while we refine the experience.
              </p>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-4 max-w-xl">
                <div>
                  <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-1">Prize Value</p>
                  <p className="text-lg sm:text-2xl font-serif text-primary break-words leading-tight">{giveaway.prizeValue}</p>
                </div>
                <div>
                  <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-1">Per Ticket</p>
                  <p className="text-lg sm:text-2xl font-serif text-foreground break-words leading-tight">£{ticketPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-1">Remaining</p>
                  <p className={`text-lg sm:text-2xl font-serif break-words leading-tight ${remaining <= 20 ? 'text-red-400' : 'text-foreground'}`}>
                    {remaining.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right: showcase card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-2"
            >
              <div className="bg-card/95 backdrop-blur-sm border border-primary/30 rounded-sm overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] relative overflow-hidden bg-black/50">
                  {heroImg ? (
                    <img src={heroImg} alt={giveaway.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                      <Wine className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <p className="text-[10px] font-serif text-primary uppercase tracking-[0.25em] mb-1">{content.kicker}</p>
                    <p className="font-serif text-xl sm:text-2xl text-white leading-tight">{giveaway.name}</p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  <div>
                    <div className="flex justify-between items-center text-xs font-serif mb-2 gap-2">
                      <span className="text-muted-foreground truncate">{entryCount} / {giveaway.maxEntries} sold</span>
                      <span className={`shrink-0 ${remaining <= 20 ? 'text-red-400' : 'text-primary'}`}>
                        {remaining} remaining
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : 'bg-primary'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.4, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-3 pt-3 border-t border-border/60">
                    <div>
                      <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-[0.25em] mb-1">Draw Ends In</p>
                      <CountdownTimer daysToAdd={daysUntil(giveaway.drawDate)} />
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={onPreview}
                    className="w-full h-12 min-h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-[0.15em] text-sm"
                  >
                    Preview Giveaway <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2 · WHAT'S INCLUDED ── */}
      <section className="py-16 sm:py-24 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">The Prize Collection</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4">What's Included</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{content.includedIntro}</p>
          </div>

          {bottles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {bottles.map((bottle, i) => (
                <motion.div
                  key={bottle.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
                  className="group relative bg-background/60 border border-border hover:border-primary/40 rounded-sm overflow-hidden transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[3/4] relative overflow-hidden" style={{ background: bottle.background }}>
                    <img
                      src={bottle.image}
                      alt={bottle.name}
                      loading="lazy"
                      className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.55))' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-3 sm:p-4 space-y-1">
                    <p className="font-serif text-sm sm:text-base text-foreground leading-tight">{bottle.name}</p>
                    <p className="font-serif text-sm text-primary">{bottle.value}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 hidden sm:block">{bottle.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {(content.includedItems ?? []).map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group relative bg-background/60 border border-border hover:border-primary/40 rounded-sm p-6 sm:p-7 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(234,146,55,0.25)]"
                >
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm border border-primary/30 bg-primary/10 text-primary">
                      <Icon name={item.icon} className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 3 · WHY THIS COLLECTION MATTERS ── */}
      <section className="py-16 sm:py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <p className="text-xs font-serif text-primary uppercase tracking-widest">Why This Collection Matters</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight">{content.story.heading}</h2>
              {content.story.paragraphs.map((p) => (
                <p key={p.slice(0, 24)} className="text-sm sm:text-base text-muted-foreground leading-relaxed">{p}</p>
              ))}
              {content.story.quote && (
                <blockquote className="border-l-2 border-primary pl-5 py-1">
                  <p className="font-serif text-lg sm:text-xl text-primary/90 italic leading-snug">
                    “{content.story.quote}”
                  </p>
                </blockquote>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="aspect-[4/5] relative overflow-hidden rounded-sm border border-primary/20 bg-black/50 shadow-2xl">
                {heroImg ? (
                  <img src={heroImg} alt={giveaway.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <Wine className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4 · COLLECTION HIGHLIGHTS ── */}
      <section className="py-16 sm:py-24 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">Why Enter With Confidence</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4">Collection Highlights</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {content.highlights.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative bg-background/60 border border-border hover:border-primary/40 rounded-sm p-6 sm:p-7 transition-all hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm border border-primary/30 bg-primary/10 text-primary">
                    <Icon name={card.icon} className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-foreground">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5 · FAQ ── */}
      <section className="py-16 sm:py-24 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">Common Questions</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4">Frequently Asked</h2>
        </div>

        <div className="space-y-3">
          {content.faq.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={faq.q}
                className={`bg-card border rounded-sm overflow-hidden transition-colors ${
                  isOpen ? 'border-primary/40' : 'border-border'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 hover:bg-primary/5 transition-colors min-h-[56px]"
                  aria-expanded={isOpen}
                  aria-controls={`collection-faq-panel-${i}`}
                  id={`collection-faq-trigger-${i}`}
                >
                  <span className="font-serif text-base sm:text-lg text-foreground">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <motion.div
                  id={`collection-faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`collection-faq-trigger-${i}`}
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button
            size="lg"
            onClick={onPreview}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-[0.15em] text-sm h-12 min-h-[48px] px-8"
          >
            <Ticket className="w-4 h-4 mr-2" /> Preview Giveaway
          </Button>
        </div>
      </section>
    </div>
  );
}
