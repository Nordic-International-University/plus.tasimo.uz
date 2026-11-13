import { ImageResponse } from 'next/og';
import { LOGO } from '@/components/logo/logo-data';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'TASIMO Plus — Mathematics Olympiad for Primary School Students';

/**
 * Ijtimoiy tarmoqlar uchun rasm (muharrirda SEO rasmi yuklanmagan bo'lsa) — brend ranglarida: fon #122C46, PLUS plashkasi
 * (brend gradienti, chap-yuqori va o'ng-past yumaloq), shior va dekriptor. Matn inglizcha: next/og standart shriftida
 * kirill yo'q — ruscha reklama uchun muharrirda o'z rasmingizni qo'ying.
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          color: '#fff',
          background: '#122c46',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <svg width="84" height="85" viewBox={`0 0 ${LOGO.emblemWidth} ${LOGO.height}`} fill="#ffffff">
            <g transform={LOGO.emblemTransform}>
              {Object.values(LOGO.emblem).map((d, index) => (
                <path key={index} d={d} />
              ))}
            </g>
          </svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 46, fontWeight: 700, letterSpacing: 2 }}>
            TASIMO
            <span
              style={{
                display: 'flex',
                padding: '6px 18px',
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: 1,
                borderRadius: '18px 4px 18px 4px',
                background: 'linear-gradient(to top right, #0a62b3, #8fbde9)',
              }}
            >
              PLUS
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.06, letterSpacing: -1 }}>Big discoveries begin with small steps.</div>
          <div style={{ fontSize: 32, color: '#cee4f8' }}>Mathematics Olympiad for Primary School Students</div>
        </div>
      </div>
    ),
    size,
  );
}
