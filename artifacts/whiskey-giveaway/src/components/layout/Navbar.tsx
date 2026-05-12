import { Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import logoSrc from '@/assets/prizepour-logo.png';

interface NavbarProps {
  onScrollTo?: (id: string) => void;
}

export function Navbar({ onScrollTo }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleNav = (id: string) => {
    setMobileOpen(false);
    if (onScrollTo) {
      onScrollTo(id);
    } else {
      setLocation('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const links = [
    { label: 'Giveaways', id: 'giveaways' },
    { label: 'Winners', id: 'winners' },
    { label: 'About', id: 'about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <button onClick={() => setLocation('/')} className="flex items-center">
          <img src={logoSrc} alt="PrizePour" className="h-14 w-auto object-contain" />
        </button>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => handleNav(l.id)}
              className="text-sm font-medium tracking-widest text-foreground/80 hover:text-primary transition-colors uppercase"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-primary">
            <User className="w-5 h-5" />
          </Button>
          <Button
            className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider"
            onClick={() => handleNav('giveaways')}
          >
            Join Club
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border px-6 pb-6 space-y-4">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => handleNav(l.id)}
              className="block w-full text-left text-sm font-medium tracking-widest text-foreground/80 hover:text-primary transition-colors uppercase py-2"
            >
              {l.label}
            </button>
          ))}
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider"
            onClick={() => handleNav('giveaways')}
          >
            Join Club
          </Button>
        </div>
      )}
    </nav>
  );
}
