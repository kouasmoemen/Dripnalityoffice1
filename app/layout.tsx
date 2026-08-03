import type { Metadata } from 'next';
import './globals.css';
import CookieConsent from '../components/CookieConsent';
import DropCountdown from '../components/DropCountdown';

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
        { '@type': 'Product', position: 1, name: 'Black Signature Zip Hoodie', sku: 'DRP-HZ-001', color: 'Black', category: 'Hoodies', image: `${siteUrl}/ds%20black1.jpg`, offers: { '@type': 'Offer', price: '100.00', priceCurrency: 'TND', availability: 'https://schema.org/SoldOut' } },
        { '@type': 'Product', position: 2, name: 'Brown Archive Zip Hoodie', sku: 'DRP-HZ-002', color: 'Brown', category: 'Hoodies', image: `${siteUrl}/ds%20brown1.jpg`, offers: { '@type': 'Offer', price: '100.00', priceCurrency: 'TND', availability: 'https://schema.org/SoldOut' } },
        { '@type': 'Product', position: 3, name: 'Dripnality’s Oversized Multi-Balaclavas White T-Shirt', sku: 'DRP-TS-003', color: 'White', category: 'T-Shirts', image: `${siteUrl}/tshirt-drop/T12.jpeg`, offers: { '@type': 'Offer', price: '60.00', priceCurrency: 'TND', availability: 'https://schema.org/InStock', url: `${siteUrl}/tshirts/drp-ts-003` } },
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
  return <html lang="en"><body>{children}<DropCountdown /><CookieConsent /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body></html>;
}
