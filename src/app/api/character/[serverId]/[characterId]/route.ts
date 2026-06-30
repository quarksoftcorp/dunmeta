import { NextRequest, NextResponse } from 'next/server';
import { db, firestore } from '@/lib/firebase-admin';
import { fetchCharacterFullData } from '@/lib/neople';
import * as adminFirestore from 'firebase-admin/firestore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string; characterId: string }> }
) {
  try {
    const { serverId, characterId } = await params;
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const cacheRef = db.ref(`characterCache/${serverId}_${characterId}`);
    const snap = await cacheRef.once('value');
    const cached = snap.val();

    const now = Date.now();

    // 1. 캐시가 없는 경우 즉시 새로 가져옴
    if (!cached) {
      try {
        const freshData = await fetchCharacterFullData(serverId, characterId);
        const newCache = {
          ...freshData,
          lastUpdated: now,
          lastRequested: now,
        };
        await cacheRef.set(newCache);
        await trackSearch(serverId, characterId, freshData.basicInfo);
        return NextResponse.json({ data: newCache, stale: false });
      } catch (err: any) {
        console.error('Error in character API route (cache miss):', err);
        const errMessage = err.message || '';
        const isNotFound = errMessage.toLowerCase().includes('not found') || 
                           errMessage.includes('Character basic info not found');
        if (isNotFound) {
          return NextResponse.json({ error: errMessage }, { status: 404 });
        }
        return NextResponse.json({ error: errMessage || 'Internal Server Error' }, { status: 500 });
      }
    }

    // 2. 강제/백그라운드 갱신 요청 처리 (?refresh=true)
    if (forceRefresh) {
      const lastRequested = cached.lastRequested || 0;
      if (now - lastRequested < 60 * 1000) {
        return NextResponse.json(
          { error: '갱신 요청은 1분에 한 번만 가능합니다.' },
          { status: 429 }
        );
      }

      // lastRequested 락 즉시 설정
      await cacheRef.child('lastRequested').set(now);

      try {
        const freshData = await fetchCharacterFullData(serverId, characterId);
        const updatedCache = {
          ...freshData,
          lastUpdated: now,
          lastRequested: now,
        };
        await cacheRef.set(updatedCache);
        await trackSearch(serverId, characterId, freshData.basicInfo);
        return NextResponse.json({ data: updatedCache, stale: false });
      } catch (err: any) {
        console.error('Error in character API route (force refresh):', err);
        // Revert lastRequested to previous value on failure
        await cacheRef.child('lastRequested').set(lastRequested);

        const errMessage = err.message || '';
        const isNotFound = errMessage.toLowerCase().includes('not found') || 
                           errMessage.includes('Character basic info not found');
        if (isNotFound) {
          return NextResponse.json({ error: errMessage }, { status: 404 });
        }
        return NextResponse.json({ error: errMessage || 'Internal Server Error' }, { status: 500 });
      }
    }

    // 3. 캐시가 있는 경우 수명 검사
    const lastUpdated = cached.lastUpdated || 0;
    const isStale = now - lastUpdated >= 30 * 60 * 1000;
    const canRefresh = now - (cached.lastRequested || 0) >= 60 * 1000;

    // 조회 수 추적 (Serverless context를 위해 await)
    await trackSearch(serverId, characterId, cached.basicInfo).catch(console.error);

    return NextResponse.json({
      data: cached,
      stale: isStale,
      canRefresh: isStale && canRefresh,
    });
  } catch (err: any) {
    console.error('Fatal error in character API route:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Firestore 인기 캐릭터 정보 적재 헬퍼
async function trackSearch(serverId: string, characterId: string, basicInfo: any) {
  if (!basicInfo) return;
  const docRef = firestore.collection('popular_characters').doc(`${serverId}_${characterId}`);
  const now = new Date();
  await docRef.set({
    characterId,
    serverId,
    characterName: basicInfo.characterName || '이름 없음',
    jobGrowName: basicInfo.jobGrowName || '무직',
    fame: basicInfo.adventureFame || basicInfo.fame || 0,
    level: basicInfo.level || 1,
    searchCount: adminFirestore.FieldValue.increment(1),
    lastSearchedAt: adminFirestore.Timestamp.fromDate(now),
  }, { merge: true });
}
