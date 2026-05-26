import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CountdownTimer } from '@/components/giveaway/CountdownTimer';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ShieldCheck, Users, Ticket, Lock, Package, ChevronDown, ChevronUp } from 'lucide-react';
import heroImg from '@/assets/images/hero.png';
import bushmillsHeroImg from '@/assets/images/bushmills-hero.png';
import { getGiveawayImage, daysUntil, getGiveawayBottles, PATRON_BOTTLES, COLLECTION_BOTTLES } from '@/data/giveaways';
import { useListGiveaways } from '@workspace/api-client-react';


const FAQS = [
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
  const COLLAPSED = 6;
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
            <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>Show all {bottles.length} bottles (+{hiddenCount}) <ChevronDown className="w-3.5 h-3.5" /></>
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
  { icon: '🥃', text: 'John from Belfast just entered the Clonakilty draw' },
  { icon: '⚡', text: '15 tickets sold in the last hour' },
  { icon: '🌵', text: 'Sarah from Manchester won the Patrón Reposado bundle' },
  { icon: '🏆', text: 'Over £42,000 in prizes awarded this year' },
  { icon: '🎟️', text: 'James from Dublin just bought 5 tickets' },
  { icon: '✨', text: 'Bushmills Distillery Tour — only 215 tickets left' },
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
  const [showBanner, setShowBanner] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Synthetic Bushmills entry surfaced in the featured rotation only (not API-backed).
  const BUSHMILLS_ID = -1;
  const bushmillsFeatured = useMemo(() => ({
    id: BUSHMILLS_ID,
    name: 'Bushmills Distillery Tour Experience',
    prizeValue: 'Worth Over £2,000',
    description: 'A private distillery tour, rare expression tasting, two nights at the historic Bushmills Inn, and a curated four-bottle take-home collection — for two, on the Causeway Coast.',
    imageUrl: bushmillsHeroImg,
    entryCount: 487,
    maxEntries: 702,
    drawDate: new Date(Date.now() + 72 * 24 * 60 * 60 * 1000).toISOString(),
  }), []);

  const featuredGiveaways = useMemo(
    () => (giveaways ? [bushmillsFeatured, ...giveaways] : [bushmillsFeatured]),
    [giveaways, bushmillsFeatured],
  );

  useEffect(() => {
    const t = setTimeout(() => setShowBanner(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const goToSlide = (i: number) => {
    setDirection(i > featuredIndex ? 1 : -1);
    setFeaturedIndex(((i % featuredGiveaways.length) + featuredGiveaways.length) % featuredGiveaways.length);
  };
  const nextSlide = () => goToSlide(featuredIndex + 1);
  const prevSlide = () => goToSlide(featuredIndex - 1);

  const featured = featuredGiveaways[featuredIndex];
  const isBushmillsFeatured = featured?.id === BUSHMILLS_ID;
  const isPatronFeatured = featured?.id === 2;
  const isClonakiltyFeatured = featured?.id === 1;
  const hasSpotlight = isPatronFeatured || isClonakiltyFeatured;
  const spotlightBottles = isPatronFeatured
    ? PATRON_BOTTLES.filter(b => PATRON_SPOTLIGHT_NAMES.includes(b.name))
    : isClonakiltyFeatured
      ? COLLECTION_BOTTLES.filter(b => CLONAKILTY_SPOTLIGHT_NAMES.includes(b.name))
      : [];
  const spotlightTaglines = isPatronFeatured ? PATRON_TAGLINES : isClonakiltyFeatured ? CLONAKILTY_TAGLINES : [];
  const spotlightAccent: SpotlightAccent = isPatronFeatured ? 'emerald' : 'amber';
  const accent: 'amber' | 'emerald' = isPatronFeatured ? 'emerald' : 'amber';
  const accentText = isPatronFeatured ? 'text-emerald-300' : 'text-primary';
  const accentBorder = isPatronFeatured ? 'border-emerald-400/40' : 'border-primary/30';
  const accentDot = isPatronFeatured ? 'bg-emerald-400' : 'bg-primary';
  const accentBgSoft = isPatronFeatured ? 'bg-emerald-500/10' : 'bg-primary/10';
  const remainingTickets = featured ? featured.maxEntries - featured.entryCount : 0;
  const isUrgent = remainingTickets > 0 && remainingTickets <= 50;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center py-3 sm:py-5 px-4 sm:px-6"
            style={{ background: 'linear-gradient(135deg, #3d1a05 0%, #1c0c03 100%)', borderBottom: '2px solid #ea9237' }}
          >
            <div className="text-center">
              <p className="font-serif text-[10px] sm:text-xs tracking-widest text-amber-500/70 uppercase mb-1">Draw Status</p>
              <p className="font-serif text-xl sm:text-3xl md:text-5xl text-amber-400 tracking-wide">No Active Draws</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar onScrollTo={scrollTo} />

      {/* ── Hero / Featured Draw ── */}
      <section className="relative pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img
            src={heroImg}
            alt=""
            className="w-full h-full object-cover opacity-20"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 24, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </div>
        <CinematicBackdrop accent={accent} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${accentBorder} ${accentBgSoft} mb-4 transition-colors duration-700`}>
              <span className={`w-2 h-2 rounded-full ${accentDot} animate-pulse`} />
              <span className={`text-[10px] font-serif ${accentText} uppercase tracking-[0.2em]`}>
                {isPatronFeatured ? 'Featured Tequila Draw' : 'Featured Draw'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif leading-tight px-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-200">Premium Spirit Giveaways</span>
            </h1>
            <p className="mt-4 sm:mt-5 mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed px-2">
              Exciting giveaways of premium spirits, exclusive distillery tours, professional bar equipment and more...
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-primary/15 blur-3xl rounded-full pointer-events-none" />

            <div className="relative bg-card/70 backdrop-blur border border-border rounded-sm shadow-2xl overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={featuredIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="grid lg:grid-cols-5"
                >
                  {/* ── Image (3/5) — taller on mobile so badges + bottle + title don't collide ── */}
                  <div className="lg:col-span-3 relative min-h-[460px] sm:min-h-[480px] lg:min-h-[520px] lg:aspect-auto overflow-hidden bg-black">
                    {hasSpotlight ? (
                      <BottleSpotlight bottles={spotlightBottles} accent={spotlightAccent} />
                    ) : featured && getGiveawayImage(featured.id, featured.imageUrl) ? (
                      <img
                        src={getGiveawayImage(featured.id, featured.imageUrl)}
                        alt={featured?.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/60 to-black flex items-center justify-center">
                        <Package className="w-24 h-24 text-primary/40" />
                      </div>
                    )}
                    {!hasSpotlight && <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />}
                    <div className="absolute inset-0 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-card/95" />

                    {/* Top badges — stack on mobile so left + right groups never collide */}
                    <div className="absolute top-4 sm:top-4 left-4 sm:left-4 right-4 sm:right-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-2 z-10">
                      <div className="flex flex-col gap-2 items-start min-w-0">
                        <span className={`text-primary-foreground text-[10px] font-serif uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm shadow-lg ${isPatronFeatured ? 'bg-emerald-500' : 'bg-primary'}`}>
                          Live Draw
                        </span>
                        {isUrgent ? (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: [1, 1.05, 1] }}
                            transition={{ scale: { duration: 1.4, repeat: Infinity } }}
                            className="bg-red-600/95 text-white text-[10px] font-serif uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm shadow-lg border border-red-300/40 max-w-full truncate"
                          >
                            Only {remainingTickets} Tickets Left
                          </motion.span>
                        ) : (
                          <span className="bg-black/70 backdrop-blur text-white/90 text-[10px] font-serif uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm border border-white/10 max-w-full truncate">
                            {isBushmillsFeatured ? 'VIP Experience Draw' : 'Limited Entries'}
                          </span>
                        )}
                      </div>
                      {featured && (
                        <span className="self-start sm:self-auto bg-black/70 backdrop-blur text-white text-[10px] font-serif uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm border border-white/10 max-w-full truncate">
                          {isBushmillsFeatured
                            ? 'Luxury Experience'
                            : isPatronFeatured
                              ? `${getGiveawayBottles(featured.id).length} Patrón Bottles`
                              : `${getGiveawayBottles(featured.id).length} Bottles`}
                        </span>
                      )}
                    </div>

                    {/* Bottom name on mobile — gradient scrim for guaranteed contrast */}
                    {featured && (
                      <div className="absolute bottom-0 left-0 right-0 px-5 pt-10 pb-6 sm:p-6 lg:hidden bg-gradient-to-t from-black via-black/75 to-transparent">
                        <p className="text-[10px] font-serif text-primary uppercase tracking-[0.2em] mb-3">Win The Special Collection</p>
                        <h2 className="text-lg sm:text-2xl font-serif text-white leading-snug break-words">{featured.name}</h2>
                      </div>
                    )}
                  </div>

                  {/* ── Info (2/5) — generous mobile padding + spacing ── */}
                  <div className="lg:col-span-2 px-6 py-8 sm:p-6 lg:p-8 flex flex-col justify-between gap-8 sm:gap-6 bg-card/95">
                    <div className="space-y-7 sm:space-y-4">
                      <div className="hidden lg:block">
                        {hasSpotlight
                          ? <RotatingTagline lines={spotlightTaglines} accent={spotlightAccent} />
                          : <p className="text-[10px] font-serif text-primary uppercase tracking-[0.2em] mb-2">Win The Special Collection</p>}
                        <h2 className="text-2xl sm:text-3xl xl:text-4xl font-serif text-white leading-tight break-words">{featured?.name}</h2>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 pt-4 sm:pt-2 border-t border-border/40 min-w-0">
                        <span className="text-[10px] font-serif text-muted-foreground uppercase tracking-[0.2em] shrink-0">Prize Value</span>
                        <span className="text-2xl sm:text-2xl lg:text-4xl font-serif text-primary break-words leading-tight">{featured?.prizeValue}</span>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{featured?.description}</p>
                    </div>

                    {/* Progress + countdown */}
                    {featured && (() => {
                      const pct = Math.min((featured.entryCount / featured.maxEntries) * 100, 100);
                      const remaining = featured.maxEntries - featured.entryCount;
                      return (
                        <div className="space-y-6 sm:space-y-4">
                          <div>
                            <div className="flex justify-between items-center text-[11px] font-serif mb-2 sm:mb-1.5 gap-3">
                              <span className="text-muted-foreground uppercase tracking-widest truncate">{featured.entryCount} / {featured.maxEntries} sold</span>
                              <span className={`shrink-0 ${remaining <= 20 ? 'text-red-400' : 'text-primary'}`}>{remaining} left</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                key={featuredIndex}
                                className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : 'bg-primary'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.9, ease: 'easeOut' }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-3 pt-4 sm:pt-2 border-t border-border/40">
                            <div className="min-w-0">
                              <p className="text-[9px] font-serif text-muted-foreground uppercase tracking-[0.2em] mb-1">Draw Ends In</p>
                              <CountdownTimer daysToAdd={daysUntil(featured.drawDate)} />
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-serif text-muted-foreground uppercase tracking-[0.2em] mb-1">Entry</p>
                              <p className="text-lg sm:text-xl font-serif text-white">£4.99</p>
                            </div>
                          </div>

                          <div className="relative">
                            <motion.div
                              aria-hidden
                              className={`absolute -inset-1 rounded-md blur-md ${isPatronFeatured ? 'bg-emerald-500/60' : 'bg-primary/60'}`}
                              animate={{ opacity: [0.35, 0.75, 0.35] }}
                              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <Button
                              size="lg"
                              className={`relative w-full text-primary-foreground font-semibold uppercase tracking-[0.15em] h-14 min-h-[52px] shadow-[0_8px_30px_-6px_rgba(234,146,55,0.55)] hover:translate-y-[-1px] transition-transform ${isPatronFeatured ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-primary hover:bg-primary/90'}`}
                              onClick={() => setLocation(isBushmillsFeatured ? '/experiences/bushmills' : `/giveaway/${featured.id}`)}
                            >
                              Buy Tickets — Enter Now <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Carousel arrows (overlay on slide) */}
            {featuredGiveaways.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous featured draw"
                  className="absolute top-[22%] sm:top-1/2 left-2 sm:left-3 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-transparent hover:bg-primary/80 text-white hover:text-primary-foreground border border-transparent hover:border-primary flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next featured draw"
                  className="absolute top-[22%] sm:top-1/2 right-2 sm:right-3 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-transparent hover:bg-primary/80 text-white hover:text-primary-foreground border border-transparent hover:border-primary flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}

            {/* Carousel dots */}
            {featuredGiveaways.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {featuredGiveaways.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    aria-label={`Show featured draw ${i + 1}`}
                    className={`rounded-full transition-all duration-300 h-1.5 ${i === featuredIndex ? 'bg-primary w-8' : 'bg-primary/30 hover:bg-primary/50 w-2'}`}
                  />
                ))}
              </div>
            )}

            <LiveActivityTicker />

            <div className="flex justify-center mt-4">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary text-xs font-serif uppercase tracking-[0.2em]" onClick={() => scrollTo('giveaways')}>
                View All Draws <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

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
            {/* ── Bushmills Distillery Tour Experience (featured static card) ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card border border-primary/40 rounded-sm overflow-hidden grid lg:grid-cols-2 hover:border-primary/70 transition-colors group"
            >
              <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[440px] overflow-hidden">
                <img
                  src={bushmillsHeroImg}
                  alt="Bushmills Distillery at golden hour"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/60 bg-background/80 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-serif text-primary uppercase tracking-[0.25em]">Featured Experience</span>
                </div>
              </div>

              <div className="p-5 sm:p-8 lg:p-10 flex flex-col justify-between gap-6 sm:gap-8">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-serif text-primary uppercase tracking-widest">Luxury Whiskey Getaway</span>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-serif mt-2 mb-1 break-words leading-tight">
                      Bushmills Distillery Tour Experience
                    </h3>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-primary break-words leading-tight">Worth Over £2,000</p>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    A private distillery tour, rare expression tasting, two nights at the historic Bushmills Inn,
                    and a curated four-bottle take-home collection — for two, on the Causeway Coast.
                  </p>

                  <div className="space-y-1.5 pt-2">
                    {[
                      'Guided Bushmills Distillery Tour',
                      'Premium Whiskey Tasting Flight',
                      'Two Nights at Bushmills Inn',
                      'Exclusive 4-Bottle Bushmills Collection',
                      'VIP Chauffeur Transport',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center text-xs font-serif py-1 border-b border-border/30 last:border-0">
                        <span className="text-foreground/70">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <div className="flex justify-between items-center text-xs font-serif mb-2 gap-2">
                      <span className="text-muted-foreground truncate">487 / 702 sold</span>
                      <span className="shrink-0 text-primary">215 left</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        whileInView={{ width: '69%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CountdownTimer daysToAdd={72} />
                    <div className="flex items-center gap-2 text-xs font-serif text-muted-foreground">
                      <Ticket className="w-3.5 h-3.5 text-primary" />
                      69% sold
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-14 min-h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest text-xs sm:text-sm font-serif px-3"
                    onClick={() => setLocation('/experiences/bushmills')}
                  >
                    <span className="truncate">Enter the Draw — From £4.99</span>
                  </Button>
                </div>
              </div>
            </motion.div>

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
                  className="bg-card border border-border rounded-sm overflow-hidden grid lg:grid-cols-2 hover:border-primary/40 transition-colors"
                >
                  {/* Left: bottle grid — cap columns on mobile so bottles don't shrink to nothing */}
                  {(() => {
                    if (bottles.length === 0) return null;
                    const desktopRowSize = Math.max(1, Math.ceil(bottles.length / 2));
                    const mobileMaxCols = 4;
                    const mobileRowSize = Math.max(1, Math.min(desktopRowSize, mobileMaxCols));
                    const mobileRows: typeof bottles[] = [];
                    for (let i = 0; i < bottles.length; i += mobileRowSize) {
                      mobileRows.push(bottles.slice(i, i + mobileRowSize));
                    }
                    const desktopRows = [bottles.slice(0, desktopRowSize), bottles.slice(desktopRowSize)];
                    const renderRows = (rows: typeof bottles[], rowSize: number) => (
                      <>
                        {rows.map((row, rowIdx) => (
                          <div key={rowIdx} className="flex gap-px justify-center">
                            {row.map((bottle, i) => (
                              <div
                                key={i}
                                className="aspect-[3/4] relative overflow-hidden group/bottle flex-none cursor-pointer"
                                style={{ background: bottle.background, width: `${100 / rowSize}%` }}
                              >
                                {/* Glow halo on hover */}
                                <div className={`absolute inset-0 opacity-0 group-hover/bottle:opacity-100 transition-opacity duration-500 pointer-events-none ${g.id === 2 ? 'bg-gradient-radial' : ''}`}
                                  style={{ background: g.id === 2
                                    ? 'radial-gradient(ellipse at 50% 45%, rgba(52,211,153,0.30) 0%, transparent 65%)'
                                    : 'radial-gradient(ellipse at 50% 45%, rgba(234,146,55,0.28) 0%, transparent 65%)'
                                  }}
                                />
                                <img
                                  src={bottle.image}
                                  alt={bottle.name}
                                  className="relative w-full h-full object-contain p-1 sm:p-2 opacity-85 group-hover/bottle:opacity-100 group-hover/bottle:scale-110 group-hover/bottle:-translate-y-1 transition-all duration-500"
                                  style={{ filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.6))' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-1 sm:p-2 text-center">
                                  <p className="text-[9px] text-white/60 leading-tight line-clamp-1 group-hover/bottle:text-white transition-colors">{bottle.name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </>
                    );
                    return (
                      <>
                        <div className="flex flex-col gap-px bg-border/30 sm:hidden">
                          {renderRows(mobileRows, mobileRowSize)}
                        </div>
                        <div className="hidden sm:flex flex-col gap-px bg-border/30">
                          {renderRows(desktopRows, desktopRowSize)}
                        </div>
                      </>
                    );
                  })()}

                  {/* Right: info panel */}
                  <div className="p-5 sm:p-8 lg:p-10 flex flex-col justify-between gap-6 sm:gap-8">
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-serif text-primary uppercase tracking-widest">Prize Selection</span>
                        <h3 className="text-2xl sm:text-3xl font-serif mt-2 mb-1 break-words">{g.name}</h3>
                        <p className="text-3xl sm:text-4xl font-serif text-primary">{g.prizeValue}</p>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{g.description}</p>

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
                        className="w-full h-14 min-h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest text-xs sm:text-sm font-serif px-3"
                        onClick={() => setLocation(`/giveaway/${g.id}`)}
                      >
                        <span className="truncate">Enter the Draw — From £2.99</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">The Process</p>
            <h2 className="text-3xl sm:text-4xl font-serif mb-4">Simple. Transparent. Fair.</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">Every draw follows the same iron-clad process, independently verified at each step.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              { icon: Ticket, step: '1', title: 'Secure Entry', body: 'Choose your prize and secure your entries. Each draw has a strict capacity limit to protect your odds.' },
              { icon: ShieldCheck, step: '2', title: 'Verified Draw', body: 'Winners are selected via a cryptographically secure RNG upon timer expiry, independently witnessed and recorded.' },
              { icon: Package, step: '3', title: 'Doorstep Delivery', body: 'Your prize is professionally packed with full insurance and shipped tracked to your door. Duties covered.' },
            ].map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="text-center space-y-4 relative">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center relative">
                  <Icon className="w-8 h-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-serif flex items-center justify-center">{step}</span>
                </div>
                <h3 className="text-xl font-serif">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why PrizePour ── */}
      <section className="py-16 sm:py-24 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div>
            <div className="mb-10 sm:mb-12 text-center">
              <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">Why Us</p>
              <h2 className="text-3xl sm:text-4xl font-serif mb-4 sm:mb-6 leading-tight">The collector's edge you've been looking for.</h2>
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

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-sm p-5 sm:p-6"
            >
              <h4 className="font-serif text-base sm:text-lg mb-3 text-foreground">{faq.q}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
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
