import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DRIPNALITY — Designed with Purpose',
    short_name: 'DRIPNALITY',
    description: 'Heavyweight essentials released with intent.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f8f8',
    theme_color: '#000000',
  };
}
