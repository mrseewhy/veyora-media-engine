import { Head, router, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppShell from '../../Components/AppShell';

type Brand = { id: number; name: string };
type Topic = { id: number; title: string; description: string | null; reference_url: string | null; status: string; created_at: string; brand: Brand };

export default function ResearchIndex({ brands, topics }: { brands: Brand[]; topics: Topic[] }) {
  const { data, setData, post, processing, reset, errors } = useForm({
    brand_id: brands[0]?.id ?? 0, title: '', description: '', reference_url: '',
  });
  const page = usePage<{ flash: { success?: string } }>();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    post('/research/topics', { onSuccess: () => reset('title', 'description', 'reference_url') });
  };
  return (
    <AppShell title="Research Studio">
      <Head title="Research | Veyora Media Engine" />
      <p className="mb-6 text-sm text-[--color-muted]">Topic intake is operational when the queue worker is running. Automated topic discovery is a later milestone.</p>
      {page.props.flash?.success && <p className="mb-5 rounded-lg border border-[--color-accent] p-3 text-sm text-[--color-accent]">{page.props.flash.success}</p>}
      <div className="grid gap-6 xl:grid-cols-[minmax(300px,400px)_1fr]">
        <form onSubmit={submit} className="self-start space-y-4 rounded-xl border border-[--color-border] bg-[--color-surface] p-6">
          <h2 className="text-lg font-semibold">Capture a topic</h2>
          <label className="block text-sm">Brand
            <select className="mt-2 w-full rounded-lg border border-[--color-border] bg-[--color-panel] px-3 py-3" value={data.brand_id} onChange={e => setData('brand_id', Number(e.target.value))}>
              {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
          </label>
          <label className="block text-sm">Topic title
            <input required minLength={5} maxLength={180} className="mt-2 w-full rounded-lg border border-[--color-border] bg-[--color-panel] px-3 py-3" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="AI tools for better meeting notes" />
          </label>
          {errors.title && <p className="text-sm text-red-300">{errors.title}</p>}
          <label className="block text-sm">Source URL (optional)
            <input type="url" className="mt-2 w-full rounded-lg border border-[--color-border] bg-[--color-panel] px-3 py-3" value={data.reference_url} onChange={e => setData('reference_url', e.target.value)} placeholder="https://..." />
          </label>
          {errors.reference_url && <p className="text-sm text-red-300">{errors.reference_url}</p>}
          <label className="block text-sm">Notes (optional)
            <textarea rows={3} className="mt-2 w-full rounded-lg border border-[--color-border] bg-[--color-panel] px-3 py-3" value={data.description} onChange={e => setData('description', e.target.value)} />
          </label>
          <button disabled={processing || brands.length === 0} className="rounded-lg bg-[--color-accent] px-4 py-3 text-sm font-semibold text-[#0B1117] disabled:opacity-60">Save topic</button>
        </form>
        <section className="rounded-xl border border-[--color-border] bg-[--color-surface] p-6">
          <h2 className="text-lg font-semibold">Research queue</h2>
          <div className="mt-5 divide-y divide-[--color-border]">
            {topics.map(topic => (
              <article key={topic.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{topic.title}</p>
                    <p className="mt-1 text-xs text-[--color-muted]">{topic.brand.name} · {topic.status.replaceAll('_', ' ')}</p>
                    {topic.reference_url && <a target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-xs text-[--color-accent] underline" href={topic.reference_url}>Open reference source</a>}
                  </div>
                  {topic.status === 'draft' && <button className="rounded-lg border border-[--color-border] px-3 py-2 text-xs hover:border-[--color-accent]" onClick={() => router.post('/research/topics/' + topic.id + '/intake')}>Queue intake</button>}
                </div>
              </article>
            ))}
            {!topics.length && <p className="py-6 text-sm text-[--color-muted]">Add your first topic to get started.</p>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
