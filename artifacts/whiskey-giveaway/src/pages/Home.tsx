import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CountdownTimer } from '@/components/giveaway/CountdownTimer';
import { WaitlistSection } from '@/components/home/WaitlistSection';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ShieldCheck, Users, Ticket, Lock, Package, ChevronDown, ChevronUp, Compass, Trophy } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import heroImg from '@/assets/images/hero.png';
import patronCollectionHero from '@assets/ChatGPT_Image_May_28,_2026,_10_09_40_PM_1780002816388.png';
import clonakiltyCollectionHero from '@assets/ChatGPT_Image_May_28,_2026,_10_04_51_PM_1780002816391.png';
import bushmillsCollectionHero from '@assets/ChatGPT_Image_May_28,_2026,_10_21_53_PM_1780003380341.png';
import macallanCollectionHero from '@assets/ChatGPT_Image_May_28,_2026,_10_51_35_PM_1780005130054.png';
import macallanHeroSlide from '@assets/ChatGPT_Image_May_28,_2026,_11_06_11_PM_1780005983787.png';
import { getGiveawayImage, daysUntil, getGiveawayBottles, PATRON_BOTTLES, COLLECTION_BOTTLES } from '@/data/giveaways';
import { useListGiveaways } from '@workspace/api-client-react';

function getCollectionHero(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes('patr')) return patronCollectionHero;
  if (n.includes('clonakilty')) return clonakiltyCollectionHero;
  if (n.includes('bushmills')) return bushmillsCollectionHero;
  if (n.includes('macallan')) return macallanCollectionHero;
  return null;
}


const FAQS = [
  {
    q: "Why is PrizePour currently in beta?",
    a: "PrizePour is currently in beta while we test the platform, improve the experience and finalise compliance checks. Checkout is disabled during beta."
  },
  {
    q: "How are winners announced?",
    a: "Winners will be contacted directly and announced through PrizePour once each draw has closed and verification is complete."
  },
  {
    q: "Is this legal?",
    a: "Yes. All draws are skill-testing question competitions, fully compliant with UK promotional contest law. No purchase necessary — free entry by mail-in is always available."
  },
  {
    q: "How are winners selected?",
    a: "Winners are selected via a cryptographically secure RNG at the exact draw close time. The process is independently witnessed and recorded."
  },
  {
    q: "How is my prize delivered?",
    a: "Every prize is professionally packed with insurance and shipped via tracked courier. We cover all applicable duties and taxes to your door."
  },
  {
    q: "How do I know the prize is genuine?",
    a: "Every item in our inventory is sourced from authorised retailers and verified by our team before listing. We never ship grey-market goods."
  }
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function BottleList({ bottles }: { bottles: { name: string }[] }) {
  const [expanded, setExpanded] = useState(false);
  const COLLAPSED = 4;
  const needsToggle = bottles.length > COLLAPSED;
  const shown = expanded || !needsToggle ? bottles : bottles.slice(0, COLLAPSED);
  const hiddenCount = bottles.length - COLLAPSED;
  return (
    <div className="space-y-1.5 pt-2">
      <AnimatePresence initial={false}>
        {shown.map((bottle, i) => (
          <motion.div
            key={`${bottle.name}-${i}`}
            initial={i >= COLLAPSED ? { opacity: 0, height: 0 } : false}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center text-xs font-serif py-1 border-b border-border/30 last:border-0 overflow-hidden"
          >
            <span className="text-foreground/70">{bottle.name}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-serif uppercase tracking-[0.15em] text-primary hover:text-amber-300 transition-colors"
        >
          {expanded ? (
            <>Show Less <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>Explore Full Collection — +{hiddenCount} more included <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}
    </div>
  );
}

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 }),
};

// Reduce animation work on small screens / prefers-reduced-motion devices.
function useIsCompactMotion() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const check = () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const small = window.matchMedia('(max-width: 640px)').matches;
      setCompact(reduced || small);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return compact;
}

// ── Cinematic backdrop: floating dust particles + light sweep + vignette ──
function CinematicBackdrop({ accent = 'amber' }: { accent?: 'amber' | 'emerald' }) {
  const compact = useIsCompactMotion();
  const particleCount = compact ? 6 : 18;
  const particles = useMemo(
    () => Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 10,
      size: 1 + Math.random() * 2.5,
      drift: -20 + Math.random() * 40,
    })),
    [particleCount],
  );
  const sweepColor = accent === 'emerald'
    ? 'linear-gradient(115deg, transparent 35%, rgba(52,211,153,0.10) 50%, transparent 65%)'
    : 'linear-gradient(115deg, transparent 35%, rgba(234,146,55,0.12) 50%, transparent 65%)';
  const particleColor = accent === 'emerald' ? 'bg-emerald-200/40' : 'bg-amber-200/40';

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Animated light sweep */}
      <motion.div
        className="absolute -inset-x-1/4 top-0 h-full"
        style={{ background: sweepColor, mixBlendMode: 'screen' }}
        animate={{ x: ['-30%', '30%', '-30%'] }}
        transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity }}
      />
      {/* Floating dust particles */}
      {particles.map(p => (
        <motion.span
          key={p.id}
          className={`absolute bottom-0 rounded-full ${particleColor} blur-[1px]`}
          style={{ left: `${p.left}%`, width: p.size, height: p.size }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -600, x: p.drift, opacity: [0, 0.7, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      {/* Soft smoke/fog gradient */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      {/* Cinematic vignette */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)' }} />
    </div>
  );
}

// ── Live activity ticker: rotating social-proof messages ──
const ACTIVITY_MESSAGES = [
  { icon: '🏆', text: 'Recent Winner • Sarah M. — Manchester • Patrón Reposado Bundle' },
  { icon: '🥃', text: 'Recent Winner • James D. — Dublin • Clonakilty Single Pot Still' },
  { icon: '✨', text: 'Bushmills Distillery Tour Experience — premium VIP draw open soon' },
  { icon: '🛡️', text: 'Every prize sourced from authorised retailers and independently verified' },
  { icon: '⚖️', text: 'Transparent draws • Independently witnessed • Winners notified within 24 hours' },
];

// ── Bottle spotlight: rotating premium bottle showcase with floating motion ──
const PATRON_SPOTLIGHT_NAMES = ['Patrón Silver', 'Patrón Reposado', 'Patrón Añejo', 'Patrón El Alto', 'Patrón Cristalino'];
const PATRON_TAGLINES = [
  'Win the ultimate Patrón collection',
  'Luxury tequila experiences await',
  'Premium bottles for true collectors',
  'Exclusive tequila prize draws',
];
const CLONAKILTY_SPOTLIGHT_NAMES = ['21 Year Old Single Malt', 'Single Pot Still', 'Cognac Cask Finish', 'Double Oak', 'Port Cask'];
const CLONAKILTY_TAGLINES = [
  'Win the rare Clonakilty 21yo collection',
  'Atlantic-aged Irish whiskey at its finest',
  'Hand-picked single malts for true collectors',
  'A West Cork distillery masterclass',
];

type SpotlightAccent = 'emerald' | 'amber';

interface BottleSpotlightProps {
  bottles: typeof PATRON_BOTTLES;
  accent: SpotlightAccent;
}

function BottleSpotlight({ bottles, accent }: BottleSpotlightProps) {
  const [idx, setIdx] = useState(0);
  const compact = useIsCompactMotion();

  useEffect(() => {
    if (bottles.length <= 1 || compact) return;
    const id = setInterval(() => setIdx(i => (i + 1) % bottles.length), 2800);
    return () => clearInterval(id);
  }, [bottles.length, compact]);

  const bottle = bottles[idx];
  if (!bottle) return null;

  const backdrop = accent === 'emerald'
    ? 'radial-gradient(ellipse at 50% 35%, rgba(52,211,153,0.18) 0%, rgba(120,75,15,0.25) 35%, rgba(10,6,2,0.95) 75%)'
    : 'radial-gradient(ellipse at 50% 35%, rgba(234,146,55,0.22) 0%, rgba(120,75,15,0.28) 35%, rgba(10,6,2,0.95) 75%)';
  const haloPrimary = accent === 'emerald' ? 'bg-emerald-400/15' : 'bg-amber-400/20';
  const haloSecondary = accent === 'emerald' ? 'bg-amber-300/20' : 'bg-amber-500/15';
  const floorRgba = accent === 'emerald' ? 'rgba(52,211,153,0.35)' : 'rgba(234,146,55,0.4)';
  const bottleGlow = accent === 'emerald' ? 'rgba(52,211,153,0.25)' : 'rgba(234,146,55,0.3)';
  const labelAccent = accent === 'emerald' ? 'text-emerald-300/90' : 'text-amber-300/90';
  const dotActive = accent === 'emerald' ? 'bg-emerald-300' : 'bg-amber-300';

  return (
    <div className="absolute inset-0">
      {/* Warm radial backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: backdrop }}
      />
      {/* Gold foil sweep (static on compact/reduced-motion) */}
      {compact ? (
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-screen pointer-events-none"
          style={{ background: 'linear-gradient(120deg, transparent 30%, rgba(252,211,77,0.10) 50%, transparent 70%)' }}
        />
      ) : (
        <motion.div
          aria-hidden
          className="absolute inset-0 mix-blend-screen pointer-events-none"
          style={{ background: 'linear-gradient(120deg, transparent 30%, rgba(252,211,77,0.10) 50%, transparent 70%)' }}
          animate={{ x: ['-30%', '30%'] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
        />
      )}

      {/* Rotating bottle stage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bottle.name}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* Halo behind the bottle */}
          <div className={`absolute inset-x-12 top-1/4 bottom-1/4 ${haloPrimary} blur-3xl rounded-full`} />
          <div className={`absolute inset-x-20 top-1/3 bottom-1/3 ${haloSecondary} blur-3xl rounded-full`} />

          {/* Floating bottle (centered) */}
          <motion.img
            src={bottle.image}
            alt={bottle.name}
            className="relative w-auto h-[70%] max-h-[400px] object-contain mx-auto"
            style={{ filter: `drop-shadow(0 30px 40px rgba(0,0,0,0.7)) drop-shadow(0 0 30px ${bottleGlow})` }}
            animate={compact ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Floor reflection ellipse */}
          <div
            aria-hidden
            className="absolute bottom-[14%] left-1/2 -translate-x-1/2 w-[50%] h-6 rounded-[50%]"
            style={{ background: `radial-gradient(ellipse, ${floorRgba} 0%, transparent 70%)` }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Bottle indicator dots */}
      <div className="absolute bottom-1.5 left-0 right-0 z-10 flex justify-center gap-1.5">
        {bottles.map((_, i) => (
          <span
            key={i}
            className={`block h-1 rounded-full transition-all duration-300 ${i === idx ? `w-5 ${dotActive}` : `w-1 ${dotActive} opacity-30`}`}
          />
        ))}
      </div>
    </div>
  );
}

interface RotatingTaglineProps {
  lines: readonly string[];
  accent: SpotlightAccent;
}

function RotatingTagline({ lines, accent }: RotatingTaglineProps) {
  const compact = useIsCompactMotion();
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (compact) return;
    const id = setInterval(() => setIdx(i => (i + 1) % lines.length), 3500);
    return () => clearInterval(id);
  }, [compact, lines.length]);
  const colorClass = accent === 'emerald' ? 'text-emerald-300' : 'text-primary';
  if (compact) {
    return (
      <p className={`text-[10px] font-serif uppercase tracking-[0.2em] mb-2 ${colorClass}`}>
        {lines[0]}
      </p>
    );
  }
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.4 }}
        className={`text-[10px] font-serif uppercase tracking-[0.2em] mb-2 ${colorClass}`}
      >
        {lines[idx]}
      </motion.p>
    </AnimatePresence>
  );
}

function LiveActivityTicker() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % ACTIVITY_MESSAGES.length), 3800);
    return () => clearInterval(id);
  }, []);
  const msg = ACTIVITY_MESSAGES[index];
  return (
    <div className="mt-6 flex justify-center px-2">
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-card/60 backdrop-blur-md shadow-[0_0_30px_-10px_rgba(234,146,55,0.4)] max-w-full">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="text-[11px] sm:text-xs font-serif text-muted-foreground tracking-wide truncate"
          >
            <span className="mr-1.5">{msg.icon}</span>
            {msg.text}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Home() {
  const [, setLocation] = useLocation();
  const { data: giveaways, isLoading: giveawaysLoading } = useListGiveaways();
  const [slideIndex, setSlideIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Hero slideshow: pure brand showcase using premium collection artwork.
  // Active Draws section (below) handles all the per-draw detail (countdown,
  // progress, bottles, CTA) — kept fully DB-driven via useListGiveaways().
  const heroSlides = useMemo(() => [
    { name: 'The Patrón Collection', image: patronCollectionHero },
    { name: 'The Clonakilty Collection', image: clonakiltyCollectionHero },
    { name: 'Bushmills Distillery Tour Experience', image: bushmillsCollectionHero },
    { name: 'The Macallan Luxury Scotch Collection', image: macallanHeroSlide },
  ], []);

  const goToSlide = (i: number) => {
    const n = heroSlides.length;
    setDirection(i > slideIndex ? 1 : -1);
    setSlideIndex(((i % n) + n) % n);
  };
  const nextSlide = () => goToSlide(slideIndex + 1);
  const prevSlide = () => goToSlide(slideIndex - 1);

  // Gentle auto-advance — 7s. Pauses naturally on tab blur (interval doesn't fire when throttled).
  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1);
      setSlideIndex((i) => (i + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(id);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar onScrollTo={scrollTo} />

      {/* ── Hero / Premium Collection Showcase ── */}
      <section className="relative pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img
            src={heroImg}
            alt=""
            className="w-full h-full object-cover opacity-15"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 24, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          {/* Premium brand intro — clean overlay above the artwork, no draw clutter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-serif text-primary uppercase tracking-[0.25em]">
                Featured Collections
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif leading-tight px-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-200">
                Win Premium Spirits &amp; Luxury Experiences
              </span>
            </h1>
            <p className="mt-4 sm:mt-5 mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed px-2">
              Curated premium whiskey, tequila and distillery experiences for collectors and enthusiasts.
            </p>
            <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-[0.15em] h-12 min-h-[48px] px-6 shadow-[0_8px_30px_-6px_rgba(234,146,55,0.55)]"
                onClick={() => scrollTo('giveaways')}
              >
                View Active Draws <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary/40 hover:border-primary text-foreground hover:text-primary font-semibold uppercase tracking-[0.15em] h-12 min-h-[48px] px-6 bg-card/50 backdrop-blur"
                onClick={() => scrollTo('how-it-works')}
              >
                How It Works
              </Button>
            </div>
            <p className="mt-5 sm:mt-6 text-[11px] sm:text-xs font-serif uppercase tracking-[0.25em] text-amber-200/80 px-2">
              UK-based <span className="text-primary/60 mx-1.5">•</span> Transparent winners <span className="text-primary/60 mx-1.5">•</span> Premium verified prizes
            </p>
          </motion.div>

          {/* Cinematic premium collection slideshow — artwork does the selling */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-primary/15 blur-3xl rounded-full pointer-events-none" />

            <div className="relative bg-black border border-border rounded-sm shadow-2xl overflow-hidden">
              <div className="relative w-full aspect-[3/2] sm:aspect-[16/9]">
                <AnimatePresence initial={false} mode="wait">
                  <motion.img
                    key={slideIndex}
                    src={heroSlides[slideIndex].image}
                    alt={heroSlides[slideIndex].name}
                    className="absolute inset-0 w-full h-full object-contain object-center select-none"
                    draggable={false}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                </AnimatePresence>

                {/* Carousel arrows — overlaid on artwork, subtle so they don't compete */}
                {heroSlides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Previous collection"
                      className="absolute top-1/2 left-2 sm:left-3 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-primary/80 text-white hover:text-primary-foreground border border-white/10 hover:border-primary flex items-center justify-center transition-all duration-200"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Next collection"
                      className="absolute top-1/2 right-2 sm:right-3 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-primary/80 text-white hover:text-primary-foreground border border-white/10 hover:border-primary flex items-center justify-center transition-all duration-200"
                    >
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Carousel dots */}
            {heroSlides.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {heroSlides.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => goToSlide(i)}
                    aria-label={`Show ${s.name}`}
                    className={`rounded-full transition-all duration-300 h-1.5 ${i === slideIndex ? 'bg-primary w-8' : 'bg-primary/30 hover:bg-primary/50 w-2'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-card/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10 sm:mb-12 text-center">
            <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">The Process</p>
            <h2 className="text-3xl sm:text-4xl font-serif mb-4 leading-tight">How It Works</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Three simple steps — built for serious collectors and spirit enthusiasts.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: Compass,
                step: 'Step One',
                title: 'Choose a Collection',
                body: 'Browse curated whiskey, tequila and premium spirit experiences.',
              },
              {
                icon: Lock,
                step: 'Step Two',
                title: 'Secure Your Entry',
                body: 'PrizePour is currently in beta. Entry checkout is disabled while we finalise the platform.',
              },
              {
                icon: Trophy,
                step: 'Step Three',
                title: 'Winner Announced',
                body: 'Winners are selected transparently and prizes are professionally handled.',
              },
            ].map(({ icon: Icon, step, title, body }) => (
              <div
                key={title}
                className="relative bg-card border border-border rounded-sm p-6 sm:p-7 hover:border-primary/40 transition-colors group"
              >
                <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-serif text-primary uppercase tracking-[0.25em]">{step}</span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl mb-2 text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Beta Waitlist ── */}
      <WaitlistSection />

      {/* ── All Draws ── */}
      <section id="giveaways" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10 sm:mb-16">
          <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">Live Raffles</p>
          <h2 className="text-3xl sm:text-4xl font-serif mb-4">Active Draws</h2>
          <p className="text-muted-foreground max-w-xl">
            {giveaways && giveaways.length > 0
              ? `Enter for your chance to win.`
              : 'Check back soon for upcoming draws.'}
          </p>
        </div>

        {giveawaysLoading ? (
          <div className="space-y-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-card border border-border/30 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : !giveaways || giveaways.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-serif text-sm">
            No active draws at the moment. Check back soon.
          </div>
        ) : (
          <div className="space-y-8">
            {giveaways.map((g, idx) => {
              const pct = Math.min((g.entryCount / g.maxEntries) * 100, 100);
              const remaining = g.maxEntries - g.entryCount;
              const bottles = getGiveawayBottles(g.id);
              return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="bg-card border border-border rounded-sm overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
                >
                  {/* Top: premium collection hero image (preferred) or bottle gallery strip (fallback) */}
                  {(() => {
                    const hero = getCollectionHero(g.name);
                    if (hero) {
                      return (
                        <div className="relative w-full overflow-hidden bg-black aspect-[3/2] sm:aspect-[16/10] flex items-center justify-center">
                          <img
                            src={hero}
                            alt={`${g.name} — premium collection artwork`}
                            className="w-full h-full object-contain object-center"
                            loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      );
                    }
                    if (bottles.length === 0) return null;
                    const maxDesktop = 6;
                    const maxMobile = 4;
                    const desktopBottles = bottles.slice(0, maxDesktop);
                    const mobileBottles = bottles.slice(0, maxMobile);
                    const moreDesktop = bottles.length - desktopBottles.length;
                    const moreMobile = bottles.length - mobileBottles.length;
                    const renderStrip = (items: typeof bottles, more: number) => (
                      <div className="flex gap-px bg-border/30 h-44 sm:h-52 lg:h-60">
                        {items.map((bottle, i) => (
                          <div
                            key={i}
                            className="flex-1 min-w-0 relative overflow-hidden group/bottle cursor-pointer"
                            style={{ background: bottle.background }}
                          >
                            <div
                              className="absolute inset-0 opacity-0 group-hover/bottle:opacity-100 transition-opacity duration-500 pointer-events-none"
                              style={{ background: g.id === 2
                                ? 'radial-gradient(ellipse at 50% 45%, rgba(52,211,153,0.30) 0%, transparent 65%)'
                                : 'radial-gradient(ellipse at 50% 45%, rgba(234,146,55,0.28) 0%, transparent 65%)'
                              }}
                            />
                            <img
                              src={bottle.image}
                              alt={bottle.name}
                              className="relative w-full h-full object-contain p-2 sm:p-3 opacity-85 group-hover/bottle:opacity-100 group-hover/bottle:scale-110 group-hover/bottle:-translate-y-1 transition-all duration-500"
                              style={{ filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.6))' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-1 sm:p-2 text-center">
                              <p className="text-[9px] text-white/60 leading-tight line-clamp-1 group-hover/bottle:text-white transition-colors">{bottle.name}</p>
                            </div>
                          </div>
                        ))}
                        {more > 0 && (
                          <div className="flex-none w-20 sm:w-24 flex items-center justify-center bg-card/40">
                            <span className="text-[10px] font-serif text-primary/80 uppercase tracking-widest text-center px-2">+{more}<br/>more</span>
                          </div>
                        )}
                      </div>
                    );
                    return (
                      <>
                        <div className="sm:hidden">{renderStrip(mobileBottles, moreMobile)}</div>
                        <div className="hidden sm:block">{renderStrip(desktopBottles, moreDesktop)}</div>
                      </>
                    );
                  })()}

                  {/* Bottom: details panel */}
                  <div className="p-5 sm:p-7 lg:p-8 flex flex-col gap-5 sm:gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-serif text-primary uppercase tracking-widest">Prize Selection</span>
                        <h3 className="text-xl sm:text-3xl font-serif mt-2 mb-1 break-words leading-tight">{g.name}</h3>
                        <p className="text-2xl sm:text-4xl font-serif text-primary break-words leading-tight">{g.prizeValue}</p>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{g.description}</p>

                      <BottleList bottles={bottles} />
                    </div>

                    <div className="space-y-5 sm:space-y-6">
                      <div>
                        <div className="flex justify-between items-center text-xs font-serif mb-2 gap-2">
                          <span className="text-muted-foreground truncate">{g.entryCount} / {g.maxEntries} sold</span>
                          <span className={`shrink-0 ${remaining <= 20 ? 'text-red-400' : 'text-primary'}`}>{remaining} left</span>
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

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <CountdownTimer daysToAdd={daysUntil(g.drawDate)} />
                        <div className="flex items-center gap-2 text-xs font-serif text-muted-foreground">
                          <Ticket className="w-3.5 h-3.5 text-primary" />
                          {pct.toFixed(0)}% sold
                        </div>
                      </div>

                      <Button
                        size="lg"
                        className="w-full h-14 min-h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest text-xs sm:text-sm font-serif px-4 sm:px-6"
                        onClick={() => setLocation(g.name === 'Bushmills Distillery Tour Experience' ? '/experiences/bushmills' : `/giveaway/${g.id}`)}
                      >
                        <span className="truncate">Preview Giveaway</span>
                      </Button>
                      <p className="text-center text-[10px] font-serif uppercase tracking-[0.25em] text-muted-foreground -mt-1">
                        Secure <span className="text-primary/60 mx-1">•</span> Transparent <span className="text-primary/60 mx-1">•</span> Beta Preview
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>


      {/* ── Why PrizePour ── */}
      <section className="py-16 sm:py-24 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div>
            <div className="mb-10 sm:mb-12 text-center">
              <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">Why Us</p>
              <h2 className="text-3xl sm:text-4xl font-serif mb-4 sm:mb-6 leading-tight">Transparent Draws. Premium Prizes. No Shortcuts.</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                PrizePour was built by enthusiasts for enthusiasts. We source direct from authorised retailers — no grey-market prizes, ever. Every draw is independently verified and every winner notified within 24 hours.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                {[
                  { icon: Lock, title: 'Cryptographic Draws', body: 'Winners selected by auditable RNG — no human involvement possible.' },
                  { icon: ShieldCheck, title: 'Verified Prizes', body: 'Every prize sourced from authorised retailers and checked before entering the draw.' },
                  { icon: Package, title: 'Fully Insured Shipping', body: 'Door-to-door tracked shipping with full replacement value covered.' },
                  { icon: Users, title: 'Community of Enthusiasts', body: 'Join collectors and spirits lovers who take their passion seriously.' },
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
        </div>
      </section>

      {/* ── About / FAQ ── */}
      <section id="about" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">About PrizePour</p>
          <h2 className="text-3xl sm:text-4xl font-serif mb-4">Frequently Asked Questions</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">Everything you need to know before entering your first draw.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-sm px-5 sm:px-6 data-[state=open]:border-primary/40 transition-colors"
              >
                <AccordionTrigger className="font-serif text-base sm:text-lg text-foreground hover:text-primary hover:no-underline py-5 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-10 sm:mt-16">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider min-h-[48px]" onClick={() => scrollTo('giveaways')}>
            Browse Active Draws
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
