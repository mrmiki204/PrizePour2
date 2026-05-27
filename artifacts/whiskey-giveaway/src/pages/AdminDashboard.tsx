import React, { useState } from 'react';
import { useListEntries, useListGiveaways, useCreateGiveaway, useUpdateGiveaway, useDeleteGiveaway } from '@workspace/api-client-react';
import type { Giveaway } from '@workspace/api-client-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { daysUntil } from '@/data/giveaways';
import { BarChart2, Users, DollarSign, Ticket, ChevronDown, ChevronUp, RefreshCw, Search, Plus, Edit2, EyeOff, Eye, X, Save, Loader2, LogOut, Settings2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-sm p-6 flex items-start gap-4">
      <div className="p-2 bg-primary/10 rounded-sm">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs font-serif uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-serif text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

type SortKey = 'createdAt' | 'firstName' | 'email' | 'ticketQty' | 'amountPaid' | 'giveawayId';

interface GiveawayFormData {
  name: string;
  description: string;
  prizeValue: string;
  prizeValueNumeric: number;
  maxEntries: number;
  drawDate: string;
  imageUrl: string;
}

function emptyForm(): GiveawayFormData {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 30);
  return {
    name: '',
    description: '',
    prizeValue: '',
    prizeValueNumeric: 0,
    maxEntries: 0,
    drawDate: tomorrow.toISOString().slice(0, 16),
    imageUrl: '',
  };
}

function giveawayToForm(g: Giveaway): GiveawayFormData {
  return {
    name: g.name,
    description: g.description,
    prizeValue: g.prizeValue,
    prizeValueNumeric: parseFloat(g.prizeValueNumeric),
    maxEntries: g.maxEntries,
    drawDate: new Date(g.drawDate).toISOString().slice(0, 16),
    imageUrl: g.imageUrl ?? '',
  };
}

function computeMaxEntries(priceNumeric: number): number {
  return Math.ceil(priceNumeric * 1.4 / 4.99);
}

interface GiveawayFormProps {
  initial: GiveawayFormData;
  onSubmit: (data: GiveawayFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting: boolean;
}

function GiveawayForm({ initial, onSubmit, onCancel, submitLabel, isSubmitting }: GiveawayFormProps) {
  const [form, setForm] = useState<GiveawayFormData>(initial);
  const [error, setError] = useState('');

  const set = (k: keyof GiveawayFormData, v: string | number) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'prizeValueNumeric') {
        const n = typeof v === 'number' ? v : parseFloat(v as string);
        next.maxEntries = isNaN(n) ? 0 : computeMaxEntries(n);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.description || !form.prizeValue || !form.prizeValueNumeric || !form.maxEntries || !form.drawDate) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-1">
          <Label className="text-xs font-serif uppercase tracking-widest">Name *</Label>
          <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Clonakilty 21 Year Old Single Malt" required />
        </div>
        <div className="md:col-span-2 space-y-1">
          <Label className="text-xs font-serif uppercase tracking-widest">Description *</Label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe the bottle…"
            rows={3}
            required
            className="w-full bg-background border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-serif uppercase tracking-widest">Prize Value Label *</Label>
          <Input value={form.prizeValue} onChange={e => set('prizeValue', e.target.value)} placeholder="€220" required />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-serif uppercase tracking-widest">Prize Value (numeric) *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.prizeValueNumeric || ''}
            onChange={e => set('prizeValueNumeric', parseFloat(e.target.value) || 0)}
            placeholder="220.00"
            required
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-serif uppercase tracking-widest">
            Max Entries *{' '}
            <span className="text-muted-foreground normal-case">(auto-computed)</span>
          </Label>
          <Input
            type="number"
            min="1"
            value={form.maxEntries || ''}
            onChange={e => set('maxEntries', parseInt(e.target.value) || 0)}
            placeholder="62"
            required
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-serif uppercase tracking-widest">Draw Date &amp; Time *</Label>
          <Input
            type="datetime-local"
            value={form.drawDate}
            onChange={e => set('drawDate', e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2 space-y-1">
          <Label className="text-xs font-serif uppercase tracking-widest">Image URL <span className="text-muted-foreground normal-case">(optional)</span></Label>
          <Input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://example.com/bottle.jpg" />
        </div>
      </div>

      {error && <p className="text-red-400 text-xs font-serif">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest gap-2" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
      </div>
    </form>
  );
}

export function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: entries = [], isLoading: entriesLoading, refetch: refetchEntries, isFetching: fetchingEntries } = useListEntries();
  const { data: giveaways = [], isLoading: giveawaysLoading, refetch: refetchGiveaways, isFetching: fetchingGiveaways } = useListGiveaways({ all: true });

  const createGiveaway = useCreateGiveaway();
  const updateGiveaway = useUpdateGiveaway();
  const deleteGiveaway = useDeleteGiveaway();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    setLocation('/');
  };

  const [search, setSearch] = useState('');
  const [filterGiveaway, setFilterGiveaway] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const giveawayMap = Object.fromEntries(giveaways.map(g => [g.id, g]));

  const totalRevenue = entries.reduce((sum, e) => sum + parseFloat(e.amountPaid), 0);
  const totalTickets = entries.reduce((sum, e) => sum + e.ticketQty, 0);
  const avgTickets = entries.length > 0 ? (totalTickets / entries.length).toFixed(1) : '0';
  const activeDraws = giveaways.filter(g => g.isActive).length;

  const giveawayStats = giveaways.map(g => {
    const gEntries = entries.filter(e => e.giveawayId === g.id);
    const revenue = gEntries.reduce((s, e) => s + parseFloat(e.amountPaid), 0);
    return { ...g, dbEntryCount: gEntries.length, revenue };
  });

  const filtered = entries
    .filter(e => {
      if (filterGiveaway !== null && e.giveawayId !== filterGiveaway) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.ticketNumbers.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      let av: string | number = a[sortKey] as string | number;
      let bv: string | number = b[sortKey] as string | number;
      if (sortKey === 'amountPaid') { av = parseFloat(av as string); bv = parseFloat(bv as string); }
      if (sortKey === 'createdAt') { av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === 'asc'
        ? <ChevronUp className="w-3 h-3 inline ml-1" />
        : <ChevronDown className="w-3 h-3 inline ml-1" />
      : <ChevronDown className="w-3 h-3 inline ml-1 opacity-30" />;

  const handleCreate = async (form: GiveawayFormData) => {
    setIsSubmitting(true);
    try {
      await createGiveaway.mutateAsync({
        data: {
          name: form.name,
          description: form.description,
          prizeValue: form.prizeValue,
          prizeValueNumeric: form.prizeValueNumeric,
          maxEntries: form.maxEntries,
          drawDate: new Date(form.drawDate).toISOString(),
          imageUrl: form.imageUrl || null,
          isActive: true,
        },
      });
      await refetchGiveaways();
      setShowCreateForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: number, form: GiveawayFormData) => {
    setIsSubmitting(true);
    try {
      await updateGiveaway.mutateAsync({
        id,
        data: {
          name: form.name,
          description: form.description,
          prizeValue: form.prizeValue,
          prizeValueNumeric: form.prizeValueNumeric,
          maxEntries: form.maxEntries,
          drawDate: new Date(form.drawDate).toISOString(),
          imageUrl: form.imageUrl || null,
        },
      });
      await refetchGiveaways();
      setEditingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (g: Giveaway) => {
    if (g.isActive) {
      await deleteGiveaway.mutateAsync({ id: g.id });
    } else {
      await updateGiveaway.mutateAsync({ id: g.id, data: { isActive: true } });
    }
    await refetchGiveaways();
  };

  const isLoading = entriesLoading || giveawaysLoading;
  const isFetching = fetchingEntries || fetchingGiveaways;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20 sm:pt-24 md:pt-28 pb-16 max-w-7xl mx-auto w-full px-4 sm:px-6 space-y-8 sm:space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground text-xs sm:text-sm font-serif mt-1 uppercase tracking-widest">Draw & Entry Management</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/admin/draws">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-serif text-xs uppercase tracking-widest border-primary/40 text-primary hover:bg-primary/10"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Draw Management
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { refetchEntries(); refetchGiveaways(); }}
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

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Entries" value={entries.length.toString()} sub="across all giveaways" />
          <StatCard icon={DollarSign} label="Total Revenue" value={`£${totalRevenue.toFixed(2)}`} sub="from ticket sales" />
          <StatCard icon={Ticket} label="Tickets Sold" value={totalTickets.toString()} sub={`avg ${avgTickets} per entry`} />
          <StatCard icon={BarChart2} label="Active Draws" value={activeDraws.toString()} sub={`${giveaways.length} total draws`} />
        </div>

        {/* ── Giveaway Management ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif">Giveaway Draws</h2>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest font-serif text-xs gap-2"
              onClick={() => { setShowCreateForm(v => !v); setEditingId(null); }}
            >
              {showCreateForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> New Draw</>}
            </Button>
          </div>

          {/* Create form */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-card border border-primary/30 rounded-sm p-4 sm:p-6 mb-4">
                  <h3 className="font-serif text-base mb-4 text-primary">New Giveaway Draw</h3>
                  <GiveawayForm
                    initial={emptyForm()}
                    onSubmit={handleCreate}
                    onCancel={() => setShowCreateForm(false)}
                    submitLabel="Create Draw"
                    isSubmitting={isSubmitting}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-card border border-border rounded-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground font-serif text-sm">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
              </div>
            ) : giveaways.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground font-serif text-sm">
                <p>No giveaways yet.</p>
                <Button size="sm" variant="outline" onClick={() => setShowCreateForm(true)}>Create first draw</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/20">
                    <th className="text-left px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">Draw</th>
                    <th className="text-right px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">Prize</th>
                    <th className="text-right px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">Entries</th>
                    <th className="text-right px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">Capacity</th>
                    <th className="text-right px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">Draw Date</th>
                    <th className="text-right px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="text-right px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {giveaways.map((g, i) => (
                    <React.Fragment key={g.id}>
                      <tr
                        className={`border-b border-border/50 hover:bg-primary/5 transition-colors ${i === giveaways.length - 1 && editingId !== g.id ? 'border-none' : ''}`}
                      >
                        <td className="px-5 py-3.5 font-serif max-w-[200px]">
                          <span className="block truncate">{g.name}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-serif text-primary">{g.prizeValue}</td>
                        <td className="px-5 py-3.5 text-right font-serif">{g.entryCount} / {g.maxEntries}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${Math.min((g.entryCount / g.maxEntries) * 100, 100) >= 90 ? 'bg-red-500' : 'bg-primary'}`}
                                style={{ width: `${Math.min((g.entryCount / g.maxEntries) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="font-serif text-xs text-muted-foreground">{Math.round((g.entryCount / g.maxEntries) * 100)}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right text-muted-foreground font-serif text-xs">
                          {daysUntil(g.drawDate)}d left
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`text-xs font-serif px-2 py-0.5 rounded-full border ${
                            g.isActive
                              ? 'border-green-500/40 bg-green-500/10 text-green-400'
                              : 'border-border bg-secondary/50 text-muted-foreground'
                          }`}>
                            {g.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="Edit"
                              onClick={() => { setEditingId(editingId === g.id ? null : g.id); setShowCreateForm(false); }}
                              className="p-1.5 rounded-sm hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title={g.isActive ? 'Disable draw' : 'Enable draw'}
                              onClick={() => handleToggleActive(g)}
                              className="p-1.5 rounded-sm hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            >
                              {g.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              title="Filter entries"
                              onClick={() => setFilterGiveaway(filterGiveaway === g.id ? null : g.id)}
                              className={`p-1.5 rounded-sm transition-colors text-xs font-serif border ${
                                filterGiveaway === g.id
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border text-muted-foreground hover:border-primary/50'
                              }`}
                            >
                              {filterGiveaway === g.id ? 'Clear' : 'View'}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Edit form row */}
                      {editingId === g.id && (
                        <tr key={`edit-${g.id}`} className="border-b border-border/50">
                          <td colSpan={7} className="px-5 py-5 bg-secondary/10">
                            <h3 className="font-serif text-sm mb-4 text-primary">Edit: {g.name}</h3>
                            <GiveawayForm
                              initial={giveawayToForm(g)}
                              onSubmit={(form) => handleUpdate(g.id, form)}
                              onCancel={() => setEditingId(null)}
                              submitLabel="Save Changes"
                              isSubmitting={isSubmitting}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Entry Stats Breakdown ── */}
        <div>
          <h2 className="text-lg font-serif mb-4">Revenue Breakdown</h2>
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-border bg-secondary/20">
                  <th className="text-left px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">Giveaway</th>
                  <th className="text-right px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">Entries</th>
                  <th className="text-right px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">Revenue</th>
                  <th className="text-right px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">Days Left</th>
                </tr>
              </thead>
              <tbody>
                {giveawayStats.map((g, i) => (
                  <tr key={g.id} className={`border-b border-border/50 hover:bg-primary/5 transition-colors ${i === giveawayStats.length - 1 ? 'border-none' : ''}`}>
                    <td className="px-5 py-3.5 font-serif">{g.name}</td>
                    <td className="px-5 py-3.5 text-right font-serif text-primary">{g.dbEntryCount}</td>
                    <td className="px-5 py-3.5 text-right font-serif">${g.revenue.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground font-serif">{daysUntil(g.drawDate)}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* ── Entries Table ── */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-4">
            <h2 className="text-lg font-serif shrink-0">
              All Entries
              {filterGiveaway && (
                <span className="ml-2 text-sm text-primary font-serif">
                  — {giveawayMap[filterGiveaway]?.name}
                </span>
              )}
            </h2>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, ticket…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm font-serif bg-card border-border"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-sm overflow-hidden">
            {entriesLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground font-serif text-sm">
                Loading entries…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground font-serif text-sm">
                {entries.length === 0 ? 'No entries yet.' : 'No entries match your search.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      <th className="text-left px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">#</th>
                      <th
                        className="text-left px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => toggleSort('firstName')}
                      >Name <SortIcon k="firstName" /></th>
                      <th
                        className="text-left px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => toggleSort('email')}
                      >Email <SortIcon k="email" /></th>
                      <th
                        className="text-left px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => toggleSort('giveawayId')}
                      >Giveaway <SortIcon k="giveawayId" /></th>
                      <th
                        className="text-right px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => toggleSort('ticketQty')}
                      >Tickets <SortIcon k="ticketQty" /></th>
                      <th className="text-left px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">Numbers</th>
                      <th
                        className="text-right px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => toggleSort('amountPaid')}
                      >Paid <SortIcon k="amountPaid" /></th>
                      <th
                        className="text-right px-5 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => toggleSort('createdAt')}
                      >Date <SortIcon k="createdAt" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry, i) => (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border/40 hover:bg-primary/5 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-muted-foreground font-serif text-xs">{entry.id}</td>
                        <td className="px-5 py-3.5 font-serif whitespace-nowrap">{entry.firstName} {entry.lastName}</td>
                        <td className="px-5 py-3.5 text-muted-foreground font-serif text-xs whitespace-nowrap">{entry.email}</td>
                        <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                          <span className="bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-sm font-serif">
                            {giveawayMap[entry.giveawayId]?.name ?? `#${entry.giveawayId}`}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-serif text-primary">{entry.ticketQty}</td>
                        <td className="px-5 py-3.5 font-serif text-xs text-muted-foreground max-w-[180px]">
                          <div className="flex flex-wrap gap-1">
                            {entry.ticketNumbers.map(t => (
                              <span key={t} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm text-[10px]">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-serif whitespace-nowrap">${entry.amountPaid}</td>
                        <td className="px-5 py-3.5 text-right font-serif text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-border/50 flex justify-between items-center text-xs font-serif text-muted-foreground">
                <span>Showing {filtered.length} of {entries.length} entries</span>
                {filterGiveaway && (
                  <button onClick={() => setFilterGiveaway(null)} className="hover:text-primary transition-colors">
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
