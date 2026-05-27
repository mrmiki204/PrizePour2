import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Check, AlertTriangle, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'prizepour_prelaunch_checklist_v1';

type Item = { id: string; label: string; critical?: boolean };
type Section = { id: string; title: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    id: 'polish',
    title: 'Website polish',
    items: [
      { id: 'polish.mobile', label: 'Mobile layout checked' },
      { id: 'polish.hero', label: 'Hero section checked' },
      { id: 'polish.footer', label: 'Footer links checked' },
      { id: 'polish.draws', label: 'Active draws visible' },
      { id: 'polish.domain', label: 'Domain and HTTPS working', critical: true },
    ],
  },
  {
    id: 'legal',
    title: 'Legal and trust',
    items: [
      { id: 'legal.tos', label: 'Terms of Service added', critical: true },
      { id: 'legal.privacy', label: 'Privacy Policy added', critical: true },
      { id: 'legal.rules', label: 'Contest Rules added', critical: true },
      { id: 'legal.responsible', label: 'Responsible Drinking / 18+ page added', critical: true },
      { id: 'legal.winners', label: 'How Winners Are Selected page added' },
      { id: 'legal.contact', label: 'Contact page added' },
    ],
  },
  {
    id: 'flow',
    title: 'Giveaway flow',
    items: [
      { id: 'flow.list', label: 'Active draws load' },
      { id: 'flow.detail', label: 'Draw detail page works' },
      { id: 'flow.steps', label: 'Entry steps work' },
      { id: 'flow.checkout-off', label: 'Checkout disabled during beta', critical: true },
      { id: 'flow.no-real', label: 'No accidental real payments possible', critical: true },
    ],
  },
  {
    id: 'payments',
    title: 'Payments testing',
    items: [
      { id: 'pay.test-connected', label: 'Stripe test mode connected' },
      { id: 'pay.test-success', label: 'Test payment succeeds' },
      { id: 'pay.test-fail', label: 'Failed payment handled' },
      { id: 'pay.test-cancel', label: 'Cancelled checkout handled' },
      { id: 'pay.entry-created', label: 'Ticket entry created after successful test payment' },
    ],
  },
  {
    id: 'launch',
    title: 'Launch readiness',
    items: [
      { id: 'launch.company', label: 'Company registration checked', critical: true },
      { id: 'launch.bank', label: 'Business bank account ready', critical: true },
      { id: 'launch.no-live-keys', label: 'Stripe live keys not enabled yet', critical: true },
      { id: 'launch.admin-pause', label: 'Admin can pause/disable draws' },
      { id: 'launch.legal-review', label: 'Final legal review completed', critical: true },
    ],
  },
];

const ALL_IDS = SECTIONS.flatMap(s => s.items.map(i => i.id));
const CRITICAL_IDS = SECTIONS.flatMap(s => s.items.filter(i => i.critical).map(i => i.id));

function loadState(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function PreLaunchChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setChecked(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)); } catch {}
  }, [checked, hydrated]);

  const toggle = (id: string) =>
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const resetAll = () => {
    if (!confirm('Reset all checklist items?')) return;
    setChecked({});
  };

  const { totalDone, totalCount, criticalDone, criticalCount, pct } = useMemo(() => {
    const totalDone = ALL_IDS.filter(id => checked[id]).length;
    const criticalDone = CRITICAL_IDS.filter(id => checked[id]).length;
    return {
      totalDone,
      totalCount: ALL_IDS.length,
      criticalDone,
      criticalCount: CRITICAL_IDS.length,
      pct: Math.round((totalDone / ALL_IDS.length) * 100),
    };
  }, [checked]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">

          {/* Header */}
          <div className="space-y-3">
            <p className="text-xs font-serif text-primary uppercase tracking-widest">Internal · Admin Only</p>
            <h1 className="text-3xl sm:text-4xl font-serif">Pre-Launch Checklist</h1>
            <p className="text-muted-foreground text-sm sm:text-base font-serif max-w-2xl">
              Working list of everything to confirm before flipping PrizePour to live payments and public launch. Progress is saved in your browser only.
            </p>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-3 rounded-sm border border-amber-400/40 bg-amber-400/10 p-4 sm:p-5">
            <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <p className="text-sm sm:text-base font-serif text-amber-100/90 leading-relaxed">
              <span className="text-amber-200 font-semibold">Internal checklist only.</span> Do not enable live payments until every critical item is complete.
            </p>
          </div>

          {/* Progress */}
          <div className="rounded-sm border border-border bg-card/60 p-5 sm:p-6 space-y-4">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-serif text-muted-foreground uppercase tracking-widest">Overall progress</p>
                <p className="font-serif text-3xl sm:text-4xl text-primary mt-1">{pct}%</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-serif text-foreground">
                  {totalDone} / {totalCount} complete
                </p>
                <p className="text-xs font-serif text-amber-200/80">
                  {criticalDone} / {criticalCount} critical
                </p>
              </div>
            </div>
            <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-amber-300 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 text-xs font-serif text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8 sm:space-y-10">
            {SECTIONS.map((section, idx) => {
              const done = section.items.filter(i => checked[i.id]).length;
              return (
                <section key={section.id} className="space-y-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-serif text-xl sm:text-2xl text-foreground">
                      <span className="text-primary/70 mr-2">{String(idx + 1).padStart(2, '0')}</span>
                      {section.title}
                    </h2>
                    <p className="text-xs sm:text-sm font-serif text-muted-foreground tabular-nums shrink-0">
                      {done} / {section.items.length}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map(item => {
                      const isChecked = !!checked[item.id];
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => toggle(item.id)}
                            aria-pressed={isChecked}
                            className={`group w-full flex items-center gap-3 sm:gap-4 rounded-sm border px-4 py-3 sm:py-3.5 text-left transition-colors min-h-[52px] ${
                              isChecked
                                ? 'border-primary/50 bg-primary/10'
                                : 'border-border bg-card/40 hover:border-primary/40 hover:bg-card/70'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                                isChecked
                                  ? 'bg-primary border-primary'
                                  : 'border-border group-hover:border-primary/60'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />}
                            </span>
                            <span className={`flex-1 text-sm sm:text-base font-serif leading-snug ${
                              isChecked ? 'text-foreground/70 line-through decoration-primary/40' : 'text-foreground'
                            }`}>
                              {item.label}
                            </span>
                            {item.critical && (
                              <span className="shrink-0 text-[10px] sm:text-xs font-serif text-amber-300/90 uppercase tracking-widest border border-amber-400/30 rounded-full px-2 py-0.5">
                                Critical
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground/70 font-serif text-center pt-4">
            Progress is stored locally in this browser only (key: <span className="font-mono">{STORAGE_KEY}</span>). Not synced across devices.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
