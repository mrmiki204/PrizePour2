import { useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useListGiveaways, useUpdateGiveaway } from '@workspace/api-client-react';
import type { Giveaway } from '@workspace/api-client-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { daysUntil } from '@/data/giveaways';
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Save,
  X,
  Edit2,
  Eye,
  EyeOff,
  Power,
  PowerOff,
  Pause,
  Play,
  AlertTriangle,
  LogOut,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TICKET_PRICE_GBP = 4.99;
const PAYMENTS_ENABLED = import.meta.env.VITE_PAYMENTS_ENABLED === 'true';

interface EditForm {
  description: string;
  prizeValue: string;
  prizeValueNumeric: string;
  maxEntries: string;
  drawDate: string;
  ticketPriceGbp: string;
  heroTagline: string;
}

function formToInitial(g: Giveaway): EditForm {
  return {
    description: g.description,
    prizeValue: g.prizeValue,
    prizeValueNumeric: g.prizeValueNumeric,
    maxEntries: String(g.maxEntries),
    drawDate: new Date(g.drawDate).toISOString().slice(0, 16),
    ticketPriceGbp: g.ticketPriceGbp,
    heroTagline: g.heroTagline ?? '',
  };
}

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive: boolean;
  onConfirm: () => void;
}

const emptyConfirm: ConfirmState = {
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  destructive: false,
  onConfirm: () => {},
};

export function AdminDraws() {
  const [, setLocation] = useLocation();
  const { data: giveaways = [], isLoading, refetch, isFetching } = useListGiveaways({ all: true });
  const updateGiveaway = useUpdateGiveaway();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [savedId, setSavedId] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(emptyConfirm);
  const [filter, setFilter] = useState<'all' | 'active' | 'hidden' | 'paused' | 'ended'>('all');

  const sorted = useMemo(
    () =>
      [...giveaways].sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        return new Date(a.drawDate).getTime() - new Date(b.drawDate).getTime();
      }),
    [giveaways],
  );

  const now = Date.now();
  const counts = useMemo(() => {
    const c = { all: sorted.length, active: 0, hidden: 0, paused: 0, ended: 0 };
    for (const g of sorted) {
      const ended = new Date(g.drawDate).getTime() < now;
      if (g.isActive && g.isPublic && !g.entriesPaused && !ended) c.active++;
      if (!g.isPublic) c.hidden++;
      if (g.entriesPaused) c.paused++;
      if (ended) c.ended++;
    }
    return c;
  }, [sorted, now]);

  const filtered = useMemo(() => {
    return sorted.filter((g) => {
      const ended = new Date(g.drawDate).getTime() < now;
      switch (filter) {
        case 'active':
          return g.isActive && g.isPublic && !g.entriesPaused && !ended;
        case 'hidden':
          return !g.isPublic;
        case 'paused':
          return g.entriesPaused;
        case 'ended':
          return ended;
        case 'all':
        default:
          return true;
      }
    });
  }, [sorted, filter, now]);

  const startEdit = (g: Giveaway) => {
    setEditingId(g.id);
    setForm(formToInitial(g));
    setFormError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(null);
    setFormError('');
  };

  const setField = (k: keyof EditForm, v: string) => {
    setForm((f) => (f ? { ...f, [k]: v } : f));
  };

  const handleSave = async (g: Giveaway) => {
    if (!form) return;
    setFormError('');

    const prizeNum = parseFloat(form.prizeValueNumeric);
    const maxEntries = parseInt(form.maxEntries, 10);
    const drawDateParsed = new Date(form.drawDate);
    const ticketPrice = parseFloat(form.ticketPriceGbp);

    if (!form.description.trim()) {
      setFormError('Description cannot be empty.');
      return;
    }
    if (!form.prizeValue.trim()) {
      setFormError('Prize value label cannot be empty.');
      return;
    }
    if (isNaN(prizeNum) || prizeNum <= 0) {
      setFormError('Prize value (numeric) must be a positive number.');
      return;
    }
    if (isNaN(maxEntries) || maxEntries < 1) {
      setFormError('Total tickets must be at least 1.');
      return;
    }
    if (maxEntries < g.entryCount) {
      setFormError(`Total tickets cannot be below tickets already sold (${g.entryCount}).`);
      return;
    }
    if (isNaN(drawDateParsed.getTime())) {
      setFormError('Draw date is invalid.');
      return;
    }
    if (isNaN(ticketPrice) || ticketPrice < 0.5 || ticketPrice > 50) {
      setFormError('Ticket price must be between £0.50 and £50.00.');
      return;
    }

    const priceChanged = Math.abs(ticketPrice - parseFloat(g.ticketPriceGbp)) > 0.001;
    if (priceChanged) {
      const ok = window.confirm(
        `Change ticket price from £${parseFloat(g.ticketPriceGbp).toFixed(2)} to £${ticketPrice.toFixed(2)}?\n\n` +
        `This affects the 140 % capacity formula and the single-ticket price shown across the site. ` +
        `Existing Stripe products and bundle prices are NOT re-seeded automatically.`,
      );
      if (!ok) return;
    }

    setSavingId(g.id);
    try {
      await updateGiveaway.mutateAsync({
        id: g.id,
        data: {
          description: form.description.trim(),
          prizeValue: form.prizeValue.trim(),
          prizeValueNumeric: prizeNum,
          maxEntries,
          drawDate: drawDateParsed.toISOString(),
          ticketPriceGbp: ticketPrice,
          heroTagline: form.heroTagline.trim() || null,
        },
      });
      await refetch();
      setEditingId(null);
      setForm(null);
      setSavedId(g.id);
      setTimeout(() => setSavedId((c) => (c === g.id ? null : c)), 2500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed.';
      if (/401|unauthor/i.test(msg)) {
        const { clearAdminToken } = await import('@/lib/adminToken');
        clearAdminToken();
        setFormError('Admin session expired. Please log in again.');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setFormError(msg);
      }
    } finally {
      setSavingId(null);
    }
  };

  const toggleField = async (g: Giveaway, field: 'isActive' | 'isPublic' | 'entriesPaused', next: boolean) => {
    setTogglingId(g.id);
    try {
      await updateGiveaway.mutateAsync({ id: g.id, data: { [field]: next } });
      await refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (/401|unauthor/i.test(msg)) {
        const { clearAdminToken } = await import('@/lib/adminToken');
        clearAdminToken();
        alert('Admin session expired. Please log in again.');
        window.location.reload();
      } else {
        alert(msg || 'Update failed.');
      }
    } finally {
      setTogglingId(null);
    }
  };

  const askConfirm = (state: Omit<ConfirmState, 'open'>) =>
    setConfirm({ ...state, open: true });

  const handleToggleActive = (g: Giveaway) => {
    if (g.isActive) {
      askConfirm({
        title: 'Deactivate draw?',
        message: `"${g.name}" will be fully disabled. It will not appear publicly and no entries can be created. You can re-activate it later.`,
        confirmLabel: 'Deactivate',
        destructive: true,
        onConfirm: () => toggleField(g, 'isActive', false),
      });
    } else {
      toggleField(g, 'isActive', true);
    }
  };

  const handleTogglePublic = (g: Giveaway) => {
    if (g.isPublic) {
      askConfirm({
        title: 'Hide from public homepage?',
        message: `"${g.name}" will be hidden from the public site. Existing entries are kept. The draw stays active in the admin area.`,
        confirmLabel: 'Hide',
        destructive: true,
        onConfirm: () => toggleField(g, 'isPublic', false),
      });
    } else {
      toggleField(g, 'isPublic', true);
    }
  };

  const handleTogglePaused = (g: Giveaway) => {
    if (!g.entriesPaused) {
      askConfirm({
        title: 'Pause entries?',
        message: `New entries for "${g.name}" will be refused until you resume. The draw stays visible.`,
        confirmLabel: 'Pause entries',
        destructive: true,
        onConfirm: () => toggleField(g, 'entriesPaused', true),
      });
    } else {
      toggleField(g, 'entriesPaused', false);
    }
  };

  const handleLogout = async () => {
    const { getAdminToken, clearAdminToken } = await import('@/lib/adminToken');
    const token = getAdminToken();
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
      headers: token ? { 'X-Admin-Token': token } : undefined,
    });
    clearAdminToken();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 pt-28 sm:pt-32 md:pt-40 pb-16 max-w-6xl mx-auto w-full px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <Link href="/admin">
              <a className="inline-flex items-center gap-1 text-xs font-serif uppercase tracking-widest text-muted-foreground hover:text-primary mb-3 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Back to Admin
              </a>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight">Draw Management</h1>
            <p className="text-muted-foreground text-xs sm:text-sm font-serif mt-1 uppercase tracking-widest">
              Activate · Hide · Pause · Edit
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2 font-serif text-xs uppercase tracking-widest"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 font-serif text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Beta / payments banner */}
        <div
          className={`border rounded-sm p-3 sm:p-4 text-xs sm:text-sm font-serif flex items-start gap-3 ${
            PAYMENTS_ENABLED
              ? 'border-yellow-500/40 bg-yellow-500/5 text-yellow-300'
              : 'border-primary/30 bg-primary/5 text-primary/90'
          }`}
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            {PAYMENTS_ENABLED ? (
              <>
                <strong className="uppercase tracking-widest text-[10px] sm:text-xs mr-2">Stripe Test Mode</strong>
                Checkout is live in <em>test mode only</em>. No real cards are charged. Live keys are refused
                server-side.
              </>
            ) : (
              <>
                <strong className="uppercase tracking-widest text-[10px] sm:text-xs mr-2">Beta — Payments Off</strong>
                Checkout is disabled at the server (<code>PAYMENTS_ENABLED=false</code>). No entries can be paid for.
              </>
            )}
          </div>
        </div>

        {/* Static experiences explainer */}
        <div className="border border-border rounded-sm p-3 sm:p-4 bg-secondary/20 text-xs sm:text-sm font-serif flex items-start gap-3 text-muted-foreground">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <div className="space-y-1">
            <p>
              <strong className="text-foreground">Bushmills Distillery Tour Experience</strong> is a static
              experience landing page at{' '}
              <Link href="/experiences/bushmills">
                <a className="text-primary underline">/experiences/bushmills</a>
              </Link>{' '}
              — it is not a database draw, so it does not appear in this list. Static experiences must be edited in
              code (<code className="text-foreground/80">src/pages/BushmillsExperience.tsx</code>).
            </p>
            <p className="text-muted-foreground/80">
              All true draws (Patrón Collection, Clonakilty Collection, and any new ones you create) live in the
              database and appear below.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        {!isLoading && sorted.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
            {(['all', 'active', 'hidden', 'paused', 'ended'] as const).map((key) => {
              const label =
                key === 'all'
                  ? 'All Draws'
                  : key === 'active'
                    ? 'Active'
                    : key === 'hidden'
                      ? 'Hidden'
                      : key === 'paused'
                        ? 'Paused'
                        : 'Previous / Ended';
              const active = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-sm text-[10px] sm:text-xs font-serif uppercase tracking-widest border transition-colors ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                >
                  {label}
                  <span className={`ml-1.5 text-[10px] ${active ? 'text-primary/70' : 'text-muted-foreground/60'}`}>
                    {counts[key]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground font-serif text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading draws…
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-card border border-border rounded-sm p-10 text-center text-muted-foreground font-serif">
            No draws yet. Create one from the{' '}
            <Link href="/admin">
              <a className="text-primary underline">main admin dashboard</a>
            </Link>
            .
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-sm p-10 text-center text-muted-foreground font-serif text-sm">
            No draws match the <span className="text-primary">{filter}</span> filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((g) => {
              const isEditing = editingId === g.id;
              const isSaving = savingId === g.id;
              const isToggling = togglingId === g.id;
              const pct = g.maxEntries > 0 ? Math.min((g.entryCount / g.maxEntries) * 100, 100) : 0;
              const ticketsRemaining = Math.max(g.maxEntries - g.entryCount, 0);

              return (
                <div
                  key={g.id}
                  className={`bg-card border rounded-sm overflow-hidden transition-colors ${
                    g.isActive ? 'border-border' : 'border-border/40 opacity-80'
                  }`}
                >
                  {/* Top row */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5">
                    {/* Thumb */}
                    <div className="w-full sm:w-32 h-32 shrink-0 bg-secondary/40 border border-border rounded-sm overflow-hidden flex items-center justify-center">
                      {g.imageUrl ? (
                        <img
                          src={g.imageUrl}
                          alt={g.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-muted-foreground text-[10px] font-serif uppercase tracking-widest">
                          No image
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <h2 className="text-lg sm:text-xl font-serif text-foreground truncate flex-1 min-w-0">
                          {g.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusPill
                            label={g.isActive ? 'Active' : 'Inactive'}
                            tone={g.isActive ? 'green' : 'muted'}
                          />
                          <StatusPill
                            label={g.isPublic ? 'Public' : 'Hidden'}
                            tone={g.isPublic ? 'gold' : 'muted'}
                          />
                          {g.entriesPaused && <StatusPill label="Entries Paused" tone="amber" />}
                          {savedId === g.id && (
                            <span className="inline-flex items-center gap-1 text-xs font-serif text-green-400">
                              <CheckCircle2 className="w-3 h-3" /> Saved
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm font-serif">
                        <InfoCell label="Prize value" value={g.prizeValue} accent />
                        <InfoCell label="Ticket price" value={`£${parseFloat(g.ticketPriceGbp).toFixed(2)}`} />
                        <InfoCell
                          label="Tickets"
                          value={`${ticketsRemaining} left`}
                          sub={`${g.entryCount} / ${g.maxEntries}`}
                        />
                        <InfoCell
                          label="Draw date"
                          value={new Date(g.drawDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                          sub={`${daysUntil(g.drawDate)}d left`}
                        />
                      </div>

                      {/* Capacity bar */}
                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Controls row */}
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex flex-wrap gap-2">
                    <ToggleButton
                      active={g.isActive}
                      activeLabel="Active"
                      inactiveLabel="Inactive"
                      onClick={() => handleToggleActive(g)}
                      disabled={isToggling || isSaving}
                      OnIcon={Power}
                      OffIcon={PowerOff}
                    />
                    <ToggleButton
                      active={g.isPublic}
                      activeLabel="Visible"
                      inactiveLabel="Hidden"
                      onClick={() => handleTogglePublic(g)}
                      disabled={isToggling || isSaving || !g.isActive}
                      OnIcon={Eye}
                      OffIcon={EyeOff}
                    />
                    <ToggleButton
                      active={!g.entriesPaused}
                      activeLabel="Accepting Entries"
                      inactiveLabel="Entries Paused"
                      onClick={() => handleTogglePaused(g)}
                      disabled={isToggling || isSaving || !g.isActive}
                      OnIcon={Play}
                      OffIcon={Pause}
                      invertColor
                    />
                    <div className="flex-1" />
                    {!isEditing ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 font-serif text-xs uppercase tracking-widest"
                        onClick={() => startEdit(g)}
                        disabled={isToggling}
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit details
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 font-serif text-xs uppercase tracking-widest text-muted-foreground"
                        onClick={cancelEdit}
                        disabled={isSaving}
                      >
                        <X className="w-3.5 h-3.5" /> Close editor
                      </Button>
                    )}
                  </div>

                  {/* Edit panel */}
                  <AnimatePresence initial={false}>
                    {isEditing && form && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border bg-secondary/10"
                      >
                        <div className="p-4 sm:p-5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-1">
                              <Label className="text-xs font-serif uppercase tracking-widest">
                                Short description
                              </Label>
                              <textarea
                                value={form.description}
                                onChange={(e) => setField('description', e.target.value)}
                                rows={3}
                                className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none font-serif"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-serif uppercase tracking-widest">
                                Prize value (label)
                              </Label>
                              <Input
                                value={form.prizeValue}
                                onChange={(e) => setField('prizeValue', e.target.value)}
                                placeholder="£220"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-serif uppercase tracking-widest">
                                Prize value (numeric, £)
                              </Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.prizeValueNumeric}
                                onChange={(e) => setField('prizeValueNumeric', e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-serif uppercase tracking-widest">
                                Total tickets
                              </Label>
                              <Input
                                type="number"
                                min={Math.max(g.entryCount, 1)}
                                value={form.maxEntries}
                                onChange={(e) => setField('maxEntries', e.target.value)}
                              />
                              <p className="text-[10px] text-muted-foreground font-serif">
                                Cannot be lower than tickets already sold ({g.entryCount}).
                              </p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-serif uppercase tracking-widest">
                                Draw end date
                              </Label>
                              <Input
                                type="datetime-local"
                                value={form.drawDate}
                                onChange={(e) => setField('drawDate', e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-serif uppercase tracking-widest">
                                Ticket price (£)
                              </Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.5"
                                max="50"
                                value={form.ticketPriceGbp}
                                onChange={(e) => setField('ticketPriceGbp', e.target.value)}
                              />
                              <p className="text-[10px] text-muted-foreground font-serif">
                                Default £4.99. Changing this rescales the 140 % capacity formula and updates
                                single-ticket price displays. Bundle prices on the entry page are separate.
                              </p>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <Label className="text-xs font-serif uppercase tracking-widest">
                                Hero tagline (optional)
                              </Label>
                              <Input
                                value={form.heroTagline}
                                onChange={(e) => setField('heroTagline', e.target.value)}
                                placeholder="e.g. The world's rarest tequila collection — yours for £4.99."
                              />
                              <p className="text-[10px] text-muted-foreground font-serif">
                                Shown above the prize name on the giveaway detail page. Leave blank to hide.
                              </p>
                            </div>
                          </div>

                          {formError && (
                            <p className="text-red-400 text-xs font-serif">{formError}</p>
                          )}

                          <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                              onClick={() => handleSave(g)}
                              disabled={isSaving}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest gap-2 font-serif text-xs"
                            >
                              {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              Save changes
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={cancelEdit}
                              disabled={isSaving}
                              className="font-serif text-xs uppercase tracking-widest"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirm.open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirm(emptyConfirm)}
          >
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-primary/30 rounded-sm max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-sm ${
                    confirm.destructive ? 'bg-red-500/10' : 'bg-primary/10'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      confirm.destructive ? 'text-red-400' : 'text-primary'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-base sm:text-lg text-foreground">
                    {confirm.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-serif mt-1">
                    {confirm.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-serif text-xs uppercase tracking-widest"
                  onClick={() => setConfirm(emptyConfirm)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className={`font-serif text-xs uppercase tracking-widest ${
                    confirm.destructive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                  onClick={() => {
                    confirm.onConfirm();
                    setConfirm(emptyConfirm);
                  }}
                >
                  {confirm.confirmLabel}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: 'green' | 'gold' | 'amber' | 'muted';
}) {
  const cls =
    tone === 'green'
      ? 'border-green-500/40 bg-green-500/10 text-green-400'
      : tone === 'gold'
        ? 'border-primary/40 bg-primary/10 text-primary'
        : tone === 'amber'
          ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
          : 'border-border bg-secondary/50 text-muted-foreground';
  return (
    <span className={`text-[10px] sm:text-xs font-serif uppercase tracking-widest px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

function InfoCell({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-serif mb-0.5">
        {label}
      </p>
      <p className={`font-serif ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground font-serif">{sub}</p>}
    </div>
  );
}

function ToggleButton({
  active,
  activeLabel,
  inactiveLabel,
  onClick,
  disabled,
  OnIcon,
  OffIcon,
  invertColor,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  onClick: () => void;
  disabled?: boolean;
  OnIcon: React.ElementType;
  OffIcon: React.ElementType;
  invertColor?: boolean;
}) {
  const Icon = active ? OnIcon : OffIcon;
  const activeCls = invertColor
    ? 'border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20'
    : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20';
  const inactiveCls = invertColor
    ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
    : 'border-border bg-secondary/40 text-muted-foreground hover:border-primary/50 hover:text-foreground';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border text-[10px] sm:text-xs font-serif uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        active ? activeCls : inactiveCls
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}
