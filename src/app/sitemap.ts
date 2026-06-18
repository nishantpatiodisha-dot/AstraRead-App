import { MetadataRoute } from 'next';
import { getDb } from '@/db';
import { articles, grammarTopics, rcPassages } from '@/db/schema';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://astraread.com';
  const db = getDb();

  // Static routes
  const staticRoutes = [
    '',
    '/reading',
    '/grammar',
    '/rc',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Reading Essays
  const readingDocs = await db.select({ slug: articles.slug, updatedAt: articles.fetchedAt }).from(articles);
  const readingRoutes = readingDocs.map((doc) => ({
    url: `${baseUrl}/reading/${doc.slug}`,
    lastModified: doc.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic Grammar Topics
  const grammarDocs = await db.select({ slug: grammarTopics.slug, updatedAt: grammarTopics.createdAt }).from(grammarTopics);
  const grammarRoutes = grammarDocs.map((doc) => ({
    url: `${baseUrl}/grammar/topic/${doc.slug}`,
    lastModified: doc.updatedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Dynamic RC Passages
  const rcDocs = await db.select({ id: rcPassages.id, updatedAt: rcPassages.createdAt }).from(rcPassages);
  const rcRoutes = rcDocs.map((doc) => ({
    url: `${baseUrl}/rc/${doc.id}`,
    lastModified: doc.updatedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...readingRoutes, ...grammarRoutes, ...rcRoutes];
}
