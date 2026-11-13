import type { LogoId } from '@/lib/doc/types';
import { ArtLogo } from './ArtLogo';
import { PlusLogo } from './PlusLogo';

/** Umumiy → Logotip da tanlangan logotip: bird — qatlamli qushcha logotipi (PlusLogo), qolganlari — ArtLogo */
export function SiteLogo({ id, uid, tone = 'dark', className }: { id: LogoId; uid: string; tone?: 'dark' | 'light'; className?: string }) {
  if (id === 'bird') return <PlusLogo tone={tone} className={className} />;
  return <ArtLogo id={id} uid={uid} tone={tone} className={className} />;
}
