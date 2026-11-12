import React, { useState } from 'react';
import {
  FileText,
  Filter,
  CheckCircle2,
  DollarSign,
  Landmark,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { GameState, Policy } from '../../types/game';
import { translate, formatCurrencyMAD } from '../../locales/i18n';

interface DecisionsViewProps {
  state: GameState;
  onEnactPolicy: (policy: Policy) => void;
}

export const DecisionsView: React.FC<DecisionsViewProps> = ({ state, onEnactPolicy }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const policies = state.policies;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', labelEn: 'All Decrees', labelAr: 'كافة المراسيم' },
    { id: 'water', labelEn: 'Water & Dams', labelAr: 'الماء والسدود' },
    { id: 'economy', labelEn: 'Economy & Industry', labelAr: 'الاقتصاد والصناعة' },
    { id: 'taxation', labelEn: 'Taxation & Fiscal', labelAr: 'الجبايات والضرائب' },
    { id: 'subsidies', labelEn: 'Subsidies & Relief', labelAr: 'المقاصة والدعم' },
    { id: 'employment', labelEn: 'Employment & Labor', labelAr: 'التشغيل والأجور' },
    { id: 'healthcare', labelEn: 'Healthcare & AMO', labelAr: 'الصحة والحماية' },
    { id: 'education', labelEn: 'Education & Schools', labelAr: 'التعليم والجامعات' },
    { id: 'infrastructure', labelEn: 'Infrastructure & Ports', labelAr: 'التجهيز والموانئ' },
    { id: 'energy', labelEn: 'Energy & Renewables', labelAr: 'الطاقة والنظيفة' },
    { id: 'agriculture', labelEn: 'Agriculture & Rural', labelAr: 'الفلاحة والقرية' },
    { id: 'housing', labelEn: 'Housing & Urbanism', labelAr: 'السكن والتعمير' },
    { id: 'digital', labelEn: 'Digital & Governance', labelAr: 'الرقمنة والحكامة' },
    { id: 'foreign', labelEn: 'Foreign & Diplomacy', labelAr: 'الدبلوماسية' },
    { id: 'security', labelEn: 'Defense & Security', labelAr: 'الدفاع والأمن' },
    { id: 'culture', labelEn: 'Culture & Identity', labelAr: 'الثقافة والهوية' }
  ];

  const filteredPolicies = policies.filter(p => {
    return selectedCategory === 'all' || p.category === selectedCategory;
  });

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner & Category Filter */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {translate(lang, 'decisions.title')}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'إصدار المراسيم الحكومية والبرامج الاستثمارية والقوانين الخاضعة للمصادقة البرلمانية'
                  : 'Executive decrees, investment charters, and legislative acts subject to parliamentary approval'}
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-400">
            {policies.filter(p => p.implemented).length} / {policies.length} {isAr ? 'مرسوم مفعّل' : 'enacted'}
          </div>
        </div>

        {/* Category Buttons Bar */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPolicies.map(policy => {
          const isEnacted = policy.implemented;

          return (
            <div
              key={policy.id}
              className={`bg-[#111a2e] border rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between transition-all ${
                isEnacted ? 'border-emerald-500/40 bg-slate-900/40' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-bold uppercase text-emerald-400">
                    {policy.category}
                  </span>

                  {policy.requiresParliamentApproval && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                      <Landmark className="w-3 h-3" />
                      <span>{isAr ? 'يتطلب تصويت البرلمان' : 'Requires Parliament Vote'}</span>
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-white mt-2">
                  {isAr ? policy.titleAr : policy.titleEn}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {isAr ? policy.descriptionAr : policy.descriptionEn}
                </p>

                {/* Costs */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                  <span>
                    {translate(lang, 'decisions.cost')}:{' '}
                    <strong className="text-amber-300">{formatCurrencyMAD(policy.upfrontCostBillionMAD, lang)}</strong>
                  </span>
                  {policy.monthlyCostBillionMAD !== 0 && (
                    <span>
                      {translate(lang, 'decisions.monthlyCost')}:{' '}
                      <strong className="text-slate-200">
                        {policy.monthlyCostBillionMAD > 0
                          ? `-${formatCurrencyMAD(policy.monthlyCostBillionMAD, lang)}/m`
                          : `+${formatCurrencyMAD(Math.abs(policy.monthlyCostBillionMAD), lang)}/m`}
                      </strong>
                    </span>
                  )}
                </div>

                {/* Expected Benefits & Risks */}
                <div className="space-y-1.5 mt-3 text-[11px]">
                  <div className="space-y-0.5 text-emerald-400">
                    {(isAr ? policy.expectedProsAr : policy.expectedProsEn).map((pro, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-0.5 text-rose-400">
                    {(isAr ? policy.expectedRisksAr : policy.expectedRisksEn).map((risk, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800">
                {isEnacted ? (
                  <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs py-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{translate(lang, 'decisions.alreadyEnacted')}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onEnactPolicy(policy)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{translate(lang, 'decisions.enactDecree')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
