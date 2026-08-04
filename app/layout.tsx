import type { Metadata } from 'next';
import './globals.css';
import CookieConsent from '../components/CookieConsent';
import DropCountdown from '../components/DropCountdown';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dripnality.com';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'DRIPNALITY', url: siteUrl, description: 'A considered Tunisian streetwear studio making limited releases.', sameAs: ['https://www.instagram.com/dripnality', 'https://www.tiktok.com/@dripnality'] },
    { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: siteUrl, name: 'DRIPNALITY', publisher: { '@id': `${siteUrl}/#organization` }, inLanguage: 'en' },
    {
      '@type': 'ItemList', name: 'DRIPNALITY current and archive releases', numberOfItems: 3,
      itemListElement: [
        { '@type': 'Product', position: 1, name: 'Dripnality’s Oversized Multi-Balaclavas White T-Shirt', sku: 'DRP-TS-003', color: 'White', category: 'T-Shirts', image: `${siteUrl}/opengraph-image`, offers: { '@type': 'Offer', price: '59.00', priceCurrency: 'TND', availability: 'https://schema.org/InStock', url: `${siteUrl}/tshirts/drp-ts-003` } },
        { '@type': 'Product', position: 2, name: 'Black Signature Zip Hoodie', sku: 'DRP-HZ-001', color: 'Black', category: 'Hoodies', image: `${siteUrl}/ds%20black1.jpg`, offers: { '@type': 'Offer', price: '100.00', priceCurrency: 'TND', availability: 'https://schema.org/SoldOut' } },
        { '@type': 'Product', position: 3, name: 'Brown Archive Zip Hoodie', sku: 'DRP-HZ-002', color: 'Brown', category: 'Hoodies', image: `${siteUrl}/ds%20brown1.jpg`, offers: { '@type': 'Offer', price: '100.00', priceCurrency: 'TND', availability: 'https://schema.org/SoldOut' } },
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'DRIPNALITY® — Designed with purpose', template: '%s | DRIPNALITY®' },
  description: 'DRIPNALITY is a Tunisian streetwear studio. Shop the Oversized Multi-Balaclavas White T-Shirt and explore limited archive releases.',
  keywords: ['DRIPNALITY', 'Multi-Balaclavas T-Shirt', 'oversized white t-shirt', 'Tunisia streetwear', 'limited drop', 'zip hoodie', 'fashion'],
  authors: [{ name: 'DRIPNALITY Studio' }],
  creator: 'DRIPNALITY Studio',
  icons: {
    icon: [{ url: '/bl1.jpg', type: 'image/jpeg' }],
    shortcut: ['/bl1.jpg'],
    apple: [{ url: '/bl1.jpg', type: 'image/jpeg' }],
  },
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'en_US', url: '/', siteName: 'DRIPNALITY', title: 'DRIPNALITY® — Designed with purpose', description: 'Shop the new oversized Multi-Balaclavas White T-Shirt and explore archive releases.', images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'DRIPNALITY — Designed with purpose' }] },
  twitter: { card: 'summary_large_image', title: 'DRIPNALITY® — Designed with purpose', description: 'Shop the new oversized Multi-Balaclavas White T-Shirt and explore archive releases.', images: ['/opengraph-image'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<DropCountdown/><CookieConsent/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}/></body></html>;
}
