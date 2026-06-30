import React from 'react';

interface Emblem {
  slotColor: string;
  itemName: string;
  itemRarity: string;
}

export interface AvatarItem {
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

interface AvatarTabProps {
  avatar?: AvatarItem[];
  getRarityStyles: (rarity: string) => { text: string; bg: string; border: string; glow: string };
}

export default function AvatarTab({ avatar, getRarityStyles }: AvatarTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {(!avatar || avatar.length === 0) ? (
        <div className="p-12 text-center bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl backdrop-blur-md text-neutral-500">
          착용중인 아바타가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {avatar.map((av, idx) => {
            const rarityStyles = getRarityStyles(av.itemRarity);
            
            return (
              <div
                key={idx}
                className="p-4 bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col md:flex-row justify-between gap-4 backdrop-blur-md shadow-md hover:scale-[1.01] transition-all duration-200 animate-in fade-in"
              >
                <div className="flex gap-3 items-start min-w-0 flex-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img-api.neople.co.kr/df/items/${av.itemId}`}
                    alt={av.itemName}
                    className="w-10 h-10 object-contain rounded bg-neutral-100/50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 p-1 shrink-0 shadow-sm"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-500 dark:text-neutral-400 shrink-0">
                        {av.slotName}
                      </span>
                      <span className={`text-[10px] font-bold uppercase ${rarityStyles.text}`}>
                        {av.itemRarity}
                      </span>
                    </div>
                    
                    <div className="font-extrabold text-sm text-neutral-800 dark:text-neutral-200 leading-snug cursor-default" title={av.itemName}>
                      {av.itemName}
                    </div>
                    
                    {av.clone?.itemName && (
                      <div className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                        <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.2 rounded border border-neutral-200 dark:border-neutral-700 font-semibold">클론</span>
                        <span className="truncate">{av.clone.itemName}</span>
                      </div>
                    )}
                    
                    {av.optionAbility && (
                      <div className="text-xs font-semibold text-rose-500 bg-rose-500/5 px-2 py-0.5 border border-rose-500/10 rounded w-fit">
                        {av.optionAbility}
                      </div>
                    )}
                  </div>
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
  );
}
