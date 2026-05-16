import { useLocation } from 'wouter';
import logoSrc from '@/assets/prizepour-logo.png';

export function Footer() {
  const [, setLocation] = useLocation();

  const nav = (path: string) => setLocation(path);

  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center">
            <img src={logoSrc} alt="PrizePour" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-muted-foreground max-w-sm">
            Exclusive prize draws for rare spirits, premium bar equipment, glassware, and more. A transparent, honest platform for collectors and enthusiasts.
          </p>
        </div>
        
        <div>
          <h4 className="font-serif text-lg mb-6 text-foreground">Explore</h4>
          <ul className="space-y-4">
            <li><button onClick={() => nav('/')} className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Active Draws</button></li>
            <li><button onClick={() => { nav('/'); setTimeout(() => document.getElementById('winners')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Past Winners</button></li>
            <li><button onClick={() => { nav('/'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">How it Works</button></li>
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
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-border/50 text-center md:text-left text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
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
