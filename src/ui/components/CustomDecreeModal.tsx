import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Loader2,
  X,
  CheckCircle2,
  AlertTriangle,
  Coins,
  TrendingUp,
  Scale,
  Send,
  Layers
} from 'lucide-react';
import { GameState, Policy } from '../../types/game';
import { analyzeCustomDecree } from '../../ai/deepseek';

interface CustomDecreeModalProps {
  state: GameState;
  onClose: () => void;
  onEnactPolicy: (policy: Policy) => void;
}

export const CustomDecreeModal: React.FC<CustomDecreeModalProps> = ({
  state,
  onClose,
  onEnactPolicy
}) => {
  const isAr = state.language === 'ar';
  const [inputText, setInputText] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [generatedPolicy, setGeneratedPolicy] = useState<Policy | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim() || analyzing) return;
    setAnalyzing(true);
    setErrorMsg(null);

    try {
      const policy = await analyzeCustomDecree(inputText, state);
      setGeneratedPolicy(policy);
    } catch (err: any) {
      setErrorMsg(
        isAr
          ? 'تعذر صياغة المرسوم بالذكاء الاصطناعي في هذه اللحظة. يرجى إعادة المحاولة أو تبسيط النص.'
          : 'Could not parse custom decree via AI. Please try again or rephrase.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleEnact = () => {
    if (!generatedPolicy) return;
    onEnactPolicy(generatedPolicy);
    onClose();
  };

  const examplesAr = [
    'فرض ضريبة تضامنية بنسبة 3% على أرباح شركات المحروقات وتوجيه العائد لدعم أثمان غاز البوتان.',
    'صرف منحة شهرية قدرها 1200 درهم لطلبة كليات الطب مع التزامهم بالعمل 3 سنوات بالمناطق القروية.',
    'إعفاء المقاولات الناشئة بمجال تحلية المياه والطاقة الشمسية من الضريبة على الشركات لمدة 5 سنوات.'
  ];

  const examplesEn = [
    'Impose a 3% solidarity windfall tax on oil distribution companies to subsidize cooking gas cylinders.',
    'Provide a 1,200 MAD monthly fellowship to medical students with a 3-year rural public health commitment.',
    'Grant a 5-year corporate tax holiday for cleantech startups specializing in water desalination.'
  ];

  const examples = isAr ? examplesAr : examplesEn;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#162238] to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 flex items-center justify-center text-white shadow-lg border border-amber-400/40">
              <FileText className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  {isAr ? 'صياغة مرسوم أو قرار حكومي حر بالذكاء الاصطناعي' : 'Free-Form Custom Decree Engine'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {state.deepseekApiKey ? (state.deepseekModel || 'deepseek-chat') : (isAr ? 'محرك محلي' : 'Offline Engine')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'اكتب أي قرار حكومي ترغب فيه وسيقوم الذكاء الاصطناعي بتقدير كلفته وأثره التشريعي والاجتماعي'
                  : 'Type any policy decree in plain language and DeepSeek AI will evaluate fiscal and social impact'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 flex-1">
          {/* Textarea Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              {isAr ? 'مضمون القرار أو المرسوم الوزاري المقترح:' : 'Proposed Decree / Policy Text:'}
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isAr
                  ? 'مثال: إقرار حزمة دعم عاجلة بقيمة 500 مليون درهم لكسابي الماشية المتضررين من الجفاف، مع مراقبة أسواق الأعلاف وتخفيض رسوم الاستيراد...'
                  : 'E.g., Allocate 500 million MAD in urgent feed subsidies for drought-impacted livestock breeders while suspending feed import customs...'
              }
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-2xl p-4 text-xs text-white placeholder-slate-500 outline-none transition-all leading-relaxed"
            />
          </div>

          {/* Quick Examples */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'نماذج ومقترحات سريعة:' : 'Quick Decree Templates:'}
            </span>
            <div className="flex flex-col gap-1.5">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(ex)}
                  className="text-start px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-all"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleAnalyze}
            disabled={!inputText.trim() || analyzing}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isAr ? 'جاري تحليل القرار التشريعي والميزانياتي عبر DeepSeek AI...' : 'Analyzing Decree via DeepSeek AI...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? 'تحليل وصياغة المرسوم بالذكاء الاصطناعي' : 'Evaluate & Structure Decree with AI'}</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Analyzed Policy Result Card */}
          {generatedPolicy && (
            <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {isAr ? 'مشروع مرسوم حكومي مدروس' : 'Evaluated Government Decree'}
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5">
                    {isAr ? generatedPolicy.titleAr : generatedPolicy.titleEn}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isAr ? generatedPolicy.descriptionAr : generatedPolicy.descriptionEn}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold shrink-0">
                  {generatedPolicy.category}
                </span>
              </div>

              {/* Fiscal & Parliamentary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400">{isAr ? 'التكلفة الأولية' : 'Upfront Cost'}</span>
                  <div className="text-sm font-black text-amber-400 mt-0.5">
                    {generatedPolicy.upfrontCostBillionMAD}B MAD
                  </div>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400">{isAr ? 'التكلفة الشهرية' : 'Monthly Cost'}</span>
                  <div className="text-sm font-black text-slate-200 mt-0.5">
                    {generatedPolicy.monthlyCostBillionMAD}B MAD
                  </div>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400">{isAr ? 'تغير الشعبية' : 'Approval Delta'}</span>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">
                    {(generatedPolicy.modifiers.approvalDelta ?? 0) > 0
                      ? `+${generatedPolicy.modifiers.approvalDelta}%`
                      : `${generatedPolicy.modifiers.approvalDelta ?? 0}%`}
                  </div>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400">{isAr ? 'تغير الاحتقان' : 'Tension Delta'}</span>
                  <div className="text-sm font-black text-rose-400 mt-0.5">
                    {(generatedPolicy.modifiers.socialTensionDelta ?? 0) > 0
                      ? `+${generatedPolicy.modifiers.socialTensionDelta}`
                      : generatedPolicy.modifiers.socialTensionDelta ?? 0}
                  </div>
                </div>
              </div>

              {/* Pros & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isAr ? 'المكاسب المتوقعة' : 'Expected Benefits'}
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                    {(isAr ? generatedPolicy.expectedProsAr : generatedPolicy.expectedProsEn).map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {isAr ? 'المخاطر والتحديات' : 'Risks & Limitations'}
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                    {(isAr ? generatedPolicy.expectedRisksAr : generatedPolicy.expectedRisksEn).map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Requirement badge */}
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  {isAr ? 'طبيعة المسار التشريعي:' : 'Legislative Track:'}
                </span>
                <span className="font-bold text-slate-200">
                  {generatedPolicy.requiresParliamentApproval
                    ? isAr
                      ? 'مشروع قانون يستوجب تصويت مجلس النواب'
                      : 'Bill requires Parliamentary Vote'
                    : isAr
                    ? 'مرسوم تطبيقي حكومي مباشر'
                    : 'Direct Executive Decree'}
                </span>
              </div>

              {/* Enact Button */}
              <button
                onClick={handleEnact}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {generatedPolicy.requiresParliamentApproval
                    ? isAr
                      ? 'إحالة مشروع القانون على مجلس النواب للتصويت'
                      : 'Submit Bill to Parliament for Vote'
                    : isAr
                    ? 'إصدار وتنزيل المرسوم الحكومي فوراً'
                    : 'Enact Executive Decree Immediately'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
