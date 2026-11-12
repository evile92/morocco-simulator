import React, { useState } from 'react';
import { Building2, Search, Filter, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { GameState } from '../../types/game';
import { translate } from '../../locales/i18n';

interface CitiesViewProps {
  state: GameState;
}

export const CitiesView: React.FC<CitiesViewProps> = ({ state }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');

  const filteredCities = state.cities.filter(c => {
    const matchesSearch =
      c.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nameAr.includes(searchTerm);
    const matchesRegion =
      selectedRegionFilter === 'all' || c.regionId === selectedRegionFilter;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner & Filters */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {translate(lang, 'nav.cities')}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'رصد الحواضر والمدن المغربية الكبرى ومطالب الساكنة والأنشطة الاقتصادية المحلية'
                  : 'Major Moroccan urban agglomerations, local economic hubs, and civic sentiment'}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">
            {filteredCities.length} {isAr ? 'مدينة مدرجة' : 'Cities Listed'}
          </span>
        </div>

        {/* Search & Region Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث عن مدينة بالاسم...' : 'Search city name...'}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedRegionFilter}
            onChange={e => setSelectedRegionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">{isAr ? 'كافة الجهات الـ 12' : 'All 12 Regions'}</option>
            {state.regions.map(r => (
              <option key={r.id} value={r.id}>
                {isAr ? r.nameAr : r.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCities.map(city => {
          const region = state.regions.find(r => r.id === city.regionId);

          return (
            <div
              key={city.id}
              className="bg-[#111a2e] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {isAr ? city.nameAr : city.nameEn}
                    </h3>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      {isAr ? region?.nameAr : region?.nameEn}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-slate-300 font-bold bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                    {(city.population / 1000).toFixed(0)}k {isAr ? 'نسمة' : 'pop'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="bg-slate-900/80 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block">{translate(lang, 'map.satisfaction')}</span>
                    <span className="font-bold text-emerald-400">{city.satisfaction}%</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block">{translate(lang, 'map.unemployment')}</span>
                    <span className="font-bold text-amber-400">{city.unemploymentRate}%</span>
                  </div>
                </div>

                {/* Industries */}
                <div className="mt-3 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    {isAr ? 'الأنشطة الاقتصادية:' : 'Key Sectors:'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {city.keyIndustries.map((ind, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Local Challenges */}
              <div className="border-t border-slate-800 pt-2.5 text-[11px] text-slate-400 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {isAr ? 'الانشغالات المحلية:' : 'Local Challenges:'}
                </span>
                <p className="text-[10px] text-slate-400 truncate">
                  {(isAr && city.localIssuesAr ? city.localIssuesAr : city.localIssues).join(' • ')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
