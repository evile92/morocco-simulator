import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Flame,
  Droplets,
  Coins,
  Shield,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Map as MapIcon,
  FileText,
  Brain,
  Sparkles,
  MessageSquare,
  AlertOctagon,
  ChevronRight,
  Layers,
  MapPin,
  CheckCircle2,
  Target
} from 'lucide-react';
import { GameState, ViewTab, RegionData, CityProtest } from '../../types/game';
import { translate, formatCurrencyMAD } from '../../locales/i18n';
import { CITY_COORDINATES } from '../../data/cityCoordinates';

interface DashboardViewProps {
  state: GameState;
  onNavigate: (tab: ViewTab) => void;
  onOpenAttribution: () => void;
  onSelectCrisis: (crisisId: string) => void;
  onSelectProtest?: (protestId: string) => void;
  onOpenAiAdvisor?: () => void;
  onOpenCustomDecree?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onNavigate,
  onOpenAttribution,
  onSelectCrisis,
  onSelectProtest,
  onOpenAiAdvisor,
  onOpenCustomDecree
}) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const econ = state.economy;
  const budget = state.budget;
  const water = state.water;
  const gov = state.government;

  const [mapMode, setMapMode] = useState<'tension' | 'satisfaction'>('tension');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('casablanca_settat');
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  const prev = state.history[state.history.length - 2] || state.history[0];
  const gdpGrowthDelta = Number((econ.realGdpGrowthRate - prev.gdpGrowthRate).toFixed(2));
  const inflationDelta = Number((econ.inflationRate - prev.inflationRate).toFixed(2));
  const damDelta = Number((water.overallDamFillRate - prev.damFillRate).toFixed(1));

  const selectedRegion = state.regions.find(r => r.id === selectedRegionId) || state.regions[0];
  const activeProtests = state.activeCityProtests || [];
  const selectedRegionProtests = activeProtests.filter(p => p.regionId === selectedRegion.id);
  const citiesInSelectedRegion = state.cities.filter(c => c.regionId === selectedRegion.id);

  // Dynamic regional coloring based on Tension or Satisfaction
  const getRegionFillColor = (region: RegionData) => {
    const isSelected = region.id === selectedRegionId;
    const isHovered = region.id === hoveredRegionId;

    if (mapMode === 'tension') {
      // High Tension = Red, Medium = Amber, Low/Calm = Green
      const tension = region.socialTension;
      if (tension >= 50) return isSelected ? '#ef4444' : isHovered ? '#f87171' : '#dc2626';
      if (tension >= 35) return isSelected ? '#f59e0b' : isHovered ? '#fbbf24' : '#d97706';
      return isSelected ? '#10b981' : isHovered ? '#34d399' : '#059669';
    } else {
      // High Satisfaction = Green, Medium = Amber, Low = Red
      const sat = region.satisfaction;
      if (sat >= 62) return isSelected ? '#10b981' : isHovered ? '#34d399' : '#059669';
      if (sat >= 50) return isSelected ? '#f59e0b' : isHovered ? '#fbbf24' : '#d97706';
      return isSelected ? '#ef4444' : isHovered ? '#f87171' : '#dc2626';
    }
  };

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner: Sovereign Identity & AI Supercharge Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-[#15233c] to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {translate(lang, 'app.subtitle')}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              DeepSeek AI Engine Active
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            {isAr ? 'التقرير السيادي للحكومة المغربية' : 'Executive Sovereign Dashboard'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            {isAr
              ? `الولاية النيابية برئاسة ${gov.primeMinister}. الأغلبية البرلمانية تشغل ${gov.parliamentarySeats} من أصل 395 مقعداً.`
              : `Parliamentary term under Prime Minister ${gov.primeMinister}. Coalition commands ${gov.parliamentarySeats}/395 seats.`}
          </p>
        </div>

        {/* Action Triggers: AI Advisor, Free Decree, Attribution */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenAiAdvisor && (
            <button
              onClick={onOpenAiAdvisor}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
            >
              <Brain className="w-4 h-4 text-white animate-pulse" />
              <span>{isAr ? 'مستشار رئيس الحكومة بالذكاء الاصطناعي' : 'AI Strategic Advisor'}</span>
            </button>
          )}

          {onOpenCustomDecree && (
            <button
              onClick={onOpenCustomDecree}
              className="px-3.5 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'إصدار مرسوم حر بالذكاء الاصطناعي' : 'AI Custom Decree'}</span>
            </button>
          )}

          <button
            onClick={onOpenAttribution}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{translate(lang, 'dashboard.whyChanged')}</span>
          </button>
        </div>
      </div>

      {/* Flagship KPI Metric Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* GDP & Growth */}
        <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{isAr ? 'الناتج الداخلي والنمو' : 'National GDP & Growth'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white">
            {formatCurrencyMAD(econ.gdpBillionMAD, lang)}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`font-bold flex items-center ${
                econ.realGdpGrowthRate >= 3.0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {econ.realGdpGrowthRate > 0 ? `+${econ.realGdpGrowthRate}%` : `${econ.realGdpGrowthRate}%`}
            </span>
            <span className="text-slate-500 text-[10px]">
              {gdpGrowthDelta >= 0 ? `(+${gdpGrowthDelta}%)` : `(${gdpGrowthDelta}%)`}
            </span>
          </div>
        </div>

        {/* Inflation (CPI) */}
        <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{translate(lang, 'app.inflation')}</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white">
            {econ.inflationRate}%
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`font-bold flex items-center ${
                econ.inflationRate <= 2.5 ? 'text-emerald-400' : econ.inflationRate <= 4.0 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {inflationDelta > 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {inflationDelta >= 0 ? `+${inflationDelta}%` : `${inflationDelta}%`}
            </span>
            <span className="text-slate-500 text-[10px]">{translate(lang, 'dashboard.changeFromLastMonth')}</span>
          </div>
        </div>

        {/* Unemployment & Youth */}
        <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{translate(lang, 'app.unemployment')}</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-black text-white">
            {econ.unemploymentRate}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[10px]">
              {isAr ? 'بطالة الشباب: ' : 'Youth: '}
              <strong className="text-amber-300">{econ.youthUnemploymentRate}%</strong>
            </span>
          </div>
        </div>

        {/* Dam Reservoirs Fill Rate */}
        <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-4 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{translate(lang, 'app.damFillRate')}</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white">
            {water.overallDamFillRate}%
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`font-bold flex items-center ${
                damDelta > 0 ? 'text-emerald-400' : damDelta < 0 ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {damDelta > 0 ? `+${damDelta}%` : `${damDelta}%`}
            </span>
            <span className="text-slate-500 text-[10px]">
              {water.droughtLevel !== 'none' ? `(${water.droughtLevel})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Active Crises (if any) */}
      {state.activeCrises.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <span>
              {isAr
                ? `تنبيه أزمات استراتيجية نشطة تستوجب تدخلاً عاجلاً (${state.activeCrises.length})`
                : `Active Sovereign Crisis Alerts Requiring Decision (${state.activeCrises.length})`}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.activeCrises.map(crisis => (
              <div
                key={crisis.id}
                onClick={() => onSelectCrisis(crisis.id)}
                className="bg-slate-900/90 hover:bg-slate-800 border border-rose-500/30 hover:border-rose-400 rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {isAr ? crisis.titleAr : crisis.titleEn}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                    {isAr ? crisis.descriptionAr : crisis.descriptionEn}
                  </p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded bg-rose-600 font-bold text-white shrink-0 ml-2">
                  {isAr ? 'اتخاذ القرار' : 'Resolve'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CENTER PIECE: THE STRATEGIC INTERACTIVE MAP OF MOROCCO & PROTEST HOTSPOTS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Center Container (8 cols) */}
        <div className="lg:col-span-8 bg-[#111a2e] border border-slate-800 rounded-3xl p-5 shadow-2xl relative flex flex-col items-center min-h-[620px] overflow-hidden">
          {/* Header Controls for Map */}
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <MapIcon className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'خريطة المملكة المغربية والجهات الـ 12' : 'Kingdom of Morocco Strategic Regional Map'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isAr
                    ? 'رصد مستويات الاحتقان، الرضا الشعبي، وبؤر المطالب الميدانية بالحواضر'
                    : 'Monitor regional tension, satisfaction, and urban civic flashpoints'}
                </p>
              </div>
            </div>

            {/* Mode Switchers: Tension vs Satisfaction */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setMapMode('tension')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  mapMode === 'tension'
                    ? 'bg-rose-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{isAr ? 'درجة الاحتقان' : 'Social Tension'}</span>
              </button>
              <button
                onClick={() => setMapMode('satisfaction')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  mapMode === 'satisfaction'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'مستوى الرضا' : 'Public Satisfaction'}</span>
              </button>
            </div>
          </div>

          {/* Map Color Legend */}
          <div className="w-full flex items-center justify-between px-2 pt-3 text-[11px]">
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>{mapMode === 'tension' ? (isAr ? 'هدوء واستقرار (<35)' : 'Calm (<35)') : (isAr ? 'رضا مرتفع (>62%)' : 'High (>62%)')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>{mapMode === 'tension' ? (isAr ? 'تأهب وتوتر متوسط (35-50)' : 'Moderate (35-50)') : (isAr ? 'رضا متوسط (50-62%)' : 'Medium (50-62%)')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>{mapMode === 'tension' ? (isAr ? 'احتقان حرج (>50)' : 'Critical (>50)') : (isAr ? 'سخط وتراجع (<50%)' : 'Low (<50%)')}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>
                {activeProtests.length} {isAr ? 'بؤر احتجاج نشطة' : 'Active Flashpoints'}
              </span>
            </div>
          </div>

          {/* SVG Canvas with Interactive Regions & City Protest Hotspots */}
          <div className="w-full max-w-2xl h-auto flex items-center justify-center py-2 relative">
            <svg
              viewBox="0 0 1282 1299"
              className="w-full h-auto max-h-[580px] drop-shadow-2xl transition-all"
            >
              {/* 1. Regional SVG Paths */}
              {state.regions.map(region => {
                if (!region.svgPath) return null;
                const isSelected = region.id === selectedRegionId;
                const isHovered = region.id === hoveredRegionId;
                const fillColor = getRegionFillColor(region);

                return (
                  <path
                    key={region.id}
                    d={region.svgPath}
                    fill={fillColor}
                    stroke={isSelected ? '#38bdf8' : isHovered ? '#f1f5f9' : '#1e293b'}
                    strokeWidth={isSelected ? 4 : isHovered ? 2.5 : 1.2}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => setSelectedRegionId(region.id)}
                    onMouseEnter={() => setHoveredRegionId(region.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                  >
                    <title>
                      {isAr ? region.nameAr : region.nameEn} - {mapMode === 'tension' ? `احتقان: ${region.socialTension}` : `رضا: ${region.satisfaction}%`}
                    </title>
                  </path>
                );
              })}

              {/* 2. City Protest Pulse Markers */}
              {activeProtests.map(protest => {
                const coords = CITY_COORDINATES[protest.cityId];
                if (!coords) return null;
                const [cx, cy] = coords;

                return (
                  <g
                    key={protest.id}
                    className="cursor-pointer transition-all hover:scale-125"
                    onClick={() => onSelectProtest && onSelectProtest(protest.id)}
                  >
                    {/* Animated Pulsing Outer Ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="22"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      className="animate-ping opacity-75 origin-center"
                    />

                    {/* Solid Warning Core */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="13"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="shadow-lg drop-shadow"
                    />

                    {/* Flame / Exclamation Mark Icon */}
                    <text
                      x={cx}
                      y={cy + 4.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="bold"
                    >
                      !
                    </text>

                    {/* City Floating Tag */}
                    <rect
                      x={cx - 45}
                      y={cy - 36}
                      width="90"
                      height="20"
                      rx="6"
                      fill="#0f172a"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      className="opacity-95"
                    />
                    <text
                      x={cx}
                      y={cy - 22}
                      textAnchor="middle"
                      fill="#fca5a5"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {isAr ? protest.cityNameAr : protest.cityNameEn}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="w-full text-center text-[11px] text-slate-500 italic mt-1 border-t border-slate-800/80 pt-2">
            {isAr
              ? 'انقر على أي جهة لاستعراض بياناتها، أو انقر على النقطة الحمراء المتوهجة للتفاعل مع مطالب المحتجين'
              : 'Click any region to inspect metrics, or click a pulsing red beacon to respond to citizen demands'}
          </div>
        </div>

        {/* Right Drawer: Selected Region Profile & Active Flashpoint Demands (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Selected Region Quick Profile */}
          <div className="bg-[#111a2e] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400">
                  {isAr ? 'الجهة المحددة على الخريطة' : 'Inspected Region'}
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  {isAr ? selectedRegion.nameAr : selectedRegion.nameEn}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isAr ? 'العاصمة الجهوية' : 'Capital'}:{' '}
                  <strong className="text-slate-200">
                    {isAr ? selectedRegion.capitalAr : selectedRegion.capitalEn}
                  </strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500">{isAr ? 'الساكنة' : 'Population'}</span>
                <div className="text-xs font-bold text-slate-200">
                  {(selectedRegion.population / 1000000).toFixed(2)}M
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'الاحتقان الاجتماعي' : 'Social Tension'}</span>
                <span
                  className={`text-base font-black ${
                    selectedRegion.socialTension >= 50
                      ? 'text-rose-400'
                      : selectedRegion.socialTension >= 35
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {selectedRegion.socialTension}/100
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'الرضا الشعبي' : 'Public Satisfaction'}</span>
                <span
                  className={`text-base font-black ${
                    selectedRegion.satisfaction >= 62
                      ? 'text-emerald-400'
                      : selectedRegion.satisfaction >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {selectedRegion.satisfaction}%
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'نسبة البطالة' : 'Unemployment'}</span>
                <span className="text-sm font-bold text-amber-300">{selectedRegion.unemploymentRate}%</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'الإجهاد المائي' : 'Water Stress'}</span>
                <span className="text-sm font-bold text-cyan-300">{selectedRegion.waterStressIndex}/100</span>
              </div>
            </div>

            {/* Regional Civic Demands & Priorities */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isAr
                    ? `المطالب الميدانية لساكنة ${selectedRegion.nameAr}:`
                    : `Civic Demands in ${selectedRegion.nameEn}:`}
                </span>
              </span>

              {/* 1. Active Protests in this Region */}
              {selectedRegionProtests.length > 0 ? (
                <div className="space-y-2">
                  {selectedRegionProtests.map(pr => (
                    <div
                      key={pr.id}
                      className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-3 space-y-2 animate-fadeIn"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-rose-300 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-rose-400" />
                          {isAr ? pr.cityNameAr : pr.cityNameEn} ({pr.intensity})
                        </span>
                        <span className="text-[10px] text-slate-400">{pr.demographicGroup}</span>
                      </div>
                      <ul className="text-[11px] text-slate-200 space-y-1">
                        {(isAr ? pr.demandsAr : pr.demandsEn).map((d, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => onSelectProtest && onSelectProtest(pr.id)}
                        className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isAr ? 'التفاعل الفوري مع مطالب هذه الحاضرة' : 'Respond to City Demands'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{isAr ? 'لا توجد وقفات احتجاجية حالية بهذه الجهة.' : 'No active protests in this region.'}</span>
                </div>
              )}

              {/* 2. City-Level Local Issues & Demands */}
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {citiesInSelectedRegion.map(c => (
                  <div
                    key={c.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{isAr ? c.nameAr : c.nameEn}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{(c.population / 1000).toFixed(0)}k pop</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      <span className="text-amber-400/90 font-medium">{isAr ? 'أولويات الساكنة: ' : 'Local Priorities: '}</span>
                      <span>{(isAr && c.localIssuesAr ? c.localIssuesAr : c.localIssues).join(' • ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigate('map')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-all text-center block"
            >
              {isAr ? 'فتح الخريطة الكاملة وتفاصيل الحواضر ←' : 'Open Comprehensive Map View →'}
            </button>
          </div>

          {/* ACTIVE CITY PROTESTS & DEMANDS CARD */}
          <div className="bg-gradient-to-b from-slate-900 via-[#161c2e] to-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <h3 className="text-sm font-black text-white">
                  {isAr ? 'بؤر الاحتجاجات والمطالب الميدانية' : 'Civic Flashpoints & Local Demands'}
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/50 font-bold font-mono">
                {activeProtests.length}
              </span>
            </div>

            {activeProtests.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-200">
                  {isAr ? 'لا توجد بؤر احتجاج نشطة حالياً' : 'No Active Civic Protests'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isAr
                    ? 'تسود حالة من الهدوء والاستقرار في سائر أقاليم وحواضر المملكة.'
                    : 'Calm and social stability currently prevail across all provinces.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {activeProtests.map(protest => (
                  <div
                    key={protest.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-3.5 space-y-2.5 transition-all shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <h4 className="text-xs font-black text-white">
                            {isAr ? protest.cityNameAr : protest.cityNameEn}
                          </h4>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              protest.intensity === 'critical'
                                ? 'bg-rose-600 text-white animate-pulse'
                                : protest.intensity === 'intense'
                                ? 'bg-amber-600 text-white'
                                : 'bg-sky-600/40 text-sky-200'
                            }`}
                          >
                            {protest.intensity}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {isAr ? 'الفئة المحتجة: ' : 'Demographic: '}
                          <strong className="text-slate-300">{protest.demographicGroup}</strong>
                        </span>
                      </div>
                    </div>

                    {/* First Demand Snippet */}
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span className="line-clamp-2 leading-relaxed">
                        {isAr ? protest.demandsAr[0] : protest.demandsEn[0]}
                      </span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => onSelectProtest && onSelectProtest(protest.id)}
                      className="w-full py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isAr ? 'التفاعل مع المطالب واتخاذ القرار' : 'Respond to Citizen Demands'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Row: Fiscal & Social Opinion Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Fiscal Health Card */}
        <div className="bg-[#111a2e] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'الوضعية المالية والميزانية' : 'Fiscal Health & Debt'}</span>
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              Rating: {budget.sovereignCreditRating}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{isAr ? 'المداخيل الشهرية' : 'Monthly Revenues'}</span>
              <span className="font-bold text-slate-200">{formatCurrencyMAD(budget.totalMonthlyRevenue, lang)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{isAr ? 'النفقات الشهرية' : 'Monthly Expenses'}</span>
              <span className="font-bold text-slate-200">{formatCurrencyMAD(budget.totalMonthlyExpense, lang)}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800">
              <span className="text-slate-300 font-semibold">{isAr ? 'الرصيد الشهري' : 'Fiscal Balance'}</span>
              <span
                className={`font-black ${
                  budget.monthlyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrencyMAD(budget.monthlyBalance, lang)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{isAr ? 'نسبة الدين من الناتج الداخلي' : 'Debt-to-GDP Ratio'}</span>
              <span className="font-bold text-amber-400">{budget.debtToGdpRatio}%</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('budget')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all text-center block"
          >
            {isAr ? 'استعراض تفاصيل الميزانية الكاملة' : 'View Full Budget Ledger'}
          </button>
        </div>

        {/* Public Opinion & Social Cohesion Card */}
        <div className="bg-[#111a2e] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>{isAr ? 'المناخ الاجتماعي وشعبية الحكومة' : 'Social Cohesion & Public Trust'}</span>
            </h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                gov.approvalRating >= 55 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {gov.approvalRating}%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'شعبية الحكومة' : 'Approval Rating'}</span>
                <span className="font-semibold text-slate-200">{gov.approvalRating}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${gov.approvalRating}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'ثقة المواطنين' : 'Public Trust'}</span>
                <span className="font-semibold text-slate-200">{gov.publicTrust}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${gov.publicTrust}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">{isAr ? 'الاحتقان الاجتماعي العام' : 'National Social Tension'}</span>
                <span className="font-semibold text-rose-400">
                  {state.history[state.history.length - 1]?.socialTension || 35}/100
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${state.history[state.history.length - 1]?.socialTension || 35}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('society')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all text-center block"
          >
            {isAr ? 'استعراض مطالب الفئات الاجتماعية الـ 11' : 'Inspect 11 Demographic Groups'}
          </button>
        </div>
      </div>

      {/* Strategic 5-Year National Goals */}
      {(state.goals || []).length > 0 && (
        <div className="bg-[#111a2e] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'أهداف الولاية الاستراتيجية (5 سنوات)' : 'Five-Year National Strategic Goals'}</span>
            </h3>
            <span className="text-xs font-bold text-amber-300">
              {(state.goals || []).filter(g => g.completed).length} / {(state.goals || []).length} {isAr ? 'مكتمل' : 'Completed'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {(state.goals || []).map(goal => (
              <div
                key={goal.id}
                className={`rounded-2xl p-3.5 border space-y-2 transition-all ${
                  goal.completed
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className="text-xs font-bold text-white leading-snug">
                    {isAr ? goal.titleAr : goal.titleEn}
                  </span>
                  {goal.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {isAr ? goal.targetDescriptionAr : goal.targetDescriptionEn}
                </p>
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        goal.completed ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-300 block text-end">{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
