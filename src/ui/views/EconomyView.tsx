import React from 'react';
import {
  TrendingUp,
  Percent,
  Coins,
  Factory,
  Wheat,
  Plane,
  Sun,
  Zap,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBasket,
  Fuel
} from 'lucide-react';
import { GameState } from '../../types/game';
import { translate, formatCurrencyMAD } from '../../locales/i18n';
import moroccoApiData from '../../data/moroccoApiData.json';

interface EconomyViewProps {
  state: GameState;
}

export const EconomyView: React.FC<EconomyViewProps> = ({ state }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const econ = state.economy;

  const tradeBalance = Number((econ.exportsBillionMAD - econ.importsBillionMAD).toFixed(2));

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner: Macro Indicators Overview */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {translate(lang, 'economy.title')}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'النموذج الاقتصادي الكلي: الإنتاج، الصادرات، الاستثمارات ومؤشرات التضخم والتشغيل'
                  : 'Macroeconomic ledger: Output, trade flows, FDI, inflation, and Bank Al-Maghrib rates'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {translate(lang, 'economy.purchasingPower')}
              </span>
              <span className="text-base font-black text-amber-300">{econ.consumerPurchasingPower}/100</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {translate(lang, 'economy.interestRate')}
              </span>
              <span className="text-base font-black text-sky-400">{econ.bamInterestRate}%</span>
            </div>
          </div>
        </div>

        {/* Trade Balance Bar */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">{translate(lang, 'economy.tradeBalance')}</span>
            <span
              className={`font-black ${
                tradeBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {tradeBalance >= 0 ? `+${tradeBalance}B MAD` : `${tradeBalance}B MAD`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">{translate(lang, 'economy.exports')}</span>
              <span className="font-bold text-emerald-400">{formatCurrencyMAD(econ.exportsBillionMAD, lang)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">{translate(lang, 'economy.imports')}</span>
              <span className="font-bold text-rose-400">{formatCurrencyMAD(econ.importsBillionMAD, lang)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sectors Output Breakdown Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Factory className="w-4 h-4 text-emerald-400" />
          <span>{translate(lang, 'economy.sectorBreakdown')}</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Industry */}
          <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-4 space-y-2 text-center">
            <Factory className="w-5 h-5 text-sky-400 mx-auto" />
            <span className="text-xs font-bold text-slate-300 block">{isAr ? 'الصناعة' : 'Industry'}</span>
            <div className="text-lg font-black text-white">{econ.sectorOutput.industry}/100</div>
            <span className="text-[10px] text-slate-500">{isAr ? 'السيارات والطيران' : 'Auto & Aero'}</span>
          </div>

          {/* Agriculture */}
          <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-4 space-y-2 text-center">
            <Wheat className="w-5 h-5 text-amber-400 mx-auto" />
            <span className="text-xs font-bold text-slate-300 block">{isAr ? 'الفلاحة' : 'Agriculture'}</span>
            <div className="text-lg font-black text-white">{econ.sectorOutput.agriculture}/100</div>
            <span className="text-[10px] text-slate-500">{isAr ? 'تأثر بالجفاف' : 'Rainfall sensitive'}</span>
          </div>

          {/* Mining Phosphates */}
          <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-4 space-y-2 text-center">
            <Coins className="w-5 h-5 text-emerald-400 mx-auto" />
            <span className="text-xs font-bold text-slate-300 block">{isAr ? 'الفوسفاط (OCP)' : 'Phosphates'}</span>
            <div className="text-lg font-black text-white">{econ.sectorOutput.miningPhosphates}/100</div>
            <span className="text-[10px] text-slate-500">${econ.phosphatePriceUSD}/T</span>
          </div>

          {/* Tourism */}
          <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-4 space-y-2 text-center">
            <Plane className="w-5 h-5 text-pink-400 mx-auto" />
            <span className="text-xs font-bold text-slate-300 block">{isAr ? 'السياحة' : 'Tourism'}</span>
            <div className="text-lg font-black text-white">{econ.sectorOutput.tourism}/100</div>
            <span className="text-[10px] text-slate-500">{formatCurrencyMAD(econ.tourismRevenueBillionMAD, lang)}</span>
          </div>

          {/* Services & Offshoring */}
          <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-4 space-y-2 text-center">
            <Globe className="w-5 h-5 text-indigo-400 mx-auto" />
            <span className="text-xs font-bold text-slate-300 block">{isAr ? 'الخدمات وترحيلها' : 'Services'}</span>
            <div className="text-lg font-black text-white">{econ.sectorOutput.services}/100</div>
            <span className="text-[10px] text-slate-500">{isAr ? 'المالية والأوفشورينغ' : 'Finance & Tech'}</span>
          </div>

          {/* Energy & Renewables */}
          <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-4 space-y-2 text-center">
            <Zap className="w-5 h-5 text-cyan-400 mx-auto" />
            <span className="text-xs font-bold text-slate-300 block">{isAr ? 'الطاقة والنظيفة' : 'Energy'}</span>
            <div className="text-lg font-black text-white">{econ.sectorOutput.energy}/100</div>
            <span className="text-[10px] text-slate-500">{isAr ? 'شمسية وريحية' : 'Solar & Wind'}</span>
          </div>
        </div>
      </div>

      {/* Global Commodities & HCP Consumer Price Index Reference (MoroccoAPI) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Fuel className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'تتبع المواد الأولية وتدفقات الاستثمار' : 'Commodity Benchmarks & Investment Flows'}</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'سعر نفط برنت العالمي' : 'Global Brent Crude'}</span>
              <span className="text-lg font-black text-amber-400">${econ.crudeOilPriceUSD}/bbl</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'سعر الفوسفاط المرجعي' : 'Phosphate Benchmark'}</span>
              <span className="text-lg font-black text-emerald-400">${econ.phosphatePriceUSD}/T</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'الاستثمار الأجنبي المباشر (FDI)' : 'Monthly FDI Inflow'}</span>
              <span className="text-lg font-black text-sky-400">{formatCurrencyMAD(econ.fdiBillionMAD, lang)}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'مؤشر الاستثمار الخاص' : 'Private Investment Index'}</span>
              <span className="text-lg font-black text-indigo-400">{econ.privateInvestmentIndex}/100</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingBasket className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'سلة الأسعار المرجعية (المندوبية السامية HCP)' : 'HCP Consumer Price Basket Reference'}</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">{moroccoApiData.cpi?.latestMonth}</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pe-1">
            {(moroccoApiData.cpi?.divisions || []).slice(0, 7).map(div => (
              <div
                key={div.code}
                className="flex items-center justify-between bg-slate-900/80 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs"
              >
                <span className="text-slate-300 truncate max-w-[75%]">
                  {isAr ? div.nameAr : div.nameFr}
                </span>
                <span className={`font-mono font-bold ${div.index > 120 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {div.index}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
