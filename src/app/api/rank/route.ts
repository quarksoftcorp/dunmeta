import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const snapshot = await firestore.collection('popular_characters')
      .where('lastSearchedAt', '>=', oneDayAgo)
      .limit(100)
      .get();

    const docsData = snapshot.docs.map(doc => doc.data());
    const sorted = docsData
      .sort((a, b) => (b.searchCount || 0) - (a.searchCount || 0))
      .slice(0, 10);

    const list = sorted.map(data => {
      return {
        characterId: data.characterId || '',
        serverId: data.serverId || '',
        characterName: data.characterName || '',
        jobGrowName: data.jobGrowName || '',
        fame: data.fame || 0,
        level: data.level || 0,
        searchCount: data.searchCount || 0,
      };
    });

    return NextResponse.json(list);
  } catch (err) {
    console.error('Error in rank API route:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
