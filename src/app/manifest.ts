import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TASIMO Plus',
    short_name: 'TASIMO Plus',
    description: 'International math olympiad: online qualifying round, final in Tashkent · winter and summer seasons',
    start_url: '/en',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0a62b3',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
