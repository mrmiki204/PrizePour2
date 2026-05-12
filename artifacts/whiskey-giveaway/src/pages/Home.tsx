import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CountdownTimer } from '@/components/giveaway/CountdownTimer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, ShieldCheck, Users, Ticket } from 'lucide-react';
import heroImg from '@/assets/images/hero.png';
import pappyImg from '@/assets/images/pappy.png';
import { ACTIVE_GIVEAWAYS } from '@/data/giveaways';

const WINNERS = [
  { name: "Sarah M.", location: "Austin, TX", prize: "Blanton's Gold Edition" },
  { name: "James K.", location: "Nashville, TN", prize: "Yamazaki 18" },
  { name: "Linda P.", location: "Denver, CO", prize: "Knob Creek 25th Anniv." },
  { name: "Marcus R.", location: "Chicago, IL", prize: "Dalmore King Alexander III" }
];

export function Home() {
  const [, setLocation] = useLocation();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      {/* Hero Section */}
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
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider" onClick={() => setLocation("/giveaway/1")}>
                Enter Featured Draw
              </Button>
              <Button size="lg" variant="outline" className="border-border hover:bg-white/5 uppercase tracking-wider">
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
                <img src={pappyImg} alt="Pappy Van Winkle" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-serif text-white mb-2">Pappy Van Winkle 23 Year</h3>
                  <div className="flex justify-between items-end">
                    <p className="text-primary font-mono">$4,200 Value</p>
                    <p className="text-sm text-gray-400 font-mono">1,847 Entries</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <CountdownTimer daysToAdd={6} />
                <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => setLocation("/giveaway/1")}>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50">
          <div className="text-center px-4">
            <p className="text-3xl md:text-4xl font-serif text-primary mb-2">47k+</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Members</p>
          </div>
          <div className="text-center px-4">
            <p className="text-3xl md:text-4xl font-serif text-primary mb-2">$2.1M</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Prizes Awarded</p>
          </div>
          <div className="text-center px-4">
            <p className="text-3xl md:text-4xl font-serif text-primary mb-2">850+</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Past Draws</p>
          </div>
          <div className="text-center px-4">
            <p className="text-3xl md:text-4xl font-serif text-primary mb-2">$4.99</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Avg Entry</p>
          </div>
        </div>
      </section>

      {/* Active Giveaways */}
      <section id="giveaways" className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-serif mb-4">The Vault is Open.</h2>
            <p className="text-muted-foreground max-w-md">Secure your chance at the world's most coveted bottles. Limited entries per draw.</p>
          </div>
          <Button variant="outline" className="uppercase tracking-widest border-border">Filter by Region</Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ACTIVE_GIVEAWAYS.map((giveaway, index) => (
            <motion.div 
              key={giveaway.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-card border border-border rounded-sm overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-black">
                <img src={giveaway.image} alt={giveaway.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 group-hover:opacity-100" />
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-sm border border-border">
                  <span className="text-xs font-mono text-primary">{giveaway.value} Value</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif mb-2 line-clamp-1">{giveaway.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{giveaway.description}</p>
                
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    <span className="text-sm font-mono">{giveaway.entries} Entries</span>
                  </div>
                  <CountdownTimer daysToAdd={giveaway.daysLeft} />
                </div>
                
                <Button 
                  className="w-full bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground transition-colors uppercase tracking-widest"
                  onClick={() => setLocation(`/giveaway/${giveaway.id}`)}
                >
                  Enter Draw
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">The Process.</h2>
            <p className="text-muted-foreground">Transparent, fair, and exclusively for enthusiasts.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Ticket className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-serif">1. Secure Entry</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Choose your coveted bottle and secure your entries. Each draw has a strict capacity limit.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-serif">2. Verified Draw</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Winners are selected via a cryptographically secure random number generator upon timer expiry.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-serif">3. Secure Delivery</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Bottles are professionally packed, insured, and shipped directly to your personal collection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Winners */}
      <section id="winners" className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-16">
          <div className="h-px bg-border flex-1" />
          <h2 className="text-3xl font-serif px-6">Recent Additions to Collections</h2>
          <div className="h-px bg-border flex-1" />
        </div>

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
              <Users className="w-8 h-8 text-primary/50 mx-auto" />
              <div>
                <p className="font-serif text-lg text-primary">{winner.prize}</p>
                <p className="text-sm text-foreground mt-2">{winner.name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{winner.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
