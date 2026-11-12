import React from 'react';
import {
  Users,
  Flame,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { GameState } from '../../types/game';
import { translate } from '../../locales/i18n';

interface SocietyViewProps {
  state: GameState;
  onOpenCrisisModal: (crisisId: string) => void;
}

export const SocietyView: React.FC<SocietyViewProps> = ({ state, onOpenCrisisModal }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const demographics = state.demographics;
  const tension = state.history[state.history.length - 1]?.socialTension || 35;

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner: Tension Barometer */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {translate(lang, 'society.title')}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'رصد تطلعات الفئات الـ 11 الاجتماعية ومستوى التماسك ومخاطر الإضرابات والاحتجاجات'
                  : 'Social cohesion, demographic group priorities, and civil unrest indicators'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl flex items-center gap-3">
            <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {translate(lang, 'app.socialTension')}
              </span>
              <span className="text-xl font-black text-rose-400">{tension}/100</span>
            </div>
          </div>
        </div>

        {/* Tension Meter Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">{translate(lang, 'tension.calm')} (0-20)</span>
            <span className="text-amber-400 font-semibold">{translate(lang, 'tension.noticeable')} (40-60)</span>
            <span className="text-rose-400 font-semibold">{translate(lang, 'tension.critical')} (80-100)</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                tension < 30 ? 'bg-emerald-500' : tension < 60 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${tension}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Active Protests Section (if any) */}
      {state.activeCrises.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span>{translate(lang, 'society.activeProtests')}</span>
          </h3>

          <div className="space-y-2">
            {state.activeCrises.map(crisis => (
              <div
                key={crisis.id}
                className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isAr ? crisis.titleAr : crisis.titleEn}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr ? crisis.descriptionAr : crisis.descriptionEn}
                  </p>
                </div>
                <button
                  onClick={() => onOpenCrisisModal(crisis.id)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
                >
                  {translate(lang, 'society.resolveCrisis')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11 Demographic Groups Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          {translate(lang, 'society.demographicsBreakdown')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demographics.map(demo => (
            <div
              key={demo.id}
              className="bg-[#111a2e] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {isAr ? demo.nameAr : demo.nameEn}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {demo.populationShare}% {isAr ? 'من ساكنة المملكة' : 'of population'}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                      demo.satisfaction >= 60
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : demo.satisfaction >= 45
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {demo.satisfaction}%
                  </span>
                </div>

                <div className="space-y-1.5 mt-3 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{translate(lang, 'society.turnout')}</span>
                    <span className="font-semibold text-slate-200">{demo.turnoutPropensity}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${demo.satisfaction}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Grievances / Concerns */}
              <div className="border-t border-slate-800/80 pt-3 text-[11px] space-y-1">
                <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">
                  {translate(lang, 'society.keyConcerns')}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {demo.topConcerns.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[10px]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
