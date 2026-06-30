import React from 'react';
import { AlertCircle, Zap } from 'lucide-react';

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
  itemId?: string;
  itemName: string;
  itemRarity: string;
}

interface BuffAvatarItem {
  slotId: string;
  slotName: string;
  itemId?: string;
  itemName: string;
  itemRarity: string;
  optionAbility?: string;
}

interface BuffCreatureItem {
  itemId?: string;
  itemName: string;
  itemRarity: string;
}

export interface BuffEquipmentData {
  skill?: {
    buff?: {
      skillInfo?: BuffSkillInfo;
      equipment?: BuffEquipmentItem[];
    };
  };
}

export interface BuffAvatarData {
  skill?: {
    buff?: {
      skillInfo?: BuffSkillInfo;
      avatar?: BuffAvatarItem[];
    };
  };
}

export interface BuffCreatureData {
  skill?: {
    buff?: {
      skillInfo?: BuffSkillInfo;
      creature?: BuffCreatureItem[];
    };
  };
}

interface BuffTabProps {
  buffEquipment?: BuffEquipmentData;
  buffAvatar?: BuffAvatarData;
  buffCreature?: BuffCreatureData;
  getRarityStyles: (rarity: string) => { text: string; bg: string; border: string; glow: string };
}

export default function BuffTab({ buffEquipment, buffAvatar, buffCreature, getRarityStyles }: BuffTabProps) {
  const buffSkillInfo =
    buffEquipment?.skill?.buff?.skillInfo ||
    buffAvatar?.skill?.buff?.skillInfo ||
    buffCreature?.skill?.buff?.skillInfo;

  if (!buffSkillInfo) {
    return (
      <div className="p-6 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl text-sm font-semibold flex items-center gap-2">
        <AlertCircle className="w-5 h-5 animate-bounce" />
        <span>스위칭으로 등록된 버프 강화 스킬 정보가 존재하지 않습니다. (미등록 상태이거나 버퍼 직업군)</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Buff Skill Info Header */}
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

      {/* Buff switching categories list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Buff Equipment */}
        <div className="p-6 bg-white/40 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span>버프 강화 장비</span>
              <span className="text-[10px] font-semibold text-neutral-400">
                {buffEquipment?.skill?.buff?.equipment?.length || 0}개 등록됨
              </span>
            </h4>

            {(!buffEquipment?.skill?.buff?.equipment || buffEquipment.skill.buff.equipment.length === 0) ? (
              <div className="py-12 text-center text-xs text-neutral-400 dark:text-neutral-500 italic leading-relaxed">
                등록된 버프 강화 장비가 없습니다.
                <br />
                <span className="text-[10px] opacity-75">(버퍼 직업군은 본장비를 스위칭으로 공유합니다)</span>
              </div>
            ) : (
              <div className="mt-3.5 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {buffEquipment.skill.buff.equipment.map((item, idx) => {
                  const rarityStyles = getRarityStyles(item.itemRarity);
                  return (
                    <div key={idx} className="p-2.5 bg-neutral-100/50 dark:bg-neutral-950/20 border border-neutral-200/50 dark:border-neutral-800/60 rounded-xl flex items-center gap-3">
                      {item.itemId && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={`https://img-api.neople.co.kr/df/items/${item.itemId}`}
                          alt={item.itemName}
                          className="w-7 h-7 object-contain rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/80 p-0.5 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
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
                {buffAvatar?.skill?.buff?.avatar?.length || 0}개 등록됨
              </span>
            </h4>

            {(!buffAvatar?.skill?.buff?.avatar || buffAvatar.skill.buff.avatar.length === 0) ? (
              <div className="py-12 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
                등록된 스위칭 아바타가 없습니다.
              </div>
            ) : (
              <div className="mt-3.5 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {buffAvatar.skill.buff.avatar.map((av, idx) => {
                  const rarityStyles = getRarityStyles(av.itemRarity);
                  return (
                    <div key={idx} className="p-2.5 bg-neutral-100/50 dark:bg-neutral-950/20 border border-neutral-200/50 dark:border-neutral-800/60 rounded-xl flex items-start gap-3">
                      {av.itemId && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={`https://img-api.neople.co.kr/df/items/${av.itemId}`}
                          alt={av.itemName}
                          className="w-7 h-7 object-contain rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/80 p-0.5 shrink-0 mt-0.5"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-neutral-400">{av.slotName}</span>
                          <span className={`text-[10px] font-semibold ${rarityStyles.text}`}>{av.itemRarity}</span>
                        </div>
                        <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 truncate mt-0.5">{av.itemName}</div>
                        {av.optionAbility && (
                          <div className="text-[10px] text-rose-500 font-medium truncate mt-0.5">{av.optionAbility}</div>
                        )}
                      </div>
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
                {buffCreature?.skill?.buff?.creature?.length || 0}개 등록됨
              </span>
            </h4>

            {(!buffCreature?.skill?.buff?.creature || buffCreature.skill.buff.creature.length === 0) ? (
              <div className="py-12 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
                등록된 스위칭 크리쳐가 없습니다.
              </div>
            ) : (
              <div className="mt-3.5 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {buffCreature.skill.buff.creature.map((cr, idx) => {
                  const rarityStyles = getRarityStyles(cr.itemRarity);
                  return (
                    <div key={idx} className="p-2.5 bg-neutral-100/50 dark:bg-neutral-950/20 border border-neutral-200/50 dark:border-neutral-800/60 rounded-xl flex items-center gap-3">
                      {cr.itemId && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={`https://img-api.neople.co.kr/df/items/${cr.itemId}`}
                          alt={cr.itemName}
                          className="w-7 h-7 object-contain rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/80 p-0.5 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
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
  );
}
