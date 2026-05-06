import type { MetadataRoute } from 'next';

const siteUrl = 'https://menmatarlmatar.ma';

const routes = [
  '/',
  '/deals',
  '/destinations',
  '/destinations/sans-visa-marocains',
  '/destinations/evisa-marocains',
  '/destinations/visa-a-l-arrivee-marocains',
  '/simulator',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }));
}
