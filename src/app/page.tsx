'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Flame,
  TrendingUp,
  Bell,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface CharacterSearchRow {
  serverId: string;
  characterId: string;
  characterName: string;
  level: number;
  jobId: string;
  jobGrowId: string;
  jobName: string;
  jobGrowName: string;
  fame: number;
}

interface PopularCharacter {
  characterId: string;
  serverId: string;
  characterName: string;
  jobGrowName: string;
  fame: number;
  level: number;
  searchCount: number;
}

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

const MOCK_RANKINGS: PopularCharacter[] = [
  { characterId: 'char-1', serverId: 'cain', characterName: '아라드', jobGrowName: '眞 뮤즈', fame: 63819, level: 115, searchCount: 420 },
  { characterId: 'char-2', serverId: 'siroco', characterName: '블러디레이븐', jobGrowName: '眞 레인저(남)', fame: 61950, level: 115, searchCount: 385 },
  { characterId: 'char-3', serverId: 'bakal', characterName: '엔트정령', jobGrowName: '眞 엘레멘탈마스터', fame: 60840, level: 115, searchCount: 312 },
  { characterId: 'char-4', serverId: 'prey', characterName: '힐링마스터', jobGrowName: '眞 크루세이더(여)', fame: 59720, level: 115, searchCount: 278 },
  { characterId: 'char-5', serverId: 'diregie', characterName: '고스트슬레이어', jobGrowName: '眞 검귀', fame: 58910, level: 115, searchCount: 243 },
  { characterId: 'char-6', serverId: 'casillas', characterName: '런처팡', jobGrowName: '眞 디스트로이어', fame: 57400, level: 115, searchCount: 198 },
  { characterId: 'char-7', serverId: 'hilder', characterName: '섀도우댄스', jobGrowName: '眞 그림리퍼', fame: 56900, level: 115, searchCount: 185 },
  { characterId: 'char-8', serverId: 'anton', characterName: '소환마녀', jobGrowName: '眞 오버마인드', fame: 56120, level: 115, searchCount: 142 },
  { characterId: 'char-9', serverId: 'cain', characterName: '넨버프', jobGrowName: '眞 넨마스터(여)', fame: 55430, level: 115, searchCount: 119 },
  { characterId: 'char-10', serverId: 'bakal', characterName: '검은기사', jobGrowName: '眞 다크나이트', fame: 54900, level: 115, searchCount: 95 }
];

const MOCK_NOTICES = [
  {
    id: 1,
    tag: 'Update',
    title: '[업데이트] 眞 아처 신규 전직 및 시나리오 던전 개방',
    summary: '신규 전직 캐릭터 출시 기념 성장 지원 이벤트 및 신규 시나리오 던전 \'차원의 틈\' 업데이트 상세 안내.',
    date: '2026.06.30',
    link: 'https://df.nexon.com'
  },
  {
    id: 2,
    tag: 'Event',
    title: '[이벤트] 아라드 모험가 초월 지원 패키지 출시',
    summary: '모험가의 빠른 성장을 돕는 스페셜 아바타 세트와 시브의 보주, 유용한 세라 아이템이 가득 담긴 역대급 지원 패키지!',
    date: '2026.06.28',
    link: 'https://df.nexon.com'
  },
  {
    id: 3,
    tag: 'Notice',
    title: '[공지] 게임 서비스 안정화를 위한 정기 점검 안내',
    summary: '보다 쾌적하고 안정적인 모험 환경을 제공하기 위한 주간 정기 점검 일정 및 점검 보상 지급 안내입니다.',
    date: '2026.06.27',
    link: 'https://df.nexon.com'
  },
  {
    id: 4,
    tag: 'Event',
    title: '[이벤트] 2026 던파 썸머 페스티벌: 아라드 여름 축제',
    summary: '매일 접속하고 피로도를 소모해 여름 축제 코인을 획득하세요! 105레벨 에픽 장비 선택 상자 등 다양한 보상 지급!',
    date: '2026.06.25',
    link: 'https://df.nexon.com'
  }
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchServer, setSearchServer] = useState('all');
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResults, setSearchResults] = useState<CharacterSearchRow[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Popular rankings state
  const [rankings, setRankings] = useState<PopularCharacter[]>([]);
  const [rankingsLoading, setRankingsLoading] = useState(true);

  // Fetch rankings on mount
  useEffect(() => {
    async function fetchRankings() {
      try {
        const res = await fetch('/api/rank');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setRankings(data);
          } else {
            // Fallback to mock rankings if DB is empty
            setRankings(MOCK_RANKINGS);
          }
        } else {
          setRankings(MOCK_RANKINGS);
        }
      } catch (err) {
        console.error('Failed to fetch popular characters ranking:', err);
        setRankings(MOCK_RANKINGS);
      } finally {
        setRankingsLoading(false);
      }
    }
    fetchRankings();
  }, []);

  const executeSearch = useCallback(async (server: string, name: string) => {
    if (!name.trim()) {
      setSearchError('캐릭터명을 입력해주세요.');
      return;
    }

    setLoading(true);
    setSearchError('');
    setSearchResults([]);
    setHasSearched(false);

    try {
      const url = `/api/search?server=${encodeURIComponent(server)}&name=${encodeURIComponent(name.trim())}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('검색 요청 중 오류가 발생했습니다.');
      }
      const data = await res.json();
      const rows: CharacterSearchRow[] = data.rows || [];

      if (rows.length === 0) {
        setSearchError('일치하는 캐릭터가 없습니다. 서버 및 캐릭터명을 다시 확인해 주세요.');
      } else if (rows.length === 1) {
        // Automatically redirect if exactly 1 match
        const char = rows[0];
        router.push(`/character/${char.serverId}/${char.characterId}`);
      } else {
        // Multiple matches, show grid panel
        setSearchResults(rows);
      }
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setSearchError(err instanceof Error ? err.message : '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set('characterName', searchName.trim());
    if (searchServer !== 'all') {
      params.set('server', searchServer);
    } else {
      params.delete('server');
    }
    router.push(`/?${params.toString()}`);
  };

  useEffect(() => {
    const characterName = searchParams.get('characterName');
    const server = searchParams.get('server');

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchName(characterName || '');
    setSearchServer(server || 'all');

    if (characterName) {
      executeSearch(server || 'all', characterName);
    } else {
      setSearchResults([]);
      setHasSearched(false);
      setSearchError('');
      setLoading(false);
    }
  }, [searchParams, executeSearch]);

  const getServerName = (serverId: string) => {
    return SERVERS.find((s) => s.id === serverId)?.name || serverId;
  };

  const formatFame = (fame: number) => {
    return fame ? fame.toLocaleString() : '0';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 text-neutral-800 dark:text-neutral-200 transition-colors duration-300">
      
      {/* 1. Hero & Search Box Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Visual Glow Decorations */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          {/* Main Title Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Premium DNF Analytics</span>
          </div>

          {/* Catchphrase */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-neutral-900 via-rose-500 to-amber-500 dark:from-white dark:via-rose-400 dark:to-amber-400 bg-clip-text text-transparent leading-none">
            던전앤파이터 캐릭터 검색 및<br className="sm:hidden" /> 실시간 트렌드 분석
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto mb-10">
            명성(fame), 장비 세팅, 아바타, 융합석, 스킬 트리 등 모든 상세 정보를 한눈에 분석하세요. 네오플 오픈 API 기반 최신 전적 피드.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl shadow-neutral-200/50 dark:shadow-black/50 backdrop-blur-xl transition-all duration-300 focus-within:border-rose-500/50 focus-within:ring-2 focus-within:ring-rose-500/20">
              
              {/* Server Dropdown */}
              <div className="relative">
                <select
                  value={searchServer}
                  onChange={(e) => setSearchServer(e.target.value)}
                  className="w-full sm:w-36 h-12 pl-4 pr-10 bg-transparent text-sm font-semibold border-0 focus:ring-0 focus:outline-none appearance-none cursor-pointer text-neutral-700 dark:text-neutral-200"
                >
                  {SERVERS.map((srv) => (
                    <option
                      key={srv.id}
                      value={srv.id}
                      className="bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200"
                    >
                      {srv.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block w-[1px] bg-neutral-200 dark:bg-neutral-800 my-2" />
              
              {/* Name Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="캐릭터명을 입력하세요 (예: 아라드)"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full h-12 px-4 bg-transparent text-sm border-0 focus:ring-0 focus:outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 font-medium"
                />
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="h-12 px-6 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 dark:shadow-rose-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>검색</span>
              </button>
            </div>
          </form>

          {/* Search Result Overlay / Dynamic Grid Panel */}
          {hasSearched && searchResults.length > 1 && (
            <div className="max-w-2xl mx-auto bg-white/95 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 text-left">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-100">
                  검색 결과 <span className="text-rose-500">{searchResults.length}</span>개의 캐릭터 매칭됨
                </h3>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">이동할 캐릭터를 선택하세요</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {searchResults.map((char) => (
                  <div
                    key={char.characterId}
                    onClick={() => router.push(`/character/${char.serverId}/${char.characterId}`)}
                    className="p-3.5 bg-neutral-50 dark:bg-neutral-950/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/15 border border-neutral-200/60 dark:border-neutral-800/80 hover:border-rose-500/30 rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-rose-500 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/10">
                        {getServerName(char.serverId)}
                      </span>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        Lv.{char.level}
                      </span>
                    </div>
                    
                    <div className="font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                      {char.characterName}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-neutral-200/40 dark:border-neutral-800/40">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[120px]">
                        {char.jobGrowName || char.jobName}
                      </span>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">
                        명성 {formatFame(char.fame)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading status details for search */}
          {loading && (
            <div className="flex items-center justify-center space-x-2 text-neutral-500 dark:text-neutral-400">
              <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
              <span className="text-sm">네오플 서버에서 캐릭터 데이터를 탐색 중입니다...</span>
            </div>
          )}

          {/* Error Message */}
          {searchError && (
            <div className="max-w-2xl mx-auto p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-700 dark:text-amber-400 text-sm font-medium text-left">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

        </div>
      </section>

      {/* 2. Dashboard Widgets Section (2-Column Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Popular Character Ranking Widget */}
          <div className="bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">실시간 인기 캐릭터</h2>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">최근 모험가들이 가장 많이 검색한 캐릭터 탑 10</p>
                </div>
              </div>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mr-1" />
                Live
              </span>
            </div>

            {/* Content List */}
            {rankingsLoading ? (
              <div className="space-y-3.5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-150 dark:border-neutral-800/40 rounded-2xl animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-800 rounded" />
                      <div className="space-y-1.5">
                        <div className="w-24 h-4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                        <div className="w-32 h-3 bg-neutral-200 dark:bg-neutral-850 rounded" />
                      </div>
                    </div>
                    <div className="w-16 h-5 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {rankings.map((char, index) => {
                  const rank = index + 1;
                  const badgeColor =
                    rank === 1
                      ? 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400 font-extrabold'
                      : rank === 2
                      ? 'bg-slate-400/10 border-slate-400/25 text-slate-600 dark:text-slate-300 font-extrabold'
                      : rank === 3
                      ? 'bg-orange-600/10 border-orange-600/25 text-orange-600 dark:text-orange-400 font-extrabold'
                      : 'bg-neutral-100 dark:bg-neutral-800/50 border-transparent text-neutral-400 dark:text-neutral-500 font-semibold';
                  
                  return (
                    <div
                      key={`${char.serverId}-${char.characterId}-${index}`}
                      onClick={() => router.push(`/character/${char.serverId}/${char.characterId}`)}
                      className="group flex items-center justify-between p-3.5 bg-neutral-50/50 dark:bg-neutral-950/20 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 border border-neutral-200/50 dark:border-neutral-800/40 hover:border-rose-500/20 rounded-2xl cursor-pointer transition-all duration-300 hover:translate-x-1"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        {/* Rank Badge */}
                        <div className={`w-7 h-7 flex items-center justify-center rounded-lg border text-sm shrink-0 ${badgeColor}`}>
                          {rank}
                        </div>
                        
                        {/* Char Info */}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors truncate">
                              {char.characterName}
                            </span>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0">
                              {getServerName(char.serverId)}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                            Lv.{char.level} • {char.jobGrowName || '전직 정보 없음'}
                          </div>
                        </div>
                      </div>

                      {/* Fame & Search Score */}
                      <div className="flex items-center space-x-4 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">
                            명성 {formatFame(char.fame)}
                          </div>
                          {char.searchCount > 0 && (
                            <div className="flex items-center justify-end text-[10px] text-rose-500 dark:text-rose-400 font-semibold mt-1 space-x-0.5">
                              <TrendingUp className="w-3 h-3" />
                              <span>+{char.searchCount}</span>
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-700 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-all duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: DNF Official Updates & News Board */}
          <div className="bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">던전앤파이터 소식</h2>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">던파 공식 패치노트 및 신규 공지/이벤트</p>
                </div>
              </div>
              <a
                href="https://df.nexon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-rose-500 dark:text-rose-400 font-semibold flex items-center space-x-1 hover:underline"
              >
                <span>공식 홈페이지</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* News Cards Grid */}
            <div className="space-y-4">
              {MOCK_NOTICES.map((notice) => {
                const tagStyles =
                  notice.tag === 'Update'
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400'
                    : notice.tag === 'Event'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400';

                return (
                  <a
                    key={notice.id}
                    href={notice.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 bg-neutral-50/50 dark:bg-neutral-950/20 hover:bg-amber-500/5 dark:hover:bg-amber-500/5 border border-neutral-200/50 dark:border-neutral-800/40 hover:border-amber-500/20 rounded-2xl transition-all duration-300 hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider border rounded px-2.5 py-0.5 ${tagStyles}`}>
                        {notice.tag}
                      </span>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        {notice.date}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                      <span>{notice.title}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0 text-amber-500 transition-opacity" />
                    </h3>
                    
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                      {notice.summary}
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
          
        </div>
      </section>

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
