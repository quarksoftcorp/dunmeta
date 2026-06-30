'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Award,
  Shield,
  Layers,
  Zap,
  Activity,
  Clock,
  Home,
  AlertCircle,
  Sparkles,
  X
} from 'lucide-react';

import StatusTab, { StatusItem } from './StatusTab';
import EquipmentTab, { EquipmentItem } from './EquipmentTab';
import AvatarTab, { AvatarItem } from './AvatarTab';
import BuffTab, { BuffEquipmentData, BuffAvatarData, BuffCreatureData } from './BuffTab';
import TimelineTab, { TimelineData } from './TimelineTab';

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
  status?: { status?: StatusItem[] };
  equipment?: { equipment?: EquipmentItem[] };
  avatar?: { avatar?: AvatarItem[] };
  buffEquipment?: BuffEquipmentData;
  buffAvatar?: BuffAvatarData;
  buffCreature?: BuffCreatureData;
  timeline?: TimelineData;
  lastUpdated: number;
  lastRequested: number;
}

interface CharacterDashboardProps {
  serverId: string;
  characterId: string;
  initialData?: {
    data: CharacterData;
    stale: boolean;
    canRefresh: boolean;
  } | null;
  initialError?: string | null;
}

export default function CharacterDashboard({
  serverId,
  characterId,
  initialData,
  initialError
}: CharacterDashboardProps) {
  const [characterData, setCharacterData] = useState<CharacterData | null>(initialData?.data || null);
  const [stale, setStale] = useState(initialData?.stale ?? false);
  const [canRefresh, setCanRefresh] = useState(initialData?.canRefresh ?? false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'status' | 'equipment' | 'avatar' | 'buff' | 'timeline'>('status');

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

  // Auto-dismiss rate limit toast after 5 seconds
  useEffect(() => {
    if (rateLimitToast) {
      const timer = setTimeout(() => {
        setRateLimitToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitToast]);

  // Update "Time Ago" every 10 seconds
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
      setCanRefresh(json.canRefresh);
      setError(null);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : '갱신 중 에러가 발생했습니다.';
      setError(msg);
    } finally {
      setRefreshing(false);
    }
  };

  // Background Auto-Refresh for Stale Cache
  useEffect(() => {
    if (stale && canRefresh && !error && !refreshing) {
      const timer = setTimeout(() => {
        handleRefresh();
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stale, canRefresh, error, refreshing]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
        <div className="p-8 max-w-md w-full bg-white/60 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col items-center text-center gap-4 animate-in zoom-in duration-300">
          <AlertCircle className="w-16 h-16 text-rose-500 animate-pulse" />
          <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">캐릭터 조회 오류</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed break-keep">
            {error}
          </p>
          <div className="pt-4 flex flex-col gap-2.5 w-full">
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

  if (!characterData) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          <span className="text-sm font-semibold text-neutral-500">데이터가 로드되지 않았습니다.</span>
        </div>
      </div>
    );
  }

  const basicInfo = characterData.basicInfo || {};
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl backdrop-blur-md">
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
            { id: 'buff' as const, label: '버프 스위칭', icon: Zap, color: 'text-emerald-500 border-emerald-500 dark:text-emerald-400 dark:border-emerald-400' },
            { id: 'timeline' as const, label: '타임라인', icon: Clock, color: 'text-cyan-500 border-cyan-500 dark:text-cyan-400 dark:border-cyan-400' }
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
            <StatusTab status={characterData.status?.status} />
          )}

          {/* B. EQUIPMENT TAB */}
          {activeTab === 'equipment' && (
            <EquipmentTab
              equipment={characterData.equipment?.equipment}
              getRarityStyles={getRarityStyles}
            />
          )}

          {/* C. AVATAR TAB */}
          {activeTab === 'avatar' && (
            <AvatarTab
              avatar={characterData.avatar?.avatar}
              getRarityStyles={getRarityStyles}
            />
          )}

          {/* D. BUFF SWITCHING TAB */}
          {activeTab === 'buff' && (
            <BuffTab
              buffEquipment={characterData.buffEquipment}
              buffAvatar={characterData.buffAvatar}
              buffCreature={characterData.buffCreature}
              getRarityStyles={getRarityStyles}
            />
          )}

          {/* E. TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <TimelineTab
              timeline={characterData.timeline}
              getRarityStyles={getRarityStyles}
            />
          )}

        </div>

      </div>

    </div>
  );
}
