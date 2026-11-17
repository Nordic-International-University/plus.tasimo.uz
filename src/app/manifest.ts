import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TASIMO Plus',
    short_name: 'TASIMO Plus',
    description: 'Mathematics Olympiad for Primary School Students — winter and summer seasons: online qualifying round, final in Tashkent',
    start_url: '/en',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0a62b3',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
