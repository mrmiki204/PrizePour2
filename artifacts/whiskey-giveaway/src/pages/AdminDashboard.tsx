import { useState } from 'react';
import { useListEntries } from '@workspace/api-client-react';
import { ACTIVE_GIVEAWAYS } from '@/data/giveaways';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BarChart2, Users, DollarSign, Ticket, ChevronDown, ChevronUp, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

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
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-serif text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

type SortKey = 'createdAt' | 'firstName' | 'email' | 'ticketQty' | 'amountPaid' | 'giveawayId';

export function AdminDashboard() {
  const { data: entries = [], isLoading, refetch, isFetching } = useListEntries();

  const [search, setSearch] = useState('');
  const [filterGiveaway, setFilterGiveaway] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const giveawayMap = Object.fromEntries(ACTIVE_GIVEAWAYS.map(g => [g.id, g]));

  // Stats
  const totalRevenue = entries.reduce((sum, e) => sum + parseFloat(e.amountPaid), 0);
  const totalTickets = entries.reduce((sum, e) => sum + e.ticketQty, 0);
  const avgTickets = entries.length > 0 ? (totalTickets / entries.length).toFixed(1) : '0';

  // Per-giveaway breakdown
  const giveawayStats = ACTIVE_GIVEAWAYS.map(g => {
    const gEntries = entries.filter(e => e.giveawayId === g.id);
    const revenue = gEntries.reduce((s, e) => s + parseFloat(e.amountPaid), 0);
    return { ...g, entryCount: gEntries.length, revenue };
  });

  // Filter + sort
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 pt-28 pb-16 max-w-7xl mx-auto w-full px-6 space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1 uppercase tracking-widest">Entry Management</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 font-mono text-xs uppercase tracking-widest"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Entries" value={entries.length.toString()} sub="across all giveaways" />
          <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} sub="from ticket sales" />
          <StatCard icon={Ticket} label="Tickets Sold" value={totalTickets.toString()} sub={`avg ${avgTickets} per entry`} />
          <StatCard icon={BarChart2} label="Active Draws" value={ACTIVE_GIVEAWAYS.length.toString()} sub="currently running" />
        </div>

        {/* Per-Giveaway Breakdown */}
        <div>
          <h2 className="text-lg font-serif mb-4">Giveaway Breakdown</h2>
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/20">
                  <th className="text-left px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Giveaway</th>
                  <th className="text-right px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Entries</th>
                  <th className="text-right px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Revenue</th>
                  <th className="text-right px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Days Left</th>
                  <th className="text-right px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Filter</th>
                </tr>
              </thead>
              <tbody>
                {giveawayStats.map((g, i) => (
                  <tr key={g.id} className={`border-b border-border/50 hover:bg-primary/5 transition-colors ${i === giveawayStats.length - 1 ? 'border-none' : ''}`}>
                    <td className="px-5 py-3.5 font-serif">{g.name}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-primary">{g.entryCount}</td>
                    <td className="px-5 py-3.5 text-right font-mono">${g.revenue.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground font-mono">{g.daysLeft}d</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setFilterGiveaway(filterGiveaway === g.id ? null : g.id)}
                        className={`text-xs font-mono px-2 py-0.5 rounded-sm border transition-colors ${
                          filterGiveaway === g.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {filterGiveaway === g.id ? 'Clear' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Entries Table */}
        <div>
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-lg font-serif shrink-0">
              All Entries
              {filterGiveaway && (
                <span className="ml-2 text-sm text-primary font-mono">
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
                className="pl-9 h-9 text-sm font-mono bg-card border-border"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground font-mono text-sm">
                Loading entries…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground font-mono text-sm">
                {entries.length === 0 ? 'No entries yet.' : 'No entries match your search.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      <th className="text-left px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">#</th>
                      <th
                        className="text-left px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => toggleSort('firstName')}
                      >Name <SortIcon k="firstName" /></th>
                      <th
                        className="text-left px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => toggleSort('email')}
                      >Email <SortIcon k="email" /></th>
                      <th
                        className="text-left px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => toggleSort('giveawayId')}
                      >Giveaway <SortIcon k="giveawayId" /></th>
                      <th
                        className="text-right px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => toggleSort('ticketQty')}
                      >Tickets <SortIcon k="ticketQty" /></th>
                      <th className="text-left px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Numbers</th>
                      <th
                        className="text-right px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => toggleSort('amountPaid')}
                      >Paid <SortIcon k="amountPaid" /></th>
                      <th
                        className="text-right px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
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
                        <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{entry.id}</td>
                        <td className="px-5 py-3.5 font-serif whitespace-nowrap">{entry.firstName} {entry.lastName}</td>
                        <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs whitespace-nowrap">{entry.email}</td>
                        <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                          <span className="bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-sm font-mono">
                            {giveawayMap[entry.giveawayId]?.name ?? `#${entry.giveawayId}`}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-primary">{entry.ticketQty}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground max-w-[180px]">
                          <div className="flex flex-wrap gap-1">
                            {entry.ticketNumbers.map(t => (
                              <span key={t} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm text-[10px]">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono whitespace-nowrap">${entry.amountPaid}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
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
              <div className="px-5 py-3 border-t border-border/50 flex justify-between items-center text-xs font-mono text-muted-foreground">
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
