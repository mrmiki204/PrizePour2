import { Link } from 'wouter';
import {
  useGetAnalyticsSummary,
  useListAnalyticsEvents,
} from '@workspace/api-client-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Activity,
  Eye,
  MousePointerClick,
  Users,
  Wine,
  TrendingUp,
} from 'lucide-react';

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Page views',
  hero_cta_click: 'Hero CTA clicks',
  draw_click: 'Draw card clicks',
  explore_collection_click: 'Explore collection clicks',
  waitlist_started: 'Waitlist started',
  waitlist_completed: 'Waitlist completed',
  waitlist_failed: 'Waitlist failed',
  waitlist_duplicate: 'Waitlist duplicate',
};

const DRAW_LABELS: Record<string, string> = {
  'patron-collection': 'The Patrón Collection',
  'clonakilty-collection': 'The Clonakilty Collection',
  bushmills: 'Bushmills Distillery Tour',
  'macallan-luxury-collection': 'The Macallan Luxury Scotch',
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-sm p-6 flex items-start gap-4">
      <div className="p-2 bg-primary/10 rounded-sm">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-serif uppercase tracking-widest text-muted-foreground mb-1">
          {label}
        </p>
        <p className="text-2xl font-serif text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function AdminAnalytics() {
  const summaryQ = useGetAnalyticsSummary();
  const eventsQ = useListAnalyticsEvents({ limit: 50 });

  const summary = summaryQ.data;
  const events = eventsQ.data ?? [];
  const isLoading = summaryQ.isLoading || eventsQ.isLoading;
  const isFetching = summaryQ.isFetching || eventsQ.isFetching;

  const refresh = () => {
    summaryQ.refetch();
    eventsQ.refetch();
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
            <h1 className="text-2xl sm:text-3xl font-serif tracking-tight">Analytics</h1>
            <p className="text-muted-foreground text-xs sm:text-sm font-serif mt-1 uppercase tracking-widest">
              Pre-launch visitor &amp; conversion overview
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isFetching}
            className="gap-2 font-serif text-xs uppercase tracking-widest"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading && !summary ? (
          <div className="p-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : !summary ? (
          <div className="p-12 text-center text-muted-foreground font-serif text-sm">
            No analytics yet.
          </div>
        ) : (
          <>
            {/* Top stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Eye}
                label="Page Views"
                value={summary.totalPageViews.toLocaleString()}
                sub="home page mounts"
              />
              <StatCard
                icon={MousePointerClick}
                label="Hero CTA Clicks"
                value={summary.heroCtaClicks.toLocaleString()}
                sub="primary call-to-actions"
              />
              <StatCard
                icon={Wine}
                label="Draw Card Clicks"
                value={summary.drawClicks.toLocaleString()}
                sub="preview giveaway"
              />
              <StatCard
                icon={Users}
                label="Beta Signups"
                value={summary.betaSignups.toLocaleString()}
                sub={`${summary.waitlistCompleted} via tracked funnel`}
              />
            </div>

            {/* Waitlist funnel */}
            <section className="bg-card border border-border rounded-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h2 className="font-serif uppercase tracking-widest text-sm">
                  Waitlist Funnel
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { label: 'Started', value: summary.waitlistFunnel.started },
                  { label: 'Completed', value: summary.waitlistFunnel.completed },
                  { label: 'Duplicate', value: summary.waitlistFunnel.duplicate },
                  { label: 'Failed', value: summary.waitlistFunnel.failed },
                  {
                    label: 'Conversion',
                    value: `${(summary.waitlistFunnel.conversionRate * 100).toFixed(1)}%`,
                  },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xs font-serif uppercase tracking-widest text-muted-foreground mb-1">
                      {s.label}
                    </p>
                    <p className="text-xl font-serif text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Events by type */}
              <section className="bg-card border border-border rounded-sm p-6">
                <h2 className="font-serif uppercase tracking-widest text-sm mb-4">
                  Events by Type
                </h2>
                <div className="space-y-2">
                  {summary.eventsByType.map((e) => (
                    <div
                      key={e.key}
                      className="flex items-center justify-between text-sm border-b border-border/40 pb-2 last:border-0"
                    >
                      <span className="text-muted-foreground">
                        {EVENT_LABELS[e.key] ?? e.key}
                      </span>
                      <span className="font-mono text-foreground">
                        {e.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Total events: {summary.totalEvents.toLocaleString()}
                </p>
              </section>

              {/* Top draws */}
              <section className="bg-card border border-border rounded-sm p-6">
                <h2 className="font-serif uppercase tracking-widest text-sm mb-4">
                  Draw Interest
                </h2>
                <div className="space-y-3">
                  {summary.topDraws.map((d) => (
                    <div key={d.slug} className="border-b border-border/40 pb-2 last:border-0">
                      <p className="font-serif text-sm text-foreground">
                        {DRAW_LABELS[d.slug] ?? d.slug}
                      </p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground font-mono">
                        <span>clicks: {d.drawClicks}</span>
                        <span>explore: {d.exploreCollectionClicks}</span>
                        <span>views: {d.pageViews}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Recent events */}
            <section className="bg-card border border-border rounded-sm overflow-hidden">
              <div className="p-6 pb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h2 className="font-serif uppercase tracking-widest text-sm">
                  Recent Events
                </h2>
              </div>
              {events.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-serif text-sm">
                  No events recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-background/40 border-b border-border">
                      <tr className="text-left">
                        <th className="px-4 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                          When
                        </th>
                        <th className="px-4 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                          Type
                        </th>
                        <th className="px-4 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                          Name
                        </th>
                        <th className="px-4 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                          Draw
                        </th>
                        <th className="px-4 py-3 font-serif text-xs uppercase tracking-widest text-muted-foreground">
                          Path
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((e) => (
                        <tr
                          key={e.id}
                          className="border-b border-border last:border-0 hover:bg-background/30"
                        >
                          <td className="px-4 py-2 text-muted-foreground text-xs whitespace-nowrap">
                            {formatDate(e.createdAt)}
                          </td>
                          <td className="px-4 py-2 font-mono text-xs text-foreground">
                            {e.eventType}
                          </td>
                          <td className="px-4 py-2 text-foreground text-xs">{e.eventName}</td>
                          <td className="px-4 py-2 text-muted-foreground text-xs">
                            {e.drawSlug ?? '—'}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground text-xs font-mono">
                            {e.pagePath ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
