import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, CheckCircle2, Sparkles, Clock, Crown, ShieldCheck } from 'lucide-react';
import { useCreateBetaSignup } from '@workspace/api-client-react';
import { track } from '@/lib/track';

type Status =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export function WaitlistSection() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const createSignup = useCreateBetaSignup({
    mutation: {
      onSuccess: (data) => {
        track({ eventType: 'waitlist_completed', eventName: 'beta_waitlist' });
        setStatus({
          kind: 'success',
          message: data.message || "You're on the list. PrizePour beta updates are coming soon.",
        });
        setFirstName('');
        setEmail('');
      },
      onError: (err: unknown) => {
        let message = 'Something went wrong. Please try again.';
        let status = 0;
        const errObj = err as { data?: { error?: string } | null; message?: string; status?: number };
        if (typeof errObj?.status === 'number') status = errObj.status;
        if (errObj?.data && typeof errObj.data === 'object' && typeof errObj.data.error === 'string') {
          message = errObj.data.error;
        } else if (err instanceof Error && err.message) {
          message = err.message;
        }
        if (status === 409) {
          track({ eventType: 'waitlist_duplicate', eventName: 'beta_waitlist' });
        } else {
          track({
            eventType: 'waitlist_failed',
            eventName: 'beta_waitlist',
            metadata: status ? `status=${status}` : null,
          });
        }
        setStatus({ kind: 'error', message });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: 'idle' });
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      track({ eventType: 'waitlist_failed', eventName: 'beta_waitlist', metadata: 'client_validation' });
      setStatus({ kind: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    const trimmedFirst = firstName.trim();
    track({ eventType: 'waitlist_started', eventName: 'beta_waitlist' });
    createSignup.mutate({
      data: {
        firstName: trimmedFirst.length > 0 ? trimmedFirst : null,
        email: trimmedEmail,
      },
    });
  };

  const isSubmitting = createSignup.isPending;

  return (
    <section
      id="beta-waitlist"
      className="relative py-16 sm:py-24 overflow-hidden border-y border-primary/15"
    >
      {/* Premium gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-card/60 backdrop-blur-sm border border-primary/25 rounded-sm p-8 sm:p-12 shadow-[0_0_60px_-15px_rgba(212,175,55,0.25)]"
        >
          <div className="text-center mb-8">
            <p className="inline-flex items-center gap-2 text-xs font-serif text-primary uppercase tracking-[0.2em] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Join the Beta List
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground mb-4 leading-tight">
              Be First Through the Door
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              PrizePour opens to a small group first. Join the beta list to preview new
              collections, get early access before each draw goes public, and secure your
              place the moment entries open.
            </p>
          </div>

          {/* Why join early — concise value props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            {[
              { icon: Clock, title: 'Early Access', body: 'Preview new collections early and get priority access the moment entries open.' },
              { icon: Crown, title: 'Founding Members', body: 'Launch-only perks reserved for our earliest members.' },
              { icon: ShieldCheck, title: 'No Spam', body: 'Occasional launch updates only. Unsubscribe anytime.' },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-sm border border-border/60 bg-background/40 p-3.5 sm:p-4"
              >
                <div className="shrink-0 w-8 h-8 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-sm text-foreground mb-0.5">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="beta-first-name"
                  className="text-[10px] font-serif uppercase tracking-[0.2em] text-muted-foreground"
                >
                  First name <span className="normal-case text-muted-foreground/60">(optional)</span>
                </Label>
                <Input
                  id="beta-first-name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="James"
                  disabled={isSubmitting}
                  className="bg-background/60 border-border focus:border-primary/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="beta-email"
                  className="text-[10px] font-serif uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Email *
                </Label>
                <Input
                  id="beta-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  className="bg-background/60 border-border focus:border-primary/60"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-[0.2em] font-serif text-sm h-12 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining…
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Join Beta List
                </>
              )}
            </Button>

            {status.kind === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 text-sm text-primary bg-primary/10 border border-primary/30 rounded-sm px-4 py-3"
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{status.message}</span>
              </motion.div>
            )}
            {status.kind === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3"
                role="alert"
                aria-live="polite"
              >
                {status.message}
              </motion.div>
            )}

            <p className="text-center text-[11px] font-serif text-muted-foreground/80 uppercase tracking-[0.2em] pt-2">
              No spam · Early access only · Unsubscribe anytime
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
