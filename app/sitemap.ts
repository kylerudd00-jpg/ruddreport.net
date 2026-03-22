import { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ruddreport.net';

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/articles`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/cybersecurity`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/intelligence`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/geopolitics`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/national-security`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/economic-security`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/osint`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const articlePages: MetadataRoute.Sitemap = ARTICLES.map(a => ({
    url: `${base}/articles/${a.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticPages, ...articlePages];
}
