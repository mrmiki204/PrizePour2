import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useRoute } from 'wouter';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CountdownTimer } from '@/components/giveaway/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Ticket, CheckCircle2, Loader2, ArrowLeft, XCircle, Share2, Copy, Check, Gift, HelpCircle, RefreshCw, CreditCard, Lock, ShieldCheck, Building2 } from 'lucide-react';
import { useGetGiveaway, useCreateEntry } from '@workspace/api-client-react';
import { getGiveawayImage, daysUntil, COLLECTION_BOTTLES } from '@/data/giveaways';

const TICKET_PACKAGES = [
  { id: 1, qty: 1,  price: 2.99,  badge: null },
  { id: 2, qty: 4,  price: 9.99,  badge: "Best Value" },
  { id: 3, qty: 10, price: 24.99, badge: "Most Popular" },
];

const QUIZ_QUESTIONS = [
  {
    question: "Scotch whisky must be aged for a minimum of how many years?",
    options: [
      { val: 'a', label: '1 year' },
      { val: 'b', label: '3 years' },
      { val: 'c', label: '5 years' },
      { val: 'd', label: '10 years' },
    ],
    answer: 'c',
  },
  {
    question: "Which country is Clonakilty Distillery based in?",
    options: [
      { val: 'a', label: 'Scotland' },
      { val: 'b', label: 'Ireland' },
      { val: 'c', label: 'United States' },
      { val: 'd', label: 'Japan' },
    ],
    answer: 'b',
  },
  {
    question: "What type of cask is most commonly used to mature Irish whiskey?",
    options: [
      { val: 'a', label: 'Red wine cask' },
      { val: 'b', label: 'Sherry butt' },
      { val: 'c', label: 'Ex-bourbon barrel' },
      { val: 'd', label: 'New oak cask' },
    ],
    answer: 'c',
  },
  {
    question: "What is the minimum ABV for a spirit to be legally sold as whisky in the UK?",
    options: [
      { val: 'a', label: '30% ABV' },
      { val: 'b', label: '37.5% ABV' },
      { val: 'c', label: '40% ABV' },
      { val: 'd', label: '45% ABV' },
    ],
    answer: 'c',
  },
  {
    question: "Which of the following is NOT one of the five Scotch whisky regions?",
    options: [
      { val: 'a', label: 'Speyside' },
      { val: 'b', label: 'Highland' },
      { val: 'c', label: 'Leinster' },
      { val: 'd', label: 'Islay' },
    ],
    answer: 'c',
  },
  {
    question: "What does 'single malt' whisky mean?",
    options: [
      { val: 'a', label: 'Made from a single grain variety' },
      { val: 'b', label: 'Made at one distillery using malted barley' },
      { val: 'c', label: 'Aged in a single barrel' },
      { val: 'd', label: 'Bottled by a single person' },
    ],
    answer: 'b',
  },
];

export function GiveawayDetail() {
  const [, params] = useRoute("/giveaway/:id");
  const [, setLocation] = useLocation();
  const giveawayId = params?.id ? parseInt(params.id) : 1;
  const { data: giveaway, isLoading } = useGetGiveaway(giveawayId);
  const { mutateAsync: createEntry, isPending: isSubmitting } = useCreateEntry();

  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(TICKET_PACKAGES[0]);
  const [assignedTickets, setAssignedTickets] = useState<string[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);
  const [entryError, setEntryError] = useState('');

  const referredBy = new URLSearchParams(window.location.search).get('ref');

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState('');
  const [quizError, setQuizError] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState(0);

  const [details, setDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    ageVerified: false,
    termsAccepted: false,
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: '',
  });
  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    sortCode: '',
    accountNumber: '',
  });

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
  };

  const formatSortCode = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 6);
    return d.replace(/(\d{2})(?=\d)/g, '$1-').replace(/-$/, '');
  };

  const isCardValid =
    cardDetails.name.trim().length > 0 &&
    cardDetails.number.replace(/\s/g, '').length === 16 &&
    cardDetails.expiry.replace(/\s/g, '').length === 5 &&
    cardDetails.cvc.length >= 3;

  const isBankValid =
    bankDetails.accountHolder.trim().length > 0 &&
    bankDetails.sortCode.replace(/-/g, '').length === 6 &&
    bankDetails.accountNumber.replace(/\D/g, '').length === 8;

  const isPaymentValid = paymentMethod === 'card' ? isCardValid : isBankValid;

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => s + 1);
  };

  const currentQuiz = QUIZ_QUESTIONS[quizIndex % QUIZ_QUESTIONS.length];

  const submitQuiz = () => {
    if (quizSelected === currentQuiz.answer) {
      setQuizError(false);
      nextStep();
    } else {
      setQuizError(true);
      setQuizAttempts(a => a + 1);
      setQuizSelected('');
      setQuizIndex(i => (i + 1) % QUIZ_QUESTIONS.length);
    }
  };

  const handlePayment = async () => {
    if (!giveaway) return;
    setEntryError('');
    try {
      const result = await createEntry({
        data: {
          giveawayId: giveaway.id,
          firstName: details.firstName,
          lastName: details.lastName,
          email: details.email,
          ticketQty: selectedPackage.qty,
          referralCode: referredBy ?? undefined,
        },
      });
      const tickets = (result as { ticketNumbers?: string[] }).ticketNumbers ?? [];
      setAssignedTickets(tickets);
      const code = `${details.firstName.toLowerCase().replace(/[^a-z]/g, '')}-${giveawayId}-${(tickets[0] ?? '').replace('#', '')}`;
      setReferralLink(`${window.location.origin}/giveaway/${giveawayId}?ref=${code}`);
      nextStep();
    } catch {
      setEntryError('Could not process your entry — please try again.');
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

  const img = getGiveawayImage(giveaway.id, giveaway.imageUrl);
  const entryCount = giveaway.entryCount;
  const pct = Math.min((entryCount / giveaway.maxEntries) * 100, 100);
  const remaining = giveaway.maxEntries - entryCount;

  const TOTAL_STEPS = 5;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 pt-36 pb-12 max-w-4xl mx-auto w-full px-6">
        <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => setLocation('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Giveaways
        </Button>

        {/* Progress Bar — 5 steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center text-xs font-mono tracking-widest text-muted-foreground mb-4">
            <span className={step >= 1 ? "text-primary" : ""}>Tickets</span>
            <span className="hidden sm:inline">→</span>
            <span className={step >= 2 ? "text-primary" : ""}>Details</span>
            <span className="hidden sm:inline">→</span>
            <span className={step >= 3 ? "text-primary" : ""}>Question</span>
            <span className="hidden sm:inline">→</span>
            <span className={step >= 4 ? "text-primary" : ""}>Payment</span>
            <span className="hidden sm:inline">→</span>
            <span className={step >= 5 ? "text-primary" : ""}>Confirmed</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: `${(1 / TOTAL_STEPS) * 100}%` }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: TICKETS ── */}
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
                        You're viewing this draw through a personal referral link.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid md:grid-cols-2 gap-8 bg-card border border-border p-6 rounded-sm shadow-xl">
                <div className="aspect-[4/5] relative bg-black/50 rounded-sm overflow-hidden">
                  <div className="w-full h-full grid grid-cols-4 gap-px bg-border/20">
                    {COLLECTION_BOTTLES.map((bottle, i) => (
                      <div
                        key={i}
                        className="relative overflow-hidden"
                        style={{ background: 'radial-gradient(ellipse at 50% 25%, #3d1a05 0%, #1c0c03 50%, #080401 100%)' }}
                      >
                        <img src={bottle.image} alt={bottle.name} className="w-full h-full object-contain p-1 opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 space-y-4">
                    <h2 className="text-3xl font-serif leading-tight">{giveaway.name}</h2>
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span className="text-primary">{giveaway.prizeValue}</span>
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
                    onClick={nextStep}
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
                    { icon: '🎟️', title: 'Enter the draw', desc: 'Select a ticket package to enter.' },
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

          {/* ── STEP 2: DETAILS ── */}
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
                  {details.confirmEmail && details.email !== details.confirmEmail && (
                    <p className="text-xs text-destructive">Emails do not match</p>
                  )}
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
                  onClick={() => { setQuizIndex(0); setQuizSelected(''); setQuizError(false); setQuizAttempts(0); nextStep(); }}
                >
                  Continue to Question
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: SKILL-TESTING QUESTION ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="text-center space-y-2 mb-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-3xl font-serif text-primary">Skill-Testing Question</h2>
                <p className="text-muted-foreground text-sm">
                  As required by contest law, answer this whisky question correctly to proceed to payment.
                </p>
              </div>

              <div className="bg-card border border-border p-8 rounded-sm space-y-6">
                {quizAttempts > 0 && (
                  <motion.div
                    key={`attempt-${quizAttempts}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-sm px-4 py-3 text-sm text-amber-400"
                  >
                    <RefreshCw className="w-4 h-4 shrink-0" />
                    Incorrect — here's a new question. Have another go!
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={quizIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <p className="font-serif text-xl leading-snug">{currentQuiz.question}</p>

                    <div className="space-y-3">
                      {currentQuiz.options.map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => setQuizSelected(opt.val)}
                          className={`w-full text-left px-5 py-4 border rounded-sm transition-all duration-200 font-mono text-sm ${
                            quizSelected === opt.val
                              ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(234,146,55,0.12)]'
                              : 'border-border hover:border-primary/50 bg-card/50'
                          }`}
                        >
                          <span className="text-primary/60 mr-3 uppercase">{opt.val}.</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <Button
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest text-base"
                  onClick={submitQuiz}
                  disabled={!quizSelected}
                >
                  Submit Answer
                </Button>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <div className="bg-card border border-border rounded-sm px-4 py-2 text-xs font-mono text-muted-foreground">
                  {selectedPackage.qty} ticket{selectedPackage.qty !== 1 ? 's' : ''} · £{selectedPackage.price}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: PAYMENT ── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-5 gap-8"
            >
              {/* Left: checkout panel */}
              <div className="md:col-span-3 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-serif text-primary">Secure Checkout</h2>
                  <p className="text-muted-foreground text-sm">Complete your entry purchase below.</p>
                </div>

                <div className="bg-card border border-border rounded-sm p-8 space-y-6">
                  {/* Entrant summary */}
                  <div className="flex items-center gap-3 pb-5 border-b border-border/50">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                      <span className="text-primary font-serif text-sm">
                        {details.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-serif">{details.firstName} {details.lastName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{details.email}</p>
                    </div>
                  </div>

                  {/* Payment method tabs */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/40 rounded-sm">
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-sm text-sm font-mono transition-all duration-200 ${
                          paymentMethod === 'card'
                            ? 'bg-card border border-border text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" /> Card
                      </button>
                      <button
                        onClick={() => setPaymentMethod('bank')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-sm text-sm font-mono transition-all duration-200 ${
                          paymentMethod === 'bank'
                            ? 'bg-card border border-border text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Building2 className="w-4 h-4" /> Bank Transfer
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {paymentMethod === 'card' ? (
                        <motion.div
                          key="card-form"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-3"
                        >
                          <div className="space-y-1.5">
                            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Cardholder Name</Label>
                            <Input
                              placeholder="James Bond"
                              value={cardDetails.name}
                              onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                              className="font-mono"
                              autoComplete="cc-name"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Card Number</Label>
                            <div className="relative">
                              <Input
                                placeholder="1234 5678 9012 3456"
                                value={cardDetails.number}
                                onChange={e => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                                className="font-mono tracking-widest pr-20"
                                inputMode="numeric"
                                autoComplete="cc-number"
                                maxLength={19}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                                <div className="w-8 h-5 bg-blue-500/20 border border-blue-500/30 rounded-sm flex items-center justify-center">
                                  <span className="text-[8px] font-bold text-blue-400 leading-none">VISA</span>
                                </div>
                                <div className="w-8 h-5 bg-orange-500/20 border border-orange-500/30 rounded-sm flex items-center justify-center">
                                  <div className="flex">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70 -ml-1.5" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Expiry</Label>
                              <Input
                                placeholder="MM / YY"
                                value={cardDetails.expiry}
                                onChange={e => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                                className="font-mono"
                                inputMode="numeric"
                                autoComplete="cc-exp"
                                maxLength={7}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">CVC</Label>
                              <div className="relative">
                                <Input
                                  placeholder="123"
                                  value={cardDetails.cvc}
                                  onChange={e => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                  className="font-mono pr-9"
                                  inputMode="numeric"
                                  autoComplete="cc-csc"
                                  maxLength={4}
                                  type="password"
                                />
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="bank-form"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-3"
                        >
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-sm px-4 py-3 text-xs text-amber-400 font-mono">
                            Funds will be transferred directly to our secure prize account. Draw entry is confirmed on receipt.
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Account Holder Name</Label>
                            <Input
                              placeholder="James Bond"
                              value={bankDetails.accountHolder}
                              onChange={e => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                              className="font-mono"
                              autoComplete="name"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Sort Code</Label>
                              <Input
                                placeholder="12-34-56"
                                value={bankDetails.sortCode}
                                onChange={e => setBankDetails({ ...bankDetails, sortCode: formatSortCode(e.target.value) })}
                                className="font-mono tracking-widest"
                                inputMode="numeric"
                                maxLength={8}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Account Number</Label>
                              <Input
                                placeholder="12345678"
                                value={bankDetails.accountNumber}
                                onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                                className="font-mono tracking-widest"
                                inputMode="numeric"
                                maxLength={8}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className="text-xs text-muted-foreground/60 font-mono flex items-center gap-1.5">
                      <Lock className="w-3 h-3" />
                      Your details are encrypted and never stored on our servers
                    </p>
                  </div>

                  {/* Order line */}
                  <div className="space-y-2 border-t border-border/50 pt-5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{giveaway.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{selectedPackage.qty} ticket{selectedPackage.qty > 1 ? 's' : ''}</span>
                      <span className="font-mono">£{selectedPackage.price}</span>
                    </div>
                    <div className="h-px bg-border/50 my-2" />
                    <div className="flex justify-between font-serif text-lg text-primary">
                      <span>Total</span>
                      <span>£{selectedPackage.price}</span>
                    </div>
                  </div>

                  {entryError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm font-mono bg-red-400/10 border border-red-400/20 rounded-sm p-3">
                      <XCircle className="w-4 h-4 shrink-0" />
                      {entryError}
                    </div>
                  )}

                  <Button
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest text-base gap-2 disabled:opacity-50"
                    onClick={handlePayment}
                    disabled={isSubmitting || !isPaymentValid}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
                    ) : (
                      <><CreditCard className="w-5 h-5" /> Pay £{selectedPackage.price}</>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                    256-bit SSL encryption · Secure checkout
                  </div>
                </div>
              </div>

              {/* Right: order summary */}
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
                  <div className="text-xs font-mono space-y-1.5 text-muted-foreground">
                    <div className="flex justify-between"><span>Prize Value</span><span>{giveaway.prizeValue}</span></div>
                    <div className="flex justify-between"><span>Max Entries</span><span>{giveaway.maxEntries}</span></div>
                    <div className="flex justify-between"><span>Your Tickets</span><span>{selectedPackage.qty}</span></div>
                  </div>
                </div>
                <Button variant="ghost" className="w-full" onClick={() => setStep(3)}>← Back</Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 5: CONFIRMATION ── */}
          {step === 5 && (
            <motion.div
              key="step5"
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

      <Footer />
    </div>
  );
}
