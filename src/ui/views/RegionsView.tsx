import React, { useState } from 'react';
import {
  Layers,
  ArrowUpDown,
  Users,
  TrendingUp,
  Droplets,
  Building2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GameState, RegionData } from '../../types/game';
import { translate } from '../../locales/i18n';

interface RegionsViewProps {
  state: GameState;
}

type SortField = 'population' | 'gdpContributionPercent' | 'unemploymentRate' | 'satisfaction' | 'socialTension' | 'waterStressIndex';

export const RegionsView: React.FC<RegionsViewProps> = ({ state }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const [sortField, setSortField] = useState<SortField>('gdpContributionPercent');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [expandedRegionId, setExpandedRegionId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedRegions = [...state.regions].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-white">
              {translate(lang, 'nav.regions')}
            </h2>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'البيانات والمؤشرات الاجتماعية والاقتصادية للجهات الإدارية الـ 12 للمملكة'
                : 'Socio-economic indicators and municipal breakdown across all 12 Moroccan regions'}
            </p>
          </div>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 font-bold text-emerald-400">
          12 {isAr ? 'جهة إدارية' : 'Regions'}
        </span>
      </div>

      {/* Comparative Table */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase font-bold tracking-wider text-[11px]">
              <tr>
                <th className="p-4">{isAr ? 'الجهة وعاصمتها' : 'Region'}</th>
                <th
                  className="p-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('population')}
                >
                  <div className="flex items-center gap-1">
                    <span>{translate(lang, 'map.population')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="p-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('gdpContributionPercent')}
                >
                  <div className="flex items-center gap-1">
                    <span>{translate(lang, 'map.gdpContribution')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="p-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('unemploymentRate')}
                >
                  <div className="flex items-center gap-1">
                    <span>{translate(lang, 'map.unemployment')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="p-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('satisfaction')}
                >
                  <div className="flex items-center gap-1">
                    <span>{translate(lang, 'map.satisfaction')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="p-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('socialTension')}
                >
                  <div className="flex items-center gap-1">
                    <span>{translate(lang, 'map.socialTension')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="p-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('waterStressIndex')}
                >
                  <div className="flex items-center gap-1">
                    <span>{translate(lang, 'map.waterStress')}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4 text-center">{isAr ? 'المدن' : 'Cities'}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {sortedRegions.map(reg => {
                const isExpanded = expandedRegionId === reg.id;
                const regCities = state.cities.filter(c => c.regionId === reg.id);

                return (
                  <React.Fragment key={reg.id}>
                    <tr className="hover:bg-slate-800/40 transition-all">
                      <td className="p-4">
                        <span className="font-bold text-white text-sm block">
                          {isAr ? reg.nameAr : reg.nameEn}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {isAr ? reg.capitalAr : reg.capitalEn}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-200">
                        {(reg.population / 1000000).toFixed(2)}M
                      </td>
                      <td className="p-4 font-mono font-bold text-purple-400">
                        {reg.gdpContributionPercent}%
                      </td>
                      <td className="p-4 font-mono text-amber-400">
                        {reg.unemploymentRate}%
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-400">
                        {reg.satisfaction}%
                      </td>
                      <td className="p-4 font-mono font-bold text-rose-400">
                        {reg.socialTension}/100
                      </td>
                      <td className="p-4 font-mono text-cyan-400">
                        {reg.waterStressIndex}/100
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setExpandedRegionId(isExpanded ? null : reg.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 inline-flex items-center gap-1"
                        >
                          <span>{regCities.length}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>

                    {/* Collapsible City list row */}
                    {isExpanded && (
                      <tr className="bg-slate-950/60">
                        <td colSpan={8} className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {regCities.map(city => (
                              <div
                                key={city.id}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-1"
                              >
                                <div className="flex justify-between font-bold text-slate-200">
                                  <span>{isAr ? city.nameAr : city.nameEn}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    {(city.population / 1000).toFixed(0)}k pop
                                  </span>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-400">
                                  <span>{isAr ? 'البطالة: ' : 'Unemp: '}{city.unemploymentRate}%</span>
                                  <span className="text-emerald-400">{isAr ? 'الرضا: ' : 'Sat: '}{city.satisfaction}%</span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {city.keyIndustries.join(', ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
