import React, { cache } from 'react';
import { Metadata } from 'next';
import { db, firestore } from '@/lib/firebase-admin';
import { fetchCharacterFullData } from '@/lib/neople';
import * as adminFirestore from 'firebase-admin/firestore';
import CharacterDashboard from './CharacterDashboard';
import JsonLd from '@/components/JsonLd';

const SERVERS = [
  { id: 'all', name: '전체 서버' },
  { id: 'cain', name: '카인' },
  { id: 'diregie', name: '디레지에' },
  { id: 'siroco', name: '시로코' },
  { id: 'prey', name: '프레이' },
  { id: 'casillas', name: '카시야스' },
  { id: 'hilder', name: '힐더' },
  { id: 'anton', name: '안톤' },
  { id: 'bakal', name: '바칼' },
];

interface PageProps {
  params: Promise<{
    serverId: string;
    characterId: string;
  }>;
}

interface BasicSearchInfo {
  characterName?: string;
  jobGrowName?: string;
  adventureFame?: number;
  fame?: number;
  level?: number;
}

// Firestore popular character tracking helper
async function trackSearch(
  serverId: string,
  characterId: string,
  basicInfo: BasicSearchInfo
) {
  if (!basicInfo) return;
  try {
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
  } catch (err) {
    console.error('Error tracking search in Server Page:', err);
  }
}

// React cache memoizes database calls per-request in Next.js Server Components
const getCharacterData = cache(async (serverId: string, characterId: string) => {
  try {
    const cacheRef = db.ref(`characterCache/${serverId}_${characterId}`);
    const snap = await cacheRef.once('value');
    const cached = snap.val();
    const now = Date.now();

    // 1. Cache Miss
    if (!cached) {
      const freshData = await fetchCharacterFullData(serverId, characterId);
      const newCache = {
        ...freshData,
        lastUpdated: now,
        lastRequested: now,
      };
      await cacheRef.set(newCache);
      await trackSearch(serverId, characterId, freshData.basicInfo as BasicSearchInfo);
      return {
        data: newCache,
        stale: false,
        canRefresh: false,
        error: null,
      };
    }

    // 2. Cache Hit
    const lastUpdated = cached.lastUpdated || 0;
    const isStale = now - lastUpdated >= 30 * 60 * 1000;
    const canRefresh = now - (cached.lastRequested || 0) >= 60 * 1000;

    await trackSearch(serverId, characterId, cached.basicInfo as BasicSearchInfo);

    return {
      data: cached,
      stale: isStale,
      canRefresh: isStale && canRefresh,
      error: null,
    };
  } catch (err) {
    console.error('Error in Server Page getCharacterData:', err);
    const msg = err instanceof Error ? err.message : '서버에서 데이터를 불러오는 과정에서 오류가 발생했습니다.';
    return {
      data: null,
      stale: false,
      canRefresh: false,
      error: msg,
    };
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { serverId, characterId } = await params;
  const result = await getCharacterData(serverId, characterId);

  if (result.error || !result.data || !result.data.basicInfo) {
    return {
      title: '캐릭터 정보 없음',
      description: '요청하신 캐릭터 정보를 불러올 수 없거나 검색 기록이 없습니다.',
    };
  }

  const basicInfo = result.data.basicInfo;
  const name = basicInfo.characterName || '이름 없음';
  const job = basicInfo.jobGrowName || '직업 정보 없음';
  const serverObj = SERVERS.find((s) => s.id === serverId);
  const serverName = serverObj ? serverObj.name : serverId;
  const characterImageUrl = `https://img-api.neople.co.kr/df/servers/${serverId}/characters/${characterId}?zoom=1`;

  return {
    title: `${name} (${serverName}) - ${job}`,
    description: `${serverName} 서버의 ${name} (${job}) 캐릭터 상세 정보 및 장비 세팅, 아바타, 버프 강화를 실시간으로 확인하세요.`,
    alternates: {
      canonical: `https://dnf-meta.com/character/${serverId}/${characterId}`,
    },
    openGraph: {
      title: `${name} (${serverName}) | 던파메타`,
      description: `${serverName} 서버 ${name} (${job}) 캐릭터의 실시간 전적 및 템세팅 정보를 확인하세요.`,
      url: `https://dnf-meta.com/character/${serverId}/${characterId}`,
      type: 'profile',
      images: [
        {
          url: characterImageUrl,
          alt: `${name} 캐릭터 이미지`,
        }
      ],
    },
    twitter: {
      card: 'summary',
      title: `${name} (${serverName}) | 던파메타`,
      description: `${serverName} 서버 ${name} (${job}) 캐릭터의 실시간 전적 및 템세팅 정보를 확인하세요.`,
      images: [characterImageUrl],
    }
  };
}

export default async function CharacterPage({ params }: PageProps) {
  const { serverId, characterId } = await params;
  const result = await getCharacterData(serverId, characterId);

  const basicInfo = result.data?.basicInfo;
  const name = basicInfo?.characterName || '이름 없음';
  const job = basicInfo?.jobGrowName || '직업 정보 없음';
  const serverObj = SERVERS.find((s) => s.id === serverId);
  const serverName = serverObj ? serverObj.name : serverId;

  const jsonLd = result.data ? {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": name,
      "identifier": characterId,
      "description": `${serverName} 서버의 ${job} 캐릭터`,
      "image": `https://img-api.neople.co.kr/df/servers/${serverId}/characters/${characterId}?zoom=1`,
      "knowsAbout": ["던전앤파이터", "장비 세팅", "아바타", "버프 강화"]
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "홈",
          "item": "https://dnf-meta.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": `${serverName} 캐릭터`,
          "item": `https://dnf-meta.com/character/${serverId}/${characterId}`
        }
      ]
    }
  } : null;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <CharacterDashboard
        serverId={serverId}
        characterId={characterId}
        initialData={result.data ? { data: result.data, stale: result.stale, canRefresh: result.canRefresh } : null}
        initialError={result.error}
      />
    </>
  );
}
