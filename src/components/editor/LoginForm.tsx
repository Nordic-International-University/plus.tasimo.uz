'use client';

import { Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { PlusLogo } from '../logo/PlusLogo';
import { editorApi } from './editor-api';

/** /edit — muharrir paroli (dashboard → TASIMO Plus → Landing'da o'rnatiladi) */
export function LoginForm({ message }: { message?: string }) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(message ?? null);

  return (
    <main className="sec sec-paper grid min-h-svh place-items-center py-10">
      <form
        className="mx-4 flex w-full max-w-sm flex-col gap-6 rounded-[1.75rem] border border-[var(--line)] bg-white p-8 shadow-[0_30px_70px_-40px_rgba(12,26,58,0.35)]"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!password) return;
          setBusy(true);
          setError(null);
          try {
            await editorApi.login(password);
            window.location.reload();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Kirib bo‘lmadi.');
            setBusy(false);
          }
        }}
      >
        <div className="h-9">
          <PlusLogo />
        </div>
        <div>
          <h1 className="font-display text-2xl font-medium">Landing muharriri</h1>
          <p className="mt-1 text-sm text-muted">Parolni kiriting — sahifaning o‘zida tahrirlash rejimi ochiladi.</p>
        </div>
        <label className="relative">
          <LockKeyhole size={17} className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Parol"
            autoComplete="current-password"
            autoFocus
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-12 pl-11 text-[var(--color-ink)] placeholder:text-slate-400 focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 focus:outline-none"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600" aria-label="Parolni ko‘rsatish">
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </label>
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={busy || !password}>
          {busy && <Loader2 size={18} className="animate-spin" />}
          Kirish
        </button>
      </form>
    </main>
  );
}
