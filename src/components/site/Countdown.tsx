'use client';

import { useEffect, useState } from 'react';

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function diff(target: number, now: number): Parts {
  const ms = Math.max(0, target - now);
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

/** Keyingi mavsumgacha qolgan vaqt. Server HTML'da ko'rinmaydi (vaqt farqi hydration xatosiga olib kelmasin) */
export function Countdown({ to, labels }: { to: string; labels: Record<keyof Parts, string> }) {
  const target = Date.parse(to);
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    const tick = () => setParts(diff(target, Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (!parts || target <= Date.now()) return null;
  return (
    <div className="flex gap-3" role="timer" aria-live="off">
      {(Object.keys(parts) as (keyof Parts)[]).map((key) => (
        <div key={key} className="min-w-[72px] rounded-2xl border border-white/25 bg-white/10 px-3 py-3 text-center backdrop-blur">
          <div className="font-display text-3xl font-bold tabular-nums">{String(parts[key]).padStart(2, '0')}</div>
          <div className="text-xs tracking-wider uppercase opacity-80">{labels[key]}</div>
        </div>
      ))}
    </div>
  );
}
