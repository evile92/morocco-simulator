import React from 'react';
import {
  Play,
  Pause,
  FastForward,
  Calendar,
  Globe,
  Save,
  Shield,
  Users,
  Flame,
  Coins,
  Brain,
  Droplets,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { GameState } from '../types/game';
import { translate, formatGameDate, formatCurrencyMAD } from '../locales/i18n';

interface TopBarProps {
  state: GameState;
  onAdvance: (months: number) => void;
  onTogglePause: () => void;
  onToggleSpeed: () => void;
  onToggleLanguage: () => void;
  onQuickSave: () => void;
  onOpenAiAdvisor?: () => void;
  onOpenCustomDecree?: () => void;
  onOpenAttribution?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  state,
  onAdvance,
  onTogglePause,
  onToggleSpeed,
  onToggleLanguage,
  onQuickSave,
  onOpenAiAdvisor,
  onOpenAttribution
}) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const gov = state.government;

  const stabilityColor =
    gov.stability >= 70
      ? 'text-emerald-400'
      : gov.stability >= 45
      ? 'text-amber-400'
      : 'text-rose-500 animate-pulse';

  const approvalColor =
    gov.approvalRating >= 60
      ? 'text-emerald-400'
      : gov.approvalRating >= 45
      ? 'text-amber-400'
      : 'text-rose-400';

  const currentTension = state.history[state.history.length - 1]?.socialTension || 35;
  const tensionColor =
    gov.stability < 30 || currentTension > 65
      ? 'text-rose-500 font-bold animate-pulse'
      : 'text-amber-400';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950/88 backdrop-blur-2xl border-b border-slate-800/80 text-slate-100 px-4 flex items-center justify-between shadow-2xl select-none z-40">
      {/* Left section: Sovereign Identity & Calendar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-emerald-800 flex items-center justify-center font-bold text-white shadow-lg border border-amber-500/40">
            🇲🇦
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xs font-black tracking-tight text-white">
              {translate(lang, 'app.title')}
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="font-semibold text-slate-200">
                {isAr && gov.primeMinisterAr ? gov.primeMinisterAr : gov.primeMinister}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-bold">
                {gov.parliamentarySeats}/395 {isAr ? 'مقعداً' : 'seats'}
              </span>
            </p>
          </div>
        </div>

        {/* Date Display */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-black text-amber-300 shadow-inner">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>{formatGameDate(state.currentMonth, state.currentYear, lang)}</span>
        </div>
      </div>

      {/* Center Section: Grand Strategy Resource & Power HUD */}
      <div className="hidden md:flex items-center gap-2 text-xs font-medium">
        {/* Treasury & Balance */}
        <div className="bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-slate-400 text-[9px] uppercase font-bold">{translate(lang, 'app.treasuryReserves')}</span>
            <div className="flex items-center gap-1">
              <span className="font-black text-xs text-slate-100">
                {formatCurrencyMAD(state.budget.treasuryReservesBillionMAD, lang)}
              </span>
              <span className={`text-[10px] font-mono ${state.budget.monthlyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({state.budget.monthlyBalance >= 0 ? '+' : ''}{state.budget.monthlyBalance.toFixed(1)})
              </span>
            </div>
          </div>
        </div>

        {/* GDP Growth & Inflation */}
        <div className="bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-slate-400 text-[9px] uppercase font-bold">
              {isAr ? 'النمو / التضخم' : 'Growth / CPI'}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
              <span className="text-emerald-400">{state.economy.realGdpGrowthRate}%</span>
              <span className="text-slate-600">/</span>
              <span className={state.economy.inflationRate > 3.5 ? 'text-rose-400' : 'text-amber-300'}>
                {state.economy.inflationRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Government Approval */}
        <div className="bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-400" />
          <div className="flex flex-col">
            <span className="text-slate-400 text-[9px] uppercase font-bold">{translate(lang, 'app.publicApproval')}</span>
            <span className={`font-black text-xs ${approvalColor}`}>{gov.approvalRating}%</span>
          </div>
        </div>

        {/* Political Stability */}
        <div className="bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-slate-400 text-[9px] uppercase font-bold">{translate(lang, 'app.politicalStability')}</span>
            <span className={`font-black text-xs ${stabilityColor}`}>{gov.stability}/100</span>
          </div>
        </div>

        {/* Social Tension */}
        <div className="bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <div className="flex flex-col">
            <span className="text-slate-400 text-[9px] uppercase font-bold">{translate(lang, 'app.socialTension')}</span>
            <span className={`font-black text-xs ${tensionColor}`}>{currentTension}/100</span>
          </div>
        </div>

        {/* Dam Fill Rate */}
        <div className="bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-2 hidden xl:flex">
          <Droplets className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-slate-400 text-[9px] uppercase font-bold">
              {isAr ? 'حقينة السدود' : 'Dam Reserves'}
            </span>
            <span className="font-black text-xs text-cyan-400">{state.water.overallDamFillRate}%</span>
          </div>
        </div>

        {/* Why Changed? Attribution Button */}
        {onOpenAttribution && (
          <button
            onClick={onOpenAttribution}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-sky-400 hover:text-sky-300 transition-all"
            title={isAr ? 'لماذا تغيرت المؤشرات هذا الشهر؟' : 'Why did metrics change this month?'}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right Section: Time Simulation Engine & System Controls */}
      <div className="flex items-center gap-1.5">
        {onOpenAiAdvisor && (
          <button
            onClick={onOpenAiAdvisor}
            className="p-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/50 flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm group"
            title={isAr ? 'مستشار رئيس الحكومة بالذكاء الاصطناعي (DeepSeek)' : 'DeepSeek Strategic AI Advisor'}
          >
            <Brain className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="hidden 2xl:inline">{isAr ? 'مستشار AI' : 'AI Advisor'}</span>
          </button>
        )}

        {/* Play/Pause Button */}
        <button
          onClick={onTogglePause}
          className={`px-3 py-1.5 rounded-xl border transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold ${
            state.isPaused
              ? 'bg-amber-600/25 text-amber-300 border-amber-500/50 hover:bg-amber-600/35'
              : 'bg-emerald-600/25 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/35'
          }`}
        >
          {state.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">
            {state.isPaused ? translate(lang, 'app.play') : translate(lang, 'app.pause')}
          </span>
        </button>

        {/* Speed Toggle */}
        <button
          onClick={onToggleSpeed}
          className={`p-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-1 ${
            state.gameSpeed === 'fast'
              ? 'bg-purple-600/30 text-purple-200 border-purple-500/60'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
          title="Toggle Speed"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">
            {state.gameSpeed === 'fast' ? '2x' : '1x'}
          </span>
        </button>

        {/* Manual Month Stepper */}
        <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-800">
          <button
            onClick={() => onAdvance(1)}
            className="px-2.5 py-1 text-xs font-bold text-slate-200 hover:text-white hover:bg-emerald-600/50 rounded-lg transition-all"
          >
            {isAr ? '+1ش' : '+1M'}
          </button>
          <button
            onClick={() => onAdvance(3)}
            className="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-emerald-600/50 rounded-lg transition-all hidden sm:block"
          >
            {isAr ? '+3ش' : '+3M'}
          </button>
          <button
            onClick={() => onAdvance(6)}
            className="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-emerald-600/50 rounded-lg transition-all hidden xl:block"
          >
            {isAr ? '+6ش' : '+6M'}
          </button>
        </div>

        {/* Language Toggle */}
        <button
          onClick={onToggleLanguage}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center gap-1 text-xs font-bold transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* Quick Save */}
        <button
          onClick={onQuickSave}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all"
          title={translate(lang, 'app.saveGame')}
        >
          <Save className="w-3.5 h-3.5 text-sky-400" />
        </button>
      </div>
    </header>
  );
};
