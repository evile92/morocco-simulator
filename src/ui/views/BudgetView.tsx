import React, { useState, useEffect } from 'react';
import {
  Receipt,
  TrendingDown,
  TrendingUp,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Zap,
  Users,
  Shield,
  Briefcase,
  HeartPulse,
  GraduationCap,
  Building2
} from 'lucide-react';
import { GameState, FiscalLevers } from '../../types/game';
import { DEFAULT_FISCAL_LEVERS, computeBudgetBreakdown } from '../../simulation/budget';
import { translate, formatCurrencyMAD } from '../../locales/i18n';

interface BudgetViewProps {
  state: GameState;
  onUpdateFiscalLevers?: (levers: FiscalLevers) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ state, onUpdateFiscalLevers }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const budget = state.budget;
  const economy = state.economy;

  const currentLevers: FiscalLevers = {
    ...DEFAULT_FISCAL_LEVERS,
    ...(budget.fiscalLevers || {})
  };

  const [draftLevers, setDraftLevers] = useState<FiscalLevers>(currentLevers);
  const [appliedBanner, setAppliedBanner] = useState<boolean>(false);

  useEffect(() => {
    setDraftLevers({
      ...DEFAULT_FISCAL_LEVERS,
      ...(budget.fiscalLevers || {})
    });
  }, [budget.fiscalLevers]);

  // Live Cause-and-Effect Preview Calculations using shared simulation formula
  const activePolicies = state.policies.filter(p => p.implemented);
  const {
    revenues: previewRevenues,
    totalMonthlyRevenue: previewTotalRevenue,
    totalMonthlyExpense: previewTotalExpense,
    monthlyBalance: previewMonthlyBalance
  } = computeBudgetBreakdown(budget, economy, activePolicies, draftLevers);
  const previewIncomeTax = previewRevenues.incomeTax;
  const previewCorporateTax = previewRevenues.corporateTax;
  const previewVat = previewRevenues.vat;
  const balanceDiff = previewMonthlyBalance - budget.monthlyBalance;

  // Macroeconomic & Social Cause-and-Effect Preview Deltas
  const previewGrowthEffect =
    (28 - draftLevers.corporateTaxRatePercent) * 0.08 +
    (draftLevers.infrastructureBudgetBillionMAD - 5.5) * 0.14;

  const previewInflationEffect =
    (draftLevers.vatRatePercent - 20) * 0.18 -
    (draftLevers.maqassaSubsidyBillionMAD - 3.5) * 0.22;

  const previewSocialApprovalEffect =
    (draftLevers.maqassaSubsidyBillionMAD - 3.5) * 0.9 +
    (draftLevers.healthcareBudgetBillionMAD - 4.2) * 0.7 +
    (draftLevers.educationBudgetBillionMAD - 6.8) * 0.5 +
    (draftLevers.publicWagesBillionMAD - 13.5) * 0.6 -
    (draftLevers.vatRatePercent - 20) * 0.6 -
    (draftLevers.incomeTaxRatePercent - 30) * 0.4;

  const hasChanges = JSON.stringify(draftLevers) !== JSON.stringify(currentLevers);

  const handleApplyLevers = () => {
    if (onUpdateFiscalLevers) {
      onUpdateFiscalLevers(draftLevers);
      setAppliedBanner(true);
      setTimeout(() => setAppliedBanner(false), 3500);
    }
  };

  const handleResetDefaults = () => {
    setDraftLevers({ ...DEFAULT_FISCAL_LEVERS });
  };

  return (
    <div className="p-5 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner: Sovereign Fiscal Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {isAr ? 'هندسة قانون المالية والمنزلقات السيادية الحية' : 'Live Fiscal Law & Sovereign Policy Sliders'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'حرك منزلقات الضرائب وصندوق المقاصة وميزانيات القطاعات لمعاينة الأثر السببي الفوري على التضخم والنمو والفئات الاجتماعية'
                  : 'Adjust tax rates, subsidies, and sectoral budgets with live cause-and-effect preview on growth, inflation, and social classes'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-slate-950/90 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {translate(lang, 'budget.sovereignRating')}
              </span>
              <span className="text-base font-black text-emerald-400">{budget.sovereignCreditRating}</span>
              <span className="text-[10px] text-slate-500 block">+{budget.borrowingCostSpread}% spread</span>
            </div>
            <div className="bg-slate-950/90 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {translate(lang, 'app.debtToGdp')}
              </span>
              <span className="text-base font-black text-amber-300">{budget.debtToGdpRatio}%</span>
              <span className="text-[10px] text-slate-500 block">{formatCurrencyMAD(budget.publicDebtBillionMAD, lang)}</span>
            </div>
          </div>
        </div>

        {/* LIVE CAUSE-AND-EFFECT NETWORK PREVIEW BAR */}
        <div className="bg-gradient-to-r from-slate-950 via-[#0f1a30] to-slate-950 border border-sky-500/30 rounded-2xl p-4 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-sky-300">
                {isAr ? 'معاينة الشبكة السببية الحية (قبل التطبيق)' : 'Live Cause-and-Effect Simulation Preview'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'الوضع المرجعي' : 'Reset Baseline'}</span>
              </button>
              <button
                onClick={handleApplyLevers}
                disabled={!hasChanges}
                className={`px-4 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all shadow-lg ${
                  hasChanges
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white cursor-pointer scale-[1.02]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'اعتماد وتنزيل الميزانية المعدلة' : 'Enact Adjusted Budget Law'}</span>
              </button>
            </div>
          </div>

          {appliedBanner && (
            <div className="mb-3 bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isAr
                  ? 'تم اعتماد قانون المالية التعديلي بنجاح! ستظهر انعكاساته المباشرة على الخريطة والفئات الاجتماعية والميزانية.'
                  : 'Amended Finance Law enacted! Direct impacts are now active across macroeconomy and social classes.'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'المداخيل المتوقعة/شهر' : 'Projected Revenue'}</span>
              <span className="text-sm font-black text-emerald-400">
                +{previewTotalRevenue.toFixed(1)} {isAr ? 'مليار' : 'B'}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'النفقات المتوقعة/شهر' : 'Projected Expense'}</span>
              <span className="text-sm font-black text-rose-400">
                -{previewTotalExpense.toFixed(1)} {isAr ? 'مليار' : 'B'}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'الرصيد الصافي الشهري' : 'Net Monthly Balance'}</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-black ${previewMonthlyBalance >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {previewMonthlyBalance >= 0 ? '+' : ''}{previewMonthlyBalance.toFixed(1)} {isAr ? 'مليار' : 'B'}
                </span>
                {Math.abs(balanceDiff) >= 0.1 && (
                  <span className={`text-[10px] font-bold ${balanceDiff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ({balanceDiff > 0 ? '+' : ''}{balanceDiff.toFixed(1)})
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'أثر نمو الناتج (GDP)' : 'GDP Growth Push'}</span>
              <span className={`text-sm font-black ${previewGrowthEffect >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {previewGrowthEffect >= 0 ? '+' : ''}{previewGrowthEffect.toFixed(2)}%
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'أثر التضخم والأسعار' : 'Inflation Impact'}</span>
              <span className={`text-sm font-black ${previewInflationEffect <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {previewInflationEffect > 0 ? '+' : ''}{previewInflationEffect.toFixed(2)}%
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'أثر الرضا الشعبي' : 'Social Approval Push'}</span>
              <span className={`text-sm font-black ${previewSocialApprovalEffect >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {previewSocialApprovalEffect >= 0 ? '+' : ''}{previewSocialApprovalEffect.toFixed(1)} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE SLIDERS GRID: TAXATION LEVERS VS MINISTERIAL SPENDING LEVERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Taxation & Fiscal Levers */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-emerald-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>{isAr ? 'منزلقات السياسة الضريبية والمداخيل' : 'Taxation & Revenue Sliders'}</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400">
              +{previewTotalRevenue.toFixed(2)} {isAr ? 'مليار درهم/شهر' : 'B MAD/mo'}
            </span>
          </div>

          {/* 1. Corporate Tax (IS) */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                {isAr ? 'الضريبة على الشركات (IS)' : 'Corporate Income Tax (IS)'}
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                  {draftLevers.corporateTaxRatePercent}%
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {previewCorporateTax.toFixed(2)}B
                </span>
              </div>
            </div>
            <input
              type="range"
              min={15}
              max={40}
              step={1}
              value={draftLevers.corporateTaxRatePercent}
              onChange={e => setDraftLevers(prev => ({ ...prev, corporateTaxRatePercent: Number(e.target.value) }))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{isAr ? '15% (تحفيز الاستثمار والشركات)' : '15% (Pro-Business)'}</span>
              <span className="text-amber-300/90">
                {draftLevers.corporateTaxRatePercent < 28
                  ? isAr ? '↑ يرفع الاستثمار والنمو ويرضي الباطرونا' : '↑ Boosts FDI & Growth'
                  : draftLevers.corporateTaxRatePercent > 28
                  ? isAr ? '↓ يقلص الاستثمار ويغضب رجال الأعمال' : '↓ Slows Private Investment'
                  : isAr ? 'المعدل القانوني المرجعي (28%)' : 'Standard Rate (28%)'}
              </span>
              <span>{isAr ? '40% (تقشف جبائي)' : '40% (High Tax)'}</span>
            </div>
          </div>

          {/* 2. Personal Income Tax (IR) */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                {isAr ? 'الضريبة على الدخل (IR)' : 'Personal Income Tax (IR)'}
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  {draftLevers.incomeTaxRatePercent}%
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {previewIncomeTax.toFixed(2)}B
                </span>
              </div>
            </div>
            <input
              type="range"
              min={15}
              max={45}
              step={1}
              value={draftLevers.incomeTaxRatePercent}
              onChange={e => setDraftLevers(prev => ({ ...prev, incomeTaxRatePercent: Number(e.target.value) }))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{isAr ? '15% (دعم القدرة الشرائية للأجراء)' : '15% (Middle-Class Relief)'}</span>
              <span className="text-amber-300/90">
                {draftLevers.incomeTaxRatePercent < 30
                  ? isAr ? '↑ يرفع رضا الطبقة الوسطى والموظفين' : '↑ Pleases Middle Class'
                  : draftLevers.incomeTaxRatePercent > 30
                  ? isAr ? '↓ يضغط على الأجراء والنقابات' : '↓ Hurts Salaried Workers'
                  : isAr ? 'المعدل المرجعي (30%)' : 'Baseline (30%)'}
              </span>
              <span>45%</span>
            </div>
          </div>

          {/* 3. Value Added Tax (TVA) */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                {isAr ? 'الضريبة على القيمة المضافة (TVA)' : 'Value Added Tax (TVA)'}
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  {draftLevers.vatRatePercent}%
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {previewVat.toFixed(2)}B
                </span>
              </div>
            </div>
            <input
              type="range"
              min={10}
              max={25}
              step={1}
              value={draftLevers.vatRatePercent}
              onChange={e => setDraftLevers(prev => ({ ...prev, vatRatePercent: Number(e.target.value) }))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{isAr ? '10% (تخفيض أسعار المواد الأساسية)' : '10% (Low Prices)'}</span>
              <span className="text-amber-300/90">
                {draftLevers.vatRatePercent > 20
                  ? isAr ? '⚠️ يرفع التضخم وغلاء المعيشة فوراً' : '⚠️ Pushes Inflation Up'
                  : draftLevers.vatRatePercent < 20
                  ? isAr ? '↑ يخفض التضخم ويدعم الأسر الفقيرة' : '↑ Lowers CPI Inflation'
                  : isAr ? 'المعدل المرجعي (20%)' : 'Baseline (20%)'}
              </span>
              <span>25%</span>
            </div>
          </div>

          {/* Non-Slider Sovereign Revenues Summary */}
          <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              {isAr ? 'الموارد السيادية والجمركية غير الضريبية' : 'Sovereign & Customs Non-Tax Receipts'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 flex justify-between">
                <span className="text-slate-400">{isAr ? 'عائدات الفوسفاط (OCP)' : 'OCP Dividends'}</span>
                <span className="font-mono font-bold text-slate-200">{budget.revenues.stateEnterprisesOcp}B</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 flex justify-between">
                <span className="text-slate-400">{isAr ? 'الرسوم الجمركية' : 'Customs Duties'}</span>
                <span className="font-mono font-bold text-slate-200">{budget.revenues.customs}B</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 flex justify-between">
                <span className="text-slate-400">{isAr ? 'رسوم السياحة والمطارات' : 'Tourism Taxes'}</span>
                <span className="font-mono font-bold text-slate-200">{budget.revenues.tourismTaxes}B</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 flex justify-between">
                <span className="text-slate-400">{isAr ? 'مداخيل أخرى للدولة' : 'Other State Receipts'}</span>
                <span className="font-mono font-bold text-slate-200">{budget.revenues.otherRevenues}B</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Ministerial Spending & Social Levers */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-rose-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              <span>{isAr ? 'منزلقات الإنفاق الوزاري وصندوق المقاصة' : 'Ministerial Spending & Subsidy Sliders'}</span>
            </h3>
            <span className="text-xs font-bold text-rose-400">
              -{previewTotalExpense.toFixed(2)} {isAr ? 'مليار درهم/شهر' : 'B MAD/mo'}
            </span>
          </div>

          {/* 1. Maqassa & Direct Social Aid */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                {isAr ? 'صندوق المقاصة والدعم الاجتماعي المباشر' : 'Maqassa Subsidy & Direct Social Aid'}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                {draftLevers.maqassaSubsidyBillionMAD.toFixed(1)}B MAD/mo
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={8.0}
              step={0.25}
              value={draftLevers.maqassaSubsidyBillionMAD}
              onChange={e => setDraftLevers(prev => ({ ...prev, maqassaSubsidyBillionMAD: Number(e.target.value) }))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{isAr ? '0.5B (تحرير كامل للأسعار)' : '0.5B (Full Liberalization)'}</span>
              <span className="text-amber-300/90">
                {isAr ? 'يدعم غاز البوتان والدقيق والدعم المباشر للأسر الهشة' : 'Buffers inflation & protects low-income families'}
              </span>
              <span>8.0B</span>
            </div>
          </div>

          {/* 2. Healthcare & AMO */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                {isAr ? 'الصحة وتعميم التغطية الصحية (AMO)' : 'Healthcare & Universal Medical Coverage'}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                {draftLevers.healthcareBudgetBillionMAD.toFixed(1)}B MAD/mo
              </span>
            </div>
            <input
              type="range"
              min={2.0}
              max={9.0}
              step={0.25}
              value={draftLevers.healthcareBudgetBillionMAD}
              onChange={e => setDraftLevers(prev => ({ ...prev, healthcareBudgetBillionMAD: Number(e.target.value) }))}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* 3. National Education & Universities */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                {isAr ? 'التعليم الوطني والجامعات والبحث العلمي' : 'National Education & Higher Research'}
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                {draftLevers.educationBudgetBillionMAD.toFixed(1)}B MAD/mo
              </span>
            </div>
            <input
              type="range"
              min={3.5}
              max={12.0}
              step={0.25}
              value={draftLevers.educationBudgetBillionMAD}
              onChange={e => setDraftLevers(prev => ({ ...prev, educationBudgetBillionMAD: Number(e.target.value) }))}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* 4. Infrastructure, Ports & Dams */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                {isAr ? 'التجهيز والماء والموانئ والطرق السيارة' : 'Infrastructure, Ports, Dams & Highways'}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                {draftLevers.infrastructureBudgetBillionMAD.toFixed(1)}B MAD/mo
              </span>
            </div>
            <input
              type="range"
              min={2.0}
              max={10.0}
              step={0.25}
              value={draftLevers.infrastructureBudgetBillionMAD}
              onChange={e => setDraftLevers(prev => ({ ...prev, infrastructureBudgetBillionMAD: Number(e.target.value) }))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* 5. Civil Service Wages (Masse Salariale) */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                {isAr ? 'كتلة أجور الموظفين والحوار الاجتماعي' : 'Civil Service Wage Bill (Masse Salariale)'}
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                {draftLevers.publicWagesBillionMAD.toFixed(1)}B MAD/mo
              </span>
            </div>
            <input
              type="range"
              min={10.0}
              max={18.0}
              step={0.25}
              value={draftLevers.publicWagesBillionMAD}
              onChange={e => setDraftLevers(prev => ({ ...prev, publicWagesBillionMAD: Number(e.target.value) }))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* 6. National Defense (FAR) */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                {isAr ? 'ميزانية الدفاع الوطني (القوات المسلحة الملكية)' : 'National Defense (Royal Armed Forces - FAR)'}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                {draftLevers.defenseBudgetBillionMAD.toFixed(1)}B MAD/mo
              </span>
            </div>
            <input
              type="range"
              min={3.0}
              max={10.0}
              step={0.25}
              value={draftLevers.defenseBudgetBillionMAD}
              onChange={e => setDraftLevers(prev => ({ ...prev, defenseBudgetBillionMAD: Number(e.target.value) }))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
