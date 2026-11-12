import React, { useState, useMemo } from 'react';
import {
  Droplets,
  CloudRain,
  Waves,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileText,
  Database
} from 'lucide-react';
import { GameState } from '../../types/game';
import { translate } from '../../locales/i18n';

interface WaterViewProps {
  state: GameState;
  onNavigateToDecisions: () => void;
}

export const WaterView: React.FC<WaterViewProps> = ({ state, onNavigateToDecisions }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const water = state.water;
  const [selectedBasin, setSelectedBasin] = useState<string>('all');

  const dams = water.dams || [];
  const basins = useMemo(() => {
    const map = new Map<string, { slug: string; ar: string; en: string }>();
    for (const d of dams) {
      if (!map.has(d.basin)) {
        map.set(d.basin, { slug: d.basin, ar: d.basinAr, en: d.basinEn });
      }
    }
    return Array.from(map.values());
  }, [dams]);

  const filteredDams = useMemo(
    () => (selectedBasin === 'all' ? dams : dams.filter(d => d.basin === selectedBasin)),
    [dams, selectedBasin]
  );

  const droughtBadge =
    water.droughtLevel === 'catastrophic'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
      : water.droughtLevel === 'extreme'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
      : water.droughtLevel === 'severe'
      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner: Water Security Status */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Droplets className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {translate(lang, 'water.title')}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'رصد حقينة السدود الوطنية ومشاريع تحلية مياه البحر والربط المائي بين الأحواض'
                  : 'National dam reservoir storage, coastal desalination plants, and water transfer highways'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1.5 rounded-xl border uppercase font-bold tracking-wider ${droughtBadge}`}>
              {isAr ? `مستوى الجفاف: ${water.droughtLevel}` : `Drought: ${water.droughtLevel}`}
            </span>
          </div>
        </div>

        {/* Big Fill Rate Gauge */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">{translate(lang, 'water.damFillRate')}</span>
            <span className="font-black text-lg text-cyan-400">{water.overallDamFillRate}%</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                water.overallDamFillRate >= 50
                  ? 'bg-emerald-500'
                  : water.overallDamFillRate >= 30
                  ? 'bg-amber-500'
                  : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${water.overallDamFillRate}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 pt-1">
            <span>{isAr ? 'عجز تاريخي حرج (<20%)' : 'Critical Threshold (<20%)'}</span>
            <span>{isAr ? 'المستوى الآمن (>60%)' : 'Safe Fill (>60%)'}</span>
          </div>
        </div>
      </div>

      {/* Hydraulic Infrastructure Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Desalination Capacity */}
        <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{translate(lang, 'water.desalinationOutput')}</span>
            <Waves className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white">
            {(water.desalinationDailyM3 / 1000).toFixed(0)}k m³/day
          </div>
          <span className="text-[11px] text-slate-500 block">
            {water.operationalDesalinationPlants} {isAr ? 'محطات عاملة' : 'operational plants'}
          </span>
        </div>

        {/* Urban Drinking Water Security */}
        <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{translate(lang, 'water.urbanSecurity')}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">
            {water.urbanWaterSecurityDays} {isAr ? 'يوماً' : 'Days'}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {isAr ? 'مخزون الشرب المضمون للحواضر' : 'Guaranteed drinking supply'}
          </span>
        </div>

        {/* Agricultural Irrigation Rationing */}
        <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{translate(lang, 'water.rationingRate')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400">
            -{water.agriculturalWaterRationingPercent}%
          </div>
          <span className="text-[11px] text-slate-500 block">
            {isAr ? 'تقنين السقي في الأحواض المجهدة' : 'Irrigation reduction rate'}
          </span>
        </div>

        {/* Water Highway Flow */}
        <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{translate(lang, 'water.waterHighway')}</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-black text-sky-400">
            {water.waterHighwayFlowM3Sec} m³/s
          </div>
          <span className="text-[11px] text-slate-500 block">
            {isAr ? 'تحويل سبو إلى بورقراق والبيضاء' : 'Sebou to Bouregreg & Casa'}
          </span>
        </div>
      </div>

      {/* Strategic Callout & Interventions */}
      <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">
            {isAr ? 'مخطط تسريع الاستثمارات المائية الوطنية' : 'Fast-Track Water Infrastructure Programs'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {isAr
              ? 'بإمكان الحكومة إطلاق مشاريع تحلية مياه البحر وتوسيع الطريق السيار المائي ودعم السقي الموضعي من قسم المراسيم.'
              : 'The government can expand seawater desalination, extend inter-basin water highways, and subsidize drip irrigation via Decrees.'}
          </p>
        </div>

        <button
          onClick={onNavigateToDecisions}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4" />
          <span>{isAr ? 'استعراض مراسيم الماء' : 'Enact Water Decrees'}</span>
        </button>
      </div>

      {/* Real Moroccan Hydraulic Basins & Dams Monitoring (MoroccoAPI dataset) */}
      {dams.length > 0 && (
        <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'الرصيد المائي للأحواض والسدود المغربية الرئيسية' : 'Moroccan Hydraulic Basins & Major Dams'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isAr
                    ? `تتبع حي لحقينة ${dams.length} سداً رئيسياً وفق مرجع MoroccoAPI والمديرية العامة لهندسة المياه`
                    : `Live basin reservoir telemetry across ${dams.length} dams synced from MoroccoAPI`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedBasin('all')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  selectedBasin === 'all'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {isAr ? `الكل (${dams.length})` : `All (${dams.length})`}
              </button>
              {basins.map(b => (
                <button
                  key={b.slug}
                  onClick={() => setSelectedBasin(b.slug)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedBasin === b.slug
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {isAr ? b.ar : b.en}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pe-1">
            {filteredDams.map(dam => {
              const barColor =
                dam.fillingRatePct >= 60
                  ? 'bg-emerald-500'
                  : dam.fillingRatePct >= 35
                    ? 'bg-amber-500'
                    : 'bg-rose-500';
              return (
                <div
                  key={dam.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-white">{isAr ? dam.nameAr : dam.nameEn}</div>
                      <div className="text-[10px] text-slate-400">{isAr ? dam.basinAr : dam.basinEn}</div>
                    </div>
                    <span className="text-sm font-black font-mono text-cyan-300">
                      {dam.fillingRatePct.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all`}
                      style={{ width: `${Math.min(100, dam.fillingRatePct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      {dam.volumeMm3 !== null
                        ? `${dam.volumeMm3.toFixed(1)} M m³`
                        : isAr ? 'الحجم غير متاح' : 'Volume N/A'}
                    </span>
                    {dam.prevYearFillingRatePct !== null && (
                      <span className={dam.fillingRatePct >= dam.prevYearFillingRatePct ? 'text-emerald-400' : 'text-rose-400'}>
                        {isAr ? 'السنة الماضية:' : 'Prev yr:'} {dam.prevYearFillingRatePct.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
