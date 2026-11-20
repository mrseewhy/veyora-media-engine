import { Head, Link } from '@inertiajs/react';
import AppShell from '../Components/AppShell';

type Stats = { topics: number; awaitingResearch: number; queued: number; failedRuns: number };
type Topic = { id: number; title: string; status: string; created_at: string };

export default function Dashboard({ stats, recentTopics }: { stats: Stats; recentTopics: Topic[] }) {
  const cards = [
    ['Topics captured', stats.topics],
    ['Awaiting research', stats.awaitingResearch],
    ['Queued jobs', stats.queued],
    ['Failed runs', stats.failedRuns],
  ] as const;
  return (
    <AppShell title="Production overview">
      <Head title="Dashboard | Veyora Media Engine" />
      <p className="mb-7 text-sm text-[--color-muted]">Real intake records only. Automated research and rendering are not yet enabled.</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[--color-border] bg-[--color-surface] p-6">
            <p className="text-sm text-[--color-muted]">{label}</p>
            <p className="mt-3 text-4xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <section className="mt-10 rounded-xl border border-[--color-border] bg-[--color-surface] p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent topics</h2>
          <Link href="/research" className="rounded-lg bg-[--color-accent] px-4 py-2 text-sm font-semibold text-[#0B1117]">Open Research Studio</Link>
        </div>
        <div className="mt-5 divide-y divide-[--color-border]">
          {recentTopics.map(topic => (
            <div key={topic.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <p>{topic.title}</p>
              <span className="text-xs text-[--color-muted]">{topic.status.replaceAll('_', ' ')}</span>
            </div>
          ))}
          {!recentTopics.length && <p className="py-6 text-sm text-[--color-muted]">No topics yet. Create one in Research Studio.</p>}
        </div>
      </section>
    </AppShell>
  );
}
