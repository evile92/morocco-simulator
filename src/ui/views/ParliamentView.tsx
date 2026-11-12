import React from 'react';
import {
  Landmark,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  FileText
} from 'lucide-react';
import { GameState, PoliticalParty } from '../../types/game';
import { translate } from '../../locales/i18n';

interface ParliamentViewProps {
  state: GameState;
  onNavigateToDecisions: () => void;
}

export const ParliamentView: React.FC<ParliamentViewProps> = ({ state, onNavigateToDecisions }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const parties = state.parties;
  const gov = state.government;

  const govParties = parties.filter(p => p.isGovernment);
  const oppParties = parties.filter(p => !p.isGovernment);

  const govSeats = govParties.reduce((a, b) => a + b.seats, 0);
  const oppSeats = oppParties.reduce((a, b) => a + b.seats, 0);
  const majorityThreshold = 198;

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner: Hemicycle Overview */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Landmark className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {translate(lang, 'parliament.title')}
              </h2>
              <p className="text-xs text-slate-400">
                {translate(lang, 'parliament.seatsCount')} •{' '}
                <span className="text-emerald-400 font-semibold">{translate(lang, 'parliament.majorityThreshold')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-950/40 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                {translate(lang, 'parliament.governmentBench')}
              </span>
              <span className="text-lg font-black text-emerald-300">{govSeats}</span>
            </div>
            <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                {translate(lang, 'parliament.oppositionBench')}
              </span>
              <span className="text-lg font-black text-slate-300">{oppSeats}</span>
            </div>
          </div>
        </div>

        {/* Visual Hemicycle Bar Representation */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>
              {isAr ? 'الأغلبية الحكومية (270)' : 'Government Coalition (270)'}
            </span>
            <span className="text-amber-400 font-bold">
              {isAr ? 'العتبة المطلوبة: 198 مقعداً' : '198 Majority Line'}
            </span>
            <span>
              {isAr ? 'المعارضة (125)' : 'Opposition (125)'}
            </span>
          </div>

          {/* Bar with parties */}
          <div className="h-6 w-full rounded-xl bg-slate-950 p-1 flex items-center gap-0.5 border border-slate-800 overflow-hidden">
            {parties.map(party => {
              const widthPct = (party.seats / 395) * 100;
              return (
                <div
                  key={party.id}
                  style={{ width: `${widthPct}%`, backgroundColor: party.color }}
                  className="h-full rounded-sm hover:opacity-90 transition-all cursor-pointer relative group"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-20">
                    {party.acronym}: {party.seats} {isAr ? 'مقعداً' : 'seats'} ({isAr ? party.nameAr : party.nameEn})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Columns: Parties Breakdown + Recent Legislative Votes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parties Parliamentary Strength (7 cols) */}
        <div className="lg:col-span-7 bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
            <span>{isAr ? 'توزيع المقاعد حسب الفرق والكتل النيابية' : 'Parliamentary Party Caucuses'}</span>
            <span className="text-xs text-slate-400 font-normal">9 {isAr ? 'أحزاب ممثلة' : 'Parties'}</span>
          </h3>

          <div className="space-y-2.5">
            {parties.map(party => {
              const share = ((party.seats / 395) * 100).toFixed(1);

              return (
                <div
                  key={party.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
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
                      <span className="block text-[11px] text-slate-400">
                        {party.economicPosition} • {party.socialPosition}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        party.isGovernment
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {party.isGovernment ? (isAr ? 'أغلبية' : 'Coalition') : (isAr ? 'معارضة' : 'Opposition')}
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-100 w-12 text-right">
                      {party.seats} <span className="text-[10px] text-slate-500">({share}%)</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legislative Votes History (5 cols) */}
        <div className="lg:col-span-5 bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'سجل عمليات التصويت التشريعي' : 'Legislative Vote Ledger'}</span>
            </h3>
            <button
              onClick={onNavigateToDecisions}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              {isAr ? 'المراسيم ←' : 'Decrees →'}
            </button>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {state.parliamentaryVotes.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'لم يتم عرض أي مشروع قانون يستلزم تصويت البرلمان بعد.'
                    : 'No legislative bills submitted to parliamentary ballot yet.'}
                </p>
                <button
                  onClick={onNavigateToDecisions}
                  className="px-3 py-1.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold"
                >
                  {isAr ? 'تصفح مشاريع القوانين' : 'Browse Legislative Decrees'}
                </button>
              </div>
            ) : (
              state.parliamentaryVotes.map(vote => (
                <div
                  key={vote.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-200">
                      {isAr ? vote.titleAr : vote.titleEn}
                    </h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                        vote.passed
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {vote.passed ? (isAr ? 'مصادق عليه' : 'Passed') : (isAr ? 'مرفوض' : 'Rejected')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span className="text-emerald-400 font-semibold">
                      {isAr ? 'الموافقون' : 'Ayes'}: {vote.ayes}
                    </span>
                    <span className="text-rose-400 font-semibold">
                      {isAr ? 'المعارضون' : 'Nays'}: {vote.nays}
                    </span>
                    <span className="text-slate-500">
                      {isAr ? 'الممتنعون' : 'Abstentions'}: {vote.abstentions}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
