import React, { useState } from 'react';
import {
  Globe2,
  Shield,
  Handshake,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building,
  Flag,
  Sparkles,
  Swords,
  ChevronRight,
  Filter,
  DollarSign,
  Landmark,
  Anchor
} from 'lucide-react';
import { GameState, ForeignRelation, DiplomaticActionType } from '../../types/game';
import { translate, formatCurrencyMAD } from '../../locales/i18n';

export type { DiplomaticActionType };

interface ForeignAffairsViewProps {
  state: GameState;
  onDiplomaticAction?: (
    countryId: string,
    actionType: DiplomaticActionType
  ) => void;
}

export const ForeignAffairsView: React.FC<ForeignAffairsViewProps> = ({
  state,
  onDiplomaticAction
}) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const relations = state.foreignRelations;

  const [activeFilter, setActiveFilter] = useState<'all' | 'sahara' | 'allies' | 'tense'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Compute Western Sahara recognition stats
  const fullSovereigntyCount = relations.filter(r => r.saharaRecognition === 'full_sovereignty').length;
  const autonomySupportCount = relations.filter(r => r.saharaRecognition === 'autonomy_support').length;
  const neutralCount = relations.filter(r => r.saharaRecognition === 'neutral').length;
  const hostileCount = relations.filter(r => r.saharaRecognition === 'hostile').length;

  // Conflict risk calculation based on Algeria tension and defense expense
  const algeria = relations.find(r => r.id === 'algeria');
  const defenseBudget = state.budget.expenses.defenseFar;
  const conflictRiskScore = Math.max(10, Math.min(95,
    Number(((algeria?.diplomaticTension || 80) * 0.7 - (defenseBudget * 4) + 25).toFixed(0))
  ));

  const filteredRelations = relations.filter(rel => {
    if (activeFilter === 'sahara') return rel.saharaRecognition === 'full_sovereignty' || rel.saharaRecognition === 'autonomy_support';
    if (activeFilter === 'allies') return rel.status === 'strategic_ally';
    if (activeFilter === 'tense') return rel.status === 'tense' || rel.status === 'adversarial';
    return true;
  });

  const getRecognitionBadge = (rec: ForeignRelation['saharaRecognition'], hasConsulate: boolean) => {
    switch (rec) {
      case 'full_sovereignty':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{isAr ? 'اعتراف صريح بالسيادة المغربية' : 'Full Moroccan Sovereignty'}</span>
            {hasConsulate && (
              <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono">
                {isAr ? 'قنصلية' : 'Consulate'}
              </span>
            )}
          </span>
        );
      case 'autonomy_support':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-400" />
            <span>{isAr ? 'دعم مبادرة الحكم الذاتي' : 'Supports Autonomy Plan'}</span>
          </span>
        );
      case 'neutral':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
            {isAr ? 'موقف أممي محايد' : 'UN Neutral'}
          </span>
        );
      case 'hostile':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>{isAr ? 'دعم أطروحة البوليساريو' : 'Backs Polisario'}</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: ForeignRelation['status']) => {
    switch (status) {
      case 'strategic_ally':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'friendly':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'neutral':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'tense':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'adversarial':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  const handleAction = (
    countryId: string,
    actionType: DiplomaticActionType,
    countryName: string
  ) => {
    if (onDiplomaticAction) {
      onDiplomaticAction(countryId, actionType);
    }
    setActionNotice(
      isAr
        ? `تم تنفيذ القرار السيادي: ${countryName}!`
        : `Sovereign action executed: ${countryName}!`
    );
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950/95 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Banner: Sovereign Foreign Policy & Sahara Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-[#15233c] to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-emerald-700 flex items-center justify-center font-bold text-white shadow-lg border border-amber-500/40 text-2xl">
              🇲🇦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  {translate(lang, 'foreign.title')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  {isAr ? 'الدبلوماسية الملكية والسيادة الوطنية' : 'Sovereign Diplomacy'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'إدارة الشراكات الاستراتيجية، حشد الاعتراف الدولي بمغربية الصحراء، والردع الدفاعي'
                  : 'Manage bilateral alliances, mobilize Sahara recognition, and maintain strategic defense deterrence'}
              </p>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'all' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'كافة الشركاء (16)' : 'All Partners (16)'}
            </button>
            <button
              onClick={() => setActiveFilter('sahara')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'sahara' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'مغربية الصحراء والحكم الذاتي' : 'Sahara Recognition'}
            </button>
            <button
              onClick={() => setActiveFilter('allies')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'allies' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'الحلفاء الاستراتيجيون' : 'Strategic Allies'}
            </button>
            <button
              onClick={() => setActiveFilter('tense')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeFilter === 'tense' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'دول التوتر والخصوم' : 'Tense / Adversaries'}
            </button>
          </div>
        </div>

        {/* Western Sahara Geopolitical Consensus Bar & Conflict Risk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
          {/* Western Sahara Recognition Balance */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'ميزان الاعتراف الدولي بمغربية الصحراء' : 'International Recognition on Moroccan Sahara'}</span>
              </span>
              <span className="font-bold text-emerald-400 font-mono text-sm">
                {fullSovereigntyCount + autonomySupportCount} / 16
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 flex overflow-hidden">
              <div
                style={{ width: `${(fullSovereigntyCount / 16) * 100}%` }}
                className="bg-emerald-500 h-full"
                title="Full Sovereignty"
              />
              <div
                style={{ width: `${(autonomySupportCount / 16) * 100}%` }}
                className="bg-amber-400 h-full"
                title="Autonomy Support"
              />
              <div
                style={{ width: `${(neutralCount / 16) * 100}%` }}
                className="bg-slate-600 h-full"
                title="Neutral"
              />
              <div
                style={{ width: `${(hostileCount / 16) * 100}%` }}
                className="bg-rose-600 h-full"
                title="Hostile"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{fullSovereigntyCount} {isAr ? 'سيادة كاملة' : 'Sovereignty'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>{autonomySupportCount} {isAr ? 'حكم ذاتي' : 'Autonomy'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>{neutralCount} {isAr ? 'محايد' : 'Neutral'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>{hostileCount} {isAr ? 'خصم' : 'Hostile'}</span>
              </span>
            </div>
          </div>

          {/* Border Conflict & Buffer Zone Risk Meter */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-rose-400" />
                <span>{isAr ? 'مؤشر أمن الحدود والردع الدفاعي (المنطقة العازلة)' : 'Border Security & Military Deterrence Index'}</span>
              </span>
              <span
                className={`font-bold font-mono text-sm ${
                  conflictRiskScore < 35
                    ? 'text-emerald-400'
                    : conflictRiskScore < 60
                    ? 'text-amber-400'
                    : 'text-rose-400 animate-pulse'
                }`}
              >
                {conflictRiskScore < 35
                  ? isAr ? 'ردع محكم واستقرار تام' : 'Strong Deterrence'
                  : conflictRiskScore < 60
                  ? isAr ? 'تأهب دفاعي متوسط' : 'Moderate Alert'
                  : isAr ? 'خطر اشتباكات حدودية' : 'High Clash Risk'}
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                style={{ width: `${conflictRiskScore}%` }}
                className={`h-full transition-all duration-500 ${
                  conflictRiskScore < 35 ? 'bg-emerald-500' : conflictRiskScore < 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>{isAr ? 'ميزانية الدفاع الوطني:' : 'Defense Budget:'} <strong className="text-slate-200">{defenseBudget}B MAD/شهر</strong></span>
              <span>{isAr ? 'التوتر مع الجزائر:' : 'Algerian Tension:'} <strong className="text-rose-400">{algeria?.diplomaticTension || 88}/100</strong></span>
            </div>
          </div>
        </div>

        {/* Sovereign Projects & Diplomatic Offensive Suite for Moroccan Sahara */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'حزمة القرارات السيادية والمشاريع الاستراتيجية للأقاليم الجنوبية' : 'Southern Provinces Sovereign Megaprojects & AU Campaign'}</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {isAr ? 'ترسيخ السيادة الميدانية، البنية الأطلسية، ومحاصرة أطروحة الانفصال قاريّاً' : 'Consolidate de-facto sovereignty & continental diplomacy'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Dakhla Atlantic Port */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3.5 space-y-2.5 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-emerald-400" />
                  {isAr ? 'مشروع ميناء الداخلة الأطلسي' : 'Dakhla Atlantic Megaport'}
                </span>
                <span className="text-[10px] font-mono text-amber-300">-1.20B MAD</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'تسريع إنجاز أضخم ميناء بحري بالأقاليم الجنوبية لربط إفريقيا الأطلسية بالعالم وجذب خطوط الشحن الدولية.'
                  : 'Fast-track deepwater megaport in Dakhla to dominate Atlantic African trade routes and maritime logistics.'}
              </p>
              <button
                disabled={state.executedOneTimeActions?.includes('sahara_dakhla_port')}
                onClick={() => handleAction('morocco_sahara', 'sahara_dakhla_port', isAr ? 'تسريع إنجاز ميناء الداخلة الأطلسي' : 'Fast-track Dakhla Atlantic Port')}
                className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  state.executedOneTimeActions?.includes('sahara_dakhla_port')
                    ? 'bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600/30 hover:bg-emerald-600/60 border border-emerald-500/40 text-emerald-200 hover:text-white active:scale-95'
                }`}
              >
                <span>
                  {state.executedOneTimeActions?.includes('sahara_dakhla_port')
                    ? (isAr ? '✓ تم إطلاق المشروع' : '✓ Project Launched')
                    : (isAr ? 'ضخ ميزانية استعجالية للميناء' : 'Accelerate Megaport Funding')}
                </span>
                {!state.executedOneTimeActions?.includes('sahara_dakhla_port') && (
                  <span className="text-[10px] text-emerald-300 font-mono">(+FDI & Trade)</span>
                )}
              </button>
            </div>

            {/* 2. Tiznit-Dakhla Expressway */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-3.5 space-y-2.5 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  {isAr ? 'الطريق السريع تيزنيت - الداخلة' : 'Tiznit-Dakhla Expressway'}
                </span>
                <span className="text-[10px] font-mono text-amber-300">-0.60B MAD</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'استكمال وتأهيل المحور الطرقي الاستراتيجي الأطول بالمملكة لربط الأقاليم الجنوبية بشبكة الطرق السيارة.'
                  : 'Finalize and modernize 1,055 km strategic dual-carriageway linking southern provinces to northern expressway grid.'}
              </p>
              <button
                disabled={state.executedOneTimeActions?.includes('sahara_tiznit_highway')}
                onClick={() => handleAction('morocco_sahara', 'sahara_tiznit_highway', isAr ? 'استكمال الطريق السريع تيزنيت-الداخلة' : 'Finalize Tiznit-Dakhla Expressway')}
                className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  state.executedOneTimeActions?.includes('sahara_tiznit_highway')
                    ? 'bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-sky-600/30 hover:bg-sky-600/60 border border-sky-500/40 text-sky-200 hover:text-white active:scale-95'
                }`}
              >
                <span>
                  {state.executedOneTimeActions?.includes('sahara_tiznit_highway')
                    ? (isAr ? '✓ تم التمويل الكامل' : '✓ Fully Funded')
                    : (isAr ? 'تأمين تمويل الشطر النهائي' : 'Finance Final Expressway Stretch')}
                </span>
                {!state.executedOneTimeActions?.includes('sahara_tiznit_highway') && (
                  <span className="text-[10px] text-sky-300 font-mono">(+Integration)</span>
                )}
              </button>
            </div>

            {/* 3. African Union Sovereignty Campaign */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-3.5 space-y-2.5 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                  {isAr ? 'حملة طرد الكيان الوهمي من الاتحاد الإفريقي' : 'AU Campaign: Expel Fake Entity'}
                </span>
                <span className="text-[10px] font-mono text-amber-300">-0.25B MAD</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'حملة دبلوماسية قارية مكثفة لتعبئة أغلبية الثلثين بأديس أبابا وطرد ممثلي البوليساريو من مقاعد الاتحاد الإفريقي.'
                  : 'Mobilize African two-thirds majority to formally suspend and expel the self-proclaimed SADR from the African Union.'}
              </p>
              <button
                disabled={state.executedOneTimeActions?.includes('sahara_au_expulsion')}
                onClick={() => handleAction('morocco_sahara', 'sahara_au_expulsion', isAr ? 'إطلاق الحملة الإفريقية لطرد الكيان الوهمي' : 'Launch AU Expulsion Offensive')}
                className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  state.executedOneTimeActions?.includes('sahara_au_expulsion')
                    ? 'bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600/30 hover:bg-indigo-600/60 border border-indigo-500/40 text-indigo-200 hover:text-white active:scale-95'
                }`}
              >
                <span>
                  {state.executedOneTimeActions?.includes('sahara_au_expulsion')
                    ? (isAr ? '✓ الحملة الدبلوماسية مكتملة' : '✓ Offensive Launched')
                    : (isAr ? 'بدء الهجوم الدبلوماسي القاري' : 'Launch Continental Offensive')}
                </span>
                {!state.executedOneTimeActions?.includes('sahara_au_expulsion') && (
                  <span className="text-[10px] text-indigo-300 font-mono">(+Sovereignty)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Foreign Partners with Interactive Diplomatic Action Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRelations.map(rel => {
          const statusClass = getStatusBadge(rel.status);

          return (
            <div
              key={rel.id}
              className="bg-[#111a2e] border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between transition-all"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{rel.flagEmoji}</span>
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        {isAr ? rel.nameAr : rel.nameEn}
                      </h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase mt-1 inline-block ${statusClass}`}>
                        {rel.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-black text-sm px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 ${
                      rel.relationshipScore >= 50
                        ? 'text-emerald-400'
                        : rel.relationshipScore >= 0
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {rel.relationshipScore > 0 ? `+${rel.relationshipScore}` : rel.relationshipScore}
                  </span>
                </div>

                {/* Western Sahara Recognition Badge */}
                <div className="pt-1">
                  {getRecognitionBadge(rel.saharaRecognition, rel.hasConsulateInSahara)}
                </div>

                {/* Economic & Security Indicators */}
                <div className="space-y-1.5 text-xs bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{translate(lang, 'foreign.tradeVolume')}</span>
                    <span className="font-bold text-slate-200">
                      {formatCurrencyMAD(rel.tradeVolumeBillionMAD, lang)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{translate(lang, 'foreign.securityCoop')}</span>
                    <span className="font-semibold text-sky-400">{rel.securityCooperationScore}%</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{translate(lang, 'foreign.diplomaticTension')}</span>
                    <span className={`font-semibold ${rel.diplomaticTension > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {rel.diplomaticTension}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Diplomatic Decision Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {isAr ? 'الخيارات الدبلوماسية المتاحة:' : 'Diplomatic Actions:'}
                </span>

                {/* 1. Push Sahara Recognition / Open Consulate */}
                {rel.saharaRecognition !== 'full_sovereignty' && rel.status !== 'adversarial' && (
                  <button
                    onClick={() => handleAction(rel.id, 'push_recognition', isAr ? rel.nameAr : rel.nameEn)}
                    className="w-full py-2 px-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 hover:text-white text-[11px] font-bold transition-all text-start flex items-center justify-between shadow-sm active:scale-95"
                  >
                    <span className="truncate">
                      {rel.saharaRecognition === 'neutral'
                        ? isAr ? 'حملة لحشد دعم مبادرة الحكم الذاتي' : 'Lobby for Autonomy Support'
                        : isAr ? 'طلب فتح قنصلية بالعيون أو الداخلة' : 'Request Consulate in Sahara'}
                    </span>
                    <span className="text-[9px] text-amber-300 font-mono shrink-0 ml-1">-0.08B</span>
                  </button>
                )}

                {/* 2. Free Trade Agreement */}
                {!rel.freeTradeAgreement && rel.status !== 'adversarial' && (
                  <button
                    onClick={() => handleAction(rel.id, 'sign_trade', isAr ? rel.nameAr : rel.nameEn)}
                    className="w-full py-2 px-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 hover:text-white text-[11px] font-bold transition-all text-start flex items-center justify-between shadow-sm active:scale-95"
                  >
                    <span className="truncate">{isAr ? 'توقيع شراكة تبادل تجاري تفضيلي' : 'Sign Preferential Trade Pact'}</span>
                    <span className="text-[9px] text-emerald-300 font-mono shrink-0 ml-1">+FDI</span>
                  </button>
                )}

                {/* 3. Defense & Security Pact */}
                {!rel.securityPact && (rel.status === 'strategic_ally' || rel.status === 'friendly') && (
                  <button
                    onClick={() => handleAction(rel.id, 'sign_defense', isAr ? rel.nameAr : rel.nameEn)}
                    className="w-full py-2 px-2.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/50 text-sky-200 hover:text-white text-[11px] font-bold transition-all text-start flex items-center justify-between shadow-sm active:scale-95"
                  >
                    <span className="truncate">{isAr ? 'اتفاقية تعاون دفاعي وتسليح مشترك' : 'Sign Defense & Military Pact'}</span>
                    <span className="text-[9px] text-sky-300 font-mono shrink-0 ml-1">+FAR</span>
                  </button>
                )}

                {/* 4. Algeria-Specific Sovereign Confrontation & Border Deterrence Suite */}
                {rel.id === 'algeria' && (
                  <div className="space-y-1.5 pt-2 border-t border-rose-900/60">
                    <span className="text-[10px] font-bold text-rose-400 block uppercase">
                      {isAr ? 'خيارات الردع والسيادة ضد النظام الجزائري:' : 'Deterrence & Counter-Escalation:'}
                    </span>
                    {/* A. Reinforce Defense Wall Eastward */}
                    <button
                      onClick={() => handleAction('algeria', 'algeria_reinforce_wall', isAr ? 'تحصين وتمديد الجدار الأمني شرقاً ونشر رادارات متقدمة' : 'Reinforce Defense Wall Eastward & Deploy Radars')}
                      className="w-full py-2 px-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-rose-200 hover:text-white text-[11px] font-bold transition-all text-start flex items-center justify-between shadow-sm active:scale-95"
                    >
                      <span className="truncate">{isAr ? 'تحصين وتمديد الجدار الأمني شرقاً' : 'Reinforce Defense Wall Eastward'}</span>
                      <span className="text-[9px] text-amber-300 font-mono ml-1">-0.4B</span>
                    </button>
                    {/* B. Combat UAV Patrols in Buffer Zone */}
                    <button
                      onClick={() => handleAction('algeria', 'algeria_drone_patrol', isAr ? 'تسيير دوريات المسيرات المقاتلة (الدرون) بالمنطقة العازلة' : 'Deploy Combat UAV Patrols in Buffer Zone')}
                      className="w-full py-2 px-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-rose-200 hover:text-white text-[11px] font-bold transition-all text-start flex items-center justify-between shadow-sm active:scale-95"
                    >
                      <span className="truncate">{isAr ? 'دوريات الدرون لردع أي تسلل للمنطقة العازلة' : 'Combat UAV Buffer Zone Patrols'}</span>
                      <span className="text-[9px] text-emerald-300 font-mono ml-1">+Deterrence</span>
                    </button>
                    {/* C. Enforce Strict Airspace Ban & Sovereign Severance */}
                    <button
                      onClick={() => handleAction('algeria', 'algeria_sever_ties', isAr ? 'تشديد حظر الملاحة الجوية وتثبيت قطع العلاقات' : 'Enforce Airspace Ban & Sovereign Severance')}
                      className="w-full py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-[11px] font-bold transition-all text-start flex items-center justify-between shadow-sm active:scale-95"
                    >
                      <span className="truncate">{isAr ? 'تشديد حظر الملاحة الجوية وحظر العبور التجاري' : 'Strict Airspace & Border Ban'}</span>
                      <span className="text-[9px] text-rose-300 font-mono ml-1">Sovereign</span>
                    </button>
                  </div>
                )}

                {/* 5. De-escalate Tension (General option for Tense / Adversarial Countries) */}
                {(rel.status === 'tense' || rel.status === 'adversarial') && (
                  <button
                    onClick={() => handleAction(rel.id, 'deescalate', isAr ? rel.nameAr : rel.nameEn)}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition-all text-start flex items-center justify-between shadow-sm active:scale-95"
                  >
                    <span className="truncate">{isAr ? 'فتح قنوات وساطة لتخفيف التوتر الدبلوماسي' : 'Mediation to De-escalate Tension'}</span>
                    <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-1">-Tension</span>
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
