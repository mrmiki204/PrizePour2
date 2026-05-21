import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Ticket, Gift, LogOut, CheckCircle2, ArrowRight, MapPin, Shield } from 'lucide-react';
import { useListGiveaways } from '@workspace/api-client-react';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  country: string;
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

const MONTHS = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' },   { value: '04', label: 'April' },
  { value: '05', label: 'May' },     { value: '06', label: 'June' },
  { value: '07', label: 'July' },    { value: '08', label: 'August' },
  { value: '09', label: 'September' },{ value: '10', label: 'October' },
  { value: '11', label: 'November' },{ value: '12', label: 'December' },
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(CURRENT_YEAR - 18 - i));

const COUNTRIES = [
  'United Kingdom', 'Ireland', 'United States', 'Canada', 'Australia',
  'New Zealand', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands',
  'Belgium', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Other',
];

function isAtLeast18(day: string, month: string, year: string): boolean {
  const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return dob <= cutoff;
}

function formatDob(dob: string | undefined) {
  if (!dob) return '—';
  const [y, m, d] = dob.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '',
  dobDay: '', dobMonth: '', dobYear: '',
  addressLine1: '', addressLine2: '', city: '', postcode: '', country: '',
};

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        {icon}
      </div>
      <p className="text-xs font-serif uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive mt-1">{msg}</p>;
}

export function Profile() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const { data: giveaways } = useListGiveaways();

  useEffect(() => { setProfile(getProfile()); }, []);

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '', dob: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.dobDay || !form.dobMonth || !form.dobYear) e.dob = 'Please select your full date of birth';
    else if (!isAtLeast18(form.dobDay, form.dobMonth, form.dobYear)) e.dob = 'You must be 18 or older to register';
    if (!form.addressLine1.trim()) e.addressLine1 = 'Address line 1 is required';
    if (!form.city.trim()) e.city = 'Town / city is required';
    if (!form.postcode.trim()) e.postcode = 'Postcode is required';
    if (!form.country) e.country = 'Country is required';
    return e;
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const newProfile: UserProfile = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      dateOfBirth: `${form.dobYear}-${form.dobMonth}-${form.dobDay}`,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2,
      city: form.city,
      postcode: form.postcode,
      country: form.country,
      createdAt: new Date().toISOString(),
    };
    saveProfile(newProfile);
    setProfile(newProfile);
    setSaved(true);
    window.dispatchEvent(new Event('prizepour:profile-changed'));
  }

  function handleSignOut() {
    clearProfile();
    setProfile(null);
    setSaved(false);
    setForm(EMPTY_FORM);
    window.dispatchEvent(new Event('prizepour:profile-changed'));
  }

  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 sm:pt-28 md:pt-36 pb-16 sm:pb-24 max-w-2xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">

          {/* ── Signed-in view ── */}
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
                  Account created — welcome to PrizePour!
                </motion.div>
              )}

              <div className="flex items-center gap-5 mb-10">
                <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                  <span className="text-2xl font-serif text-primary">{initials}</span>
                </div>
                <div>
                  <p className="text-xs font-serif text-primary uppercase tracking-widest mb-1">Your Profile</p>
                  <h1 className="text-3xl font-serif">{profile.firstName} {profile.lastName}</h1>
                  <p className="text-muted-foreground text-sm mt-1">{profile.email}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <button
                  onClick={() => setLocation('/my-referrals')}
                  className="group bg-card border border-border rounded-sm p-5 text-left hover:border-primary/50 transition-colors"
                >
                  <Gift className="w-6 h-6 text-primary mb-3" />
                  <p className="font-serif text-lg mb-1">My Rewards</p>
                  <p className="text-xs text-muted-foreground">Check and claim free tickets from referrals</p>
                  <div className="flex items-center gap-1 text-xs text-primary font-serif uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <div className="flex items-center gap-1 text-xs text-primary font-serif uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Enter <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              </div>

              {/* Personal info */}
              <div className="bg-card border border-border rounded-sm divide-y divide-border mb-4">
                <div className="px-5 py-3 flex justify-between items-center">
                  <span className="text-xs font-serif uppercase tracking-widest text-muted-foreground">Name</span>
                  <span className="text-sm font-serif">{profile.firstName} {profile.lastName}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center">
                  <span className="text-xs font-serif uppercase tracking-widest text-muted-foreground">Email</span>
                  <span className="text-sm font-serif">{profile.email}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center">
                  <span className="text-xs font-serif uppercase tracking-widest text-muted-foreground">Date of birth</span>
                  <span className="text-sm font-serif">{formatDob(profile.dateOfBirth)}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center">
                  <span className="text-xs font-serif uppercase tracking-widest text-muted-foreground">Member since</span>
                  <span className="text-sm font-serif">
                    {new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="bg-card border border-border rounded-sm divide-y divide-border mb-8">
                <div className="px-5 py-3 flex items-start justify-between gap-4">
                  <span className="text-xs font-serif uppercase tracking-widest text-muted-foreground shrink-0 pt-0.5">Address</span>
                  <div className="text-sm font-serif text-right space-y-0.5">
                    <p>{profile.addressLine1}</p>
                    {profile.addressLine2 && <p>{profile.addressLine2}</p>}
                    <p>{profile.city}</p>
                    <p>{profile.postcode}</p>
                    <p>{profile.country}</p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="border-destructive/40 hover:border-destructive text-destructive hover:text-destructive gap-2 font-serif text-xs uppercase tracking-widest h-10"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </motion.div>

          ) : (

            /* ── Sign-up form ── */
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
                <p className="text-xs font-serif text-primary uppercase tracking-widest mb-3">Create Account</p>
                <h1 className="text-3xl sm:text-4xl font-serif mb-3">Join PrizePour</h1>
                <p className="text-muted-foreground max-w-sm">
                  Save your details, track rewards, and enter draws faster. Must be 18 or older to register.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-10">

                {/* ── Personal details ── */}
                <div>
                  <SectionHeading icon={<User className="w-4 h-4" />} label="Personal Details" />
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="font-serif text-xs uppercase tracking-widest text-muted-foreground">First Name</Label>
                        <Input
                          id="firstName"
                          value={form.firstName}
                          onChange={e => set('firstName', e.target.value)}
                          placeholder="James"
                          className={`bg-card border-border font-serif ${errors.firstName ? 'border-destructive' : ''}`}
                        />
                        <FieldError msg={errors.firstName} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="font-serif text-xs uppercase tracking-widest text-muted-foreground">Last Name</Label>
                        <Input
                          id="lastName"
                          value={form.lastName}
                          onChange={e => set('lastName', e.target.value)}
                          placeholder="MacAllister"
                          className={`bg-card border-border font-serif ${errors.lastName ? 'border-destructive' : ''}`}
                        />
                        <FieldError msg={errors.lastName} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-serif text-xs uppercase tracking-widest text-muted-foreground">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                        placeholder="james@example.com"
                        className={`bg-card border-border font-serif ${errors.email ? 'border-destructive' : ''}`}
                      />
                      <FieldError msg={errors.email} />
                    </div>
                  </div>
                </div>

                {/* ── Age verification ── */}
                <div>
                  <SectionHeading icon={<Shield className="w-4 h-4" />} label="Age Verification (18+)" />
                  <div className="bg-primary/5 border border-primary/20 rounded-sm px-4 py-3 mb-5 flex items-start gap-3">
                    <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You must be 18 or older to enter any draw on PrizePour. We verify your age at signup to comply with UK gambling and alcohol regulations.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-serif text-xs uppercase tracking-widest text-muted-foreground">Date of Birth</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Select value={form.dobDay} onValueChange={v => set('dobDay', v)}>
                          <SelectTrigger className={`bg-card border-border font-serif ${errors.dob ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {DAYS.map(d => (
                              <SelectItem key={d} value={d} className="font-serif">{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Select value={form.dobMonth} onValueChange={v => set('dobMonth', v)}>
                          <SelectTrigger className={`bg-card border-border font-serif ${errors.dob ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {MONTHS.map(m => (
                              <SelectItem key={m.value} value={m.value} className="font-serif">{m.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Select value={form.dobYear} onValueChange={v => set('dobYear', v)}>
                          <SelectTrigger className={`bg-card border-border font-serif ${errors.dob ? 'border-destructive' : ''}`}>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {YEARS.map(y => (
                              <SelectItem key={y} value={y} className="font-serif">{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <FieldError msg={errors.dob} />
                  </div>
                </div>

                {/* ── Delivery address ── */}
                <div>
                  <SectionHeading icon={<MapPin className="w-4 h-4" />} label="Delivery Address" />
                  <p className="text-xs text-muted-foreground mb-5">
                    Where we'll ship your prize if you win. You can update this any time before a draw closes.
                  </p>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="addressLine1" className="font-serif text-xs uppercase tracking-widest text-muted-foreground">Address Line 1</Label>
                      <Input
                        id="addressLine1"
                        value={form.addressLine1}
                        onChange={e => set('addressLine1', e.target.value)}
                        placeholder="12 Distillery Lane"
                        className={`bg-card border-border font-serif ${errors.addressLine1 ? 'border-destructive' : ''}`}
                      />
                      <FieldError msg={errors.addressLine1} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressLine2" className="font-serif text-xs uppercase tracking-widest text-muted-foreground">
                        Address Line 2 <span className="normal-case tracking-normal text-muted-foreground/60">(optional)</span>
                      </Label>
                      <Input
                        id="addressLine2"
                        value={form.addressLine2}
                        onChange={e => set('addressLine2', e.target.value)}
                        placeholder="Apartment, suite, etc."
                        className="bg-card border-border font-serif"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="font-serif text-xs uppercase tracking-widest text-muted-foreground">Town / City</Label>
                        <Input
                          id="city"
                          value={form.city}
                          onChange={e => set('city', e.target.value)}
                          placeholder="Cork"
                          className={`bg-card border-border font-serif ${errors.city ? 'border-destructive' : ''}`}
                        />
                        <FieldError msg={errors.city} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postcode" className="font-serif text-xs uppercase tracking-widest text-muted-foreground">Postcode</Label>
                        <Input
                          id="postcode"
                          value={form.postcode}
                          onChange={e => set('postcode', e.target.value.toUpperCase())}
                          placeholder="SW1A 1AA"
                          className={`bg-card border-border font-serif ${errors.postcode ? 'border-destructive' : ''}`}
                        />
                        <FieldError msg={errors.postcode} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-serif text-xs uppercase tracking-widest text-muted-foreground">Country</Label>
                      <Select value={form.country} onValueChange={v => set('country', v)}>
                        <SelectTrigger className={`bg-card border-border font-serif ${errors.country ? 'border-destructive' : ''}`}>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(c => (
                            <SelectItem key={c} value={c} className="font-serif">{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError msg={errors.country} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest font-serif text-sm gap-2"
                  >
                    Create Account <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Your data is stored locally on your device. No password required. Must be 18+.
                  </p>
                </div>

              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}
