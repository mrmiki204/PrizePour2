import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Ticket, Gift, LogOut, CheckCircle2, ArrowRight } from 'lucide-react';
import { useListGiveaways } from '@workspace/api-client-react';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export const PROFILE_KEY = 'prizepour_profile';

export function getProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

export function Profile() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const { data: giveaways } = useListGiveaways();

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    return e;
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const newProfile: UserProfile = { ...form, createdAt: new Date().toISOString() };
    saveProfile(newProfile);
    setProfile(newProfile);
    setSaved(true);
    window.dispatchEvent(new Event('prizepour:profile-changed'));
  }

  function handleSignOut() {
    clearProfile();
    setProfile(null);
    setSaved(false);
    setForm({ firstName: '', lastName: '', email: '' });
    window.dispatchEvent(new Event('prizepour:profile-changed'));
  }

  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-32 pb-24 max-w-2xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {profile ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-sm px-5 py-3 text-sm text-green-400"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Profile created successfully — welcome to PrizePour!
                </motion.div>
              )}

              {/* Avatar + name */}
              <div className="flex items-center gap-5 mb-10">
                <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                  <span className="text-2xl font-serif text-primary">{initials}</span>
                </div>
                <div>
                  <p className="text-xs font-mono text-primary uppercase tracking-widest mb-1">Your Profile</p>
                  <h1 className="text-3xl font-serif">{profile.firstName} {profile.lastName}</h1>
                  <p className="text-muted-foreground text-sm mt-1">{profile.email}</p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <button
                  onClick={() => setLocation('/my-referrals')}
                  className="group bg-card border border-border rounded-sm p-5 text-left hover:border-primary/50 transition-colors"
                >
                  <Gift className="w-6 h-6 text-primary mb-3" />
                  <p className="font-serif text-lg mb-1">My Rewards</p>
                  <p className="text-xs text-muted-foreground">Check and claim free tickets from referrals</p>
                  <div className="flex items-center gap-1 text-xs text-primary font-mono uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
                <button
                  onClick={() => setLocation('/')}
                  className="group bg-card border border-border rounded-sm p-5 text-left hover:border-primary/50 transition-colors"
                >
                  <Ticket className="w-6 h-6 text-primary mb-3" />
                  <p className="font-serif text-lg mb-1">Browse Draws</p>
                  <p className="text-xs text-muted-foreground">Enter one of {giveaways?.length ?? 0} live giveaways</p>
                  <div className="flex items-center gap-1 text-xs text-primary font-mono uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Enter <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              </div>

              {/* Account info */}
              <div className="bg-card border border-border rounded-sm divide-y divide-border mb-8">
                <div className="px-5 py-4 flex justify-between items-center">
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">First name</span>
                  <span className="text-sm font-serif">{profile.firstName}</span>
                </div>
                <div className="px-5 py-4 flex justify-between items-center">
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Last name</span>
                  <span className="text-sm font-serif">{profile.lastName}</span>
                </div>
                <div className="px-5 py-4 flex justify-between items-center">
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Email</span>
                  <span className="text-sm font-mono">{profile.email}</span>
                </div>
                <div className="px-5 py-4 flex justify-between items-center">
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Member since</span>
                  <span className="text-sm font-mono">
                    {new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="border-destructive/40 hover:border-destructive text-destructive hover:text-destructive gap-2 font-mono text-xs uppercase tracking-widest h-10"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <div className="mb-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Create Profile</p>
                <h1 className="text-4xl font-serif mb-3">Join PrizePour</h1>
                <p className="text-muted-foreground max-w-sm">
                  Save your details so you can track rewards, manage your referrals, and enter draws faster.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={e => { setForm(f => ({ ...f, firstName: e.target.value })); setErrors(ev => ({ ...ev, firstName: '' })); }}
                      placeholder="James"
                      className={`bg-card border-border font-mono ${errors.firstName ? 'border-destructive' : ''}`}
                    />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={e => { setForm(f => ({ ...f, lastName: e.target.value })); setErrors(ev => ({ ...ev, lastName: '' })); }}
                      placeholder="MacAllister"
                      className={`bg-card border-border font-mono ${errors.lastName ? 'border-destructive' : ''}`}
                    />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(ev => ({ ...ev, email: '' })); }}
                    placeholder="james@example.com"
                    className={`bg-card border-border font-mono ${errors.email ? 'border-destructive' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest font-mono text-sm h-12 px-8 gap-2"
                  >
                    Create Profile <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Your data is stored locally on your device. No passwords, no account required.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}
