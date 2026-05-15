import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import logoSrc from '@/assets/prizepour-logo.png';
import { getProfile } from '@/pages/Profile';

interface NavbarProps {
  onScrollTo?: (id: string) => void;
}

export function Navbar({ onScrollTo }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [initials, setInitials] = useState<string | null>(null);

  function refreshProfile() {
    const p = getProfile();
    if (p) {
      setInitials(`${p.firstName[0]}${p.lastName[0]}`.toUpperCase());
    } else {
      setInitials(null);
    }
  }

  useEffect(() => {
    refreshProfile();
    window.addEventListener('prizepour:profile-changed', refreshProfile);
    return () => window.removeEventListener('prizepour:profile-changed', refreshProfile);
  }, []);

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
      <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
        <button onClick={() => setLocation('/')} className="flex items-center">
          <img src={logoSrc} alt="PrizePour" className="h-28 w-auto object-contain" />
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
          <button
            onClick={() => { setMobileOpen(false); setLocation('/profile'); }}
            className="w-9 h-9 rounded-full border border-border hover:border-primary transition-colors flex items-center justify-center text-foreground/80 hover:text-primary"
            aria-label="Profile"
          >
            {initials ? (
              <span className="text-xs font-serif font-medium text-primary">{initials}</span>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            )}
          </button>
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
          <button
            onClick={() => { setMobileOpen(false); setLocation('/profile'); }}
            className="block w-full text-left text-sm font-medium tracking-widest text-foreground/80 hover:text-primary transition-colors uppercase py-2"
          >
            {initials ? `My Profile (${initials})` : 'Create Profile'}
          </button>
        </div>
      )}
    </nav>
  );
}
