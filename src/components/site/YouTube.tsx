'use client';

import { Play } from 'lucide-react';
import { useState } from 'react';

/**
 * YouTube «fasad»: sahifa ochilganda faqat rasm (~20 KB), iframe (~1 MB skript) bosilgandan keyin yuklanadi —
 * Core Web Vitals (LCP/TBT) buzilmaydi. youtube-nocookie — reklama cookie'larisiz.
 */
export function YouTube({ id, title, poster, playLabel }: { id: string; title: string; poster?: string; playLabel: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full cursor-pointer" aria-label={`${playLabel}: ${title}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
      <span className="absolute top-1/2 left-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[var(--color-ink)] shadow-2xl transition-transform duration-300 group-hover:scale-110">
        <span className="absolute inset-0 animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full bg-white/60" />
        <Play size={30} className="relative ml-1" fill="currentColor" />
      </span>
    </button>
  );
}
