import React from 'react';
import { Activity, Flame, Heart, Droplet } from 'lucide-react';

export interface StatusItem {
  name: string;
  value: string | number;
}

interface StatusTabProps {
  status?: StatusItem[];
}

export default function StatusTab({ status }: StatusTabProps) {
  const getStatValue = (name: string): string | number => {
    if (!Array.isArray(status)) return '-';
    const match = status.find((s) => s.name === name);
    if (!match) return '-';
    return typeof match.value === 'number' ? match.value.toLocaleString() : match.value;
  };

  return (
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
  );
}
