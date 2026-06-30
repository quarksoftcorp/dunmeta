'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  RefreshCw,
  Award,
  Shield,
  Layers,
  Zap,
  Activity,
  Flame,
  Clock,
  Home,
  AlertCircle,
  Sparkles,
  Heart,
  Droplet,
  X
} from 'lucide-react';

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

const RARITY_COLORS: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  '신화': { text: 'text-fuchsia-500 dark:text-fuchsia-400', bg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/5', border: 'border-fuchsia-500/30', glow: 'shadow-fuchsia-500/10' },
  '태초': { text: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-500/10 dark:bg-cyan-500/5', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/10' },
  '에픽': { text: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-500/5', border: 'border-amber-500/25', glow: 'shadow-amber-500/10' },
  '레전더리': { text: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500/10 dark:bg-orange-500/5', border: 'border-orange-500/20', glow: 'shadow-orange-500/5' },
  '유니크': { text: 'text-pink-500 dark:text-pink-400', bg: 'bg-pink-500/10 dark:bg-pink-500/5', border: 'border-pink-500/20', glow: 'shadow-pink-500/5' },
  '레어': { text: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10 dark:bg-purple-500/5', border: 'border-purple-500/20', glow: 'shadow-purple-500/5' },
  '언커먼': { text: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-500/10 dark:bg-sky-500/5', border: 'border-sky-500/20', glow: '' },
  '커먼': { text: 'text-neutral-500 dark:text-neutral-400', bg: 'bg-neutral-500/10 dark:bg-neutral-500/5', border: 'border-neutral-500/20', glow: '' },
};

const SLOT_ORDER = [
  { id: 'WEAPON', name: '무기' },
  { id: 'SHOULDER', name: '머리어깨' },
  { id: 'JACKET', name: '상의' },
  { id: 'PANTS', name: '하의' },
  { id: 'WAIST', name: '벨트' },
  { id: 'SHOES', name: '신발' },
  { id: 'WRIST', name: '팔찌' },
  { id: 'AMULET', name: '목걸이' },
  { id: 'RING', name: '반지' },
  { id: 'SUPPORT', name: '보조장비' },
  { id: 'MAGIC_STON', name: '마법석' },
  { id: 'EARRING', name: '귀걸이' },
];

interface StatusItem {
  name: string;
  value: string | number;
}

interface CharacterStatus {
  status?: StatusItem[];
}

interface EquipmentItem {
  slotId: string;
  slotName: string;
  itemId: string;
  itemName: string;
  itemRarity: string;
  reinforce: number;
  refine: number;
  amplificationName: string | null;
  itemGradeName?: string;
  enchant?: {
    status?: Array<{ name: string; value: string | number | undefined }>;
    explain?: string;
  };
  upgradeInfo?: {
    itemName: string;
  };
  fixedOption?: {
    level: number;
  };
  customOption?: {
    level: number;
  };
  growthOption?: {
    level: number;
  };
  fusionOption?: {
    itemName: string;
  };
}

interface CharacterEquipment {
  equipment?: EquipmentItem[];
}

interface Emblem {
  slotColor: string;
  itemName: string;
  itemRarity: string;
}

interface AvatarItem {
  slotId: string;
  slotName: string;
  itemId: string;
  itemName: string;
  itemRarity: string;
  optionAbility?: string;
  clone?: {
    itemName?: string | null;
  };
  emblems?: Emblem[];
}

interface CharacterAvatar {
  avatar?: AvatarItem[];
}

interface BuffSkillInfo {
  name: string;
  option?: {
    level?: number;
    desc?: string;
  };
}

interface BuffEquipmentItem {
  slotId: string;
  slotName: string;
  itemName: string;
  itemRarity: string;
}

interface BuffAvatarItem {
  slotId: string;
  slotName: string;
  itemName: string;
  itemRarity: string;
  optionAbility?: string;
}

interface BuffCreatureItem {
  itemId: string;
  itemName: string;
  itemRarity: string;
}

interface BuffEquipmentData {
  skill?: {
    buff?: {
      skillInfo?: BuffSkillInfo;
      equipment?: BuffEquipmentItem[];
    };
  };
}

interface BuffAvatarData {
  skill?: {
    buff?: {
      skillInfo?: BuffSkillInfo;
      avatar?: BuffAvatarItem[];
    };
  };
}

interface BuffCreatureData {
  skill?: {
    buff?: {
      skillInfo?: BuffSkillInfo;
      creature?: BuffCreatureItem[];
    };
  };
}

interface BasicInfo {
  characterName?: string;
  level?: number;
  jobGrowName?: string;
  adventureFame?: number;
  fame?: number;
  adventureName?: string;
  guildName?: string;
}

interface CharacterData {
  basicInfo: BasicInfo;
  status?: CharacterStatus;
  equipment?: CharacterEquipment;
  avatar?: CharacterAvatar;
  buffEquipment?: BuffEquipmentData;
  buffAvatar?: BuffAvatarData;
  buffCreature?: BuffCreatureData;
  lastUpdated: number;
  lastRequested: number;
}

export default function CharacterDetailPage() {
  const params = useParams();
  const serverId = params.serverId as string;
  const characterId = params.characterId as string;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [stale, setStale] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'status' | 'equipment' | 'avatar' | 'buff'>('status');

  // Rate-limiting and other warning states
  const [rateLimitToast, setRateLimitToast] = useState<string | null>(null);
  
  // Timer helper to show minutes since last updated
  const [timeAgo, setTimeAgo] = useState<string>('');

  const getServerName = (id: string) => {
    return SERVERS.find((s) => s.id === id)?.name || id;
  };

  const getRarityStyles = (rarity: string) => {
    return RARITY_COLORS[rarity] || {
      text: 'text-neutral-700 dark:text-neutral-300',
      bg: 'bg-neutral-100 dark:bg-neutral-800/40',
      border: 'border-neutral-200 dark:border-neutral-700',
      glow: ''
    };
  };

  const formatEnchant = (enchant: EquipmentItem['enchant']) => {
    if (!enchant) return null;
    if (enchant.explain) return enchant.explain;
    if (Array.isArray(enchant.status)) {
      return enchant.status
        .map((s) => {
          if (s.value !== undefined && s.value !== null) {
            return `${s.name} +${s.value}`;
          }
          return s.name;
        })
        .join(', ');
    }
    return null;
  };

  // Initial Fetch inside useEffect to avoid Synchronous setState inside effect warnings
  useEffect(() => {
    if (!serverId || !characterId) return;
    
    let isMounted = true;
    
    async function loadInitialData() {
      if (isMounted) {
        setLoading(true);
        setError(null);
        setRateLimitToast(null);
      }
      try {
        const url = `/api/character/${serverId}/${characterId}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('캐릭터 정보를 찾을 수 없습니다. 서버명과 캐릭터 ID가 올바른지 확인해주세요.');
          } else {
            throw new Error('서버 데이터를 불러오는 과정에서 오류가 발생했습니다.');
          }
        }

        const json = await res.json();
        if (isMounted) {
          setCharacterData(json.data);
          setStale(json.stale);
        }
      } catch (err) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다.';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [serverId, characterId]);

  // Clock ticks to update "Time Ago" every 10 seconds
  useEffect(() => {
    if (!characterData?.lastUpdated) return;

    const updateTimer = () => {
      const diffMs = Date.now() - characterData.lastUpdated;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);

      if (diffSecs < 60) {
        setTimeAgo('방금 전');
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins}분 전`);
      } else if (diffHours < 24) {
        setTimeAgo(`${diffHours}시간 전`);
      } else {
        setTimeAgo(new Date(characterData.lastUpdated).toLocaleDateString());
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 10000);
    return () => clearInterval(interval);
  }, [characterData?.lastUpdated]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRateLimitToast(null);

    try {
      const url = `/api/character/${serverId}/${characterId}?refresh=true`;
      const res = await fetch(url);
      
      if (!res.ok) {
        if (res.status === 429) {
          const errData = await res.json();
          setRateLimitToast(errData.error || '갱신 요청은 1분에 한 번만 가능합니다.');
          return;
        } else {
          throw new Error('실시간 갱신 요청 중 오류가 발생했습니다.');
        }
      }

      const json = await res.json();
      setCharacterData(json.data);
      setStale(json.stale);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : '갱신 중 에러가 발생했습니다.';
      setError(msg);
    } finally {
      setRefreshing(false);
    }
  };

  // Stat extraction helpers
  const getStatValue = (name: string): string | number => {
    const list = characterData?.status?.status;
    if (!Array.isArray(list)) return '-';
    const match = list.find((s) => s.name === name);
    if (!match) return '-';
    return typeof match.value === 'number' ? match.value.toLocaleString() : match.value;
  };

  const getEquippedItem = (slotId: string) => {
    const list = characterData?.equipment?.equipment;
    if (!Array.isArray(list)) return null;
    return list.find((item) => item.slotId === slotId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 text-neutral-800 dark:text-neutral-200 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Skeleton Hero Card */}
          <div className="relative overflow-hidden rounded-3xl p-8 bg-white/60 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-850 shadow-xl backdrop-blur-xl animate-pulse">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-40 h-52 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
              <div className="flex-1 space-y-4 w-full">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-24" />
                <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3 md:w-1/3" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-200 dark:bg-neutral-850 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton Tabs */}
          <div className="flex space-x-2 border-b border-neutral-200 dark:border-neutral-850 pb-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            ))}
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 bg-white/60 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-850 rounded-2xl p-5 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 text-neutral-800 dark:text-neutral-200 px-4 transition-colors duration-300">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/80 dark:bg-neutral-900/60 border border-amber-500/30 dark:border-amber-500/20 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 mx-auto bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">캐릭터 조회 오류</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed break-keep">
            {error}
          </p>
          <div className="pt-4 flex flex-col gap-2.5">
            <Link
              href="/"
              className="w-full py-3 px-6 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>메인 화면으로 돌아가기</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const basicInfo = characterData?.basicInfo || {};
  const fame = basicInfo.adventureFame || basicInfo.fame || 0;
  
  const isHighFame = fame >= 50000;
  const isGodFame = fame >= 60000;

  let heroBorderClass = 'border-neutral-200 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/60 shadow-neutral-200/50 dark:shadow-black/50';
  let fameBadge = null;
  let heroCardGlow = null;

  if (isGodFame) {
    heroBorderClass = 'border-amber-400 dark:border-amber-500 bg-gradient-to-br from-amber-500/15 via-white/70 to-purple-500/10 dark:from-amber-500/15 dark:via-neutral-950/80 dark:to-purple-950/10 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/20';
    fameBadge = (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm animate-pulse">
        <Sparkles className="w-3.5 h-3.5" />
        <span>眞 모험가 (God)</span>
      </div>
    );
    heroCardGlow = (
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
    );
  } else if (isHighFame) {
    heroBorderClass = 'border-orange-500/70 bg-gradient-to-br from-orange-500/10 via-white/70 to-rose-500/5 dark:from-orange-500/10 dark:via-neutral-950/80 dark:to-rose-950/5 shadow-lg shadow-orange-500/5';
    fameBadge = (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20">
        <Sparkles className="w-3.5 h-3.5" />
        <span>마스터 모험가</span>
      </div>
    );
    heroCardGlow = (
      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 text-neutral-800 dark:text-neutral-200 pb-24 transition-colors duration-300">
      
      {/* Rate limit warning banner (toast) */}
      {rateLimitToast && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center justify-between text-rose-700 dark:text-rose-400 text-sm font-medium backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{rateLimitToast}</span>
            </div>
            <button
              onClick={() => setRateLimitToast(null)}
              className="p-1 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Top Control Panel (Refresh Status) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-805 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>마지막 갱신: <strong className="text-neutral-700 dark:text-neutral-300">{timeAgo}</strong></span>
            {stale && (
              <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                갱신 필요
              </span>
            )}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="self-start sm:self-auto py-2 px-5 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-850 dark:hover:bg-neutral-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>실시간 갱신</span>
          </button>
        </div>

        {/* 1. Profile Hero Section */}
        <section className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border backdrop-blur-xl shadow-xl transition-all duration-500 ${heroBorderClass}`}>
          {heroCardGlow}

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
            
            {/* Character Render Image Wrapper */}
            <div className="relative group bg-neutral-950/10 dark:bg-neutral-950/40 rounded-2xl p-4 border border-neutral-200/40 dark:border-neutral-800/40 w-44 h-56 flex items-center justify-center shadow-inner shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img-api.neople.co.kr/df/servers/${serverId}/characters/${characterId}?zoom=2`}
                alt={basicInfo.characterName || '캐릭터 일러스트'}
                className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-neutral-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-widest pointer-events-none">
                {getServerName(serverId)}
              </div>
            </div>

            {/* Info Body */}
            <div className="flex-1 text-center md:text-left space-y-4 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-3">
                {fameBadge}
                <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/15 w-fit mx-auto md:mx-0">
                  Lv.{basicInfo.level || 115}
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 dark:from-white dark:via-neutral-100 dark:to-white bg-clip-text text-transparent">
                  {basicInfo.characterName || '이름 없음'}
                </h1>
                <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                  {basicInfo.jobGrowName || '무직'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-left max-w-3xl">
                {/* Fame Card */}
                <div className="p-3 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/10 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400/80 uppercase">모험가 명성</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 leading-none">
                      {fame ? fame.toLocaleString() : '0'}
                    </span>
                  </div>
                </div>

                {/* Adventure Club Card */}
                <div className="p-3 bg-neutral-500/5 dark:bg-neutral-500/5 border border-neutral-200/50 dark:border-neutral-800/85 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase">모험단</span>
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-1 truncate">
                    {basicInfo.adventureName || '등록 안됨'}
                  </span>
                </div>

                {/* Guild Card */}
                <div className="p-3 bg-neutral-500/5 dark:bg-neutral-500/5 border border-neutral-200/50 dark:border-neutral-800/85 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase">길드</span>
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-1 truncate">
                    {basicInfo.guildName || '길드 없음'}
                  </span>
                </div>

                {/* Server Card */}
                <div className="p-3 bg-neutral-500/5 dark:bg-neutral-500/5 border border-neutral-200/50 dark:border-neutral-800/85 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase">서버</span>
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-1">
                    {getServerName(serverId)}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 2. Custom Glassmorphic Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 pb-px gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'status' as const, label: '능력치', icon: Activity, color: 'text-rose-500 border-rose-500 dark:text-rose-400 dark:border-rose-400' },
            { id: 'equipment' as const, label: '장비 세팅', icon: Shield, color: 'text-amber-500 border-amber-500 dark:text-amber-400 dark:border-amber-400' },
            { id: 'avatar' as const, label: '아바타', icon: Layers, color: 'text-violet-500 border-violet-500 dark:text-violet-400 dark:border-violet-400' },
            { id: 'buff' as const, label: '버프 스위칭', icon: Zap, color: 'text-emerald-500 border-emerald-500 dark:text-emerald-400 dark:border-emerald-400' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-5 text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all duration-300 select-none shrink-0 ${
                  isActive
                    ? `${tab.color} bg-neutral-100/50 dark:bg-neutral-900/50 rounded-t-xl`
                    : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Dynamic Tab Content Panel */}
        <div className="transition-all duration-300">
          
          {/* A. STATUS TAB */}
          {activeTab === 'status' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Basic and Combat Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Basic Stats Card */}
                <div className="p-6 bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl backdrop-blur-md">
                  <h3 className="text-base font-bold mb-4 text-neutral-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" />
                    <span>기본 능력치</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: '힘', label: '힘 (STR)' },
                      { name: '지능', label: '지능 (INT)' },
                      { name: '체력', label: '체력 (VIT)' },
                      { name: '정신력', label: '정신력 (SPR)' }
                    ].map((stat) => (
                      <div key={stat.name} className="p-4 bg-neutral-100/40 dark:bg-neutral-950/20 border border-neutral-200/50 dark:border-neutral-800/60 rounded-2xl flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{stat.label}</span>
                        <span className="text-base font-extrabold text-neutral-800 dark:text-neutral-200">{getStatValue(stat.name)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Combat Stats Card */}
                <div className="p-6 bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl backdrop-blur-md">
                  <h3 className="text-base font-bold mb-4 text-neutral-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" />
                    <span>전투 및 크리티컬</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'HP', label: '최대 HP', icon: Heart, iconColor: 'text-rose-500' },
                      { name: 'MP', label: '최대 MP', icon: Droplet, iconColor: 'text-sky-500' },
                      { name: '물리 공격', label: '물리 공격력' },
                      { name: '마법 공격', label: '마법 공격력' },
                      { name: '독립 공격', label: '독립 공격력' },
                      { name: '물리 크리티컬', label: '물리 크리티컬', suffix: '%' },
                      { name: '마법 크리티컬', label: '마법 크리티컬', suffix: '%' }
                    ].map((stat) => (
                      <div
                        key={stat.name}
                        className={`p-4 bg-neutral-100/40 dark:bg-neutral-950/20 border border-neutral-200/50 dark:border-neutral-800/60 rounded-2xl flex items-center justify-between ${
                          stat.name === 'HP' || stat.name === 'MP' ? 'col-span-1' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {stat.icon && <stat.icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />}
                          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{stat.label}</span>
                        </div>
                        <span className="text-base font-extrabold text-neutral-800 dark:text-neutral-200">
                          {getStatValue(stat.name)}{stat.suffix || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Elemental Stats Panel */}
              <div className="p-6 bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl backdrop-blur-md">
                <h3 className="text-base font-bold mb-4 text-neutral-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>속성 강화 정보</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: '화속성 강화', label: '화속성 (Fire)', color: 'from-orange-500/20 to-rose-500/20 border-orange-500/30 text-orange-600 dark:text-orange-400' },
                    { name: '수속성 강화', label: '수속성 (Water)', color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-600 dark:text-sky-400' },
                    { name: '명속성 강화', label: '명속성 (Light)', color: 'from-amber-400/25 to-yellow-500/20 border-amber-400/35 text-amber-600 dark:text-amber-400' },
                    { name: '암속성 강화', label: '암속성 (Shadow)', color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-600 dark:text-purple-400' }
                  ].map((el) => {
                    const val = Number((getStatValue(el.name) as string).replace(/,/g, '')) || 0;
                    
                    return (
                      <div
                        key={el.name}
                        className={`p-5 bg-gradient-to-br border rounded-2xl flex flex-col justify-between ${el.color}`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider">{el.label}</span>
                        <div className="mt-4 flex items-baseline justify-between">
                          <span className="text-2xl font-black">{val}</span>
                          <span className="text-[10px] font-semibold opacity-70">강화 수치</span>
                        </div>
                        {/* Progress visual bar */}
                        <div className="mt-3 w-full bg-neutral-200/50 dark:bg-black/20 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-current h-full rounded-full opacity-80"
                            style={{ width: `${Math.min((val / 400) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* B. EQUIPMENT TAB */}
          {activeTab === 'equipment' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {SLOT_ORDER.map((slot) => {
                  const item = getEquippedItem(slot.id);
                  
                  if (!item) {
                    return (
                      <div
                        key={slot.id}
                        className="p-5 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl flex flex-col justify-center items-center h-44 text-neutral-400 text-xs gap-2 bg-neutral-50/30 dark:bg-neutral-900/10"
                      >
                        <Shield className="w-5 h-5 opacity-40" />
                        <span className="font-semibold">{slot.name} 장비 없음</span>
                      </div>
                    );
                  }

                  const rarityStyles = getRarityStyles(item.itemRarity);
                  const enchantText = formatEnchant(item.enchant);
                  const isFused = item.upgradeInfo || item.fusionOption;
                  const itemLevel = item.fixedOption?.level ?? item.customOption?.level ?? item.growthOption?.level ?? null;

                  return (
                    <div
                      key={slot.id}
                      className={`relative p-5 bg-white/50 dark:bg-neutral-900/40 border rounded-2xl flex flex-col justify-between h-44 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:bg-white/80 dark:hover:bg-neutral-900/60 ${rarityStyles.border} ${rarityStyles.glow}`}
                    >
                      {/* Top Header line */}
                      <div className="flex items-center justify-between">
                        {/* Slot Badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-500 dark:text-neutral-400">
                          {slot.name}
                        </span>

                        {/* Upgrade levels (Amplification, Reinforcement, Refinement) */}
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          {item.amplificationName ? (
                            <span className="text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/10">
                              +{item.reinforce} 증폭
                            </span>
                          ) : item.reinforce > 0 ? (
                            <span className="text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/10">
                              +{item.reinforce} 강화
                            </span>
                          ) : null}

                          {item.refine > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                              +{item.refine} 재련
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Item Name & Rarity */}
                      <div className="my-2.5 space-y-1">
                        <div className={`font-black text-sm line-clamp-2 leading-snug cursor-default ${rarityStyles.text}`}>
                          {item.itemName}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                            {item.itemRarity} • {item.itemGradeName || '등급 정보 없음'}
                          </span>
                          {itemLevel !== null && (
                            <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/5 dark:bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/10">
                              Lv.{itemLevel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom row: Fusion Status & Enchant */}
                      <div className="border-t border-neutral-200/40 dark:border-neutral-800/40 pt-2.5 flex flex-col gap-1 w-full text-[11px] leading-tight">
                        {isFused && (
                          <div className="flex items-center gap-1 font-bold text-violet-600 dark:text-violet-400 bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/10 px-1.5 py-0.5 rounded w-fit truncate max-w-full">
                            <Layers className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{item.upgradeInfo?.itemName || item.fusionOption?.itemName}</span>
                          </div>
                        )}
                        <div className="text-neutral-500 dark:text-neutral-400 truncate max-w-full" title={enchantText || '마법부여 없음'}>
                          {enchantText ? `마법부여: ${enchantText}` : '마법부여 정보 없음'}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* C. AVATAR TAB */}
          {activeTab === 'avatar' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {(!characterData?.avatar?.avatar || characterData.avatar.avatar.length === 0) ? (
                <div className="p-12 text-center bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl backdrop-blur-md text-neutral-500">
                  착용중인 아바타가 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {characterData.avatar.avatar.map((av, idx) => {
                    const rarityStyles = getRarityStyles(av.itemRarity);
                    
                    return (
                      <div
                        key={idx}
                        className="p-4 bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col md:flex-row justify-between gap-4 backdrop-blur-md shadow-md hover:scale-[1.01] transition-all duration-200"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-500 dark:text-neutral-400 shrink-0">
                              {av.slotName}
                            </span>
                            <span className={`text-[10px] font-bold uppercase ${rarityStyles.text}`}>
                              {av.itemRarity}
                            </span>
                          </div>
                          
                          <div className="font-extrabold text-sm text-neutral-800 dark:text-neutral-200">
                            {av.itemName}
                          </div>
                          
                          {av.clone?.itemName && (
                            <div className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                              <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.2 rounded border border-neutral-200 dark:border-neutral-700">클론</span>
                              <span className="truncate">{av.clone.itemName}</span>
                            </div>
                          )}
                          
                          {av.optionAbility && (
                            <div className="text-xs font-semibold text-rose-500 bg-rose-500/5 px-2 py-0.5 border border-rose-500/10 rounded w-fit">
                              {av.optionAbility}
                            </div>
                          )}
                        </div>

                        {/* Emblem Slot List */}
                        <div className="border-t md:border-t-0 md:border-l border-neutral-200/50 dark:border-neutral-800/80 pt-3 md:pt-0 md:pl-4 flex flex-col justify-center gap-1.5 w-full md:w-56 shrink-0 text-xs">
                          <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-0.5">엠블렘 슬롯</div>
                          {(!av.emblems || av.emblems.length === 0) ? (
                            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 italic">장착된 엠블렘 없음</div>
                          ) : (
                            av.emblems.map((em, emIdx) => (
                              <div key={emIdx} className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  em.slotColor === '붉은빛' ? 'bg-red-500' :
                                  em.slotColor === '노란빛' ? 'bg-yellow-500' :
                                  em.slotColor === '녹색빛' ? 'bg-green-500' :
                                  em.slotColor === '푸른빛' ? 'bg-blue-500' :
                                  'bg-purple-500'
                                }`} />
                                <span className="font-medium text-neutral-600 dark:text-neutral-300 truncate" title={em.itemName}>
                                  {em.itemName}
                                </span>
                              </div>
                            ))
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* D. BUFF SWITCHING TAB */}
          {activeTab === 'buff' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Buff Skill Info Header */}
              {(() => {
                const buffSkillInfo =
                  characterData?.buffEquipment?.skill?.buff?.skillInfo ||
                  characterData?.buffAvatar?.skill?.buff?.skillInfo ||
                  characterData?.buffCreature?.skill?.buff?.skillInfo;

                if (!buffSkillInfo) {
                  return (
                    <div className="p-6 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>스위칭으로 등록된 버프 강화 스킬 정보가 존재하지 않습니다. (미등록 상태이거나 버퍼 직업군)</span>
                    </div>
                  );
                }

                return (
                  <div className="p-6 bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-md">
                        강화 스킬 정보
                      </span>
                      <h3 className="text-lg font-black text-neutral-800 dark:text-neutral-100 flex items-center gap-2 mt-1">
                        <Zap className="w-5 h-5 text-emerald-500" />
                        <span>{buffSkillInfo.name}</span>
                        <span className="text-emerald-500 text-sm font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                          Lv.{buffSkillInfo.option?.level || '0'}
                        </span>
                      </h3>
                    </div>
                    {buffSkillInfo.option?.desc && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed whitespace-pre-line max-w-xl text-left sm:text-right border-t sm:border-t-0 sm:border-l border-neutral-200 dark:border-neutral-800 pt-3 sm:pt-0 sm:pl-4">
                        {buffSkillInfo.option.desc}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Buff switching categories list */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Buff Equipment */}
                <div className="p-6 bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                      <span>버프 강화 장비</span>
                      <span className="text-[10px] font-semibold text-neutral-400">
                        {characterData?.buffEquipment?.skill?.buff?.equipment?.length || 0}개 등록됨
                      </span>
                    </h4>

                    {(!characterData?.buffEquipment?.skill?.buff?.equipment || characterData.buffEquipment.skill.buff.equipment.length === 0) ? (
                      <div className="py-12 text-center text-xs text-neutral-400 dark:text-neutral-500 italic leading-relaxed">
                        등록된 버프 강화 장비가 없습니다.
                        <br />
                        <span className="text-[10px] opacity-75">(버퍼 직업군은 본장비를 스위칭으로 공유합니다)</span>
                      </div>
                    ) : (
                      <div className="mt-3.5 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {characterData?.buffEquipment?.skill?.buff?.equipment?.map((item, idx) => {
                          const rarityStyles = getRarityStyles(item.itemRarity);
                          return (
                            <div key={idx} className="p-2.5 bg-neutral-100/50 dark:bg-neutral-950/20 border border-neutral-200/50 dark:border-neutral-800/60 rounded-xl flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className={`text-xs font-bold truncate ${rarityStyles.text}`}>{item.itemName}</div>
                                <div className="text-[10px] text-neutral-400 dark:text-neutral-500">{item.slotName}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Buff Avatar */}
                <div className="p-6 bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                      <span>스위칭용 아바타</span>
                      <span className="text-[10px] font-semibold text-neutral-400">
                        {characterData?.buffAvatar?.skill?.buff?.avatar?.length || 0}개 등록됨
                      </span>
                    </h4>

                    {(!characterData?.buffAvatar?.skill?.buff?.avatar || characterData.buffAvatar.skill.buff.avatar.length === 0) ? (
                      <div className="py-12 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
                        등록된 스위칭 아바타가 없습니다.
                      </div>
                    ) : (
                      <div className="mt-3.5 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {characterData?.buffAvatar?.skill?.buff?.avatar?.map((av, idx) => {
                          const rarityStyles = getRarityStyles(av.itemRarity);
                          return (
                            <div key={idx} className="p-2.5 bg-neutral-100/50 dark:bg-neutral-950/20 border border-neutral-200/50 dark:border-neutral-800/60 rounded-xl flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-neutral-400">{av.slotName}</span>
                                <span className={`text-[10px] font-semibold ${rarityStyles.text}`}>{av.itemRarity}</span>
                              </div>
                              <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 truncate">{av.itemName}</div>
                              {av.optionAbility && (
                                <div className="text-[10px] text-rose-500 font-medium truncate">{av.optionAbility}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Buff Creature */}
                <div className="p-6 bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                      <span>스위칭용 크리쳐</span>
                      <span className="text-[10px] font-semibold text-neutral-400">
                        {characterData?.buffCreature?.skill?.buff?.creature?.length || 0}개 등록됨
                      </span>
                    </h4>

                    {(!characterData?.buffCreature?.skill?.buff?.creature || characterData.buffCreature.skill.buff.creature.length === 0) ? (
                      <div className="py-12 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
                        등록된 스위칭 크리쳐가 없습니다.
                      </div>
                    ) : (
                      <div className="mt-3.5 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {characterData?.buffCreature?.skill?.buff?.creature?.map((cr, idx) => {
                          const rarityStyles = getRarityStyles(cr.itemRarity);
                          return (
                            <div key={idx} className="p-2.5 bg-neutral-100/50 dark:bg-neutral-950/20 border border-neutral-200/50 dark:border-neutral-800/60 rounded-xl flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className={`text-xs font-bold truncate ${rarityStyles.text}`}>{cr.itemName}</div>
                                <div className="text-[10px] text-neutral-400 dark:text-neutral-500">크리쳐</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
