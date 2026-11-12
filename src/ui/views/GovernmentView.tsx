import React, { useState } from 'react';
import {
  Briefcase,
  Shield,
  Users,
  Award,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { GameState, Minister } from '../../types/game';
import { translate } from '../../locales/i18n';
import { PARTY_LEADERS_AND_FIGURES } from '../../simulation/governmentFormation';

interface GovernmentViewProps {
  state: GameState;
  onReshuffle: (portfolio: Minister['portfolio'], newNameEn: string, newNameAr: string, partyId?: string) => void;
}

export const GovernmentView: React.FC<GovernmentViewProps> = ({ state, onReshuffle }) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const gov = state.government;
  const [selectedPortfolio, setSelectedPortfolio] = useState<Minister['portfolio'] | null>(null);
  const [newNameInput, setNewNameInput] = useState('');

  const rulingParty = state.parties.find(p => p.id === gov.rulingPartyId);
  const coalitionIds = Array.from(new Set([gov.rulingPartyId, ...(gov.coalitionPartyIds || [])]));

  const candidateOptions = selectedPortfolio
    ? coalitionIds.flatMap(partyId =>
        (PARTY_LEADERS_AND_FIGURES[partyId]?.prominentFigures || []).map(fig => ({
          ...fig,
          partyId,
          isPreferred: fig.preferredPortfolios.includes(selectedPortfolio)
        }))
      )
    : [];

  const handleConfirmReshuffle = () => {
    if (!selectedPortfolio || !newNameInput.trim()) return;
    onReshuffle(selectedPortfolio, newNameInput.trim(), newNameInput.trim());
    setSelectedPortfolio(null);
    setNewNameInput('');
  };

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner: Head of Government & Stability */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-700 to-sky-700 flex items-center justify-center text-2xl font-black text-white shadow-lg border border-amber-500/30">
            🏛️
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-emerald-400">
              {translate(lang, 'government.primeMinisterOffice')}
            </span>
            <h2 className="text-2xl font-black text-white mt-0.5">{isAr && gov.primeMinisterAr ? gov.primeMinisterAr : gov.primeMinister}</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>
                {isAr ? 'الحزب الحاكم:' : 'Ruling Party:'}{' '}
                <strong className="text-sky-400">{isAr ? rulingParty?.nameAr : rulingParty?.nameEn}</strong>
              </span>
              <span>•</span>
              <span>
                {isAr ? `في المنصب منذ ${gov.monthsInOffice} شهراً` : `In office for ${gov.monthsInOffice} months`}
              </span>
            </p>
          </div>
        </div>

        {/* Stability Rating & Seats */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {translate(lang, 'government.stabilityScore')}
            </span>
            <div
              className={`text-2xl font-black ${
                gov.stability >= 70 ? 'text-emerald-400' : gov.stability >= 45 ? 'text-amber-400' : 'text-rose-500'
              }`}
            >
              {gov.stability}/100
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {isAr ? 'الأغلبية الحكومية' : 'Parliamentary Seats'}
            </span>
            <div className="text-2xl font-black text-emerald-400">
              {gov.parliamentarySeats}
              <span className="text-xs text-slate-500 font-normal">/395</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reshuffle Dialog if open */}
      {selectedPortfolio && (
        <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>{isAr ? 'تعديل وزاري وتعيين وزير جديد' : 'Cabinet Reshuffle Appointment'}</span>
            </h3>
            <button
              onClick={() => setSelectedPortfolio(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

          <div className="space-y-3">
            {candidateOptions.length > 0 && (
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-2">
                  {isAr ? 'مرشحو أحزاب الأغلبية الحكومية:' : 'Coalition Party Candidate Roster:'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {candidateOptions.slice(0, 6).map(cand => {
                    const p = state.parties.find(pt => pt.id === cand.partyId);
                    return (
                      <button
                        key={`${cand.partyId}_${cand.nameEn}`}
                        onClick={() => {
                          onReshuffle(selectedPortfolio, cand.nameEn, cand.nameAr, cand.partyId);
                          setSelectedPortfolio(null);
                          setNewNameInput('');
                        }}
                        className="p-2.5 bg-slate-950 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-start transition-all flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{isAr ? cand.nameAr : cand.nameEn}</div>
                          {cand.isPreferred && (
                            <span className="text-[10px] text-emerald-400">
                              {isAr ? 'كفاءة ملائمة للحقيبة' : 'Portfolio Specialist'}
                            </span>
                          )}
                        </div>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-bold text-white shrink-0"
                          style={{ backgroundColor: p?.color || '#334155' }}
                        >
                          {p?.acronym || cand.partyId.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <input
                type="text"
                value={newNameInput}
                onChange={e => setNewNameInput(e.target.value)}
                placeholder={isAr ? 'أو أدخل اسم شخصية كفاءة مستقلة يدوياً...' : 'Or enter a custom technocrat name...'}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleConfirmReshuffle}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold text-white transition-all shadow-md"
              >
                {isAr ? 'تثبيت التعيين الوزاري' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ministers Portfolios Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-400" />
          <span>{translate(lang, 'government.cabinetTitle')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gov.ministers.map(minister => {
            const party = state.parties.find(p => p.id === minister.partyId);

            return (
              <div
                key={minister.id}
                className="bg-[#111a2e] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-3 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-emerald-400">
                      {isAr ? minister.titleAr : minister.titleEn}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-bold uppercase text-white shrink-0"
                      style={{ backgroundColor: party?.color || '#334155' }}
                    >
                      {party?.acronym || 'IND'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mt-1 flex items-center justify-between gap-2">
                    <span>{isAr ? minister.nameAr : minister.nameEn}</span>
                    {minister.corruptionRisk >= 45 && (
                      <span
                        title={isAr ? 'مخاطر تدبيرية مرتفعة تستوجب الافتحاص' : 'Elevated governance/audit risk'}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold shrink-0"
                      >
                        ⚠️ {minister.corruptionRisk}%
                      </span>
                    )}
                  </h4>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="bg-slate-900/80 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block">{translate(lang, 'government.competence')}</span>
                    <span className="font-bold text-emerald-400">{minister.competence}%</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block">{translate(lang, 'government.loyalty')}</span>
                    <span className="font-bold text-sky-400">{minister.loyalty}%</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block">{translate(lang, 'government.publicApproval')}</span>
                    <span className="font-bold text-amber-400">{minister.publicApproval}%</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPortfolio(minister.portfolio)}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>{translate(lang, 'government.reshuffleCabinet')}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
