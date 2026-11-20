import { Link, router, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

export default function AppShell({ children, title }: PropsWithChildren<{ title: string }>) {
  const page = usePage<{ auth: { user: { name: string; email: string } | null } }>();
  const active = page.url;
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-[--color-border] bg-[--color-surface] p-6 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <Link href="/" className="block text-lg font-bold tracking-tight"><span className="text-[--color-accent]">VEYORA</span> / MEDIA</Link>
        <p className="mt-1 text-xs text-[--color-muted]">ToolPilot Daily · Control Center</p>
        <nav className="mt-9 flex flex-col gap-2 text-sm">
          <Link className={'rounded-lg px-3 py-2 ' + (active === '/' ? 'bg-[--color-panel] text-white' : 'text-[--color-muted] hover:text-white')} href="/">Dashboard</Link>
          <Link className={'rounded-lg px-3 py-2 ' + (active.startsWith('/research') ? 'bg-[--color-panel] text-white' : 'text-[--color-muted] hover:text-white')} href="/research">Research Studio</Link>
          <span className="px-3 py-2 text-[--color-muted] opacity-50">Video Studio · Coming next</span>
          <span className="px-3 py-2 text-[--color-muted] opacity-50">Publishing · Not connected</span>
        </nav>
        <div className="mt-10 border-t border-[--color-border] pt-5 text-xs">
          <p className="truncate text-[--color-muted]">{page.props.auth.user?.email}</p>
          <button className="mt-3 text-[--color-accent] hover:underline" onClick={() => router.post('/logout')}>Sign out</button>
        </div>
      </aside>
      <main className="w-full min-w-0 flex-1 px-5 py-7 md:px-10">
        <header className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[--color-accent]">Veyora Media Engine</p>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        </header>
        {children}
      </main>
    </div>
  );
}
