import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoSrc from '@assets/WhatsApp_Image_2026-05-12_at_21.07.11_1778616565600.jpeg';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <img src={logoSrc} alt="PrizePour" className="h-14 w-auto object-contain" />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#giveaways" className="text-sm font-medium tracking-widest text-foreground/80 hover:text-primary transition-colors uppercase">Giveaways</a>
          <a href="#winners" className="text-sm font-medium tracking-widest text-foreground/80 hover:text-primary transition-colors uppercase">Winners</a>
          <a href="#about" className="text-sm font-medium tracking-widest text-foreground/80 hover:text-primary transition-colors uppercase">About</a>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-primary">
            <User className="w-5 h-5" />
          </Button>
          <Button className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider">
            Join Club
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden text-foreground">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
