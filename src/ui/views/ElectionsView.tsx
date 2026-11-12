import React, { useState } from 'react';
import {
  Vote,
  Calendar,
  Users,
  Award,
  AlertTriangle,
  CheckCircle2,
  Check,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { GameState, PoliticalParty } from '../../types/game';
import { translate } from '../../locales/i18n';
import { simulateElection } from '../../simulation/elections';
import { calculateCoalitionHarmony } from '../../simulation/government';

interface ElectionsViewProps {
  state: GameState;
  onConductElection: () => void;
  onFormNewGovernment: (coalitionPartyIds: string[]) => void;
}

export const ElectionsView: React.FC<ElectionsViewProps> = ({
  state,
  onConductElection,
  onFormNewGovernment
}) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const gov = state.government;
  const parties = state.parties;

  const monthsRemaining = Math.max(0, gov.nextScheduledElectionMonth - state.elapsedMonths);

  // Coalition builder local state
  const [selectedCoalitionIds, setSelectedCoalitionIds] = useState<string[]>(
    gov.coalitionPartyIds.includes(gov.rulingPartyId)
      ? gov.coalitionPartyIds
      : [gov.rulingPartyId, ...gov.coalitionPartyIds]
  );

  const toggleCoalitionParty = (partyId: string) => {
    if (selectedCoalitionIds.includes(partyId)) {
      if (selectedCoalitionIds.length > 1) {
        setSelectedCoalitionIds(selectedCoalitionIds.filter(id => id !== partyId));
      }
    } else {
      setSelectedCoalitionIds([...selectedCoalitionIds, partyId]);
    }
  };

  // Calculate total coalition seats & harmony
  const currentSeatSource = state.electionResults?.seatsPerParty || Object.fromEntries(parties.map(p => [p.id, p.seats]));
  const totalCoalitionSeats = selectedCoalitionIds.reduce((sum, id) => sum + (currentSeatSource[id] || 0), 0);
  const hasMajority = totalCoalitionSeats >= 198;
  const coalitionHarmony = calculateCoalitionHarmony(
    {
      ...gov,
      rulingPartyId: selectedCoalitionIds[0] || gov.rulingPartyId,
      coalitionPartyIds: selectedCoalitionIds
    },
    parties
  );

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner: Election Cycle & Polling */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Vote className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {translate(lang, 'elections.title')}
              </h2>
              <p className="text-xs text-slate-400">
                {translate(lang, 'elections.monthsRemaining', { months: monthsRemaining })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onConductElection}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isAr ? 'إجراء وتصويت الانتخابات الآن' : 'Hold General Elections Now'}</span>
            </button>
          </div>
        </div>

        {/* Polling Projection Bar */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">{translate(lang, 'elections.pollingForecast')}</span>
            <span className="text-slate-400 text-[11px]">{isAr ? 'استطلاعات الرأي الوطنية' : 'National Poll Trend'}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 text-center text-xs pt-2">
            {parties.map(p => (
              <div key={p.id} className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 space-y-0.5">
                <span className="font-bold text-slate-200 block text-[11px]">{p.acronym}</span>
                <span className="font-mono text-sm font-black text-sky-400">{p.popularity}%</span>
                <span className="text-[10px] text-slate-500 block">{p.seats} {isAr ? 'مقعداً' : 'seats'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Election Results & Coalition Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Seats and Vote Results (7 cols) */}
        <div className="lg:col-span-7 bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{translate(lang, 'elections.electionResults')}</span>
            </h3>
            {state.electionResults && (
              <span className="text-xs text-emerald-400 font-semibold">
                {isAr ? 'نسبة المشاركة:' : 'Turnout:'} {state.electionResults.voterTurnout}%
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {parties.map(party => {
              const seats = currentSeatSource[party.id] || party.seats;
              const voteShare = state.electionResults?.popularVotePercent[party.id] || party.popularity;

              return (
                <div
                  key={party.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: party.color }}
                    ></span>
                    <div>
                      <span className="font-bold text-slate-200">
                        {party.acronym} - {isAr ? party.nameAr : party.nameEn}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {voteShare}% {isAr ? 'من الأصوات المعبر عنها' : 'of popular vote'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-sm text-emerald-400 block">
                      {seats} {isAr ? 'مقعداً' : 'seats'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {((seats / 395) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Post-Election Coalition Builder (5 cols) */}
        <div className="lg:col-span-5 bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{translate(lang, 'elections.coalitionNegotiation')}</span>
            </h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                hasMajority ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {totalCoalitionSeats}/198
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {isAr
              ? 'اختر الأحزاب الشريكة لتشكيل الأغلبية الحكومية (يشترط الدستور المغربي 198 مقعداً على الأقل لتنصيب الحكومة).'
              : 'Select political parties to construct the governing majority (198 seats minimum required by the Moroccan Constitution).'}
          </p>

          <div className="space-y-2">
            {parties.map(p => {
              const isSelected = selectedCoalitionIds.includes(p.id);
              const seats = currentSeatSource[p.id] || p.seats;

              return (
                <div
                  key={p.id}
                  onClick={() => toggleCoalitionParty(p.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-emerald-500 text-white' : 'border border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <span className="font-bold">{p.acronym} - {isAr ? p.nameAr : p.nameEn}</span>
                  </div>

                  <span className="font-mono font-bold text-slate-200">
                    {seats} {isAr ? 'مقعداً' : 'seats'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">{isAr ? 'مجموع مقاعد التحالف:' : 'Total Coalition Seats:'}</span>
              <span className={`text-base font-black ${hasMajority ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalCoalitionSeats} / 395
              </span>
            </div>

            <div className="flex justify-between items-center text-xs bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-slate-400">{isAr ? 'انسجام التحالف الأيديولوجي:' : 'Coalition Harmony:'}</span>
              <span className={`font-black ${
                coalitionHarmony >= 70 ? 'text-emerald-400' : coalitionHarmony >= 55 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {coalitionHarmony}/100
              </span>
            </div>
            {coalitionHarmony < 55 && (
              <p className="text-[11px] text-amber-300 leading-relaxed">
                {isAr
                  ? '⚠️ تحذير: انسجام التحالف ضعيف وسيؤدي إلى توتر داخل الأغلبية وتراجع الاستقرار الحكومي.'
                  : '⚠️ Warning: Low ideological compatibility may cause coalition friction and lower stability.'}
              </p>
            )}

            <button
              disabled={!hasMajority}
              onClick={() => onFormNewGovernment(selectedCoalitionIds)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                hasMajority
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {hasMajority ? translate(lang, 'elections.formGovernment') : (isAr ? 'تحتاج إلى 198 مقعداً على الأقل' : 'Need 198 Seats for Majority')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
