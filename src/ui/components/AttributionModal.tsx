import React from 'react';
import { X, HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricAttribution, Language } from '../../types/game';
import { translate } from '../../locales/i18n';

interface AttributionModalProps {
  attributions: MetricAttribution[];
  lang: Language;
  onClose: () => void;
}

export const AttributionModal: React.FC<AttributionModalProps> = ({
  attributions,
  lang,
  onClose
}) => {
  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-[#131c2e] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-slate-100 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              {isAr ? 'شفافية المؤشرات: أسباب ودوافع التغير الشهري' : 'Indicator Transparency: Drivers of Change'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {attributions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              {isAr ? 'لا توجد تقلبات بارزة مسجلة في هذا الشهر.' : 'No major indicator volatility recorded this month.'}
            </p>
          ) : (
            attributions.map((attr, idx) => {
              const title =
                attr.metric === 'approval'
                  ? (isAr ? 'شعبية ورضا المواطنين عن الحكومة' : 'Government Citizen Approval')
                  : (isAr ? 'مؤشر الاحتقان والتوتر الاجتماعي' : 'Social Tension Barometer');

              return (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">{title}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        attr.netDelta > 0
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : attr.netDelta < 0
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {attr.netDelta > 0 ? `+${attr.netDelta}%` : `${attr.netDelta}%`}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {attr.reasons.length === 0 ? (
                      <span className="text-slate-500">{isAr ? 'استقرار تلقائي للمؤشر' : 'Baseline stability'}</span>
                    ) : (
                      attr.reasons.map((r, rIdx) => (
                        <div key={rIdx} className="flex items-center justify-between text-slate-300 py-0.5 border-b border-slate-800/60 last:border-0">
                          <span className="flex items-center gap-1.5">
                            {r.delta > 0 ? (
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            ) : r.delta < 0 ? (
                              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                            ) : (
                              <Minus className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>{isAr ? r.sourceAr : r.sourceEn}</span>
                          </span>
                          <span className={r.delta > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                            {r.delta > 0 ? `+${r.delta}` : r.delta}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
