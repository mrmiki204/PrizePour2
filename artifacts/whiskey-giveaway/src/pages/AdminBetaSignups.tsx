import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useListBetaSignups, useDeleteBetaSignup } from '@workspace/api-client-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, RefreshCw, Search, Trash2, Mail, Users } from 'lucide-react';

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-sm p-6 flex items-start gap-4">
      <div className="p-2 bg-primary/10 rounded-sm">
        <Users className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs font-serif uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-serif text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function AdminBetaSignups() {
  const { data: signups = [], isLoading, refetch, isFetching } = useListBetaSignups();
  const deleteSignup = useDeleteBetaSignup();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return signups;
    const q = search.toLowerCase();
    return signups.filter(
      (s) => s.email.toLowerCase().includes(q) || (s.firstName ?? '').toLowerCase().includes(q),
    );
  }, [signups, search]);

  const handleDelete = async (id: number, email: string) => {
    if (!window.confirm(`Delete beta signup for ${email}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteSignup.mutateAsync({ id });
      await refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Failed to delete: ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 pt-28 sm:pt-32 md:pt-40 pb-16 max-w-7xl mx-auto w-full px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 font-serif text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground mb-2 -ml-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight">Beta Signups</h1>
            <p className="text-muted-foreground text-xs sm:text-sm font-serif mt-1 uppercase tracking-widest">
              Waitlist management
            </p>
          </div>
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard label="Total Beta Signups" value={signups.length.toString()} sub="all-time" />
          <StatCard
            label="Last 7 Days"
            value={signups
              .filter((s) => Date.now() - new Date(s.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000)
              .length.toString()}
            sub="recent signups"
          />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name…"
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="font-serif text-sm">
                {signups.length === 0 ? 'No beta signups yet.' : 'No matches for that search.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background/40 border-b border-border">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                      Joined
                    </th>
                    <th className="px-4 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-background/30">
                      <td className="px-4 py-3 text-foreground">
                        {s.firstName || <span className="text-muted-foreground/60 italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-foreground font-mono text-xs">{s.email}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(s.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(s.id, s.email)}
                          disabled={deletingId === s.id}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5 font-serif text-xs uppercase tracking-widest"
                        >
                          {deletingId === s.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
