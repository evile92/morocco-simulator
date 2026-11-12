import React, { useState } from 'react';
import {
  Flame,
  MessageSquare,
  Coins,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  X,
  Sparkles,
  Loader2,
  Building,
  Users
} from 'lucide-react';
import { CityProtest, GameState } from '../../types/game';
import { evaluateProtestResponse } from '../../ai/deepseek';

interface CityProtestModalProps {
  protest: CityProtest;
  state: GameState;
  onClose: () => void;
  onResolveAction: (
    protestId: string,
    actionType: 'dialogue' | 'grant_demands' | 'partial_aid' | 'police_enforce',
    customFeedback?: string
  ) => void;
}

export const CityProtestModal: React.FC<CityProtestModalProps> = ({
  protest,
  state,
  onClose,
  onResolveAction
}) => {
  const isAr = state.language === 'ar';
  const [evaluatingAction, setEvaluatingAction] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{
    actionType: string;
    reactionText: string;
    tensionDelta: number;
    approvalDelta: number;
    costBillionMAD: number;
  } | null>(null);

  const region = state.regions.find(r => r.id === protest.regionId);

  const handleAction = async (actionType: 'dialogue' | 'grant_demands' | 'partial_aid' | 'police_enforce') => {
    setEvaluatingAction(actionType);
    try {
      // Evaluate reaction through DeepSeek AI engine
      const evalResult = await evaluateProtestResponse(protest, actionType, state);
      setAiAnalysis({
        actionType,
        ...evalResult
      });
      // Complete action
      onResolveAction(protest.id, actionType, evalResult.reactionText);
    } catch {
      onResolveAction(protest.id, actionType);
    } finally {
      setEvaluatingAction(null);
    }
  };

  const getIntensityBadge = () => {
    switch (protest.intensity) {
      case 'critical':
        return (
          <span className="px-3 py-1 bg-rose-600/30 text-rose-300 border border-rose-500/50 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            {isAr ? 'حراك حرج ومستعجل' : 'Critical Flashpoint'}
          </span>
        );
      case 'intense':
        return (
          <span className="px-3 py-1 bg-amber-600/30 text-amber-300 border border-amber-500/50 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            {isAr ? 'احتقان مرتفع' : 'Intense Mobilization'}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-sky-600/30 text-sky-300 border border-sky-500/50 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            {isAr ? 'وقفات احتجاجية سلمية' : 'Peaceful Rallies'}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-gradient-to-r from-slate-900 via-[#1e293b] to-slate-900">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-amber-400">
                {isAr ? 'بؤرة توتر واحتجاجات ميدانية' : 'Civic Flashpoint & Demands'}
              </span>
              {getIntensityBadge()}
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span>{isAr ? protest.cityNameAr : protest.cityNameEn}</span>
              <span className="text-sm font-semibold text-slate-400">
                ({isAr ? region?.nameAr : region?.nameEn})
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Protesters Demands Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                {isAr ? 'قائمة مطالب الساكنة والتنسيقية الميدانية:' : 'Civic Rallies Core Demands:'}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {isAr ? 'الفئة المحتجة: ' : 'Group: '}
                <strong className="text-slate-300">{protest.demographicGroup}</strong>
              </span>
            </div>

            <ul className="space-y-2.5">
              {(isAr ? protest.demandsAr : protest.demandsEn).map((demand, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50"
                >
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{demand}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Advisor Preview Note if already executed */}
          {aiAnalysis && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>{isAr ? 'تقييم ذكاء DeepSeek الميداني لرد الفعل:' : 'DeepSeek AI Field Evaluation:'}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                "{aiAnalysis.reactionText}"
              </p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-emerald-900/50">
                <span>
                  {isAr ? 'تغير الاحتقان:' : 'Tension Delta:'}{' '}
                  <strong className={aiAnalysis.tensionDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {aiAnalysis.tensionDelta > 0 ? `+${aiAnalysis.tensionDelta}` : aiAnalysis.tensionDelta}
                  </strong>
                </span>
                <span>
                  {isAr ? 'التكلفة:' : 'Cost:'}{' '}
                  <strong className="text-amber-400">{aiAnalysis.costBillionMAD}B MAD</strong>
                </span>
                <span>
                  {isAr ? 'شعبية الحكومة:' : 'Approval:'}{' '}
                  <strong className={aiAnalysis.approvalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {aiAnalysis.approvalDelta > 0 ? `+${aiAnalysis.approvalDelta}%` : `${aiAnalysis.approvalDelta}%`}
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Government Action Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              {isAr ? 'خيارات التدخل والقرار الحكومي:' : 'Government Policy Responses:'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 1. Direct Dialogue */}
              <button
                disabled={evaluatingAction !== null}
                onClick={() => handleAction('dialogue')}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-sky-500 rounded-2xl p-4 text-start transition-all space-y-2 group shadow-lg disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-sky-400 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    {isAr ? 'فتح حوار وتفاوض مباشر' : 'Dialogue & Consultation'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">0.05B MAD</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'إيفاد وفد وزاري للاستماع لممثلي التنسيقية وتوقيع محضر اتفاق مرحلي.'
                    : 'Dispatch ministerial committee to negotiate a joint roadmap.'}
                </p>
                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                  <span className="text-emerald-400 font-medium">{isAr ? 'خفض التوتر (-3.0)' : 'Tension (-3.0)'}</span>
                  <span>•</span>
                  <span>{isAr ? 'رفع الثقة (+2.0)' : 'Trust (+2.0)'}</span>
                </div>
              </button>

              {/* 2. Full Budget Grant */}
              <button
                disabled={evaluatingAction !== null}
                onClick={() => handleAction('grant_demands')}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-start transition-all space-y-2 group shadow-lg disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                    <Coins className="w-4 h-4" />
                    {isAr ? 'الاستجابة وصرف ميزانية استعجالية' : 'Meet Demands & Fund'}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">0.60B MAD</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'الموافقة على المطالب الأساسية وصرف اعتمادات استثنائية لإنهاء الاحتقان فوراً.'
                    : 'Approve core demands and disburse emergency credits to end protests.'}
                </p>
                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                  <span className="text-emerald-400 font-medium">{isAr ? 'خفض التوتر (-8.0)' : 'Tension (-8.0)'}</span>
                  <span>•</span>
                  <span className="text-emerald-300">{isAr ? 'شعبية (+4.5%)' : 'Approval (+4.5%)'}</span>
                </div>
              </button>

              {/* 3. Partial Aid */}
              <button
                disabled={evaluatingAction !== null}
                onClick={() => handleAction('partial_aid')}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 rounded-2xl p-4 text-start transition-all space-y-2 group shadow-lg disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {isAr ? 'إقرار دعم وتنازلات جزئية' : 'Partial Aid & Reform'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">0.25B MAD</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'تقديم حزمة دعم مالي مؤقت وإرجاء الملفات المعقدة للدراسة التشريعية.'
                    : 'Deliver immediate targeted support and table structural issues.'}
                </p>
                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                  <span className="text-emerald-400 font-medium">{isAr ? 'خفض التوتر (-4.5)' : 'Tension (-4.5)'}</span>
                  <span>•</span>
                  <span>{isAr ? 'شعبية (+2.5%)' : 'Approval (+2.5%)'}</span>
                </div>
              </button>

              {/* 4. Enforce Security */}
              <button
                disabled={evaluatingAction !== null}
                onClick={() => handleAction('police_enforce')}
                className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-rose-500 rounded-2xl p-4 text-start transition-all space-y-2 group shadow-lg disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    {isAr ? 'رفض المطالب والتدخل الأمني' : 'Reject & Enforce Law'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">0.02B MAD</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'اعتبار التجمهر غير مرخص وفض الاعتصامات بواسطة القوة العمومية لحفظ النظام.'
                    : 'Declare rallies unlawful and deploy security forces to clear roads.'}
                </p>
                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                  <span className="text-rose-400 font-medium">{isAr ? 'ارتفاع الاحتقان (+5.0)' : 'Tension (+5.0)'}</span>
                  <span>•</span>
                  <span className="text-rose-400">{isAr ? 'تراجع الشعبية (-3.5%)' : 'Approval (-3.5%)'}</span>
                </div>
              </button>
            </div>

            {evaluatingAction && (
              <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isAr ? 'جاري تقييم رد فعل المحتجين عبر نموذج DeepSeek AI...' : 'Evaluating civic response via DeepSeek AI...'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
          >
            {isAr ? 'إغلاق ومتابعة الوضع' : 'Close & Monitor'}
          </button>
        </div>
      </div>
    </div>
  );
};
