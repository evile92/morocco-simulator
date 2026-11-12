import React, { useState } from 'react';
import { Newspaper, Filter, Calendar } from 'lucide-react';
import { GameState } from '../../types/game';
import { translate } from '../../locales/i18n';

interface NewsViewProps {
  state: GameState;
}

export const NewsView: React.FC<NewsViewProps> = ({ state }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredNews = state.newsFeed.filter(n => {
    return categoryFilter === 'all' || n.category === categoryFilter;
  });

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {translate(lang, 'news.title')}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'برقيات الأنباء الرسمية والتغطية الإعلامية للقرارات الحكومية ومؤشرات الأسواق والجهات'
                  : 'Official Moroccan news wire coverage of government actions, market swings, and regional developments'}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">
            {state.newsFeed.length} {isAr ? 'برقية مسجلة' : 'Bulletins'}
          </span>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {['all', 'economy', 'politics', 'water', 'society', 'diplomacy'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {translate(lang, `news.filter${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {/* News Feed List */}
      <div className="space-y-3">
        {filteredNews.length === 0 ? (
          <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            {translate(lang, 'news.empty')}
          </div>
        ) : (
          filteredNews.map(item => (
            <div
              key={item.id}
              className="bg-[#111a2e] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-2 transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono text-[11px]">{item.date}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold uppercase text-emerald-400">
                    {item.category}
                  </span>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded font-bold uppercase ${
                    item.impact === 'positive'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : item.impact === 'negative'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.impact}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">
                {isAr ? item.headlineAr : item.headlineEn}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? item.summaryAr : item.summaryEn}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
