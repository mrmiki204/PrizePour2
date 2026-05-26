import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Ticket,
  ShieldCheck,
  MapPin,
  Wine,
  BedDouble,
  Sparkles,
  Car,
  Check,
  ChevronDown,
  Calendar,
  Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CountdownTimer } from '@/components/giveaway/CountdownTimer';
import { useToast } from '@/hooks/use-toast';

import bushmillsHero from '@/assets/images/bushmills-hero.png';
import bushmillsStills from '@/assets/images/bushmills-stills.png';
import bushmillsTasting from '@/assets/images/bushmills-tasting.png';
import bushmillsSuite from '@/assets/images/bushmills-suite.png';
import bushmillsBottles from '@/assets/images/bushmills-bottles.png';

const PRIZE_VALUE_GBP = 2500;
const TICKET_PRICE = 4.99;
const MAX_ENTRIES = Math.ceil((PRIZE_VALUE_GBP * 1.4) / TICKET_PRICE); // 702
const ENTRIES_SOLD = 487;
const ENTRIES_REMAINING = MAX_ENTRIES - ENTRIES_SOLD;
const DAYS_UNTIL_DRAW = 72;
const DRAW_DATE_LABEL = '1 August 2026';

const PACKAGES = [
  { qty: 1, price: 4.99, label: 'Single', perTicket: 4.99 },
  { qty: 5, price: 19.99, label: 'Taster', perTicket: 4.0, save: 5.0 },
  { qty: 10, price: 39.99, label: 'Connoisseur', perTicket: 4.0, save: 9.91, popular: true },
  { qty: 25, price: 89.99, label: 'Collector', perTicket: 3.6, save: 34.76 },
];

const INCLUDED = [
  {
    icon: MapPin,
    title: 'Guided Distillery Tour',
    body: 'A private behind-the-scenes tour of the historic Bushmills Distillery, led by a master distiller. See the gleaming copper stills, the bonded warehouses, and the centuries-old craft up close.',
  },
  {
    icon: Wine,
    title: 'Premium Whiskey Tasting',
    body: 'A curated flight of four rare expressions — including the 21-Year-Old Madeira Cask Single Malt — paired with artisan Irish cheeses and chocolate, hosted in the private tasting room.',
  },
  {
    icon: BedDouble,
    title: 'Two-Night Stay at Bushmills Inn',
    body: 'Overnight stay for two in a luxury countryside suite at the historic Bushmills Inn. Full Irish breakfast, evening dining in the gas-lit restaurant, and access to the private library lounge.',
  },
  {
    icon: Sparkles,
    title: 'Exclusive 4-Bottle Collection',
    body: 'Take home a curated collection of four Bushmills bottles — Original, Black Bush, 16-Year-Old, and the prized 21-Year-Old Single Malt. Worth over £400 alone.',
  },
  {
    icon: Car,
    title: 'VIP Transport & Itinerary',
    body: 'Private chauffeur transfer between Belfast and Bushmills, plus a curated Causeway Coast itinerary including the Giant\'s Causeway and Carrick-a-Rede rope bridge.',
  },
];

const GALLERY = [
  { src: bushmillsStills, alt: 'Copper pot stills inside the distillery', caption: 'The historic stillhouse' },
  { src: bushmillsTasting, alt: 'Whiskey tasting flight', caption: 'Private tasting room' },
  { src: bushmillsSuite, alt: 'Luxury suite at Bushmills Inn', caption: 'Bushmills Inn — countryside suite' },
  { src: bushmillsBottles, alt: 'Bushmills bottle collection', caption: 'Take-home bottle collection' },
];

const FAQS = [
  {
    q: 'When does the experience take place?',
    a: 'The winner can redeem their experience any weekend between September 2026 and September 2027, subject to availability. We\'ll coordinate dates directly with you after the draw.',
  },
  {
    q: 'Can I bring a guest?',
    a: 'Absolutely. The package is designed for two — both the distillery tour, the tasting, and the two-night stay at Bushmills Inn are for the winner plus one guest aged 18 or over.',
  },
  {
    q: 'What\'s included in the bottle collection?',
    a: 'A hand-selected four-bottle Bushmills set: Original, Black Bush, 16-Year-Old Three-Wood, and the prized 21-Year-Old Madeira Cask Single Malt — shipped insured and tracked to your door.',
  },
  {
    q: 'How are winners chosen?',
    a: 'On the draw close date, a winner is selected via a cryptographically secure, independently verifiable random number generator. The draw is broadcast live and recorded. Every ticket has equal odds.',
  },
  {
    q: 'What if I can\'t travel to Northern Ireland?',
    a: 'The bottle collection is yours regardless. If travel isn\'t possible, we can substitute the travel components for an equivalent gift voucher (up to £1,200) — discussed directly with the winner.',
  },
  {
    q: 'Is travel from outside the UK included?',
    a: 'Domestic UK ground transport is included. International winners can opt for a £400 flight credit to cover travel to Belfast in lieu of the chauffeur transfer.',
  },
];

export function BushmillsExperience() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[2]); // Connoisseur default
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState('');

  const pctSold = Math.min((ENTRIES_SOLD / MAX_ENTRIES) * 100, 100);

  function handleReserve() {
    toast({
      title: 'Tickets reserved',
      description: `${selectedPackage.qty} ticket${selectedPackage.qty === 1 ? '' : 's'} held for 15 minutes. We'll email you a checkout link to complete payment.`,
    });
  }

  function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    toast({
      title: 'You\'re on the list',
      description: `We'll email ${email} the moment new tickets open.`,
    });
    setEmail('');
  }

  function scrollToTickets() {
    document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={bushmillsHero} alt="" className="w-full h-full object-cover opacity-40" loading="eager" />
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
                  Featured Experience · Limited Tickets
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.05]">
                Win the Ultimate{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-300 via-primary to-amber-700">
                  Bushmills
                </span>{' '}
                Whiskey Experience
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                A luxury Irish whiskey getaway for two on the wild Causeway Coast. Private distillery tour,
                rare expression tasting, two nights at the historic Bushmills Inn, and a four-bottle take-home
                collection — including the prized 21-Year-Old Single Malt.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={scrollToTickets}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-[0.15em] text-sm h-12 min-h-[48px] px-6"
                >
                  Enter the Draw <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('included')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-primary/40 hover:border-primary text-foreground font-serif uppercase tracking-[0.15em] text-sm h-12 min-h-[48px] px-6"
                >
                  See What's Included
                </Button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 max-w-xl">
                <div>
                  <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-1">Prize Value</p>
                  <p className="text-lg sm:text-2xl font-serif text-primary break-words leading-tight">£{PRIZE_VALUE_GBP.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-1">Per Ticket</p>
                  <p className="text-lg sm:text-2xl font-serif text-foreground break-words leading-tight">£{TICKET_PRICE.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest mb-1">Remaining</p>
                  <p className={`text-lg sm:text-2xl font-serif break-words leading-tight ${ENTRIES_REMAINING < 50 ? 'text-red-400' : 'text-foreground'}`}>
                    {ENTRIES_REMAINING}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right: stats card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-2"
            >
              <div className="bg-card/95 backdrop-blur-sm border border-primary/30 rounded-sm overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src={bushmillsHero} alt="Bushmills Distillery" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <p className="text-[10px] font-serif text-primary uppercase tracking-[0.25em] mb-1">County Antrim, Ireland</p>
                    <p className="font-serif text-xl sm:text-2xl text-white">Bushmills Distillery Tour Experience</p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  <div>
                    <div className="flex justify-between items-center text-xs font-serif mb-2">
                      <span className="text-muted-foreground">{ENTRIES_SOLD} / {MAX_ENTRIES} tickets sold</span>
                      <span className={ENTRIES_REMAINING < 50 ? 'text-red-400' : 'text-primary'}>
                        {ENTRIES_REMAINING} remaining
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${pctSold >= 90 ? 'bg-red-500' : 'bg-primary'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pctSold}%` }}
                        transition={{ duration: 1.4, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-3 pt-3 border-t border-border/60">
                    <div>
                      <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-[0.25em] mb-1">Draw Ends In</p>
                      <CountdownTimer daysToAdd={DAYS_UNTIL_DRAW} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-serif text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{DRAW_DATE_LABEL}</span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={scrollToTickets}
                    className="w-full h-12 min-h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-[0.15em] text-sm"
                  >
                    Reserve Your Tickets <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section id="included" className="py-16 sm:py-24 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">The Prize Package</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4">What's Included</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every element of this experience has been curated for the discerning whiskey enthusiast.
              Worth over £{PRIZE_VALUE_GBP.toLocaleString()}, no detail overlooked.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {INCLUDED.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group relative bg-background/60 border border-border hover:border-primary/40 rounded-sm p-6 sm:p-7 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(234,146,55,0.25)]"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full" />
                  <div className="relative space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm border border-primary/30 bg-primary/10 text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px bg-border flex-1" />
          <p className="text-xs font-serif text-primary uppercase tracking-widest px-2 sm:px-4 text-center">Inside the Experience</p>
          <div className="h-px bg-border flex-1" />
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-center mb-10 sm:mb-14 px-2">
          A glimpse of what awaits
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {GALLERY.map((img, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-sm bg-card border border-border group ${
                i === 0 ? 'sm:col-span-2 aspect-[16/9]' : 'aspect-[4/3]'
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <figcaption className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <p className="text-[10px] font-serif text-primary uppercase tracking-[0.25em] mb-1">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="font-serif text-base sm:text-lg text-white">{img.caption}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* ── TICKET PURCHASE ── */}
      <section id="tickets" className="py-16 sm:py-24 bg-gradient-to-b from-card via-background to-card border-y border-border scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
            <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">Choose Your Tickets</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4">Reserve Your Spot</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Bundle up for better value. More tickets, better odds — at just £{TICKET_PRICE.toFixed(2)} each.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
            {PACKAGES.map((pkg) => {
              const isSelected = selectedPackage.qty === pkg.qty;
              return (
                <button
                  key={pkg.qty}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`group relative p-4 sm:p-6 rounded-sm border-2 text-left transition-all min-h-[140px] ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-[0_0_30px_-10px_rgba(234,146,55,0.4)]'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-serif uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                  <p className="text-[10px] font-serif text-primary uppercase tracking-[0.2em] mb-2">{pkg.label}</p>
                  <p className="font-serif text-2xl sm:text-3xl text-foreground mb-1">
                    {pkg.qty} <span className="text-sm text-muted-foreground">ticket{pkg.qty === 1 ? '' : 's'}</span>
                  </p>
                  <p className="font-serif text-lg sm:text-xl text-primary mb-2">£{pkg.price.toFixed(2)}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-serif">
                    £{pkg.perTicket.toFixed(2)} / ticket
                    {pkg.save !== undefined && (
                      <span className="block text-green-400 mt-0.5">Save £{pkg.save.toFixed(2)}</span>
                    )}
                  </p>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Summary + CTA */}
          <div className="bg-card border border-primary/30 rounded-sm p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-serif text-muted-foreground uppercase tracking-widest mb-1">Your Order</p>
                <p className="font-serif text-xl sm:text-2xl">
                  {selectedPackage.qty} ticket{selectedPackage.qty === 1 ? '' : 's'} ·{' '}
                  <span className="text-primary">£{selectedPackage.price.toFixed(2)}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-serif text-muted-foreground uppercase tracking-widest mb-1">Your Odds</p>
                <p className="font-serif text-base sm:text-lg text-foreground">
                  1 in {Math.round(MAX_ENTRIES / selectedPackage.qty).toLocaleString()}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleReserve}
              className="w-full h-14 min-h-[52px] bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-[0.2em] text-sm"
            >
              Reserve {selectedPackage.qty} Ticket{selectedPackage.qty === 1 ? '' : 's'} · £{selectedPackage.price.toFixed(2)}
              <ArrowRight className="w-4 h-4 ml-3" />
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] sm:text-xs font-serif text-muted-foreground uppercase tracking-widest pt-2">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-primary" /> Secure Checkout</span>
              <span className="flex items-center gap-1.5"><Ticket className="w-3 h-3 text-primary" /> Free Entry Available</span>
              <span className="flex items-center gap-1.5"><Plane className="w-3 h-3 text-primary" /> UK & Eire Eligible</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-24 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">Common Questions</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4">Frequently Asked</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className={`bg-card border rounded-sm overflow-hidden transition-colors ${
                  isOpen ? 'border-primary/40' : 'border-border'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 hover:bg-primary/5 transition-colors min-h-[56px]"
                  aria-expanded={isOpen}
                  aria-controls={`bushmills-faq-panel-${i}`}
                  id={`bushmills-faq-trigger-${i}`}
                >
                  <span className="font-serif text-base sm:text-lg text-foreground">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <motion.div
                  id={`bushmills-faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`bushmills-faq-trigger-${i}`}
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

        {/* Notify-me */}
        <div className="mt-12 sm:mt-16 bg-card border border-border rounded-sm p-5 sm:p-7 text-center">
          <p className="text-xs font-serif text-primary uppercase tracking-widest mb-2">Sold Out Soon?</p>
          <h3 className="font-serif text-xl sm:text-2xl mb-2">Get notified when new draws open</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            We release new luxury experiences every month. Be the first to know.
          </p>
          <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-background border border-border rounded-sm px-4 py-3 text-sm font-serif text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors min-h-[44px]"
            />
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-widest text-xs min-h-[44px] px-5"
            >
              Notify Me
            </Button>
          </form>
        </div>
      </section>

      {/* ── TERMS ── */}
      <section className="py-12 sm:py-16 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg sm:text-xl">Terms &amp; Conditions</h2>
          </div>
          <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed list-none">
            <li className="flex gap-3"><span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" /> Entrants must be 18 or older and legally resident in the United Kingdom or Republic of Ireland at the time of entry.</li>
            <li className="flex gap-3"><span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" /> Each draw is governed by our Official Contest Rules and a skill-testing question must be answered correctly to qualify.</li>
            <li className="flex gap-3"><span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" /> Maximum 25 tickets per person per draw. Draw closes {DRAW_DATE_LABEL} at 20:00 GMT — entries accepted up to that moment.</li>
            <li className="flex gap-3"><span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" /> Winner selected via cryptographically secure RNG, broadcast live, and notified by email within 48 hours.</li>
            <li className="flex gap-3"><span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" /> Travel components (distillery tour, tasting, accommodation) are redeemable between September 2026 and September 2027 subject to availability.</li>
            <li className="flex gap-3"><span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" /> Bottle collection is shipped insured and tracked within 14 business days of winner confirmation. Prize is non-transferable; no cash equivalent except as set out in the FAQ.</li>
            <li className="flex gap-3"><span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" /> A free postal entry route is available — see the Official Contest Rules for full details.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-serif uppercase tracking-widest">
            <button onClick={() => setLocation('/rules')} className="text-primary hover:underline">Full Contest Rules →</button>
            <button onClick={() => setLocation('/terms')} className="text-primary hover:underline">Terms of Service →</button>
            <button onClick={() => setLocation('/privacy')} className="text-primary hover:underline">Privacy Policy →</button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-primary/30 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.6)]">
        <div className="min-w-0">
          <p className="text-[10px] font-serif text-muted-foreground uppercase tracking-widest leading-tight">From</p>
          <p className="font-serif text-base text-primary leading-tight">£{TICKET_PRICE.toFixed(2)} / ticket</p>
        </div>
        <Button
          onClick={scrollToTickets}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif uppercase tracking-widest text-xs h-11 min-h-[44px] px-5 shrink-0"
        >
          Enter Now <ArrowRight className="w-3.5 h-3.5 ml-2" />
        </Button>
      </div>
      {/* spacer so footer content isn't covered by sticky bar */}
      <div className="lg:hidden h-16" aria-hidden />
    </div>
  );
}
