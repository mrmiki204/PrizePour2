export function BetaBanner() {
  return (
    <div
      role="status"
      aria-label="Beta notice"
      className="relative w-full border-b border-primary/20 bg-gradient-to-r from-background via-card to-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-center gap-2.5 sm:gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full border border-primary/40 bg-primary/10">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[9px] sm:text-[10px] font-serif text-primary uppercase tracking-[0.25em]">Beta</span>
        </span>
        <p className="text-[11px] sm:text-xs font-serif text-muted-foreground leading-snug">
          <span className="text-foreground/80">PrizePour is currently in beta testing.</span>
          <span className="hidden sm:inline"> Checkout is disabled while we finalise the experience.</span>
          <span className="sm:hidden"> Checkout disabled.</span>
        </p>
      </div>
    </div>
  );
}
