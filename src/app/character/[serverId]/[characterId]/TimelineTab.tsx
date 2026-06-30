import React from 'react';
import { Clock } from 'lucide-react';

interface TimelineRow {
  code: number;
  name: string;
  date: string;
  data?: {
    itemId?: string;
    itemName?: string;
    itemRarity?: string;
    dungeonName?: string;
    channelName?: string;
  };
}

export interface TimelineData {
  name: string;
  rows?: TimelineRow[];
}

interface TimelineTabProps {
  timeline?: TimelineData;
  getRarityStyles: (rarity: string) => { text: string; bg: string; border: string; glow: string };
}

export default function TimelineTab({ timeline, getRarityStyles }: TimelineTabProps) {
  const rows = timeline?.rows || [];

  if (rows.length === 0) {
    return (
      <div className="p-12 text-center bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl backdrop-blur-md text-neutral-500">
        최근 활동 타임라인 기록이 존재하지 않습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8 py-2">
        {rows.map((row, idx) => {
          const itemRarity = row.data?.itemRarity || '';
          const rarityStyles = getRarityStyles(itemRarity);
          
          return (
            <div key={idx} className="relative group">
              {/* Timeline dot */}
              <span className="absolute -left-[31px] md:-left-[39px] top-1.5 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 group-hover:border-rose-500 transition-colors">
                <span className="h-2 w-2 rounded-full bg-rose-500 group-hover:scale-125 transition-transform" />
              </span>

              {/* Event card */}
              <div className="p-5 bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl backdrop-blur-md shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:scale-[1.005] hover:bg-white/60 dark:hover:bg-neutral-900/50 transition-all duration-200">
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Date and tag */}
                  <div className="flex items-center gap-3 text-[10px] font-bold text-neutral-400 dark:text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{row.date}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-500">
                      {row.name}
                    </span>
                  </div>

                  {/* Event Content */}
                  <div className="text-neutral-800 dark:text-neutral-100 font-extrabold text-sm flex flex-wrap items-center gap-2">
                    {row.data?.itemName ? (
                      <div className="flex items-center gap-2 min-w-0">
                        {row.data?.itemId && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={`https://img-api.neople.co.kr/df/items/${row.data.itemId}`}
                            alt={row.data.itemName}
                            className="w-7 h-7 object-contain rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/80 p-0.5 shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                        <span className={`font-black truncate ${rarityStyles.text}`}>
                          [{row.data.itemName}]
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-300 font-bold shrink-0">획득</span>
                      </div>
                    ) : (
                      <span className="font-bold">{row.name} 활동 기록 완료</span>
                    )}
                  </div>

                  {/* Extra location info */}
                  {(row.data?.dungeonName || row.data?.channelName) && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      {row.data.dungeonName && (
                        <span>던전: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{row.data.dungeonName}</span></span>
                      )}
                      {row.data.dungeonName && row.data.channelName && <span className="mx-2">•</span>}
                      {row.data.channelName && (
                        <span>채널: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{row.data.channelName}</span></span>
                      )}
                    </div>
                  )}
                </div>

                {/* Decorative neon tag */}
                {row.data?.itemRarity && (
                  <div className={`text-[10px] font-black tracking-widest uppercase border px-2.5 py-0.5 rounded-full shrink-0 ${rarityStyles.text} ${rarityStyles.bg} ${rarityStyles.border}`}>
                    {row.data.itemRarity}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
