import { useLocation } from 'wouter';
import { Search, CreditCard, Trophy } from 'lucide-react';
import logoSrc from '@/assets/prizepour-logo.png';

const HOW_IT_WORKS_STEPS = [
  {
    icon: Search,
    step: '01',
    title: 'Choose a Draw',
    body: 'Browse premium whisky, tequila and spirit giveaways from authorised retailers.',
  },
  {
    icon: CreditCard,
    step: '02',
    title: 'Buy Your Entries',
    body: 'Secure checkout with transparent entry limits. Every draw has a fixed cap.',
  },
  {
    icon: Trophy,
    step: '03',
    title: 'Winner Selected',
    body: 'Winners are chosen fairly via verifiable RNG and announced publicly.',
  },
] as const;

export function Footer() {
  const [, setLocation] = useLocation();

  const nav = (path: string) => setLocation(path);

  return (
    <footer id="how-it-works" className="bg-card border-t border-border">
      {/* ── How it Works strip ── */}
      <div className="border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[10px] font-serif text-primary uppercase tracking-[0.25em]">The Process</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-200">How It Works</span>
            </h2>
          </div>

          <div className="relative">
            {/* Connecting hairline — desktop only */}
            <div aria-hidden className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {HOW_IT_WORKS_STEPS.map(({ icon: Icon, step, title, body }) => (
                <div key={step} className="group text-center">
                  <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-primary/20 group-hover:border-primary/50 transition-colors duration-500" />
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/40 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-500">
                      <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="font-serif text-[10px] tracking-[0.3em] text-primary/70 uppercase mb-2">Step {step}</p>
                  <h3 className="font-serif text-base sm:text-lg text-foreground mb-2 leading-tight">{title}</h3>
                  <div className="mx-auto w-8 h-px bg-primary/40 mb-3 group-hover:w-12 group-hover:bg-primary/70 transition-all duration-500" />
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-12 sm:pt-16 max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
        <div className="col-span-1 sm:col-span-2 space-y-4 sm:space-y-6">
          <div className="flex items-center">
            <img src={logoSrc} alt="PrizePour" className="h-12 sm:h-16 w-auto object-contain" />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-sm">
            Exclusive prize draws for rare spirits, premium bar equipment, glassware, and more. A transparent, honest platform for collectors and enthusiasts.
          </p>
        </div>
        
        <div>
          <h4 className="font-serif text-lg mb-6 text-foreground">Explore</h4>
          <ul className="space-y-4">
            <li><button onClick={() => nav('/')} className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Active Draws</button></li>
            <li><button onClick={() => { nav('/'); setTimeout(() => document.getElementById('winners')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Past Winners</button></li>
            <li><button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">How it Works</button></li>
            <li><a href="mailto:hello@prizepour.com" className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Contact Us</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-serif text-lg mb-6 text-foreground">Legal</h4>
          <ul className="space-y-4">
            <li><button onClick={() => nav('/terms')} className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Terms of Service</button></li>
            <li><button onClick={() => nav('/privacy')} className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Privacy Policy</button></li>
            <li><button onClick={() => nav('/rules')} className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Contest Rules</button></li>
            <li><a href="mailto:legal@prizepour.com" className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Legal Enquiries</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16 pt-6 sm:pt-8 pb-12 sm:pb-16 border-t border-border/50 text-center md:text-left text-xs sm:text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} PrizePour. All rights reserved.</p>
        <div className="flex gap-6">
          <button onClick={() => nav('/terms')} className="hover:text-primary transition-colors">Terms</button>
          <button onClick={() => nav('/privacy')} className="hover:text-primary transition-colors">Privacy</button>
          <button onClick={() => nav('/rules')} className="hover:text-primary transition-colors">Rules</button>
        </div>
        <p>Please drink responsibly. Must be of legal drinking age.</p>
      </div>
    </footer>
  );
}
