import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import logoSrc from '@/assets/prizepour-logo.png';

// Session-only verification: persists for the current browser tab/session
// (survives reloads and direct deep links within the same session) but is
// cleared when the tab/browser is closed — so returning visitors are always
// re-prompted. Intentionally NOT localStorage (no permanent remembering).
const STORAGE_KEY = 'prizepour_age_verified_session';

// Subtle luxury film-grain noise as an inline SVG data URI (no extra asset).
const NOISE_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'pending' | 'allowed' | 'denied'>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true' ? 'allowed' : 'pending';
    } catch {
      return 'pending';
    }
  });

  function allow() {
    try { sessionStorage.setItem(STORAGE_KEY, 'true'); } catch {}
    setStatus('allowed');
  }

  function deny() {
    setStatus('denied');
    setTimeout(() => {
      try { window.location.href = 'https://www.google.com'; } catch {}
    }, 2200);
  }

  return (
    <>
      <AnimatePresence>
        {status === 'pending' && (
          <motion.div
            key="age-gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto px-5 py-10 sm:px-8"
            style={{ background: 'radial-gradient(120% 90% at 50% 0%, #251205 0%, #160a03 45%, #0b0502 75%, #060301 100%)' }}
          >
            {/* Decorative background layers */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* warm amber glow behind the card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] max-w-[120vw] bg-amber-600/12 rounded-full blur-[120px]" />
              {/* subtle whiskey-glow accents on the far left and right edges */}
              <div className="absolute top-1/2 -left-40 -translate-y-1/2 w-[420px] h-[620px] bg-amber-800/10 rounded-full blur-[130px]" />
              <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-[420px] h-[620px] bg-amber-700/10 rounded-full blur-[130px]" />
              {/* soft vignette around the edges */}
              <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(110% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)' }}
              />
              {/* luxury film-grain texture */}
              <div
                className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
                style={{ backgroundImage: NOISE_DATA_URI, backgroundRepeat: 'repeat' }}
              />
            </div>

            <div className="relative w-[90%] mx-auto" style={{ maxWidth: '1000px' }}>
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-7 sm:mb-9"
              >
                <img
                  src={logoSrc}
                  alt="PrizePour"
                  className="h-24 sm:h-28 w-auto object-contain"
                  style={{ filter: 'drop-shadow(0 0 26px rgba(217,160,60,0.45))' }}
                />
              </motion.div>

              {/* Main verification card */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, delay: 0.12 }}
                className="relative rounded-[32px] border border-amber-500/30 bg-[#140a04]/70 backdrop-blur-xl px-6 py-12 sm:px-14 sm:py-14 text-center"
                style={{ boxShadow: '0 0 0 1px rgba(217,160,60,0.06), 0 30px 80px -20px rgba(0,0,0,0.8), 0 0 90px -30px rgba(217,160,60,0.45)' }}
              >
                {/* 18+ badge */}
                <div className="flex justify-center -mt-[68px] sm:-mt-[78px] mb-8">
                  <div
                    className="flex items-center justify-center w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full border border-amber-400/50 bg-[#160a04] text-amber-300 font-serif text-xl sm:text-2xl tracking-wide"
                    style={{ boxShadow: '0 0 30px -6px rgba(217,160,60,0.5), inset 0 0 14px rgba(217,160,60,0.12)' }}
                  >
                    18+
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs font-serif tracking-[0.32em] text-amber-400/70 uppercase">
                  Age Verification
                </p>

                <h2 className="mt-4 text-3xl sm:text-5xl font-serif text-white leading-tight">
                  Are you <span className="text-amber-400">18</span> or over?
                </h2>

                {/* decorative gold divider */}
                <div className="mx-auto mt-7 h-px w-40 sm:w-56 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

                <p className="mx-auto mt-7 max-w-xl text-sm sm:text-base text-amber-100/55 leading-relaxed">
                  PrizePour competitions involve alcohol and are strictly for adults.
                  You must be 18 or over to enter.
                </p>

                {/* Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-5">
                  <button
                    onClick={allow}
                    className="group relative flex-1 inline-flex items-center justify-center gap-2 h-16 rounded-xl text-[#1a0e03] font-serif text-base sm:text-lg font-semibold tracking-[0.18em] uppercase transition-all duration-200 hover:brightness-110 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #f4c66a 0%, #d99a36 50%, #b9772a 100%)',
                      boxShadow: '0 10px 30px -8px rgba(217,160,60,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
                    }}
                  >
                    Yes — Enter
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={deny}
                    className="flex-1 inline-flex items-center justify-center h-16 rounded-xl border border-amber-400/40 bg-transparent text-amber-100/75 font-serif text-base sm:text-lg tracking-[0.18em] uppercase transition-all duration-200 hover:bg-amber-500/10 hover:border-amber-300/70 hover:text-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
                  >
                    No — Leave
                  </button>
                </div>

                {/* Footer / legal note */}
                <div className="mt-10 flex items-center justify-center gap-2 text-amber-100/35">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <p className="text-[11px] sm:text-xs leading-relaxed">
                    By entering you confirm you are of legal age in your jurisdiction.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {status === 'denied' && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-6"
          style={{ background: 'radial-gradient(120% 90% at 50% 0%, #251205 0%, #160a03 45%, #0b0502 75%, #060301 100%)' }}
        >
          <div className="max-w-md w-full mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <img src={logoSrc} alt="PrizePour" className="h-16 w-auto object-contain opacity-50" />
            </div>
            <h2 className="text-2xl font-serif text-white">Sorry, entry not permitted.</h2>
            <p className="text-sm text-amber-100/50 leading-relaxed">
              PrizePour is only available to those aged 18 and over. Please come back when you meet the age requirement.
            </p>
            <p className="text-xs text-amber-100/30">Please drink responsibly.</p>
          </div>
        </div>
      )}

      {status === 'allowed' && <>{children}</>}
    </>
  );
}
