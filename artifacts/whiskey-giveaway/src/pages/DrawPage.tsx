import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoute, useLocation } from 'wouter';
import { ACTIVE_GIVEAWAYS } from '@/data/giveaways';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowLeft } from 'lucide-react';

export function DrawPage() {
  const [, params] = useRoute("/draw/:id");
  const [, setLocation] = useLocation();
  const giveawayId = params?.id ? parseInt(params.id) : 1;
  const giveaway = ACTIVE_GIVEAWAYS.find(g => g.id === giveawayId) || ACTIVE_GIVEAWAYS[0];

  // Load user's tickets from local storage, fallback to random if they skipped
  const storedTickets = localStorage.getItem(`giveaway_${giveaway.id}_tickets`);
  const userTickets = storedTickets ? JSON.parse(storedTickets) : ["#8472", "#9311"];
  
  // To ensure the user "wins" in the demo
  const winningTicket = userTickets[0];

  const [phase, setPhase] = useState<'lobby' | 'draw' | 'reveal'>('lobby');
  const [lobbyCount, setLobbyCount] = useState(0);
  const targetEntries = giveaway.baseEntries + userTickets.length;

  useEffect(() => {
    if (phase === 'lobby') {
      const interval = setInterval(() => {
        setLobbyCount(prev => {
          if (prev >= targetEntries) {
            clearInterval(interval);
            return targetEntries;
          }
          return prev + Math.floor(targetEntries / 30);
        });
      }, 50);

      const timeout = setTimeout(() => {
        setPhase('draw');
      }, 3500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else if (phase === 'draw') {
      const timeout = setTimeout(() => {
        setPhase('reveal');
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [phase, targetEntries]);

  // Generate a long list of random tickets for the spinner
  const spinnerItems = Array.from({ length: 50 }).map((_, i) => {
    if (i === 48) return winningTicket; // The winning ticket placed near the end to land on
    return "#" + Math.floor(1000 + Math.random() * 9000).toString();
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center overflow-hidden relative">
      
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <img src={giveaway.image} alt="Background" className="w-full h-full object-cover opacity-10 blur-xl scale-110 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/50" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* PHASE 1: LOBBY */}
          {phase === 'lobby' && (
            <motion.div 
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-12 w-full"
            >
              <div className="space-y-4">
                <p className="text-primary font-mono tracking-[0.2em] uppercase text-sm animate-pulse">Official Draw</p>
                <h1 className="text-5xl md:text-7xl font-serif">{giveaway.name}</h1>
              </div>

              <div className="w-48 h-48 mx-auto relative rounded-sm overflow-hidden border border-border shadow-2xl">
                <img src={giveaway.image} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground uppercase tracking-widest text-xs font-mono">Total Verified Entries</p>
                <p className="text-6xl font-mono text-primary font-bold">
                  {Math.min(lobbyCount, targetEntries).toLocaleString()}
                </p>
              </div>

              <div className="text-xl tracking-[0.3em] font-mono text-muted-foreground animate-pulse mt-12">
                DRAW STARTING...
              </div>
            </motion.div>
          )}

          {/* PHASE 2: DRAW ANIMATION */}
          {phase === 'draw' && (
            <motion.div
              key="draw"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-16 w-full"
            >
              <h2 className="text-3xl font-serif text-muted-foreground">Selecting Winner...</h2>

              <div className="relative h-40 overflow-hidden mx-auto max-w-md w-full bg-black/50 border-y-2 border-primary/50 shadow-[0_0_50px_rgba(234,146,55,0.2)] flex items-center justify-center">
                {/* Gradient masks for smooth fade at top and bottom */}
                <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background to-transparent z-20" />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent z-20" />
                
                {/* Center highlight line */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 bg-primary/10 border-y border-primary/30 z-10" />

                <motion.div
                  className="flex flex-col items-center justify-start pt-[60px]"
                  animate={{ 
                    y: [0, -(spinnerItems.length * 64 - 200)] 
                  }}
                  transition={{ 
                    duration: 5.5, 
                    ease: [0.1, 0.8, 0.3, 1], // Custom ease-out to simulate spinning down
                  }}
                >
                  {spinnerItems.map((item, idx) => (
                    <div key={idx} className="h-16 flex items-center justify-center text-4xl md:text-5xl font-mono font-bold text-foreground">
                      {item}
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* PHASE 3: REVEAL */}
          {phase === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-center w-full max-w-2xl relative"
            >
              {/* Confetti effect using simple divs */}
              <div className="absolute inset-0 overflow-visible pointer-events-none z-0">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={`confetti-${i}`}
                    className="absolute w-2 h-2 bg-primary rounded-full"
                    initial={{ 
                      x: "50%", 
                      y: "50%", 
                      opacity: 1 
                    }}
                    animate={{ 
                      x: `${50 + (Math.random() * 200 - 100)}%`, 
                      y: `${50 + (Math.random() * 200 - 150)}%`,
                      opacity: 0,
                      scale: 0
                    }}
                    transition={{ 
                      duration: 1 + Math.random(), 
                      ease: "easeOut" 
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 space-y-10">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(234,146,55,0.3)] text-primary uppercase tracking-[0.3em] font-mono text-sm"
                >
                  <Trophy className="w-5 h-5" /> Official Winner
                </motion.div>

                <div className="bg-card/80 backdrop-blur-md border-2 border-primary p-12 rounded-sm shadow-[0_0_100px_rgba(234,146,55,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                  
                  <div className="relative z-10 space-y-6">
                    <p className="text-xl text-muted-foreground uppercase tracking-widest font-mono">Ticket Number</p>
                    <p className="text-6xl md:text-8xl font-mono text-primary font-bold">{winningTicket}</p>
                    <div className="h-px w-24 bg-border mx-auto my-8" />
                    <p className="text-3xl font-serif">Sarah M. from Austin, TX</p>
                    <p className="text-muted-foreground">Winner of the {giveaway.name}</p>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="flex flex-col sm:flex-row justify-center gap-6 pt-8"
                >
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest text-base h-14 px-8"
                    onClick={() => setLocation('/')}
                  >
                    View All Active Draws
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
