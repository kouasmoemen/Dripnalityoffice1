import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dripnality.com';
  const lastModified = new Date();

  return [
    { url: siteUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/tshirts`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/support`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/account`, lastModified, changeFrequency: 'monthly', priority: 0.4 },
  ];
}
