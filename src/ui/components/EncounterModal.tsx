import React, { useState } from 'react';
import {
  X,
  Mic,
  Users,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Send,
  ShieldAlert,
  TrendingUp,
  Coins
} from 'lucide-react';
import { GameState } from '../../types/game';
import { evaluatePressStatement } from '../../ai/deepseek';

export type EncounterMode = 'press' | 'unions' | 'cabinet';

export interface EncounterOutcome {
  mode: EncounterMode;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  costBillionMAD: number;
  approvalDelta: number;
  stabilityDelta: number;
  tensionDelta: number;
}

interface EncounterModalProps {
  state: GameState;
  initialMode?: EncounterMode;
  onClose: () => void;
  onResolveEncounter: (outcome: EncounterOutcome) => void;
}

export const EncounterModal: React.FC<EncounterModalProps> = ({
  state,
  initialMode = 'press',
  onClose,
  onResolveEncounter
}) => {
  const isAr = state.language === 'ar';
  const [mode, setMode] = useState<EncounterMode>(initialMode);
  const [customResponse, setCustomResponse] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Dynamic context-aware Press Question based on live state
  const highInflation = state.economy.inflationRate > 3.2;
  const lowWater = state.water.overallDamFillRate < 35;
  const highUnemployment = state.economy.youthUnemploymentRate > 28;

  const pressTopicAr = lowWater
    ? `سيد رئيس الحكومة، نسبة ملء السدود تراجعت إلى ${state.water.overallDamFillRate}% والشارع يتساءل عن مدى جاهزية محطات تحلية المياه وضمان الماء الصالح للشرب بالمدن الكبرى؛ بماذا تردون؟`
    : highInflation
    ? `سيد رئيس الحكومة، التضخم وصل إلى ${state.economy.inflationRate}% والأسر المغربية تشتكي من غلاء المعيشة وتآكل القدرة الشرائية؛ ما هي إجراءاتكم الملموسة؟`
    : highUnemployment
    ? `سيد رئيس الحكومة، بطالة الشباب تسجل ${state.economy.youthUnemploymentRate}% وحاملو الشهادات يطالبون بفرص شغل عاجلة؛ ما هو التزامكم أمام الرأي العام؟`
    : `سيد رئيس الحكومة، كيف تقيمون حصيلة الائتلاف الحكومي الحالي في تنزيل أوراش الدولة الاجتماعية وميثاق الاستثمار؟`;

  const pressTopicEn = lowWater
    ? `Prime Minister, national dam reserves stand at ${state.water.overallDamFillRate}%. Citizens are asking whether desalination plants will prevent urban water cuts. What is your response?`
    : highInflation
    ? `Prime Minister, inflation is at ${state.economy.inflationRate}% and Moroccan households face rising living costs. What immediate relief will your government provide?`
    : highUnemployment
    ? `Prime Minister, youth unemployment is at ${state.economy.youthUnemploymentRate}%. University graduates are demanding jobs. What is your concrete commitment today?`
    : `Prime Minister, how do you assess your coalition's progress on the Social State and New Investment Charter?`;

  const handleCustomPressSubmit = async () => {
    if (!customResponse.trim() || isEvaluating) return;
    setIsEvaluating(true);

    const text = customResponse.trim();
    try {
      const evaluation = await evaluatePressStatement(text, state);
      onResolveEncounter({
        mode: 'press',
        titleEn: evaluation.headlineEn,
        titleAr: evaluation.headlineAr,
        summaryEn: `${evaluation.feedbackEn} ("${text.slice(0, 90)}")`,
        summaryAr: `${evaluation.feedbackAr} ("${text.slice(0, 90)}")`,
        costBillionMAD: 0.05,
        approvalDelta: evaluation.approvalDelta,
        stabilityDelta: Number((evaluation.approvalDelta * 0.6).toFixed(1)),
        tensionDelta: evaluation.tensionDelta
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const activeCooldown = state.actionCooldowns?.[`enc_${mode}`] || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-[#0f172a] via-[#111c35] to-[#0b1120] border border-sky-500/40 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 block">
                {isAr ? 'مركز المواجهات السياسية والتفاعلية' : 'Interactive Political Encounter Suite'}
              </span>
              <h2 className="text-base font-black text-white">
                {isAr ? 'الديوان التفاعلي: الصحافة، النقابات، ومجلس الحكومة' : 'Live Press Conference, Labor Unions & Cabinet'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-3 bg-slate-900/50 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setMode('press')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              mode === 'press'
                ? 'bg-sky-500/15 border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isAr ? '🎙️ الندوة الصحفية المباشرة' : '🎙️ Live Press Conference'}</span>
          </button>

          <button
            onClick={() => setMode('unions')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              mode === 'unions'
                ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isAr ? '🤝 طاولة الحوار النقابي (UMT/CDT)' : '🤝 Labor Union Bargaining'}</span>
          </button>

          <button
            onClick={() => setMode('cabinet')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              mode === 'cabinet'
                ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{isAr ? '🏛️ المجلس الحكومي المصغر' : '🏛️ Inner Cabinet Briefing'}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeCooldown > 0 && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl px-4 py-2.5 text-xs text-amber-200 font-semibold flex items-center justify-between gap-2">
              <span>
                {isAr
                  ? '⏳ تم عقد هذا اللقاء بالفعل خلال الشهر الجاري. تقدّم شهراً في الزمن لإتاحة جولة جديدة.'
                  : '⏳ This encounter was already held this month. Advance time to schedule another session.'}
              </span>
            </div>
          )}
          {mode === 'press' && (
            <div className="space-y-5">
              {/* Journalist Character Card */}
              <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-4 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-sky-400/40 flex items-center justify-center text-2xl shrink-0">
                  📺
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-sky-400">
                      {isAr ? 'الصحافة الوطنية المعتمدة بالرباط' : 'National Press Corps - Rabat'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold animate-pulse">
                      {isAr ? 'بث مباشر • LIVE' : 'LIVE BROADCAST'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-100 leading-relaxed">
                    "{isAr ? pressTopicAr : pressTopicEn}"
                  </p>
                </div>
              </div>

              {/* Pre-built Tactical Responses */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-400 block">
                  {isAr ? 'اختر الموقف السياسي الرسمي أو صُغ ردك الخاص أدناه:' : 'Select an official stance or type your custom response below:'}
                </span>

                <button
                  onClick={() =>
                    onResolveEncounter({
                      mode: 'press',
                      titleEn: 'Press Conference: Social Package & Price Control Pledge',
                      titleAr: 'الندوة الصحفية: التزام حكومي بحماية القدرة الشرائية وتسريع الأوراش',
                      summaryEn: 'PM pledged targeted fiscal support and strict market monitoring, reassuring citizens.',
                      summaryAr: 'رئيس الحكومة يعلن أمام الصحافة عن إجراءات استعجالية لحماية القدرة الشرائية وتسريع المشاريع الميدانية.',
                      costBillionMAD: 0.35,
                      approvalDelta: 4.5,
                      stabilityDelta: 3.0,
                      tensionDelta: -4.5
                    })
                  }
                  className="w-full text-right bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-emerald-500/60 rounded-2xl p-4 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-emerald-400 group-hover:text-emerald-300">
                      {isAr ? '1. خطاب التزام اجتماعي ومالي فوري (تهدئة الشارع)' : '1. Announce Immediate Social & Infrastructure Commitment'}
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      {isAr
                        ? 'الإعلان عن رصد اعتماد مالي استثنائي (0.35 مليار درهم) لتسريع الأوراش وحماية القدرة الشرائية.'
                        : 'Commit 0.35B MAD emergency allocation to protect households and accelerate public delivery.'}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-right shrink-0 space-y-0.5">
                    <div className="text-emerald-400 font-bold">+4.5% {isAr ? 'شعبية' : 'Approval'}</div>
                    <div className="text-sky-400">-4.5 {isAr ? 'احتقان' : 'Tension'}</div>
                    <div className="text-rose-400">-0.35B MAD</div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    onResolveEncounter({
                      mode: 'press',
                      titleEn: 'Press Conference: Technocratic Realism & Fiscal Discipline',
                      titleAr: 'الندوة الصحفية: خطاب الصراحة والمصارحة حول التوازنات الماكرو-اقتصادية',
                      summaryEn: 'PM defended macroeconomic stability and structural reforms over short-term populism.',
                      summaryAr: 'رئيس الحكومة يدافع بلغة الأرقام عن استدامة المالية العمومية ورفض الشعبوية، مما يعزز ثقة المستثمرين.',
                      costBillionMAD: 0,
                      approvalDelta: 1.0,
                      stabilityDelta: 4.0,
                      tensionDelta: -1.0
                    })
                  }
                  className="w-full text-right bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-sky-500/60 rounded-2xl p-4 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-sky-400 group-hover:text-sky-300">
                      {isAr ? '2. خطاب الواقعية الاقتصادية والانضباط المالي (طمأنة الأسواق)' : '2. Defend Macroeconomic Realism & Structural Reform'}
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      {isAr
                        ? 'تقديم أرقام دقيقة حول الإصلاحات الهيكلية والحفاظ على التوازنات المالية دون إنفاق إضافي.'
                        : 'Present rigorous fiscal data defending long-term reforms without extra deficit spending.'}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-right shrink-0 space-y-0.5">
                    <div className="text-emerald-400 font-bold">+4.0 {isAr ? 'استقرار' : 'Stability'}</div>
                    <div className="text-sky-400">+1.0% {isAr ? 'شعبية' : 'Approval'}</div>
                    <div className="text-slate-400">0.0B MAD</div>
                  </div>
                </button>
              </div>

              {/* Free-form Statement Box */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? 'أو صُغ تصريحك الصحفي الحر بكلماتك الخاصة:' : 'Or type your own custom press statement:'}</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customResponse}
                    onChange={e => setCustomResponse(e.target.value)}
                    placeholder={
                      isAr
                        ? 'اكتب رد رئيس الحكومة هنا (مثلاً: سنضرب بيد من حديد على المضاربين في الأسواق...) '
                        : 'Type your official statement to the press...'
                    }
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleCustomPressSubmit}
                    disabled={!customResponse.trim() || isEvaluating}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إلقاء التصريح' : 'Deliver'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === 'unions' && (
            <div className="space-y-5">
              {/* Union Leaders Card */}
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-700 to-rose-800 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
                  ✊
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-amber-400 block">
                    {isAr ? 'وفد المركزيات النقابية (UMT • CDT • UGTM)' : 'Central Labor Unions Delegation (UMT • CDT • UGTM)'}
                  </span>
                  <p className="text-sm font-medium text-slate-100 leading-relaxed">
                    {isAr
                      ? '"سيد رئيس الحكومة، الشغيلة المغربية تنتظر مخرجات جولة الحوار الاجتماعي. نطالب بزيادة عامة في الأجور، وتخفيض الضريبة على الدخل، وتجميد أي رفع لسن التقاعد مقابل ضمان السلم الاجتماعي."'
                      : '"Prime Minister, Moroccan workers expect concrete results from this social dialogue round: a general wage increase, income tax relief for employees, and protection of pension rights in exchange for industrial peace."'}
                  </p>
                </div>
              </div>

              {/* Bargaining Options */}
              <div className="space-y-3">
                <button
                  onClick={() =>
                    onResolveEncounter({
                      mode: 'unions',
                      titleEn: 'Historic Tripartite Social Charter Signed with Unions',
                      titleAr: 'توقيع ميثاق الحوار الاجتماعي التاريخي مع المركزيات النقابية',
                      summaryEn: 'Government agreed to wage hikes and tax relief, securing nationwide union truce and social peace.',
                      summaryAr: 'الحكومة والنقابات والباطرونا يوقعون اتفاقاً اجتماعياً يقضي برفع الأجور وتخفيض العبء الضريبي مقابل هدنة اجتماعية شاملة.',
                      costBillionMAD: 0.75,
                      approvalDelta: 6.5,
                      stabilityDelta: 5.5,
                      tensionDelta: -8.5
                    })
                  }
                  className="w-full text-right bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-emerald-500/60 rounded-2xl p-4 transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-emerald-400">
                      {isAr ? '1. توقيع اتفاق اجتماعي شامل (زيادة الأجور + هدنة نقابية)' : '1. Sign Comprehensive Tripartite Social Pact'}
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      {isAr
                        ? 'إقرار زيادة 1000 درهم على دفعتين وتخفيض الضريبة على الدخل للأجراء مقابل سحب كافة دعوات الإضراب.'
                        : 'Approve public wage increments and middle-class tax relief in exchange for a full strike moratorium.'}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-right shrink-0 space-y-0.5">
                    <div className="text-emerald-400 font-bold">+6.5% {isAr ? 'شعبية' : 'Approval'}</div>
                    <div className="text-sky-400">-8.5 {isAr ? 'احتقان' : 'Tension'}</div>
                    <div className="text-rose-400">-0.75B MAD</div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    onResolveEncounter({
                      mode: 'unions',
                      titleEn: 'Social Dialogue: Sectoral Bonuses & Conditional Agreement',
                      titleAr: 'الحوار الاجتماعي: اتفاق مرحلي للتعويضات القطاعية وتأجيل ملف التقاعد',
                      summaryEn: 'Reached a balanced compromise with unions focusing on health and education cadres.',
                      summaryAr: 'التوصل إلى تسوية وسطى تشمل تحفيزات لقطاعي الصحة والتعليم وتشكيل لجنة مشتركة لإصلاح التقاعد.',
                      costBillionMAD: 0.30,
                      approvalDelta: 3.0,
                      stabilityDelta: 2.5,
                      tensionDelta: -4.0
                    })
                  }
                  className="w-full text-right bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-amber-500/60 rounded-2xl p-4 transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-amber-400">
                      {isAr ? '2. تسوية وسطى: زيادات قطاعية (التعليم والصحة) وتأجيل التقاعد' : '2. Balanced Compromise: Sectoral Bonuses & Committee'}
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      {isAr
                        ? 'تخصيص غلاف مالي معتدل (0.30 مليار درهم) للقطاعات ذات الأولوية مع مواصلة التفاوض.'
                        : 'Allocate 0.30B MAD for priority sectors while deferring pension overhaul to technical committees.'}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-right shrink-0 space-y-0.5">
                    <div className="text-emerald-400 font-bold">+3.0% {isAr ? 'شعبية' : 'Approval'}</div>
                    <div className="text-sky-400">-4.0 {isAr ? 'احتقان' : 'Tension'}</div>
                    <div className="text-rose-400">-0.30B MAD</div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    onResolveEncounter({
                      mode: 'unions',
                      titleEn: 'Social Dialogue Deadlock: Government Enforces Fiscal Ceiling',
                      titleAr: 'تصلب الموقف الحكومي: رفض الزيادات العامة حفاظاً على توازن الميزانية',
                      summaryEn: 'Government rejected union wage demands to protect budget deficit targets, sparking union anger.',
                      summaryAr: 'الحكومة ترفض مطالب الزيادة العامة في الأجور لتفادي تفاقم عجز الميزانية، والنقابات تلوح بإضراب وطني.',
                      costBillionMAD: 0,
                      approvalDelta: -3.5,
                      stabilityDelta: -2.0,
                      tensionDelta: 5.0
                    })
                  }
                  className="w-full text-right bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-rose-500/60 rounded-2xl p-4 transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-rose-400">
                      {isAr ? '3. رفض المطالب النقابية والتمسك بسقف الميزانية (تقشف صارم)' : '3. Reject Wage Demands to Protect Fiscal Deficit'}
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      {isAr
                        ? 'الحفاظ على الخزينة العامة دون مساس، مع تحمل كلفة الغضب النقابي واحتمال ارتفاع الاحتقان.'
                        : 'Zero treasury cost, but triggers union backlash and increases social tension.'}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-right shrink-0 space-y-0.5">
                    <div className="text-rose-400 font-bold">-3.5% {isAr ? 'شعبية' : 'Approval'}</div>
                    <div className="text-rose-400">+5.0 {isAr ? 'احتقان' : 'Tension'}</div>
                    <div className="text-emerald-400">0.0B MAD</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {mode === 'cabinet' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                {isAr
                  ? 'يعرض أقطاب الحكومة الثلاثة أولويات متباينة للأشهر المقبلة. أي توجه استراتيجي تأمرون بتغليبه في عمل اللجان الوزارية؟'
                  : 'Your key ministers present competing strategic priorities. Which directive will guide the Cabinet?'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Interior Minister */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-black text-white">
                        {isAr ? 'وزير الداخلية' : 'Minister of Interior'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {isAr
                        ? '"الأولوية القصوى هي الضبط الترابي، دعم الولاة والعمال في تتبع مشاريع القرب، وتطويق بؤر الاحتقان بالجهات."'
                        : '"Priority must be territorial stability, empowering regional Walis, and preempting local unrest."'}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onResolveEncounter({
                        mode: 'cabinet',
                        titleEn: 'Cabinet Directive: Territorial Security & Regional Delivery',
                        titleAr: 'توجيه المجلس الحكومي: أولوية الأمن الترابي وتسريع مشاريع القرب بالجهات',
                        summaryEn: 'Empowered regional Walis and interior coordination, boosting stability and reducing tension.',
                        summaryAr: 'إصدار تعليمات صارمة للولاة والعمال لتتبع أوراش القرب، مما عزز استقرار الحكومة وخفض الاحتقان.',
                        costBillionMAD: 0.20,
                        approvalDelta: 2.0,
                        stabilityDelta: 5.5,
                        tensionDelta: -5.0
                      })
                    }
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    {isAr ? 'تغليب مقاربة الداخلية' : 'Endorse Interior Plan'}
                  </button>
                </div>

                {/* Economy Minister */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-black text-white">
                        {isAr ? 'وزيرة الاقتصاد والمالية' : 'Minister of Economy'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {isAr
                        ? '"علينا تحفيز الاستثمار الخاص وتعبئة موارد إضافية للخزينة عبر تسريع الشراكات بين القطاعين العام والخاص."'
                        : '"We must mobilize private investment and public-private partnerships to bolster treasury reserves."'}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onResolveEncounter({
                        mode: 'cabinet',
                        titleEn: 'Cabinet Directive: Public-Private Investment Mobilization',
                        titleAr: 'توجيه المجلس الحكومي: تعبئة الاستثمارات والشراكة بين القطاعين العام والخاص',
                        summaryEn: 'Unlocked 0.5B MAD in non-tax receipts and PPP inflows, strengthening state finances.',
                        summaryAr: 'تفعيل آليات التمويل المبتكر والشراكة مع القطاع الخاص، مما وفر 0.5 مليار درهم إضافية لخزينة الدولة.',
                        costBillionMAD: -0.50, // Net gain to treasury!
                        approvalDelta: 1.5,
                        stabilityDelta: 3.0,
                        tensionDelta: -1.0
                      })
                    }
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    {isAr ? 'تغليب مقاربة المالية (+0.5B)' : 'Endorse Finance Plan (+0.5B)'}
                  </button>
                </div>

                {/* Social & Water Priority */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-sky-400" />
                      <span className="text-xs font-black text-white">
                        {isAr ? 'الأقطاب الاجتماعية والماء' : 'Social & Water Ministers'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {isAr
                        ? '"المواطن ينتظر أثر الدولة الاجتماعية وتأمين الماء الصالح للشرب بالمراكز القروية والحواضر المتضررة."'
                        : '"Citizens expect immediate social protection delivery and rural drinking water supply."'}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onResolveEncounter({
                        mode: 'cabinet',
                        titleEn: 'Cabinet Directive: Social State & Hydraulic Emergency Acceleration',
                        titleAr: 'توجيه المجلس الحكومي: تسريع أوراش الدولة الاجتماعية والربط المائي الاستعجالي',
                        summaryEn: 'Directed 0.40B MAD into immediate social and water delivery, boosting public approval.',
                        summaryAr: 'توجيه 0.40 مليار درهم لتسريع برامج الحماية الاجتماعية والربط المائي، مما رفع شعبية الحكومة.',
                        costBillionMAD: 0.40,
                        approvalDelta: 5.0,
                        stabilityDelta: 2.5,
                        tensionDelta: -4.5
                      })
                    }
                    className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    {isAr ? 'تغليب القطب الاجتماعي' : 'Endorse Social & Water Plan'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
