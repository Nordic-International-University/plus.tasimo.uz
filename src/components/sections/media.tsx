import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { ImageOpts } from './ctx';

/** next/image faqat bizning CDN'dagi yuklangan rasmlar uchun (next.config remotePatterns bilan bir xil) */
const OPTIMIZABLE = /^https:\/\/cdn\.nordicuniversity\.org\/tasimo-2\.0\/uploads\/[^?#]+$/;

export function Media({ src, alt, className, sizes, priority, fill, width = 1200, height = 800 }: ImageOpts & { src: string }) {
  if (OPTIMIZABLE.test(src)) {
    return fill ? (
      <Image src={src} alt={alt} fill sizes={sizes ?? '100vw'} priority={priority} className={cn('object-cover', className)} quality={75} />
    ) : (
      <Image src={src} alt={alt} width={width} height={height} sizes={sizes} priority={priority} className={className} quality={75} />
    );
  }
  // SVG illyustratsiyalar (public/art) va boshqa manzillar — oddiy img
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={cn(fill && 'absolute inset-0 h-full w-full object-cover', className)}
    />
  );
}
