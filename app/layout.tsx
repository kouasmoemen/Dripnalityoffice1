import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dripnality.com';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'DRIPNALITY',
      url: siteUrl,
      description: 'A considered streetwear studio making heavyweight essentials in limited releases.',
      sameAs: ['https://www.instagram.com/dripnality', 'https://www.tiktok.com/@dripnality'],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'DRIPNALITY',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en',
    },
    {
      '@type': 'ItemList',
      name: 'DRIPNALITY Drop 01 hoodies',
      numberOfItems: 2,
      itemListElement: [
        { '@type': 'Product', position: 1, name: 'Black Signature Zip Hoodie', color: 'Black', category: 'Hoodies', image: `${siteUrl}/hoodie-black-artwork.jpg`, offers: { '@type': 'Offer', price: '145.00', priceCurrency: 'USD', availability: 'https://schema.org/SoldOut' } },
        { '@type': 'Product', position: 2, name: 'Brown Archive Zip Hoodie', color: 'Brown', category: 'Hoodies', image: `${siteUrl}/hoodie-brown-artwork.jpg`, offers: { '@type': 'Offer', price: '155.00', priceCurrency: 'USD', availability: 'https://schema.org/SoldOut' } },
      ],
    },
  ],
};

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
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body></html>;
}
