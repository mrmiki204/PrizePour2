import { GlassWater, Instagram, Twitter, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <GlassWater className="w-8 h-8 text-primary" />
            <span className="font-serif text-2xl font-bold tracking-widest text-primary">PRIZEPOUR</span>
          </div>
          <p className="text-muted-foreground max-w-sm">
            Curating the finest, rarest, and most sought-after whiskies for those who appreciate the craft. An exclusive club for serious collectors.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="font-serif text-lg mb-6 text-foreground">Explore</h4>
          <ul className="space-y-4">
            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Active Draws</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Past Winners</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">How it Works</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Authentication</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-serif text-lg mb-6 text-foreground">Legal</h4>
          <ul className="space-y-4">
            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Terms of Service</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Privacy Policy</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Rules</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-border/50 text-center md:text-left text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} PrizePour. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Please drink responsibly.</p>
      </div>
    </footer>
  );
}
