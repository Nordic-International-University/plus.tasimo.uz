import { PlusLogo } from '@/components/logo/PlusLogo';
import { ui } from '@/lib/ui-strings';

export default function NotFound() {
  const locale = 'en';
  return (
    <main className="sec sec-paper grid min-h-svh place-items-center">
      <div className="container-x flex flex-col items-center gap-7 text-center">
        <div className="h-12">
          <PlusLogo />
        </div>
        <h1 className="title-lg">{ui(locale, 'notFoundTitle')}</h1>
        <p className="lead max-w-md">{ui(locale, 'notFoundText')}</p>
        <a href="/" className="btn btn-primary">
          {ui(locale, 'home')}
        </a>
      </div>
    </main>
  );
}
