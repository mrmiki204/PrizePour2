import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useRoute } from 'wouter';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CountdownTimer } from '@/components/giveaway/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Ticket, CreditCard, CheckCircle2, Loader2, ArrowLeft, XCircle, Share2, Copy, Check, Gift } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useGetGiveaway } from '@workspace/api-client-react';
import { getGiveawayImage, daysUntil } from '@/data/giveaways';

const TICKET_PACKAGES = [
  { id: 1, qty: 1,  price: 2.99,  badge: null },
  { id: 2, qty: 4,  price: 9.99,  badge: "Best Value" },
  { id: 3, qty: 10, price: 24.99, badge: "Most Popular" },
  { id: 4, qty: 25, price: 64.99, badge: null },
];

export function GiveawayDetail() {
  const [, params] = useRoute("/giveaway/:id");
  const [, setLocation] = useLocation();
  const giveawayId = params?.id ? parseInt(params.id) : 1;
  const { data: giveaway, isLoading } = useGetGiveaway(giveawayId);

  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(TICKET_PACKAGES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assignedTickets, setAssignedTickets] = useState<string[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);

  const referredBy = new URLSearchParams(window.location.search).get('ref');

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSelected, setQuizSelected] = useState('');
  const [quizError, setQuizError] = useState(false);
  
  const [details, setDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    ageVerified: false,
    termsAccepted: false
  });

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [sessionError, setSessionError] = useState('');

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s + 1);
  };

  const submitQuiz = () => {
    if (quizSelected === 'scotland') {
      setShowQuiz(false);
      setQuizSelected('');
      setQuizError(false);
      nextStep();
    } else {
      setQuizError(true);
    }
  };

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) return;

    setIsProcessing(true);
    fetch(`/api/stripe/session/${sessionId}`)
      .then(r => r.json())
      .then((data: { entry?: { firstName: string; lastName: string; email: string }; ticketNumbers?: string[]; error?: string }) => {
        if (data.error || !data.ticketNumbers) {
          setSessionError(data.error ?? 'Payment verification failed');
          setIsProcessing(false);
          return;
        }
        const tickets = data.ticketNumbers;
        localStorage.setItem(`giveaway_${giveawayId}_tickets`, JSON.stringify(tickets));
        setAssignedTickets(tickets);
        if (data.entry) {
          setDetails(d => ({
            ...d,
            firstName: data.entry!.firstName,
            lastName: data.entry!.lastName,
            email: data.entry!.email,
          }));
        }
        const code = `${(data.entry?.firstName ?? 'friend').toLowerCase().replace(/[^a-z]/g, '')}-${giveawayId}-${tickets[0].replace('#', '')}`;
        setReferralLink(`${window.location.origin}/giveaway/${giveawayId}?ref=${code}`);
        setIsProcessing(false);
        window.history.replaceState({}, '', `/giveaway/${giveawayId}`);
        setStep(4);
      })
      .catch(() => {
        setSessionError('Could not verify your payment. Please contact support.');
        setIsProcessing(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initiateStripeCheckout = async () => {
    if (!giveaway) return;
    setIsRedirecting(true);
    try {
      const resp = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giveawayId: giveaway.id,
          firstName: details.firstName,
          lastName: details.lastName,
          email: details.email,
          ticketQty: selectedPackage.qty,
          amountCents: Math.round(selectedPackage.price * 100),
          referralCode: referredBy ?? undefined,
        }),
      });
      const { url, error } = await resp.json() as { url?: string; error?: string };
      if (url) {
        window.location.href = url;
      } else {
        setSessionError(error ?? 'Failed to start checkout');
        setIsRedirecting(false);
      }
    } catch {
      setSessionError('Network error — please try again');
      setIsRedirecting(false);
    }
  };

  const isDetailsValid = 
    details.firstName.length > 0 && 
    details.lastName.length > 0 && 
    details.email.length > 0 && 
    details.email === details.confirmEmail &&
    details.ageVerified && 
    details.termsAccepted;

  if (isLoading || !giveaway) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-mono text-sm">Verifying your payment…</p>
        </div>
      </div>
    );
  }

  const img = getGiveawayImage(giveaway.id, giveaway.imageUrl);
  const entryCount = giveaway.entryCount;
  const pct = Math.min((entryCount / giveaway.maxEntries) * 100, 100);
  const remaining = giveaway.maxEntries - entryCount;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-12 max-w-4xl mx-auto w-full px-6">
        <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => setLocation('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Giveaways
        </Button>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center text-sm font-mono tracking-widest text-muted-foreground mb-4">
            <span className={step >= 1 ? "text-primary" : ""}>Choose Tickets</span>
            <span className="hidden sm:inline">→</span>
            <span className={step >= 2 ? "text-primary" : ""}>Your Details</span>
            <span className="hidden sm:inline">→</span>
            <span className={step >= 3 ? "text-primary" : ""}>Payment</span>
            <span className="hidden sm:inline">→</span>
            <span className={step >= 4 ? "text-primary" : ""}>Confirmed</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden flex">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "25%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: TICKETS */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {referredBy && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden bg-gradient-to-r from-primary/15 via-primary/10 to-amber-600/10 border border-primary/40 rounded-sm px-6 py-4"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-sm" />
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-serif text-base text-primary leading-tight">
                        {(() => {
                          const name = referredBy.split('-')[0];
                          return name ? `${name.charAt(0).toUpperCase() + name.slice(1)} invited you!` : 'A friend invited you!';
                        })()}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        You're viewing this draw through a personal referral link. Enter your tickets below.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid md:grid-cols-2 gap-8 bg-card border border-border p-6 rounded-sm shadow-xl">
                <div className="aspect-[4/5] relative bg-black/50 rounded-sm overflow-hidden">
                  {img ? (
                    <img src={img} alt={giveaway.name} className="w-full h-full object-cover mix-blend-screen" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-950 via-amber-900/60 to-stone-950 flex items-center justify-center">
                      <svg viewBox="0 0 80 160" className="w-16 h-32 opacity-20 fill-amber-400" xmlns="http://www.w3.org/2000/svg">
                        <rect x="28" y="0" width="24" height="20" rx="4" />
                        <rect x="20" y="18" width="40" height="8" rx="2" />
                        <rect x="16" y="24" width="48" height="110" rx="6" />
                        <rect x="20" y="134" width="40" height="26" rx="4" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 space-y-4">
                    <h2 className="text-3xl font-serif leading-tight">{giveaway.name}</h2>
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span className="text-primary">{giveaway.prizeValue} Value</span>
                      <span className="text-muted-foreground">{(entryCount + selectedPackage.qty).toLocaleString()} / {giveaway.maxEntries.toLocaleString()}</span>
                    </div>
                    <div className="mt-2">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pct >= 90 ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(((entryCount + selectedPackage.qty) / giveaway.maxEntries) * 100, 100)}%` }}
                        />
                      </div>
                      <p className={`text-xs font-mono mt-1 ${remaining <= 5 ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {remaining > 0 ? `${remaining} tickets remaining` : 'SOLD OUT'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 flex flex-col">
                  <div>
                    <h3 className="text-xl font-serif mb-2">Draw Ends In:</h3>
                    <CountdownTimer daysToAdd={daysUntil(giveaway.drawDate)} />
                  </div>
                  
                  <div className="h-px w-full bg-border/50 my-2" />

                  <div className="flex-1 space-y-4">
                    <h3 className="font-serif text-xl mb-4">Select Ticket Quantity</h3>
                    {TICKET_PACKAGES.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`w-full relative flex items-center justify-between p-4 border rounded-sm transition-all duration-200 ${
                          selectedPackage.id === pkg.id 
                            ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(234,146,55,0.15)]' 
                            : 'border-border bg-card/50 hover:border-primary/50'
                        }`}
                      >
                        {pkg.badge && (
                          <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm">
                            {pkg.badge}
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Ticket className={`w-5 h-5 ${selectedPackage.id === pkg.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-serif text-lg">
                            {pkg.qty} {pkg.qty === 1 ? 'Ticket' : 'Tickets'}
                          </span>
                        </div>
                        <span className="font-mono text-primary">£{pkg.price}</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-secondary/30 p-4 border border-secondary text-sm text-center text-muted-foreground mt-auto rounded-sm">
                    {`Selecting ${selectedPackage.qty} ticket${selectedPackage.qty !== 1 ? 's' : ''} — odds: ${(selectedPackage.qty / (entryCount + selectedPackage.qty) * 100).toFixed(2)}%`}
                  </div>

                  <Button 
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest"
                    onClick={() => { setQuizError(false); setQuizSelected(''); setShowQuiz(true); }}
                  >
                    Continue to Details
                  </Button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-sm p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Share2 className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-lg">Refer &amp; Earn</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: '🎟️', title: 'Enter the draw', desc: 'Purchase any ticket package to enter.' },
                    { icon: '🔗', title: 'Get your link', desc: 'Receive a personal referral link on confirmation.' },
                    { icon: '📣', title: 'Share & grow', desc: 'Share with friends — every referral helps grow the community.' },
                  ].map((s) => (
                    <div key={s.title} className="flex gap-3">
                      <span className="text-xl mt-0.5">{s.icon}</span>
                      <div>
                        <p className="text-sm font-serif text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-serif text-primary">Your Details</h2>
                <p className="text-muted-foreground">Please provide your legal name for the official draw.</p>
              </div>

              <div className="bg-card border border-border p-8 rounded-sm space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={details.firstName} onChange={e => setDetails({...details, firstName: e.target.value})} placeholder="James" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={details.lastName} onChange={e => setDetails({...details, lastName: e.target.value})} placeholder="Bond" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" value={details.email} onChange={e => setDetails({...details, email: e.target.value})} placeholder="james@example.com" />
                </div>

                <div className="space-y-2">
                  <Label>Confirm Email</Label>
                  <Input type="email" value={details.confirmEmail} onChange={e => setDetails({...details, confirmEmail: e.target.value})} placeholder="james@example.com" />
                </div>

                <div className="pt-4 space-y-4 border-t border-border/50">
                  <div className="flex items-start space-x-3">
                    <Checkbox id="age" checked={details.ageVerified} onCheckedChange={(c) => setDetails({...details, ageVerified: !!c})} className="mt-1" />
                    <Label htmlFor="age" className="text-sm font-normal leading-tight text-muted-foreground">
                      I confirm I am 18 years of age or older and legally permitted to purchase alcohol in my jurisdiction.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox id="terms" checked={details.termsAccepted} onCheckedChange={(c) => setDetails({...details, termsAccepted: !!c})} className="mt-1" />
                    <Label htmlFor="terms" className="text-sm font-normal leading-tight text-muted-foreground">
                      I agree to the PrizePour Terms &amp; Conditions and Privacy Policy.
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest px-8"
                  disabled={!isDetailsValid}
                  onClick={nextStep}
                >
                  Continue to Payment
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-5 gap-8"
            >
              <div className="md:col-span-3 space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif text-primary">Secure Checkout</h2>
                  <p className="text-muted-foreground text-sm">You'll be redirected to Stripe's secure payment page</p>
                </div>

                <div className="bg-card border border-border p-8 rounded-sm space-y-6">
                  <div className="flex items-center gap-3 pb-5 border-b border-border/50">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-serif text-lg">{details.firstName} {details.lastName}</p>
                      <p className="text-sm text-muted-foreground font-mono">{details.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{giveaway.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{selectedPackage.qty} ticket{selectedPackage.qty > 1 ? 's' : ''}</span>
                      <span className="font-mono text-foreground">£{selectedPackage.price}</span>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div className="flex justify-between font-serif text-lg text-primary">
                      <span>Total</span>
                      <span>£{selectedPackage.price}</span>
                    </div>
                  </div>

                  {sessionError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm font-mono bg-red-400/10 border border-red-400/20 rounded-sm p-3">
                      <XCircle className="w-4 h-4 shrink-0" />
                      {sessionError}
                    </div>
                  )}

                  <Button 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest text-base"
                    onClick={initiateStripeCheckout}
                    disabled={isRedirecting}
                  >
                    {isRedirecting ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Redirecting to Stripe...</>
                    ) : (
                      <><CreditCard className="w-5 h-5 mr-2" /> Pay £{selectedPackage.price} with Stripe</>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    Secured by Stripe · 256-bit SSL
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-sm p-6 space-y-4">
                  <h3 className="font-serif text-lg border-b border-border/50 pb-3">Order Summary</h3>
                  <div className="aspect-[4/3] relative overflow-hidden rounded-sm">
                    {img ? (
                      <img src={img} alt={giveaway.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-950 via-amber-900/60 to-stone-950" />
                    )}
                  </div>
                  <p className="font-serif">{giveaway.name}</p>
                  <div className="text-xs font-mono space-y-1 text-muted-foreground">
                    <div className="flex justify-between"><span>Prize Value</span><span>{giveaway.prizeValue}</span></div>
                    <div className="flex justify-between"><span>Max Entries</span><span>{giveaway.maxEntries}</span></div>
                    <div className="flex justify-between"><span>Your Tickets</span><span>{selectedPackage.qty}</span></div>
                  </div>
                </div>
                <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>← Back</Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CONFIRMATION */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </motion.div>

              <div>
                <h2 className="text-4xl font-serif text-primary mb-3">You're In!</h2>
                <p className="text-muted-foreground">Your entry for <span className="text-foreground font-serif">{giveaway.name}</span> has been confirmed.</p>
              </div>

              {assignedTickets.length > 0 && (
                <div className="bg-card border border-border rounded-sm p-6 space-y-4">
                  <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Your Ticket Numbers</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {assignedTickets.map(t => (
                      <span key={t} className="bg-primary/10 border border-primary/30 text-primary font-mono text-lg px-4 py-2 rounded-sm">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {referralLink && (
                <div className="bg-card border border-border rounded-sm p-6 space-y-3 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-4 h-4 text-primary" />
                    <p className="font-serif text-base">Your Referral Link</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Share this link — when a friend enters, you'll both benefit.</p>
                  <div className="flex gap-2">
                    <Input value={referralLink} readOnly className="font-mono text-xs bg-secondary/30 border-border" />
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-2"
                      onClick={() => { navigator.clipboard.writeText(referralLink); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); }}
                    >
                      {referralCopied ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest" onClick={() => setLocation('/draw/' + giveaway.id)}>
                  Watch the Draw
                </Button>
                <Button variant="outline" onClick={() => setLocation('/')}>
                  Browse More Draws
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skill-testing question dialog */}
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="bg-card border border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Skill-Testing Question</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              As required by contest law, please answer this question correctly to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="font-serif text-base">Scotch whisky must be aged for a minimum of how many years?</p>
            <div className="space-y-2">
              {[
                { val: 'one', label: '1 year' },
                { val: 'three', label: '3 years' },
                { val: 'scotland', label: '5 years' },
                { val: 'ten', label: '10 years' },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setQuizSelected(opt.val)}
                  className={`w-full text-left px-4 py-3 border rounded-sm transition-colors font-mono text-sm ${
                    quizSelected === opt.val ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {quizError && <p className="text-red-400 text-xs font-mono">Incorrect — please try again.</p>}
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest"
              onClick={submitQuiz}
              disabled={!quizSelected}
            >
              Submit Answer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
