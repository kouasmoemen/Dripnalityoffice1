import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dripnality.com';
  const lastModified = new Date();

  return [
    { url: siteUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/tshirts/drp-ts-003`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/tshirts`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/hoodies`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/hoodies/black-signature-zip`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/hoodies/brown-archive-zip`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/support`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
