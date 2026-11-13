'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { LOGO_IDS, type LogoId } from '@/lib/doc/types';
import { LOGO_ART } from '../logo/logo-art';
import { SiteLogo } from '../logo/SiteLogo';

const LOGO_NAME: Record<LogoId, string> = {
  bird: 'TASIMO qushcha',
  official: LOGO_ART.official.name,
  mountain: LOGO_ART.mountain.name,
  compass: LOGO_ART.compass.name,
  compass2: LOGO_ART.compass2.name,
  tent: LOGO_ART.tent.name,
};

const LOGO_HINT: Record<LogoId, string> = {
  bird: 'Oldingi logotip: qushcha + TASIMO + PLUS',
  official: 'Brand book dagi asosiy logotip, to‘q plashkada',
  mountain: 'Tog‘lar, chodir va PLUS kapsulasi',
  compass: 'Kompas «o», PLUS pufakchasi va iz',
  compass2: 'Chapda kompas guli, PLUS yorlig‘i',
  tent: '«A» ichida chodir, PLUS yorlig‘i',
};

/**
 * Logotip tanlash: har variant — sahifadagi sarlavhadagidek ko'rinish. Sichqoncha ustida (yoki fokusda) skroll animatsiyasi
 * ko'rsatiladi: harflar yig'iladi, belgi qoladi ([data-lg-collapsed] — globals.css dagi sarlavha qoidalari bilan bir xil).
 */
export function LogoPicker({ value, onChange }: { value: LogoId; onChange: (id: LogoId) => void }) {
  const [preview, setPreview] = useState<LogoId | null>(null);
  const [moved, setMoved] = useState<LogoId | null>(null);

  return (
    <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Logotip">
      {LOGO_IDS.map((id) => {
        const active = id === value;
        const collapsed = preview === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            onMouseEnter={() => {
              setPreview(id);
              setMoved(id);
            }}
            onMouseLeave={() => setPreview(null)}
            onFocus={() => {
              setPreview(id);
              setMoved(id);
            }}
            onBlur={() => setPreview(null)}
            className={cn(
              'group flex flex-col gap-1.5 rounded-xl border bg-white p-2 text-left transition',
              active ? 'border-[var(--ed-accent)] ring-2 ring-[var(--ed-accent-soft)]' : 'border-slate-200 hover:border-slate-300',
            )}
          >
            <span
              className="relative grid h-[68px] place-items-center overflow-hidden rounded-lg bg-[#f3f8fd] px-3"
              data-lg-collapsed={collapsed ? 'true' : 'false'}
              data-lg-moved={moved === id ? '' : undefined}
            >
              {/* Kenglik bo'yicha sig'diriladi (logotiplar nisbati 3.3–4.7 : 1) */}
              <span className="block w-full max-w-[132px]">
                <SiteLogo id={id} uid={`pick-${id}`} className="!h-auto w-full" />
              </span>
              {active && (
                <span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-[var(--ed-accent)] text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </span>
            <span className="px-0.5">
              <span className="block text-xs font-bold text-slate-800">{LOGO_NAME[id]}</span>
              <span className="block text-[0.68rem] leading-snug text-slate-400">{LOGO_HINT[id]}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
