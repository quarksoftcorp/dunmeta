import React from 'react';
import { Shield, Layers } from 'lucide-react';

export interface EquipmentItem {
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

interface EquipmentTabProps {
  equipment?: EquipmentItem[];
  getRarityStyles: (rarity: string) => { text: string; bg: string; border: string; glow: string };
}

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

export default function EquipmentTab({ equipment, getRarityStyles }: EquipmentTabProps) {
  const getEquippedItem = (slotId: string) => {
    if (!Array.isArray(equipment)) return null;
    return equipment.find((item) => item.slotId === slotId);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SLOT_ORDER.map((slot) => {
          const item = getEquippedItem(slot.id);
          
          if (!item) {
            return (
              <div
                key={slot.id}
                className="p-5 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl flex flex-col justify-center items-center h-48 text-neutral-400 text-xs gap-2 bg-neutral-50/30 dark:bg-neutral-900/10"
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
              className={`relative p-5 bg-white/50 dark:bg-neutral-900/40 border rounded-2xl flex flex-col justify-between h-48 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:bg-white/80 dark:hover:bg-neutral-900/60 ${rarityStyles.border} ${rarityStyles.glow}`}
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

              {/* Item Icon, Name & Rarity */}
              <div className="my-2.5 flex items-start gap-3 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img-api.neople.co.kr/df/items/${item.itemId}`}
                  alt={item.itemName}
                  className="w-10 h-10 object-contain rounded bg-neutral-100/50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 p-1 shrink-0 shadow-sm"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className={`font-black text-sm line-clamp-2 leading-snug cursor-default ${rarityStyles.text}`} title={item.itemName}>
                    {item.itemName}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      {item.itemRarity} • {item.itemGradeName || '등급 정보 없음'}
                    </span>
                    {itemLevel !== null && (
                      <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/5 dark:bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/10 shrink-0">
                        Lv.{itemLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom row: Fusion Status & Enchant */}
              <div className="border-t border-neutral-200/40 dark:border-neutral-800/40 pt-2 flex flex-col gap-1 w-full text-[11px] leading-tight">
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
  );
}
