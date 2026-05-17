import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoute, useLocation } from 'wouter';
import { useGetGiveaway, useGetGiveawayWinner } from '@workspace/api-client-react';
import { getGiveawayImage, COLLECTION_BOTTLES } from '@/data/giveaways';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowLeft, Loader2 } from 'lucide-react';

export function DrawPage() {
  const [, params] = useRoute("/draw/:id");
  const [, setLocation] = useLocation();
  const giveawayId = params?.id ? parseInt(params.id) : 1;
  const { data: giveaway } = useGetGiveaway(giveawayId);
  const { data: winner, isLoading: winnerLoading } = useGetGiveawayWinner(giveawayId);

  const [phase, setPhase] = useState<'lobby' | 'draw' | 'reveal'>('lobby');
  const [lobbyCount, setLobbyCount] = useState(0);
  const entryCount = giveaway?.entryCount ?? 0;

  const img = giveaway ? getGiveawayImage(giveaway.id, giveaway.imageUrl) : undefined;

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (phase === 'lobby') {
      intervalId = setInterval(() => {
        setLobbyCount(prev => {
          if (prev >= entryCount) {
            clearInterval(intervalId);
            return entryCount;
          }
          return prev + Math.max(1, Math.floor(entryCount / 30));
        });
      }, 50);
      timeoutId = setTimeout(() => setPhase('draw'), 3500);
    } else if (phase === 'draw') {
      timeoutId = setTimeout(() => setPhase('reveal'), 6000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [phase, entryCount]);

  const winningTicket = winner?.ticketNumber ?? '#????';

  const spinnerItems = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      if (i === 48) return winningTicket;
      return "#" + Math.floor(1000 + Math.random() * 9000).toString();
    });
  }, [winningTicket]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center overflow-hidden relative">
      
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        {img && (
          <img src={img} alt="Background" className="w-full h-full object-cover opacity-10 blur-xl scale-110 mix-blend-screen" />
        )}
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
                <p className="text-primary font-serif tracking-[0.2em] uppercase text-sm animate-pulse">Official Draw</p>
                <h1 className="text-5xl md:text-7xl font-serif">{giveaway?.name ?? '...'}</h1>
              </div>

              <div className="w-56 h-40 mx-auto relative rounded-sm overflow-hidden border border-border shadow-2xl">
                <div className="w-full h-full grid grid-cols-4 gap-px bg-border/20">
                  {COLLECTION_BOTTLES.map((bottle, i) => (
                    <div
                      key={i}
                      className="relative overflow-hidden"
                      style={{ background: 'radial-gradient(ellipse at 50% 25%, #3d1a05 0%, #1c0c03 50%, #080401 100%)' }}
                    >
                      <img src={bottle.image} alt={bottle.name} className="w-full h-full object-contain p-1 opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground uppercase tracking-widest text-xs font-serif">Total Verified Entries</p>
                <p className="text-6xl font-serif text-primary font-bold">
                  {Math.min(lobbyCount, entryCount).toLocaleString()}
                </p>
              </div>

              <div className="text-xl tracking-[0.3em] font-serif text-muted-foreground animate-pulse mt-12">
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
                <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background to-transparent z-20" />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent z-20" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 bg-primary/10 border-y border-primary/30 z-10" />

                <motion.div
                  className="flex flex-col items-center justify-start pt-[60px]"
                  animate={{ 
                    y: [0, -(spinnerItems.length * 64 - 200)] 
                  }}
                  transition={{ 
                    duration: 5.5, 
                    ease: [0.1, 0.8, 0.3, 1],
                  }}
                >
                  {spinnerItems.map((item, idx) => (
                    <div key={idx} className="h-16 flex items-center justify-center text-4xl md:text-5xl font-serif font-bold text-foreground">
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
              <div className="absolute inset-0 overflow-visible pointer-events-none z-0">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={`confetti-${i}`}
                    className="absolute w-2 h-2 bg-primary rounded-full"
                    initial={{ x: "50%", y: "50%", opacity: 1 }}
                    animate={{ 
                      x: `${50 + (Math.random() * 200 - 100)}%`, 
                      y: `${50 + (Math.random() * 200 - 150)}%`,
                      opacity: 0,
                      scale: 0
                    }}
                    transition={{ duration: 1 + Math.random(), ease: "easeOut" }}
                  />
                ))}
              </div>

              <div className="relative z-10 space-y-10">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(234,146,55,0.3)] text-primary uppercase tracking-[0.3em] font-serif text-sm"
                >
                  <Trophy className="w-5 h-5" /> Official Winner
                </motion.div>

                <div className="bg-card/80 backdrop-blur-md border-2 border-primary p-12 rounded-sm shadow-[0_0_100px_rgba(234,146,55,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                  
                  <div className="relative z-10 space-y-6">
                    {winnerLoading ? (
                      <div className="flex items-center justify-center gap-3 text-muted-foreground py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="font-serif text-sm">Verifying draw result…</span>
                      </div>
                    ) : winner ? (
                      <>
                        <p className="text-xl text-muted-foreground uppercase tracking-widest font-serif">Winning Ticket</p>
                        <motion.p
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", bounce: 0.4, delay: 0.3 }}
                          className="text-6xl md:text-8xl font-serif text-primary font-bold"
                        >
                          {winner.ticketNumber}
                        </motion.p>
                        <div className="h-px w-24 bg-border mx-auto my-8" />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <p className="text-3xl font-serif">
                            {winner.firstName} {winner.lastName.charAt(0)}.
                          </p>
                          <p className="text-muted-foreground mt-2">Winner of the {giveaway?.name ?? 'draw'}</p>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <p className="text-xl text-muted-foreground uppercase tracking-widest font-serif">No Entries Yet</p>
                        <p className="text-muted-foreground mt-2">This draw has no entries to select a winner from.</p>
                      </>
                    )}
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

        {phase === 'lobby' && (
          <button
            onClick={() => setLocation('/')}
            className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-serif text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
      </div>
    </div>
  );
}
