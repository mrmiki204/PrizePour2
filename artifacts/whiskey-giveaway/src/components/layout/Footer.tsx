import { useLocation } from 'wouter';
import logoSrc from '@/assets/prizepour-logo.png';

export function Footer() {
  const [, setLocation] = useLocation();
  const nav = (path: string) => {
    setLocation(path);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };
  const scrollToOnHome = (id: string) => {
    setLocation('/');
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
  };

  const linkCls =
    'text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider py-1 min-h-[32px] inline-flex items-center';

  return (
    <footer className="bg-card border-t border-border">
      {/* Top — brand + columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-5 space-y-5">
          <div className="flex items-center">
            <img src={logoSrc} alt="PrizePour" className="h-12 sm:h-16 w-auto object-contain" />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm">
            A transparent home for premium spirit prize draws — rare whiskies, distillery experiences, fine glassware and craft bar equipment. Capped, fair, and drawn live.
          </p>

          {/* Beta + 18+ notes */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-start gap-2.5 rounded-sm border border-primary/30 bg-primary/5 px-3 py-2.5 max-w-sm">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
              <p className="text-xs sm:text-[13px] font-serif text-muted-foreground leading-snug">
                <span className="text-foreground/80">PrizePour is currently in beta.</span> Checkout is disabled while we finalise the experience.
              </p>
            </div>
            <p className="text-xs sm:text-[13px] font-serif text-amber-200/70 tracking-wide">
              18+ only. Please drink responsibly.
            </p>
          </div>
        </div>

        {/* Explore */}
        <nav aria-label="Explore" className="lg:col-span-3">
          <h4 className="font-serif text-base sm:text-lg mb-5 sm:mb-6 text-foreground">Explore</h4>
          <ul className="space-y-2 sm:space-y-3">
            <li><button onClick={() => nav('/')} className={linkCls}>Active Draws</button></li>
            <li><button onClick={() => scrollToOnHome('winners')} className={linkCls}>Past Winners</button></li>
            <li><button onClick={() => nav('/how-it-works')} className={linkCls}>How It Works</button></li>
            <li><button onClick={() => nav('/how-winners-are-selected')} className={linkCls}>How Winners Are Selected</button></li>
            <li><button onClick={() => nav('/faq')} className={linkCls}>FAQ</button></li>
            <li><a href="mailto:hello@prizepour.com" className={linkCls}>Contact Us</a></li>
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label="Legal" className="lg:col-span-4">
          <h4 className="font-serif text-base sm:text-lg mb-5 sm:mb-6 text-foreground">Legal &amp; Wellbeing</h4>
          <ul className="space-y-2 sm:space-y-3">
            <li><button onClick={() => nav('/responsible-drinking')} className={linkCls}>Responsible Drinking / 18+</button></li>
            <li><button onClick={() => nav('/terms')} className={linkCls}>Terms of Service</button></li>
            <li><button onClick={() => nav('/privacy')} className={linkCls}>Privacy Policy</button></li>
            <li><button onClick={() => nav('/rules')} className={linkCls}>Contest Rules</button></li>
            <li><a href="mailto:legal@prizepour.com" className={linkCls}>Legal Enquiries</a></li>
          </ul>
        </nav>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-center md:text-left">
          <p className="text-xs sm:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PrizePour. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-muted-foreground">
            <button onClick={() => nav('/terms')} className="hover:text-primary transition-colors">Terms</button>
            <button onClick={() => nav('/privacy')} className="hover:text-primary transition-colors">Privacy</button>
            <button onClick={() => nav('/rules')} className="hover:text-primary transition-colors">Rules</button>
            <button onClick={() => nav('/responsible-drinking')} className="hover:text-primary transition-colors">Drink Aware</button>
          </div>
          <p className="text-xs sm:text-sm text-amber-200/60 font-serif tracking-wide">
            18+ · Please drink responsibly
          </p>
        </div>
      </div>
    </footer>
  );
}
