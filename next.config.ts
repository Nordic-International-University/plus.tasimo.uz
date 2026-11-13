import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

/** Reklama piksellari (Meta, TikTok, Google) — faqat ID o'rnatilganda yuklanadi, CSP esa oldindan ruxsat beradi */
const PIXEL_SCRIPTS = [
  'https://connect.facebook.net',
  'https://analytics.tiktok.com',
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://googleads.g.doubleclick.net',
];
const PIXEL_CONNECT = [
  'https://www.facebook.com',
  'https://connect.facebook.net',
  'https://analytics.tiktok.com',
  'https://*.tiktok.com',
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  'https://www.googletagmanager.com',
  'https://googleads.g.doubleclick.net',
  'https://www.google.com',
];

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} ${PIXEL_SCRIPTS.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https: blob:",
  `connect-src 'self' ${PIXEL_CONNECT.join(' ')}${isDev ? ' ws:' : ''}`,
  // 'self' — muharrirdagi desktop/planshet/mobil ko'rinish o'z saytining /edit/preview sahifasini iframe'da ochadi
  "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://www.googletagmanager.com https://td.doubleclick.net https://www.facebook.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

const nextConfig: NextConfig = {
  // Serverda ikki slot (.next-a / .next-b): yangi build ishlab turgan saytga tegmaydi. Build va `next start` bir xil
  // NEXT_DIST_DIR bilan ishlaydi (deploy.yml va ecosystem.config.js `.next-slot` faylidan o'qiydi); lokalda — .next
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  // next dev repoga AGENTS.md yozmasin
  agentRules: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    qualities: [60, 75, 90],
    formats: ['image/webp'],
    minimumCacheTTL: 2592000,
    maximumDiskCacheSize: 512 * 1024 * 1024,
    maximumResponseBody: 10 * 1024 * 1024,
    // Faqat muharrirda yuklangan rasmlar (backend: uploads/plus); query taqiqlangan (keshni to'ldirib bo'lmasin)
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.nordicuniversity.org', pathname: '/tasimo-2.0/uploads/**', search: '' }],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      { source: '/edit/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/edit', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/art/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, immutable' }] },
    ];
  },
};

export default nextConfig;
