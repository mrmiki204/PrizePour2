import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, Ticket, CheckCircle2, Clock, Loader2, ArrowRight, Trophy } from 'lucide-react';
import { useListGiveaways } from '@workspace/api-client-react';

interface Reward {
  id: number;
  referralCode: string;
  freeTickets: number;
  status: string;
  claimedGiveawayId: number | null;
  claimedAt: string | null;
  createdAt: string;
}

interface ClaimState {
  rewardId: number | null;
  giveawayId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function MyReferrals() {
  const [, setLocation] = useLocation();
  const codeFromUrl = new URLSearchParams(window.location.search).get('code') ?? '';

  const [code, setCode] = useState(codeFromUrl);
  const [inputCode, setInputCode] = useState(codeFromUrl);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [claim, setClaim] = useState<ClaimState>({ rewardId: null, giveawayId: '', firstName: '', lastName: '', email: '' });
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimResult, setClaimResult] = useState<{ tickets: string[]; giveawayName: string } | null>(null);

  const { data: giveaways = [] } = useListGiveaways();

  useEffect(() => {
    if (code) fetchRewards(code);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRewards(c: string) {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`/api/rewards/${encodeURIComponent(c)}`);
      const data = await r.json() as { rewards?: Reward[]; error?: string };
      if (data.error) { setError(data.error); setRewards([]); }
      else setRewards(data.rewards ?? []);
    } catch {
      setError('Could not load rewards. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputCode.trim();
    if (!trimmed) return;
    setCode(trimmed);
    window.history.replaceState({}, '', `/my-referrals?code=${encodeURIComponent(trimmed)}`);
    fetchRewards(trimmed);
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!claim.rewardId || !claim.giveawayId || !claim.firstName || !claim.lastName || !claim.email) return;
    setClaiming(true);
    setClaimError('');
    try {
      const r = await fetch(`/api/rewards/${claim.rewardId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCode: code,
          giveawayId: parseInt(claim.giveawayId, 10),
          firstName: claim.firstName,
          lastName: claim.lastName,
          email: claim.email,
        }),
      });
      const data = await r.json() as { ticketNumbers?: string[]; error?: string };
      if (data.error) { setClaimError(data.error); }
      else {
        const giveaway = giveaways.find(g => g.id === parseInt(claim.giveawayId, 10));
        setClaimResult({ tickets: data.ticketNumbers ?? [], giveawayName: giveaway?.name ?? 'the draw' });
        fetchRewards(code);
        setClaim({ rewardId: null, giveawayId: '', firstName: '', lastName: '', email: '' });
      }
    } catch {
      setClaimError('Network error — please try again.');
    } finally {
      setClaiming(false);
    }
  }

  const unclaimed = rewards.filter(r => r.status === 'unclaimed');
  const claimed = rewards.filter(r => r.status === 'claimed');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <button onClick={() => setLocation('/')} className="font-serif text-xl text-primary tracking-widest">PRIZEPOUR</button>
        <Button variant="ghost" size="sm" onClick={() => setLocation('/')} className="font-serif text-xs uppercase tracking-widest">← Back to Draws</Button>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8 sm:space-y-10">
        <div className="space-y-2">
          <p className="font-serif text-xs uppercase tracking-widest text-primary">Referral Rewards</p>
          <h1 className="font-serif text-3xl sm:text-4xl">My Rewards</h1>
          <p className="text-muted-foreground text-sm">When someone enters a draw using your referral link, you earn 1–5 free tickets to use on any draw.</p>
        </div>

        <form onSubmit={handleLookup} className="bg-card border border-border rounded-sm p-6 space-y-4">
          <Label className="text-sm font-serif uppercase tracking-widest">Your Referral Code</Label>
          <div className="flex gap-2">
            <Input
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              placeholder="e.g. james-1-4321"
              className="font-serif text-sm"
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest px-5 shrink-0" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
            </Button>
          </div>
          {error && <p className="text-red-400 text-xs font-serif">{error}</p>}
        </form>

        {code && !loading && (
          <AnimatePresence mode="wait">
            {claimResult && (
              <motion.div key="claim-success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-green-400/10 border border-green-400/30 rounded-sm p-5 flex items-start gap-4">
                <Trophy className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-serif text-base">Tickets claimed!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Your free tickets for <span className="text-foreground">{claimResult.giveawayName}</span>:</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {claimResult.tickets.map(t => (
                      <span key={t} className="bg-green-400/10 border border-green-400/20 text-green-400 font-serif text-sm px-3 py-1 rounded-sm">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {unclaimed.length > 0 && (
              <motion.div key="unclaimed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h2 className="font-serif text-xl flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Unclaimed Rewards
                  <span className="ml-1 bg-primary text-primary-foreground text-xs font-serif px-2 py-0.5 rounded-full">{unclaimed.length}</span>
                </h2>
                {unclaimed.map(reward => (
                  <motion.div key={reward.id} layout className="bg-gradient-to-br from-primary/10 to-card border border-primary/30 rounded-sm overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                          <Ticket className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-serif text-2xl text-primary">{reward.freeTickets} Free {reward.freeTickets === 1 ? 'Ticket' : 'Tickets'}</p>
                          <p className="text-xs font-serif text-muted-foreground mt-0.5">Earned {new Date(reward.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest font-serif text-xs h-9 px-5 gap-2"
                        onClick={() => setClaim(c => ({ ...c, rewardId: c.rewardId === reward.id ? null : reward.id, giveawayId: '', firstName: '', lastName: '', email: '' }))}
                      >
                        {claim.rewardId === reward.id ? 'Cancel' : <><span>Claim</span><ArrowRight className="w-3 h-3" /></>}
                      </Button>
                    </div>

                    <AnimatePresence>
                      {claim.rewardId === reward.id && (
                        <motion.form
                          key="claim-form"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={handleClaim}
                          className="overflow-hidden border-t border-primary/20 px-4 sm:px-6 py-5 space-y-4 bg-background/50"
                        >
                          <p className="text-sm text-muted-foreground">Choose a draw and enter your details to claim your <span className="text-primary font-serif">{reward.freeTickets} free {reward.freeTickets === 1 ? 'ticket' : 'tickets'}</span>.</p>

                          <div className="space-y-1">
                            <Label className="text-xs font-serif uppercase tracking-widest">Select Draw</Label>
                            <select
                              value={claim.giveawayId}
                              onChange={e => setClaim(c => ({ ...c, giveawayId: e.target.value }))}
                              className="w-full bg-card border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              required
                            >
                              <option value="">— Choose a draw —</option>
                              {giveaways.map(g => (
                                <option key={g.id} value={g.id}>{g.name} ({g.prizeValue})</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs font-serif uppercase tracking-widest">First Name</Label>
                              <Input value={claim.firstName} onChange={e => setClaim(c => ({ ...c, firstName: e.target.value }))} placeholder="James" required />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-serif uppercase tracking-widest">Last Name</Label>
                              <Input value={claim.lastName} onChange={e => setClaim(c => ({ ...c, lastName: e.target.value }))} placeholder="Bond" required />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-serif uppercase tracking-widest">Email</Label>
                            <Input type="email" value={claim.email} onChange={e => setClaim(c => ({ ...c, email: e.target.value }))} placeholder="james@example.com" required />
                          </div>

                          {claimError && <p className="text-red-400 text-xs font-serif">{claimError}</p>}

                          <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest h-11"
                            disabled={claiming}
                          >
                            {claiming ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Claiming...</> : `Claim ${reward.freeTickets} Free ${reward.freeTickets === 1 ? 'Ticket' : 'Tickets'}`}
                          </Button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {claimed.length > 0 && (
              <motion.div key="claimed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <h2 className="font-serif text-lg text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Claimed
                </h2>
                {claimed.map(reward => {
                  const g = giveaways.find(x => x.id === reward.claimedGiveawayId);
                  return (
                    <div key={reward.id} className="bg-card border border-border rounded-sm px-5 py-4 flex items-center justify-between opacity-60">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-sm font-serif">{reward.freeTickets} ticket{reward.freeTickets !== 1 ? 's' : ''} — {g?.name ?? `Draw #${reward.claimedGiveawayId}`}</p>
                          <p className="text-xs font-serif text-muted-foreground">{reward.claimedAt ? new Date(reward.claimedAt).toLocaleDateString() : ''}</p>
                        </div>
                      </div>
                      <span className="text-xs font-serif text-green-400 uppercase tracking-widest">Claimed</span>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {rewards.length === 0 && !error && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <Clock className="w-7 h-7 text-primary/50" />
                </div>
                <div>
                  <p className="font-serif text-xl">No rewards yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Share your referral link — when someone enters a draw using it, you'll earn 1–5 free tickets here.</p>
                </div>
                <Button variant="outline" onClick={() => setLocation('/')} className="font-serif text-xs uppercase tracking-widest mt-4">
                  Browse Draws
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
