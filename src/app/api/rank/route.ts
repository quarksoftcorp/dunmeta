import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await firestore.collection('popular_characters')
      .where('searchCount', '>=', 1)
      .orderBy('searchCount', 'desc')
      .limit(10)
      .get();

    const list = snapshot.docs.map(doc => {
      const data = doc.data();
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
