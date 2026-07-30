import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dripnality.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'DRIPNALITY® — Designed with Purpose',
    template: '%s | DRIPNALITY®',
  },
  description: 'DRIPNALITY is a considered streetwear studio making heavyweight essentials in limited releases.',
  keywords: ['DRIPNALITY', 'streetwear', 'limited drop', 'zip hoodie', 'heavyweight hoodie', 'fashion'],
  authors: [{ name: 'DRIPNALITY Studio' }],
  creator: 'DRIPNALITY Studio',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'DRIPNALITY',
    title: 'DRIPNALITY® — Designed with Purpose',
    description: 'Heavyweight essentials, released with intent.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DRIPNALITY® — Designed with Purpose',
    description: 'Heavyweight essentials, released with intent.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
