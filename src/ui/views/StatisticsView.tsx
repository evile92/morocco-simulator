import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Layers,
  Droplets,
  Flame,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { GameState } from '../../types/game';
import { translate } from '../../locales/i18n';

interface StatisticsViewProps {
  state: GameState;
}

type TimeRange = '1y' | '5y' | '10y' | 'all';

export const StatisticsView: React.FC<StatisticsViewProps> = ({ state }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const history = state.history;

  // Filter history based on range
  const rangeMonths = timeRange === '1y' ? 12 : timeRange === '5y' ? 60 : timeRange === '10y' ? 120 : history.length;
  const filteredHistory = history.slice(-rangeMonths);

  const customTooltipStyle = {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderRadius: '0.75rem',
    fontSize: '11px',
    color: '#f8fafc'
  };

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner & Range Toggles */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-white">
              {translate(lang, 'nav.statistics')}
            </h2>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'السلاسل الزمنية والرسوم البيانية التاريخية لمؤشرات الاقتصاد والمجتمع والماء'
                : 'Historical multi-year time series charts for macro, fiscal, water, and social indices'}
            </p>
          </div>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
          {(['1y', '5y', '10y', 'all'] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === r ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r === '1y'
                ? (isAr ? '1 سنة' : '1 Year')
                : r === '5y'
                ? (isAr ? '5 سنوات' : '5 Years')
                : r === '10y'
                ? (isAr ? '10 سنوات' : '10 Years')
                : (isAr ? 'كافة المدة' : 'All Time')}
            </button>
          ))}
        </div>
      </div>

      {/* Chart 1: Real GDP Growth vs Inflation */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center justify-between">
          <span>{isAr ? 'النمو الاقتصادي الحقيقي ونسبة التضخم (%)' : 'Real GDP Growth vs. Inflation (%)'}</span>
          <span className="text-xs text-slate-500 font-normal">{filteredHistory.length} {isAr ? 'شهراً' : 'months'}</span>
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                type="monotone"
                dataKey="gdpGrowthRate"
                name={isAr ? 'النمو الاقتصادي (%)' : 'GDP Growth (%)'}
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="inflationRate"
                name={isAr ? 'التضخم (%)' : 'Inflation (%)'}
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Public Approval vs Social Tension */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center justify-between">
          <span>{isAr ? 'شعبية الحكومة مقابل مؤشر الاحتقان الاجتماعي' : 'Government Approval vs. Social Tension'}</span>
          <span className="text-xs text-slate-500 font-normal">{filteredHistory.length} {isAr ? 'شهراً' : 'months'}</span>
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                type="monotone"
                dataKey="approvalRating"
                name={isAr ? 'شعبية الحكومة (%)' : 'Approval (%)'}
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="socialTension"
                name={isAr ? 'الاحتقان الاجتماعي' : 'Social Tension'}
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="stability"
                name={isAr ? 'استقرار الحكومة' : 'Stability'}
                stroke="#34d399"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Dam Reservoirs Fill Rate */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center justify-between">
          <span>{isAr ? 'تطور نسبة ملء السدود الوطنية (%)' : 'National Dam Fill Rate Evolution (%)'}</span>
          <span className="text-xs text-cyan-400 font-semibold">{state.water.droughtLevel} drought</span>
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                type="monotone"
                dataKey="damFillRate"
                name={isAr ? 'نسبة ملء السدود (%)' : 'Dam Fill Rate (%)'}
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
