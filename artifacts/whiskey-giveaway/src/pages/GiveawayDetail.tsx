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
import { Ticket, Trophy, CreditCard, CheckCircle2, Loader2, ArrowLeft, HelpCircle, XCircle, Share2, Copy, Check, Gift } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ACTIVE_GIVEAWAYS } from '@/data/giveaways';
import { useCreateEntry } from '@workspace/api-client-react';

const TICKET_PACKAGES = [
  { id: 1, qty: 1, price: 4.99, badge: null },
  { id: 2, qty: 5, price: 19.99, badge: "Best Value" },
  { id: 3, qty: 10, price: 34.99, badge: "Most Popular" },
  { id: 4, qty: 25, price: 74.99, badge: null },
];

export function GiveawayDetail() {
  const [, params] = useRoute("/giveaway/:id");
  const [, setLocation] = useLocation();
  const giveawayId = params?.id ? parseInt(params.id) : 1;
  const giveaway = ACTIVE_GIVEAWAYS.find(g => g.id === giveawayId) || ACTIVE_GIVEAWAYS[0];

  const createEntry = useCreateEntry();

  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(TICKET_PACKAGES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assignedTickets, setAssignedTickets] = useState<string[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);

  // Detect incoming referral param
  const referredBy = new URLSearchParams(window.location.search).get('ref');

  // Skill-testing question
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSelected, setQuizSelected] = useState('');
  const [quizError, setQuizError] = useState(false);
  
  // Form Details
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

  // On mount: if ?session_id= present, verify payment and jump to confirmation
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
        localStorage.setItem(`giveaway_${giveaway.id}_tickets`, JSON.stringify(tickets));
        setAssignedTickets(tickets);
        if (data.entry) {
          setDetails(d => ({
            ...d,
            firstName: data.entry!.firstName,
            lastName: data.entry!.lastName,
            email: data.entry!.email,
          }));
        }
        const code = `${(data.entry?.firstName ?? 'friend').toLowerCase().replace(/[^a-z]/g, '')}-${giveaway.id}-${tickets[0].replace('#', '')}`;
        setReferralLink(`${window.location.origin}/giveaway/${giveaway.id}?ref=${code}`);
        setIsProcessing(false);
        // Strip query params and jump to step 4
        window.history.replaceState({}, '', `/giveaway/${giveaway.id}`);
        setStep(4);
      })
      .catch(() => {
        setSessionError('Could not verify your payment. Please contact support.');
        setIsProcessing(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initiateStripeCheckout = async () => {
    setIsRedirecting(true);
    try {
      const resp = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giveawayId: giveaway.id,
          ticketQty: selectedPackage.qty,
          firstName: details.firstName,
          lastName: details.lastName,
          email: details.email,
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
              {/* Referral welcome banner */}
              {referredBy && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-sm px-5 py-3"
                >
                  <Gift className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-sm font-mono text-primary">
                    You were invited by a friend! Enter this draw for your chance to win.
                  </p>
                </motion.div>
              )}

              <div className="grid md:grid-cols-2 gap-8 bg-card border border-border p-6 rounded-sm shadow-xl">
                <div className="aspect-[4/5] relative bg-black/50 rounded-sm overflow-hidden">
                  <img src={giveaway.image} alt={giveaway.name} className="w-full h-full object-cover mix-blend-screen" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 space-y-4">
                    <h2 className="text-3xl font-serif leading-tight">{giveaway.name}</h2>
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span className="text-primary">{giveaway.value} Value</span>
                      <span className="text-muted-foreground">{(giveaway.baseEntries + selectedPackage.qty).toLocaleString()} / {giveaway.maxEntries.toLocaleString()}</span>
                    </div>
                    {/* Capacity fill bar */}
                    {(() => {
                      const sold = giveaway.baseEntries + selectedPackage.qty;
                      const pct = Math.min((sold / giveaway.maxEntries) * 100, 100);
                      const remaining = giveaway.maxEntries - sold;
                      return (
                        <div className="mt-2">
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${pct >= 90 ? 'bg-red-500' : 'bg-primary'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className={`text-xs font-mono mt-1 ${remaining <= 80 ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {remaining > 0 ? `${remaining} tickets remaining` : 'SOLD OUT'}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-6 flex flex-col">
                  <div>
                    <h3 className="text-xl font-serif mb-2">Draw Ends In:</h3>
                    <CountdownTimer daysToAdd={giveaway.daysLeft} />
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
                          <span className="font-serif text-lg">{pkg.qty} {pkg.qty === 1 ? 'Ticket' : 'Tickets'}</span>
                        </div>
                        <span className="font-mono text-primary">${pkg.price}</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-secondary/30 p-4 border border-secondary text-sm text-center text-muted-foreground mt-auto rounded-sm">
                    Selecting {selectedPackage.qty} tickets improves your odds to {(selectedPackage.qty / (giveaway.baseEntries + selectedPackage.qty) * 100).toFixed(2)}%
                  </div>

                  <Button 
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest"
                    onClick={() => { setQuizError(false); setQuizSelected(''); setShowQuiz(true); }}
                  >
                    Continue to Details
                  </Button>
                </div>
              </div>
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
                    <Input 
                      value={details.firstName} 
                      onChange={e => setDetails({...details, firstName: e.target.value})} 
                      placeholder="James" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input 
                      value={details.lastName} 
                      onChange={e => setDetails({...details, lastName: e.target.value})} 
                      placeholder="Bond" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email"
                    value={details.email} 
                    onChange={e => setDetails({...details, email: e.target.value})} 
                    placeholder="james@example.com" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confirm Email</Label>
                  <Input 
                    type="email"
                    value={details.confirmEmail} 
                    onChange={e => setDetails({...details, confirmEmail: e.target.value})} 
                    placeholder="james@example.com" 
                  />
                </div>

                <div className="pt-4 space-y-4 border-t border-border/50">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="age" 
                      checked={details.ageVerified} 
                      onCheckedChange={(c) => setDetails({...details, ageVerified: !!c})} 
                      className="mt-1"
                    />
                    <Label htmlFor="age" className="text-sm font-normal leading-tight text-muted-foreground">
                      I confirm I am 18 years of age or older and legally permitted to purchase alcohol in my jurisdiction.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="terms" 
                      checked={details.termsAccepted} 
                      onCheckedChange={(c) => setDetails({...details, termsAccepted: !!c})} 
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm font-normal leading-tight text-muted-foreground">
                      I agree to the PrizePour Terms & Conditions and Privacy Policy.
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
                      <span className="font-mono text-foreground">${selectedPackage.price}</span>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div className="flex justify-between font-serif text-lg text-primary">
                      <span>Total</span>
                      <span>${selectedPackage.price}</span>
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
                      <><CreditCard className="w-5 h-5 mr-2" /> Pay ${selectedPackage.price} with Stripe</>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>
                    Secured by Stripe · SSL encrypted
                  </div>
                </div>

                <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="bg-secondary/20 border border-secondary p-6 rounded-sm sticky top-28 space-y-5">
                  <h3 className="font-serif text-xl">Your Entry</h3>
                  <div className="aspect-video relative bg-black/50 rounded-sm overflow-hidden">
                    <img src={giveaway.image} alt={giveaway.name} className="w-full h-full object-cover mix-blend-screen" />
                  </div>
                  <div>
                    <p className="font-serif text-lg">{giveaway.name}</p>
                    <p className="text-primary text-sm font-mono mt-1">{giveaway.value} prize</p>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Tickets</span>
                      <span className="text-foreground">{selectedPackage.qty}×</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Draw closes</span>
                      <span className="text-foreground">{giveaway.daysLeft} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CONFIRMATION */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center space-y-10 py-12"
            >
              <motion.div 
                className="relative w-32 h-32 mx-auto"
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-full h-full bg-gradient-to-br from-primary to-amber-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-background">
                  <Trophy className="w-16 h-16 text-primary-foreground" />
                </div>
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-5xl font-serif text-primary">Entry Confirmed!</h1>
                <p className="text-xl text-muted-foreground">You're officially in the running for the {giveaway.name}.</p>
              </div>

              <div className="bg-card border border-border p-8 rounded-sm text-left shadow-lg">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-serif">Your Official Ticket Numbers</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {assignedTickets.map((ticket, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="bg-secondary/30 border border-secondary p-3 rounded-sm text-center font-mono text-primary text-lg"
                    >
                      {ticket}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Share & Earn referral card */}
              {referralLink && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-card border border-primary/30 p-8 rounded-sm text-left shadow-lg space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                      <Share2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg leading-tight">Spread the Word</h3>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">Share your personal referral link with friends</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 bg-background border border-border rounded-sm px-4 py-3 font-mono text-xs text-muted-foreground truncate select-all">
                      {referralLink}
                    </div>
                    <Button
                      variant="outline"
                      className="shrink-0 border-border h-auto px-4"
                      onClick={() => {
                        navigator.clipboard.writeText(referralLink);
                        setReferralCopied(true);
                        setTimeout(() => setReferralCopied(false), 2500);
                      }}
                    >
                      {referralCopied ? (
                        <><Check className="w-4 h-4 text-green-400 mr-2" /><span className="text-green-400 font-mono text-xs uppercase tracking-widest">Copied!</span></>
                      ) : (
                        <><Copy className="w-4 h-4 mr-2" /><span className="font-mono text-xs uppercase tracking-widest">Copy</span></>
                      )}
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      className="bg-[#1877f2] hover:bg-[#1877f2]/90 text-white font-mono text-xs uppercase tracking-widest h-9 px-4"
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank')}
                    >
                      Facebook
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#1d9bf0] hover:bg-[#1d9bf0]/90 text-white font-mono text-xs uppercase tracking-widest h-9 px-4"
                      onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just entered the ${giveaway.name} giveaway on PrizePour — join me!`)}&url=${encodeURIComponent(referralLink)}`, '_blank')}
                    >
                      X / Twitter
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#25d366] hover:bg-[#25d366]/90 text-white font-mono text-xs uppercase tracking-widest h-9 px-4"
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`I just entered the ${giveaway.name} giveaway on PrizePour — join me! ${referralLink}`)}`, '_blank')}
                    >
                      WhatsApp
                    </Button>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest text-base h-14 px-8"
                  onClick={() => setLocation(`/draw/${giveaway.id}`)}
                >
                  Watch the Live Draw
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-border uppercase tracking-widest text-base h-14 px-8"
                  onClick={() => setLocation('/')}
                >
                  Enter Another Giveaway
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />

      {/* Skill-Testing Question Modal */}
      <Dialog open={showQuiz} onOpenChange={(open) => { if (!open) { setShowQuiz(false); setQuizError(false); setQuizSelected(''); } }}>
        <DialogContent className="sm:max-w-md bg-card border border-border text-foreground">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <HelpCircle className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-serif text-center">Skill-Testing Question</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              No purchase necessary. Answer the following question correctly to qualify for entry.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-4 space-y-6">
            <div className="bg-background/60 border border-border/60 rounded-sm p-5 text-center">
              <p className="font-serif text-lg text-foreground leading-relaxed">
                "What country is Scotch whisky made in?"
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/80 text-sm uppercase tracking-widest font-mono">Select Your Answer</Label>
              <Select
                value={quizSelected}
                onValueChange={(val) => { setQuizSelected(val); setQuizError(false); }}
              >
                <SelectTrigger
                  data-testid="select-quiz-answer"
                  className={`w-full h-12 bg-background border-border text-foreground text-base ${quizError ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder="Choose an answer..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="ireland" className="text-base py-3 cursor-pointer hover:bg-primary/10">Ireland</SelectItem>
                  <SelectItem value="scotland" className="text-base py-3 cursor-pointer hover:bg-primary/10">Scotland</SelectItem>
                  <SelectItem value="usa" className="text-base py-3 cursor-pointer hover:bg-primary/10">United States</SelectItem>
                  <SelectItem value="japan" className="text-base py-3 cursor-pointer hover:bg-primary/10">Japan</SelectItem>
                </SelectContent>
              </Select>
              {quizError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm font-mono pt-1"
                >
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  Incorrect answer. Please try again.
                </motion.div>
              )}
            </div>

            <Button
              data-testid="button-submit-quiz"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-widest"
              onClick={submitQuiz}
            >
              Submit Answer
            </Button>

            <p className="text-center text-xs text-muted-foreground font-mono">
              This question is required by law as an alternative means of entry.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
