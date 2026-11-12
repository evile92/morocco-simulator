import React from 'react';
import { History, FileText, CheckCircle2, ShieldAlert, Award } from 'lucide-react';
import { GameState } from '../../types/game';
import { translate, formatCurrencyMAD } from '../../locales/i18n';

interface HistoryViewProps {
  state: GameState;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ state }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const history = state.decisionHistory;

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-white">
              {translate(lang, 'nav.history')}
            </h2>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'السجل الزمني لكافة المراسيم والقوانين والقرارات المصيرية التي صادقت عليها حكومتك'
                : 'Permanent chronological archive of all laws passed, royal decrees, and crisis choices signed'}
            </p>
          </div>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 font-bold text-emerald-400">
          {history.length} {isAr ? 'قرارات تاريخية' : 'Decisions Signed'}
        </span>
      </div>

      {/* Chronicle Timeline */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            {isAr
              ? 'لم تصدر حكومتك أي مرسوم أو قرار مصيري حتى الآن. تصفح قسم المراسيم الحكومية للبدء.'
              : 'Your government has not enacted any decrees or crisis solutions yet. Browse Decrees to begin.'}
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
            {history.map(record => (
              <div key={record.id} className="relative group">
                {/* Timeline Dot */}
                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0b1120] group-hover:scale-125 transition-all"></span>

                <div className="bg-[#111a2e] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono text-[11px]">{record.date}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold uppercase text-emerald-400">
                        {record.type.replace('_', ' ')}
                      </span>
                    </div>

                    {record.costBillionMAD !== 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                        {record.costBillionMAD > 0
                          ? `-${formatCurrencyMAD(record.costBillionMAD, lang)}`
                          : `+${formatCurrencyMAD(Math.abs(record.costBillionMAD), lang)}`}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white">
                    {isAr ? record.titleAr : record.titleEn}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr ? record.immediateEffectsAr : record.immediateEffectsEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
