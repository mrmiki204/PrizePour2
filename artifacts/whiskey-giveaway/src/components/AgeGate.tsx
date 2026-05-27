import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoSrc from '@/assets/prizepour-logo.png';

const STORAGE_KEY = 'prizepour_age_verified';

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'pending' | 'allowed' | 'denied'>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true' ? 'allowed' : 'pending';
    } catch {
      return 'pending';
    }
  });

  function allow() {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
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
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: 'linear-gradient(160deg, #1c0c03 0%, #0e0603 60%, #080401 100%)' }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-700/10 rounded-full blur-3xl" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative max-w-md w-full mx-6 text-center space-y-8"
            >
              <div className="flex justify-center">
                <img src={logoSrc} alt="PrizePour" className="h-20 w-auto object-contain" />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-serif tracking-widest text-amber-500/60 uppercase">Age Verification</p>
                <h2 className="text-3xl font-serif text-white leading-snug">
                  Are you 18 or over?
                </h2>
                <p className="text-sm text-amber-100/50 leading-relaxed">
                  PrizePour competitions involve alcohol and are strictly for adults. You must be 18 or over to enter.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={allow}
                  className="flex-1 h-14 rounded-sm bg-amber-600 hover:bg-amber-500 text-white font-serif text-base sm:text-lg tracking-wide transition-colors duration-200 uppercase"
                >
                  Yes — Enter
                </button>
                <button
                  onClick={deny}
                  className="flex-1 h-14 rounded-sm border border-amber-900/60 hover:border-amber-700/60 text-amber-100/60 hover:text-amber-100/80 font-serif text-base sm:text-lg tracking-wide transition-colors duration-200 uppercase"
                >
                  No — Leave
                </button>
              </div>

              <p className="text-xs text-amber-100/30 leading-relaxed">
                By entering you confirm you are of legal age in your jurisdiction.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {status === 'denied' && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'linear-gradient(160deg, #1c0c03 0%, #0e0603 60%, #080401 100%)' }}
        >
          <div className="max-w-md w-full mx-6 text-center space-y-6">
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
