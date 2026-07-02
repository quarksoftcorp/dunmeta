import type { MetadataRoute } from 'next';
import { firestore } from '@/lib/firebase-admin';

export const revalidate = 86400; // Revalidate at most once per day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: 'https://dnf-meta.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  try {
    // Fetch top 500 popular characters to index in sitemap
    const popularSnap = await firestore
      .collection('popular_characters')
      .orderBy('searchCount', 'desc')
      .limit(500)
      .get();

    popularSnap.forEach((doc) => {
      const data = doc.data();
      const serverId = data.serverId;
      const characterId = data.characterId;
      if (serverId && characterId) {
        const lastModified = (data.lastSearchedAt && typeof data.lastSearchedAt.toDate === 'function')
          ? data.lastSearchedAt.toDate()
          : new Date();

        routes.push({
          url: `https://dnf-meta.com/character/${serverId}/${characterId}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });
  } catch (err) {
    console.error('Error generating dynamic sitemap from firestore:', err);
  }

  return routes;
}
