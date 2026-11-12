import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, DollarSign, ArrowRight, X, Sparkles, Loader2 } from 'lucide-react';
import { GameEvent, Language, GameState } from '../../types/game';
import { formatCurrencyMAD } from '../../locales/i18n';
import { getAiCrisisAdvice } from '../../ai/deepseek';

interface CrisisModalProps {
  crisis: GameEvent;
  lang: Language;
  state?: GameState;
  onSelectChoice: (choiceId: string) => void;
  onDismiss?: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  crisis,
  lang,
  state,
  onSelectChoice,
  onDismiss
}) => {
  const isAr = lang === 'ar';
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);

  const severityBadge =
    crisis.severity === 'critical'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : crisis.severity === 'high'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-sky-500/20 text-sky-300 border-sky-500/40';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-[#131c2e] border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-100 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className={`text-[11px] px-2 py-0.5 rounded-md border uppercase font-bold tracking-wider ${severityBadge}`}>
                {crisis.severity}
              </span>
              <h2 className="text-lg font-bold mt-1 text-white">
                {isAr ? crisis.titleAr : crisis.titleEn}
              </h2>
            </div>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shrink-0"
              title={isAr ? 'إغلاق وتأجيل القرار' : 'Close and defer'}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Description Body */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
          {isAr ? crisis.descriptionAr : crisis.descriptionEn}
        </div>

        {/* AI Sovereign Advisor Directive (DeepSeek) */}
        {state && (
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 space-y-2">
            {!aiAdvice && !loadingAdvice ? (
              <button
                type="button"
                onClick={async () => {
                  setLoadingAdvice(true);
                  try {
                    const advice = await getAiCrisisAdvice(crisis, state);
                    setAiAdvice(advice);
                  } finally {
                    setLoadingAdvice(false);
                  }
                }}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isAr ? 'طلب التوجيه الاستراتيجي للذكاء الاصطناعي (DeepSeek)' : 'Consult Sovereign AI Advisor (DeepSeek)'}</span>
              </button>
            ) : loadingAdvice ? (
              <div className="flex items-center justify-center gap-2 py-1 text-xs text-indigo-300">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>{isAr ? 'جاري استشارة وتوجيه الذكاء الاصطناعي الاستراتيجي...' : 'Synthesizing strategic directive via DeepSeek...'}</span>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    {isAr ? 'توصية المستشار الاستراتيجي الأعلى للحكومة:' : 'Chief Strategic Directive for the Prime Minister:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAiAdvice(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                  >
                    {isAr ? 'تحديث' : 'Refresh'}
                  </button>
                </div>
                <p className="text-slate-200 leading-relaxed text-[11px] bg-slate-950/70 p-2.5 rounded-lg border border-indigo-500/30">
                  {aiAdvice}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Strategic Decision Choices */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'خيارات التدخل والقرار الحكومي' : 'Government Action Choices'}</span>
          </h3>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {crisis.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onSelectChoice(choice.id)}
                className="w-full text-left bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500/60 rounded-xl p-4 transition-all group flex flex-col gap-2"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm text-emerald-300 group-hover:text-emerald-200">
                    {isAr ? choice.textAr : choice.textEn}
                  </span>
                  {choice.costBillionMAD !== 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">
                      {choice.costBillionMAD > 0
                        ? `-${formatCurrencyMAD(choice.costBillionMAD, lang)}`
                        : `+${formatCurrencyMAD(Math.abs(choice.costBillionMAD), lang)}`}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  {(isAr ? choice.consequencesAr : choice.consequencesEn).map((cq, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-emerald-400"></span>
                      <span>{cq}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {onDismiss && (
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              {isAr ? 'إرجاء القرار الحكومي ومتابعة اللعبة' : 'Defer Decision & Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
