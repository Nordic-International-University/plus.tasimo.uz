'use client';

import { ImagePlus, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Path } from '@/lib/doc/types';
import type { ImageOpts } from '../sections/ctx';
import { Media } from '../sections/media';
import { useEditor } from './EditorContext';

/** Rasm: ustiga bosilsa — almashtirish oynasi (yuklash, havola, kutubxona). Bo'sh bo'lsa — joy belgisi */
export function EditableImage({ path, src, opts }: { path: Path; src: string | undefined; opts: ImageOpts }) {
  const editor = useEditor();
  const open = (event: React.MouseEvent) => {
    event.stopPropagation();
    editor.openImage(path);
  };

  if (!src) {
    return (
      <button
        type="button"
        onClick={open}
        className={cn(
          'ed-image-empty flex flex-col items-center justify-center gap-2 border-2 border-dashed border-current/30 bg-black/5 text-sm font-semibold opacity-80 hover:opacity-100',
          opts.fill ? 'absolute inset-0' : 'aspect-[4/3] w-full',
        )}
      >
        <ImagePlus size={22} />
        Rasm qo‘shish
      </button>
    );
  }

  return (
    <>
      <Media src={src} {...opts} priority={false} />
      <button
        type="button"
        onClick={open}
        className={cn('ed-image-overlay', opts.fill ? 'absolute inset-0' : 'absolute inset-0')}
        aria-label="Rasmni almashtirish"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#10162f] shadow-lg">
          <RefreshCw size={14} /> Rasmni almashtirish
        </span>
      </button>
    </>
  );
}
