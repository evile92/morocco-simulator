import React, { useState } from 'react';
import {
  Layers,
  Users,
  Flame,
  Droplets,
  TrendingUp,
  Building2,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { RegionData, CityData, GameState } from '../../types/game';
import { translate } from '../../locales/i18n';
import { CITY_COORDINATES } from '../../data/cityCoordinates';

type HeatmapMode = 'satisfaction' | 'tension' | 'unemployment' | 'waterStress' | 'gdp' | 'investment';

interface MoroccoMapViewProps {
  state: GameState;
  onSelectCity?: (cityId: string) => void;
  onSelectProtest?: (protestId: string) => void;
}

export const MoroccoMapView: React.FC<MoroccoMapViewProps> = ({ state, onSelectProtest }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('satisfaction');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('casablanca_settat');
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  const selectedRegion = state.regions.find(r => r.id === selectedRegionId) || state.regions[0];
  const citiesInRegion = state.cities.filter(c => c.regionId === selectedRegion.id);

  // Heatmap color generator
  const getRegionFillColor = (region: RegionData) => {
    const isSelected = region.id === selectedRegionId;
    const isHovered = region.id === hoveredRegionId;

    if (heatmapMode === 'satisfaction') {
      // 0-100: Green is high satisfaction, Red is low
      const sat = region.satisfaction;
      if (sat >= 65) return isSelected ? '#10b981' : isHovered ? '#34d399' : '#059669';
      if (sat >= 52) return isSelected ? '#f59e0b' : isHovered ? '#fbbf24' : '#d97706';
      return isSelected ? '#ef4444' : isHovered ? '#f87171' : '#dc2626';
    }

    if (heatmapMode === 'tension') {
      // Tension: High is Red, Low is Green
      const tension = region.socialTension;
      if (tension >= 50) return isSelected ? '#ef4444' : isHovered ? '#f87171' : '#dc2626';
      if (tension >= 35) return isSelected ? '#f59e0b' : isHovered ? '#fbbf24' : '#d97706';
      return isSelected ? '#10b981' : isHovered ? '#34d399' : '#059669';
    }

    if (heatmapMode === 'unemployment') {
      const unemp = region.unemploymentRate;
      if (unemp >= 15.0) return isSelected ? '#e11d48' : '#be123c';
      if (unemp >= 12.0) return isSelected ? '#d97706' : '#b45309';
      return isSelected ? '#0d9488' : '#0f766e';
    }

    if (heatmapMode === 'waterStress') {
      const stress = region.waterStressIndex;
      if (stress >= 75) return isSelected ? '#dc2626' : '#b91c1c';
      if (stress >= 55) return isSelected ? '#ea580c' : '#c2410c';
      return isSelected ? '#0284c7' : '#0369a1';
    }

    if (heatmapMode === 'gdp') {
      const gdpShare = region.gdpContributionPercent;
      if (gdpShare >= 20.0) return isSelected ? '#8b5cf6' : '#7c3aed';
      if (gdpShare >= 8.0) return isSelected ? '#6366f1' : '#4f46e5';
      return isSelected ? '#475569' : '#334155';
    }

    // Investment
    const inv = region.investmentFlowIndex;
    if (inv >= 75) return isSelected ? '#10b981' : '#059669';
    if (inv >= 55) return isSelected ? '#06b6d4' : '#0891b2';
    return isSelected ? '#64748b' : '#475569';
  };

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Controls: Heatmap Selectors */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-white">
              {isAr ? 'الخريطة التفاعلية للجهات الـ 12 للمملكة المغربية' : 'Interactive 12 Moroccan Regions Strategic Map'}
            </h2>
            <p className="text-xs text-slate-400">
              {translate(lang, 'map.selectRegionToInspect')}
            </p>
          </div>
        </div>

        {/* Heatmap Mode Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80 text-xs font-semibold">
          <button
            onClick={() => setHeatmapMode('satisfaction')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              heatmapMode === 'satisfaction'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {translate(lang, 'map.satisfaction')}
          </button>
          <button
            onClick={() => setHeatmapMode('tension')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              heatmapMode === 'tension'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {translate(lang, 'map.socialTension')}
          </button>
          <button
            onClick={() => setHeatmapMode('waterStress')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              heatmapMode === 'waterStress'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {translate(lang, 'map.waterStress')}
          </button>
          <button
            onClick={() => setHeatmapMode('unemployment')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              heatmapMode === 'unemployment'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {translate(lang, 'map.unemployment')}
          </button>
          <button
            onClick={() => setHeatmapMode('gdp')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              heatmapMode === 'gdp'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {translate(lang, 'map.gdpContribution')}
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Vector Map + Regional Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map SVG Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-[#111a2e] border border-slate-800 rounded-2xl p-4 shadow-2xl relative flex flex-col items-center justify-center min-h-[580px] overflow-hidden">
          {/* Subtle Map Legend */}
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 shadow-lg backdrop-blur-sm">
            <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">
              {translate(lang, 'map.viewHeatmap')}: {heatmapMode}
            </span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
              <span className="text-[10px] text-slate-400">{isAr ? 'مرتفع / إيجابي' : 'Favorable'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
              <span className="text-[10px] text-slate-400">{isAr ? 'متوسط / تنبيه' : 'Moderate'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-rose-500"></span>
              <span className="text-[10px] text-slate-400">{isAr ? 'حرج / احتقان' : 'Critical'}</span>
            </div>
          </div>

          {/* SVG Map Container */}
          <div className="w-full max-w-xl h-auto flex items-center justify-center py-2">
            <svg
              viewBox="0 0 1282 1299"
              className="w-full h-auto max-h-[560px] drop-shadow-2xl transition-all"
            >
              {/* Regional Paths */}
              {state.regions.map(region => {
                if (!region.svgPath) return null;
                const isSelected = region.id === selectedRegionId;
                const isHovered = region.id === hoveredRegionId;
                const fillColor = getRegionFillColor(region);

                return (
                  <g key={region.id}>
                    <path
                      d={region.svgPath}
                      fill={fillColor}
                      stroke={isSelected ? '#38bdf8' : isHovered ? '#e2e8f0' : '#1e293b'}
                      strokeWidth={isSelected ? 4 : isHovered ? 2.5 : 1.2}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => setSelectedRegionId(region.id)}
                      onMouseEnter={() => setHoveredRegionId(region.id)}
                      onMouseLeave={() => setHoveredRegionId(null)}
                    >
                      <title>{isAr ? region.nameAr : region.nameEn}</title>
                    </path>
                  </g>
                );
              })}

              {/* City Protest Pulsing Hotspots */}
              {(state.activeCityProtests || []).map(protest => {
                const coords = CITY_COORDINATES[protest.cityId];
                if (!coords) return null;
                const [cx, cy] = coords;

                return (
                  <g
                    key={protest.id}
                    className="cursor-pointer transition-all hover:scale-125"
                    onClick={() => onSelectProtest && onSelectProtest(protest.id)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r="20"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      className="animate-ping opacity-75 origin-center"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="12"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      !
                    </text>
                    <rect
                      x={cx - 40}
                      y={cy - 34}
                      width="80"
                      height="18"
                      rx="5"
                      fill="#0f172a"
                      stroke="#ef4444"
                      strokeWidth="1.2"
                      className="opacity-95"
                    />
                    <text
                      x={cx}
                      y={cy - 21}
                      textAnchor="middle"
                      fill="#fca5a5"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {isAr ? protest.cityNameAr : protest.cityNameEn}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="text-[11px] text-slate-500 italic mt-2">
            {isAr
              ? 'الحدود الترابية الرسمية للجهات الـ 12 للمملكة المغربية مع الصحراء المغربية'
              : 'Official territorial division of the 12 administrative regions of the Kingdom of Morocco'}
          </div>
        </div>

        {/* Selected Region Detailed Profile & Constituent Cities (5 cols) */}
        <div className="lg:col-span-5 bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] uppercase font-bold text-emerald-400">
                {translate(lang, 'map.regionProfile')}
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                {isAr ? selectedRegion.nameAr : selectedRegion.nameEn}
              </h3>
              <p className="text-xs text-slate-400">
                {translate(lang, 'map.capital')}:{' '}
                <strong className="text-slate-200">
                  {isAr ? selectedRegion.capitalAr : selectedRegion.capitalEn}
                </strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">{translate(lang, 'map.population')}</span>
              <div className="text-sm font-bold text-slate-100">
                {(selectedRegion.population / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>

          {/* Core Indicators Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-slate-400">{translate(lang, 'map.satisfaction')}</span>
              <div className="text-base font-black text-emerald-400">{selectedRegion.satisfaction}%</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-slate-400">{translate(lang, 'map.socialTension')}</span>
              <div className="text-base font-black text-rose-400">{selectedRegion.socialTension}/100</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-slate-400">{translate(lang, 'map.unemployment')}</span>
              <div className="text-base font-black text-amber-400">{selectedRegion.unemploymentRate}%</div>
              <span className="text-[10px] text-slate-500">Youth: {selectedRegion.youthUnemploymentRate}%</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-slate-400">{translate(lang, 'map.waterStress')}</span>
              <div className="text-base font-black text-cyan-400">{selectedRegion.waterStressIndex}/100</div>
              <span className="text-[10px] text-slate-500">Reservoir: {selectedRegion.reservoirFillRate}%</span>
            </div>
          </div>

          {/* Dominant Sectors & Infrastructure */}
          <div className="space-y-2 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
              {translate(lang, 'map.dominantSectors')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedRegion.dominantSectors.map(sec => (
                <span
                  key={sec}
                  className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-semibold uppercase text-[10px]"
                >
                  {sec}
                </span>
              ))}
            </div>
          </div>

          {/* Constituent Cities List */}
          <div className="space-y-2.5 border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>{translate(lang, 'map.citiesInRegion')}</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {citiesInRegion.length} {isAr ? 'حواضر' : 'Cities'}
              </span>
            </h4>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {citiesInRegion.map(city => (
                <div
                  key={city.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-1 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">
                      {isAr ? city.nameAr : city.nameEn}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {(city.population / 1000).toFixed(0)}k pop
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>
                      {isAr ? 'البطالة' : 'Unemployment'}: <strong className="text-slate-300">{city.unemploymentRate}%</strong>
                    </span>
                    <span>
                      {isAr ? 'الرضا' : 'Satisfaction'}: <strong className="text-emerald-400">{city.satisfaction}%</strong>
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {(isAr && city.localIssuesAr ? city.localIssuesAr : city.localIssues).join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
