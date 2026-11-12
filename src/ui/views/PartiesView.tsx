import React, { useState } from 'react';
import { Flag, Users, Award, Shield, CheckCircle, Percent } from 'lucide-react';
import { GameState, PoliticalParty } from '../../types/game';
import { translate } from '../../locales/i18n';

interface PartiesViewProps {
  state: GameState;
}

export const PartiesView: React.FC<PartiesViewProps> = ({ state }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const parties = state.parties;
  const [selectedPartyId, setSelectedPartyId] = useState<string>(parties[0].id);

  const selectedParty = parties.find(p => p.id === selectedPartyId) || parties[0];

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-white">
              {translate(lang, 'nav.parties')}
            </h2>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'البيانات الحزبية والبرامج السياسية والتحالفات الإيديولوجية لمجلس النواب'
                : 'Political spectrum, party programs, electoral strongholds, and coalition compatibility'}
            </p>
          </div>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 font-bold text-slate-300">
          9 {isAr ? 'أحزاب برلمانية' : 'Parties'}
        </span>
      </div>

      {/* Grid: Parties List (5 cols) + Party Detail & Manifesto (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Parties List */}
        <div className="lg:col-span-5 space-y-2.5">
          {parties.map(party => {
            const isSelected = party.id === selectedPartyId;

            return (
              <div
                key={party.id}
                onClick={() => setSelectedPartyId(party.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-lg'
                    : 'bg-[#111a2e] border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: party.color }}
                  ></div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {party.acronym} - {isAr ? party.nameAr : party.nameEn}
                    </h3>
                    <span className="text-[11px] text-slate-400 block">
                      {party.economicPosition} • {party.socialPosition}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-emerald-400 block">
                    {party.seats} {isAr ? 'مقعداً' : 'seats'}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      party.isGovernment
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {party.isGovernment ? (isAr ? 'حكومة' : 'Coalition') : (isAr ? 'معارضة' : 'Opposition')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Party Deep Inspection */}
        <div className="lg:col-span-7 bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-xs"
                style={{ backgroundColor: selectedParty.color }}
              >
                {selectedParty.acronym}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {isAr ? selectedParty.nameAr : selectedParty.nameEn}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedParty.ideology.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">{isAr ? 'استطلاعات الرأي' : 'Polling'}</span>
              <span className="text-base font-black text-sky-400">{selectedParty.popularity}%</span>
            </div>
          </div>

          {/* Manifesto / Platform Statement */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              {isAr ? 'البرنامج السياسي والخط العام للمانيفستو:' : 'Political Manifesto & Core Platform:'}
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr ? selectedParty.manifestoAr : selectedParty.manifestoEn}
            </p>
          </div>

          {/* Demographics & Regional Strongholds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">
                {isAr ? 'القاعدة الانتخابية والناخبون:' : 'Core Target Demographics:'}
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedParty.targetDemographics.map(d => (
                  <span
                    key={d}
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]"
                  >
                    {d.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">
                {isAr ? 'المعاقل والجهات القوية:' : 'Regional Strongholds:'}
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedParty.regionalStrongholds.map(r => (
                  <span
                    key={r}
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]"
                  >
                    {r.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Coalition Compatibility Matrix */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">
              {isAr ? 'نسب التوافق والتحالف الحكومي مع باقي الأحزاب:' : 'Coalition Partnership Compatibility:'}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {Object.entries(selectedParty.coalitionCompatibility).map(([pId, compat]) => {
                const other = parties.find(p => p.id === pId);
                if (!other) return null;

                return (
                  <div
                    key={pId}
                    className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-300">{other.acronym}</span>
                    <span
                      className={`font-mono font-bold ${
                        compat >= 70 ? 'text-emerald-400' : compat >= 45 ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {compat}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
