import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({ email: '', password: '' });
  const submit = (e: FormEvent) => { e.preventDefault(); post('/login'); };
  return (
    <div className="grid min-h-screen place-items-center p-5">
      <Head title="Sign in | Veyora Media Engine" />
      <div className="w-full max-w-md rounded-2xl border border-[--color-border] bg-[--color-surface] p-9">
        <p className="text-sm font-semibold tracking-widest text-[--color-accent]">VEYORA / MEDIA</p>
        <h1 className="mt-5 text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-[--color-muted]">Private production workspace for ToolPilot Daily.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm">Email
            <input type="email" autoComplete="username" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-2 w-full rounded-lg border border-[--color-border] bg-[--color-panel] px-4 py-3" required />
          </label>
          {errors.email && <p className="text-sm text-red-300">{errors.email}</p>}
          <label className="block text-sm">Password
            <input type="password" autoComplete="current-password" value={data.password} onChange={e => setData('password', e.target.value)} className="mt-2 w-full rounded-lg border border-[--color-border] bg-[--color-panel] px-4 py-3" required />
          </label>
          {errors.password && <p className="text-sm text-red-300">{errors.password}</p>}
          <button disabled={processing} className="w-full rounded-lg bg-[--color-accent] px-4 py-3 font-semibold text-[#0B1117] disabled:opacity-60">Sign in</button>
        </form>
        <p className="mt-6 text-xs text-[--color-muted]">Access is invitation-free and administrator-only. Accounts are created locally by CLI.</p>
      </div>
    </div>
  );
}
