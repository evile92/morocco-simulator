import React, { useState, useEffect } from 'react';
import {
  GameState,
  ViewTab,
  Policy,
  Minister,
  FiscalLevers,
  RegionalInterventionType,
  DiplomaticActionType
} from './types/game';
import { getInitialGameState, advanceMonth } from './simulation/engine';
import { simulateBudget, chargeTreasury } from './simulation/budget';
import { simulateParliamentVote } from './simulation/parliament';
import { simulateElection } from './simulation/elections';
import {
  enactPolicyAction,
  resolveCrisisChoiceAction,
  regionalInterventionAction,
  diplomaticAction,
  reshuffleMinisterAction
} from './simulation/actions';
import { saveGameState, loadGameState } from './storage/saveManager';
import { formatGameDate } from './locales/i18n';
import { generateNewCabinet } from './simulation/governmentFormation';

import { TopBar } from './ui/TopBar';
import { CommandDock, StrategicHubId, HUB_SUBTABS } from './ui/CommandDock';
import { StrategicMapCanvas } from './ui/components/StrategicMapCanvas';
import { EncounterModal, EncounterMode, EncounterOutcome } from './ui/components/EncounterModal';
import { CrisisModal } from './ui/components/CrisisModal';
import { AttributionModal } from './ui/components/AttributionModal';
import { CityProtestModal } from './ui/components/CityProtestModal';
import { AiAdvisorModal } from './ui/components/AiAdvisorModal';
import { CustomDecreeModal } from './ui/components/CustomDecreeModal';

import { DashboardView } from './ui/views/DashboardView';
import { MoroccoMapView } from './ui/views/MoroccoMapView';
import { GovernmentView } from './ui/views/GovernmentView';
import { ParliamentView } from './ui/views/ParliamentView';
import { EconomyView } from './ui/views/EconomyView';
import { BudgetView } from './ui/views/BudgetView';
import { SocietyView } from './ui/views/SocietyView';
import { WaterView } from './ui/views/WaterView';
import { RegionsView } from './ui/views/RegionsView';
import { CitiesView } from './ui/views/CitiesView';
import { PartiesView } from './ui/views/PartiesView';
import { ElectionsView } from './ui/views/ElectionsView';
import { ForeignAffairsView } from './ui/views/ForeignAffairsView';
import { DecisionsView } from './ui/views/DecisionsView';
import { NewsView } from './ui/views/NewsView';
import { StatisticsView } from './ui/views/StatisticsView';
import { HistoryView } from './ui/views/HistoryView';
import { SettingsView } from './ui/views/SettingsView';
import { X, Map, Award, RotateCcw, Play } from 'lucide-react';

function getHubForTab(tab: ViewTab): StrategicHubId {
  if (['government', 'parliament', 'parties', 'elections'].includes(tab)) return 'governance';
  if (['budget', 'decisions', 'economy'].includes(tab)) return 'economy_policy';
  if (['water', 'regions', 'cities'].includes(tab)) return 'infrastructure';
  if (['foreign', 'society'].includes(tab)) return 'sovereignty';
  if (['dashboard', 'statistics', 'news', 'history', 'settings'].includes(tab)) return 'intel_archives';
  return 'map_canvas';
}

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadGameState('autosave');
    return saved || getInitialGameState();
  });

  // Start on the Full-Screen Interactive Map Canvas by default
  const [activeHub, setActiveHub] = useState<StrategicHubId>('map_canvas');
  const [activeCrisisId, setActiveCrisisId] = useState<string | null>(null);
  const [selectedProtestId, setSelectedProtestId] = useState<string | null>(null);
  const [showAiAdvisor, setShowAiAdvisor] = useState<boolean>(false);
  const [showCustomDecree, setShowCustomDecree] = useState<boolean>(false);
  const [showAttribution, setShowAttribution] = useState<boolean>(false);
  const [encounterMode, setEncounterMode] = useState<EncounterMode | null>(null);
  const [voteNotice, setVoteNotice] = useState<{ text: string; passed: boolean } | null>(null);

  // Sync document RTL / LTR direction with state language
  useEffect(() => {
    const isAr = gameState.language === 'ar';
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = gameState.language;
  }, [gameState.language]);

  // Simulation timer loop
  useEffect(() => {
    if (gameState.isPaused) return;

    const intervalMs = gameState.gameSpeed === 'fast' ? 1400 : 3200;
    const timer = setInterval(() => {
      setGameState(prev => {
        const next = advanceMonth(prev, 1);
        saveGameState('autosave', next);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [gameState.isPaused, gameState.gameSpeed]);

  const navigateToTab = (tab: ViewTab) => {
    if (tab === 'map') {
      setActiveHub('map_canvas');
      setGameState(prev => ({ ...prev, activeTab: 'map' }));
    } else {
      setActiveHub(getHubForTab(tab));
      setGameState(prev => ({ ...prev, activeTab: tab }));
    }
  };

  const handleSelectHub = (hub: StrategicHubId, defaultTab?: ViewTab) => {
    if (hub === 'map_canvas') {
      setActiveHub('map_canvas');
    } else if (activeHub === hub) {
      // Clicking the already open hub toggles back to the unobstructed Map Canvas
      setActiveHub('map_canvas');
    } else {
      setActiveHub(hub);
      if (defaultTab) {
        setGameState(prev => ({ ...prev, activeTab: defaultTab }));
      }
    }
  };

  // Handler to advance time manually
  const handleAdvance = (months: number) => {
    setGameState(prev => {
      const next = advanceMonth(prev, months);
      saveGameState('autosave', next);
      return next;
    });
  };

  const handleTogglePause = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleToggleSpeed = () => {
    setGameState(prev => ({
      ...prev,
      gameSpeed: prev.gameSpeed === 'normal' ? 'fast' : 'normal'
    }));
  };

  const handleToggleLanguage = () => {
    setGameState(prev => ({
      ...prev,
      language: prev.language === 'ar' ? 'en' : 'ar'
    }));
  };

  const handleQuickSave = () => {
    saveGameState('slot_1', gameState);
    setVoteNotice({
      text: gameState.language === 'ar' ? 'تم حفظ اللعبة في الخانة 1 بنجاح!' : 'Game quick-saved to Slot 1!',
      passed: true
    });
    setTimeout(() => setVoteNotice(null), 3000);
  };

  // Live Fiscal Sliders Update Handler
  const handleUpdateFiscalLevers = (levers: FiscalLevers) => {
    const isAr = gameState.language === 'ar';
    const formattedDate = formatGameDate(gameState.currentMonth, gameState.currentYear, gameState.language);

    setGameState(prev => {
      const activePolicies = prev.policies.filter(p => p.implemented);
      const budgetWithLevers = { ...prev.budget, fiscalLevers: levers };
      const { nextBudget } = simulateBudget(budgetWithLevers, prev.economy, activePolicies, prev.gameMode);

      const record = {
        id: `fiscal_law_${Date.now()}`,
        month: prev.currentMonth,
        year: prev.currentYear,
        date: formattedDate,
        titleEn: `Amended Finance Law (IS: ${levers.corporateTaxRatePercent}%, IR: ${levers.incomeTaxRatePercent}%, TVA: ${levers.vatRatePercent}%)`,
        titleAr: `تعديل قانون المالية (ضريبة الشركات ${levers.corporateTaxRatePercent}%، الدخل ${levers.incomeTaxRatePercent}%، المقاصة ${levers.maqassaSubsidyBillionMAD} مليار)`,
        type: 'budget_reform' as const,
        costBillionMAD: 0,
        immediateEffectsEn: `Projected monthly balance adjusted to ${nextBudget.monthlyBalance.toFixed(1)}B MAD.`,
        immediateEffectsAr: `تحديث الموازين الجبائية وميزانيات القطاعات؛ الرصيد الشهري المتوقع: ${nextBudget.monthlyBalance.toFixed(1)} مليار درهم.`
      };

      return {
        ...prev,
        budget: {
          ...nextBudget,
          publicDebtBillionMAD: prev.budget.publicDebtBillionMAD,
          treasuryReservesBillionMAD: prev.budget.treasuryReservesBillionMAD
        },
        decisionHistory: [record, ...prev.decisionHistory]
      };
    });

    setVoteNotice({
      text: isAr
        ? 'تم اعتماد قانون المالية التعديلي وتحيين منزلقات الضرائب والإنفاق!'
        : 'Amended Finance Law & Policy Sliders enacted!',
      passed: true
    });
    setTimeout(() => setVoteNotice(null), 4000);
  };

  const showToastNotice = (textAr: string, textEn: string, passed: boolean, durationMs = 4000) => {
    setVoteNotice({
      text: gameState.language === 'ar' ? textAr : textEn,
      passed
    });
    setTimeout(() => setVoteNotice(null), durationMs);
  };

  // Direct Regional Intervention Handler from Map Inspector
  const handleRegionalIntervention = (regionId: string, actionType: RegionalInterventionType) => {
    const result = regionalInterventionAction(gameState, regionId, actionType);
    if (result.notice.passed) {
      setGameState(result.state);
    }
    showToastNotice(result.notice.textAr, result.notice.textEn, result.notice.passed, 3500);
  };

  // Interactive Encounter Resolution Handler (Press / Unions / Cabinet)
  const handleResolveEncounter = (outcome: EncounterOutcome) => {
    const isAr = gameState.language === 'ar';
    const cooldownKey = `enc_${outcome.mode}`;
    if ((gameState.actionCooldowns?.[cooldownKey] || 0) > 0) {
      showToastNotice(
        'تم عقد هذا اللقاء بالفعل خلال الشهر الجاري — تقدّم لشهر جديد أولاً.',
        'This encounter has already been held this month — advance time before repeating.',
        false
      );
      return;
    }

    const preCheck = chargeTreasury(gameState.budget, outcome.costBillionMAD, gameState.gameMode, false);
    if (!preCheck.ok) {
      showToastNotice(
        `احتياطي الخزينة غير كافٍ لتغطية تعهد هذا اللقاء (${outcome.costBillionMAD} مليار درهم).`,
        `Insufficient treasury reserves for this commitment (${outcome.costBillionMAD}B MAD).`,
        false
      );
      return;
    }

    const formattedDate = formatGameDate(gameState.currentMonth, gameState.currentYear, gameState.language);

    setGameState(prev => {
      const treasuryCheck = chargeTreasury(prev.budget, outcome.costBillionMAD, prev.gameMode, false);
      if (!treasuryCheck.ok) return prev;

      const newApproval = Math.max(10, Math.min(95, Number((prev.government.approvalRating + outcome.approvalDelta).toFixed(1))));
      const newStability = Math.max(10, Math.min(95, Number((prev.government.stability + outcome.stabilityDelta).toFixed(1))));

      const updatedRegions = prev.regions.map(r => ({
        ...r,
        socialTension: Math.max(8, Math.min(95, Number((r.socialTension + outcome.tensionDelta * 0.7).toFixed(1)))),
        satisfaction: Math.max(12, Math.min(95, Number((r.satisfaction + outcome.approvalDelta * 0.6).toFixed(1))))
      }));

      const record = {
        id: `enc_${outcome.mode}_${Date.now()}`,
        month: prev.currentMonth,
        year: prev.currentYear,
        date: formattedDate,
        titleEn: outcome.titleEn,
        titleAr: outcome.titleAr,
        type: 'policy' as const,
        costBillionMAD: outcome.costBillionMAD,
        immediateEffectsEn: outcome.summaryEn,
        immediateEffectsAr: outcome.summaryAr
      };

      const newsBulletin = {
        id: `news_enc_${Date.now()}`,
        date: formattedDate,
        month: prev.currentMonth,
        year: prev.currentYear,
        category: 'politics' as const,
        headlineEn: outcome.titleEn,
        headlineAr: outcome.titleAr,
        summaryEn: outcome.summaryEn,
        summaryAr: outcome.summaryAr,
        impact: (outcome.approvalDelta >= 0 ? 'positive' : 'negative') as 'positive' | 'negative'
      };

      return {
        ...prev,
        regions: updatedRegions,
        budget: treasuryCheck.nextBudget,
        government: {
          ...prev.government,
          approvalRating: newApproval,
          stability: newStability
        },
        actionCooldowns: {
          ...(prev.actionCooldowns || {}),
          [cooldownKey]: 1
        },
        decisionHistory: [record, ...prev.decisionHistory],
        newsFeed: [newsBulletin, ...prev.newsFeed]
      };
    });

    setEncounterMode(null);
    setVoteNotice({
      text: isAr ? outcome.titleAr : outcome.titleEn,
      passed: outcome.approvalDelta >= 0
    });
    setTimeout(() => setVoteNotice(null), 4000);
  };

  // Enact Policy with parliamentary vote check (handles both catalog & custom decrees)
  const handleEnactPolicy = (policy: Policy) => {
    const formattedDate = formatGameDate(gameState.currentMonth, gameState.currentYear, gameState.language);
    const vote = policy.requiresParliamentApproval
      ? simulateParliamentVote(policy, gameState.parties, gameState.government.approvalRating, formattedDate)
      : undefined;

    const result = enactPolicyAction(gameState, policy, vote);
    setGameState(result.state);
    showToastNotice(result.notice.textAr, result.notice.textEn, result.notice.passed, vote ? 5000 : 4000);
  };

  // Resolve Crisis Choice (applies full CrisisChoice effects)
  const handleResolveCrisisChoice = (crisisId: string, choiceId: string) => {
    const isSnapElection = crisisId.startsWith('motion_no_confidence_') && choiceId === 'concede_early_elections';
    if (isSnapElection) {
      setActiveHub('governance');
    }

    setGameState(prev => resolveCrisisChoiceAction(prev, crisisId, choiceId));
    setActiveCrisisId(null);
  };

  // Resolve City-Level Protest Action
  const handleResolveProtestAction = (
    protestId: string,
    actionType: 'dialogue' | 'grant_demands' | 'partial_aid' | 'police_enforce',
    customFeedback?: string
  ) => {
    const protest = (gameState.activeCityProtests || []).find(p => p.id === protestId);
    if (!protest) return;

    const formattedDate = formatGameDate(gameState.currentMonth, gameState.currentYear, gameState.language);

    let cost = 0.05;
    let tensionDelta = -3.0;
    let approvalDelta = 2.0;
    let actionTitleAr = 'فتح حوار وتفاوض مباشر';
    let actionTitleEn = 'Official Dialogue Opened';

    if (actionType === 'grant_demands') {
      cost = 0.60;
      tensionDelta = -8.0;
      approvalDelta = 4.5;
      actionTitleAr = 'الاستجابة للمطالب وتخصيص ميزانية استعجالية';
      actionTitleEn = 'Demands Fully Granted & Budget Allocated';
    } else if (actionType === 'partial_aid') {
      cost = 0.25;
      tensionDelta = -4.5;
      approvalDelta = 2.5;
      actionTitleAr = 'إقرار حزمة دعم وتنازلات جزئية';
      actionTitleEn = 'Partial Aid & Concessions Granted';
    } else if (actionType === 'police_enforce') {
      cost = 0.02;
      tensionDelta = 5.0;
      approvalDelta = -3.5;
      actionTitleAr = 'رفض المطالب والتدخل الأمني';
      actionTitleEn = 'Security Dispersal Executed';
    }

    setGameState(prev => {
      const updatedProtests = (prev.activeCityProtests || []).filter(p => p.id !== protestId);
      const updatedRegions = prev.regions.map(r => {
        if (r.id === protest.regionId) {
          return {
            ...r,
            socialTension: Math.max(10, Math.min(95, Number((r.socialTension + tensionDelta).toFixed(1)))),
            satisfaction: Math.max(15, Math.min(95, Number((r.satisfaction + approvalDelta).toFixed(1))))
          };
        }
        return r;
      });

      const updatedCities = prev.cities.map(c => {
        if (c.id === protest.cityId) {
          return {
            ...c,
            socialTension: Math.max(10, Math.min(95, Number((c.socialTension + tensionDelta * 1.5).toFixed(1)))),
            satisfaction: Math.max(15, Math.min(95, Number((c.satisfaction + approvalDelta * 1.5).toFixed(1))))
          };
        }
        return c;
      });

      const { nextBudget } = chargeTreasury(prev.budget, cost, prev.gameMode, true);
      const newApproval = Math.max(10, Math.min(95, Number((prev.government.approvalRating + approvalDelta).toFixed(1))));

      const record = {
        id: `dec_protest_${Date.now()}`,
        month: prev.currentMonth,
        year: prev.currentYear,
        date: formattedDate,
        titleEn: `${actionTitleEn}: ${protest.cityNameEn}`,
        titleAr: `${actionTitleAr}: ${protest.cityNameAr}`,
        type: 'crisis_resolution' as const,
        costBillionMAD: cost,
        immediateEffectsEn: customFeedback || `Tension ${tensionDelta > 0 ? '+' : ''}${tensionDelta}, Approval ${approvalDelta > 0 ? '+' : ''}${approvalDelta}%`,
        immediateEffectsAr: customFeedback || `تغير الاحتقان: ${tensionDelta > 0 ? '+' : ''}${tensionDelta}، تغير الرضا: ${approvalDelta > 0 ? '+' : ''}${approvalDelta}%`
      };

      const newsBulletin = {
        id: `news_res_${Date.now()}`,
        date: formattedDate,
        month: prev.currentMonth,
        year: prev.currentYear,
        category: 'society' as const,
        headlineEn: `Resolution in ${protest.cityNameEn}: ${actionTitleEn}`,
        headlineAr: `تطورات الأوضاع بـ ${protest.cityNameAr}: ${actionTitleAr}`,
        summaryEn: customFeedback || `Government executed policy response to civic demands in ${protest.cityNameEn}.`,
        summaryAr: customFeedback || `الحكومة تصدر قراراتها الميدانية استجابة لمطالب واحتجاجات ساكنة ${protest.cityNameAr}.`,
        regionId: protest.regionId,
        impact: (tensionDelta <= 0 ? 'positive' : 'negative') as 'positive' | 'negative'
      };

      return {
        ...prev,
        activeCityProtests: updatedProtests,
        regions: updatedRegions,
        cities: updatedCities,
        budget: nextBudget,
        government: { ...prev.government, approvalRating: newApproval },
        decisionHistory: [record, ...prev.decisionHistory],
        newsFeed: [newsBulletin, ...prev.newsFeed]
      };
    });

    setSelectedProtestId(null);
  };

  // Reshuffle Minister
  const handleReshuffleMinister = (
    portfolio: Minister['portfolio'],
    newNameEn: string,
    newNameAr: string,
    partyId?: string
  ) => {
    setGameState(prev => reshuffleMinisterAction(prev, portfolio, newNameEn, newNameAr, partyId));
    showToastNotice('تم إجراء التعديل الحكومي بنجاح!', 'Ministerial reshuffle completed!', true, 3000);
  };

  // Conduct General Election
  const handleConductElection = () => {
    const electionResults = simulateElection(
      gameState.parties,
      gameState.regions,
      gameState.demographics,
      gameState.economy,
      gameState.government.approvalRating
    );

    setGameState(prev => {
      const updatedParties = prev.parties.map(p => ({
        ...p,
        seats: electionResults.seatsPerParty[p.id] || p.seats,
        popularity: electionResults.popularVotePercent[p.id] || p.popularity
      }));

      return {
        ...prev,
        parties: updatedParties,
        pendingElection: false,
        electionResults,
        government: {
          ...prev.government,
          lastElectionMonth: prev.elapsedMonths,
          nextScheduledElectionMonth: prev.elapsedMonths + 60
        },
        activeTab: 'elections'
      };
    });
  };

  // Form New Government after election
  const handleFormNewGovernment = (coalitionPartyIds: string[]) => {
    setGameState(prev => {
      const seatSource = prev.electionResults?.seatsPerParty || Object.fromEntries(prev.parties.map(p => [p.id, p.seats]));
      const totalSeats = coalitionPartyIds.reduce((sum, id) => sum + (seatSource[id] || 0), 0);

      const updatedParties = prev.parties.map(p => ({
        ...p,
        isGovernment: coalitionPartyIds.includes(p.id)
      }));

      const rulingPartyId = coalitionPartyIds[0] || prev.government.rulingPartyId;
      const newCabinet = generateNewCabinet(rulingPartyId, coalitionPartyIds);
      const formattedDate = formatGameDate(prev.currentMonth, prev.currentYear, prev.language);

      const record = {
        id: `gov_form_${Date.now()}`,
        month: prev.currentMonth,
        year: prev.currentYear,
        date: formattedDate,
        titleEn: `Inauguration of New Government led by ${newCabinet.primeMinisterEn} (${totalSeats}/395 seats)`,
        titleAr: `تنصيب الحكومة الجديدة برئاسة ${newCabinet.primeMinisterAr} بحزام أغلبي (${totalSeats}/395 مقعداً)`,
        type: 'reshuffle' as const,
        costBillionMAD: 0,
        immediateEffectsEn: `Government coalition formed with ${totalSeats} seats. Prime Minister ${newCabinet.primeMinisterEn} and new cabinet formally invested.`,
        immediateEffectsAr: `تم تنصيب رئيس الحكومة ${newCabinet.primeMinisterAr} والتشكيلة الوزارية الجديدة رسمياً بحزام أغلبي يضم ${totalSeats} مقعداً بمجلس النواب.`
      };

      return {
        ...prev,
        parties: updatedParties,
        government: {
          ...prev.government,
          primeMinister: newCabinet.primeMinisterEn,
          primeMinisterAr: newCabinet.primeMinisterAr,
          rulingPartyId,
          coalitionPartyIds,
          ministers: newCabinet.ministers,
          parliamentarySeats: totalSeats,
          stability: 88,
          approvalRating: Math.min(92, Math.max(52, prev.government.approvalRating + 10)),
          publicTrust: Math.min(90, Math.max(50, prev.government.publicTrust + 8)),
          monthsInOffice: 0,
          voteOfNoConfidenceWarning: false
        },
        decisionHistory: [record, ...prev.decisionHistory],
        electionResults: undefined,
        activeTab: 'government'
      };
    });
  };

  // Diplomatic Action Handler
  const handleDiplomaticAction = (countryId: string, actionType: DiplomaticActionType) => {
    const result = diplomaticAction(gameState, countryId, actionType);
    if (result.notice.passed) {
      setGameState(result.state);
    }
    showToastNotice(result.notice.textAr, result.notice.textEn, result.notice.passed, 4000);
  };

  // Reset Game to initial state
  const handleResetGame = () => {
    if (confirm(gameState.language === 'ar' ? 'هل أنت متأكد من رغبتك في إعادة ضبط اللعبة إلى يناير 2026؟' : 'Are you sure you want to reset the simulation to January 2026?')) {
      const initial = getInitialGameState();
      setGameState(initial);
      saveGameState('autosave', initial);
      setActiveHub('map_canvas');
    }
  };

  const activeCrisis = activeCrisisId
    ? gameState.activeCrises.find(c => c.id === activeCrisisId) || null
    : null;

  const selectedProtest = (gameState.activeCityProtests || []).find(p => p.id === selectedProtestId);
  const isAr = gameState.language === 'ar';

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050a14] text-slate-100 relative font-sans">
      {/* Vote / Action Notice Toast */}
      {voteNotice && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-black transition-all flex items-center gap-2 backdrop-blur-xl ${
            voteNotice.passed
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/95 border-rose-500 text-rose-200'
          }`}
        >
          <span>{voteNotice.text}</span>
        </div>
      )}

      {/* 1. FLOATING TOP GRAND STRATEGY HUD */}
      <TopBar
        state={gameState}
        onAdvance={handleAdvance}
        onTogglePause={handleTogglePause}
        onToggleSpeed={handleToggleSpeed}
        onToggleLanguage={handleToggleLanguage}
        onQuickSave={handleQuickSave}
        onOpenAiAdvisor={() => setShowAiAdvisor(true)}
        onOpenCustomDecree={() => setShowCustomDecree(true)}
        onOpenAttribution={() => setShowAttribution(true)}
      />

      {/* 2. PERMANENT FULL-SCREEN INTERACTIVE MOROCCO MAP CANVAS */}
      <StrategicMapCanvas
        state={gameState}
        onSelectCrisis={id => setActiveCrisisId(id)}
        onSelectProtest={id => setSelectedProtestId(id)}
        onRegionalIntervention={handleRegionalIntervention}
        onOpenEncounter={mode => setEncounterMode(mode)}
        onOpenCustomDecree={() => setShowCustomDecree(true)}
        onOpenAiAdvisor={() => setShowAiAdvisor(true)}
      />

      {/* 3. FLOATING GLASSMORPHIC COMMAND DRAWER (When a Strategic Hub is active) */}
      {activeHub !== 'map_canvas' && (
        <div className="fixed top-20 bottom-20 left-4 right-4 md:left-10 md:right-10 z-30 bg-slate-950/92 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-[0_25px_90px_rgba(0,0,0,0.92)] flex flex-col overflow-hidden transition-all">
          {/* Drawer Sub-Navigation Header */}
          <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2">
              {HUB_SUBTABS[activeHub].map(sub => {
                const isSubActive = gameState.activeTab === sub.tab;
                return (
                  <button
                    key={sub.tab}
                    onClick={() => setGameState(prev => ({ ...prev, activeTab: sub.tab }))}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                      isSubActive
                        ? 'bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-md'
                        : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {sub.icon}
                    <span>{isAr ? sub.labelAr : sub.labelEn}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setActiveHub('map_canvas')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
            >
              <Map className="w-3.5 h-3.5" />
              <span>{isAr ? 'العودة للخريطة' : 'Return to Map'}</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Scrollable View Content */}
          <div className="flex-1 overflow-y-auto">
            {gameState.activeTab === 'dashboard' && (
              <DashboardView
                state={gameState}
                onNavigate={navigateToTab}
                onOpenAttribution={() => setShowAttribution(true)}
                onSelectCrisis={id => setActiveCrisisId(id)}
                onSelectProtest={id => setSelectedProtestId(id)}
                onOpenAiAdvisor={() => setShowAiAdvisor(true)}
                onOpenCustomDecree={() => setShowCustomDecree(true)}
              />
            )}

            {gameState.activeTab === 'map' && (
              <MoroccoMapView
                state={gameState}
                onSelectProtest={id => setSelectedProtestId(id)}
              />
            )}

            {gameState.activeTab === 'government' && (
              <GovernmentView
                state={gameState}
                onReshuffle={handleReshuffleMinister}
              />
            )}

            {gameState.activeTab === 'parliament' && (
              <ParliamentView
                state={gameState}
                onNavigateToDecisions={() => navigateToTab('decisions')}
              />
            )}

            {gameState.activeTab === 'economy' && (
              <EconomyView state={gameState} />
            )}

            {gameState.activeTab === 'budget' && (
              <BudgetView
                state={gameState}
                onUpdateFiscalLevers={handleUpdateFiscalLevers}
              />
            )}

            {gameState.activeTab === 'society' && (
              <SocietyView
                state={gameState}
                onOpenCrisisModal={id => setActiveCrisisId(id)}
              />
            )}

            {gameState.activeTab === 'water' && (
              <WaterView
                state={gameState}
                onNavigateToDecisions={() => navigateToTab('decisions')}
              />
            )}

            {gameState.activeTab === 'regions' && (
              <RegionsView state={gameState} />
            )}

            {gameState.activeTab === 'cities' && (
              <CitiesView state={gameState} />
            )}

            {gameState.activeTab === 'parties' && (
              <PartiesView state={gameState} />
            )}

            {gameState.activeTab === 'elections' && (
              <ElectionsView
                state={gameState}
                onConductElection={handleConductElection}
                onFormNewGovernment={handleFormNewGovernment}
              />
            )}

            {gameState.activeTab === 'foreign' && (
              <ForeignAffairsView
                state={gameState}
                onDiplomaticAction={handleDiplomaticAction}
              />
            )}

            {gameState.activeTab === 'decisions' && (
              <DecisionsView
                state={gameState}
                onEnactPolicy={handleEnactPolicy}
              />
            )}

            {gameState.activeTab === 'news' && (
              <NewsView state={gameState} />
            )}

            {gameState.activeTab === 'statistics' && (
              <StatisticsView state={gameState} />
            )}

            {gameState.activeTab === 'history' && (
              <HistoryView state={gameState} />
            )}

            {gameState.activeTab === 'settings' && (
              <SettingsView
                state={gameState}
                onUpdateState={setGameState}
                onResetGame={handleResetGame}
              />
            )}
          </div>
        </div>
      )}

      {/* 4. BOTTOM STRATEGIC COMMAND DOCK */}
      <CommandDock
        activeHub={activeHub}
        activeTab={gameState.activeTab}
        state={gameState}
        onSelectHub={handleSelectHub}
        onOpenEncounter={() => setEncounterMode('press')}
      />

      {/* 5. INTERACTIVE MODALS */}
      {encounterMode && (
        <EncounterModal
          state={gameState}
          initialMode={encounterMode}
          onClose={() => setEncounterMode(null)}
          onResolveEncounter={handleResolveEncounter}
        />
      )}

      {activeCrisis && (
        <CrisisModal
          crisis={activeCrisis}
          lang={gameState.language}
          state={gameState}
          onSelectChoice={choiceId => handleResolveCrisisChoice(activeCrisis.id, choiceId)}
          onDismiss={() => setActiveCrisisId(null)}
        />
      )}

      {showAttribution && (
        <AttributionModal
          attributions={gameState.monthlyAttributions}
          lang={gameState.language}
          onClose={() => setShowAttribution(false)}
        />
      )}

      {selectedProtest && (
        <CityProtestModal
          protest={selectedProtest}
          state={gameState}
          onClose={() => setSelectedProtestId(null)}
          onResolveAction={handleResolveProtestAction}
        />
      )}

      {showAiAdvisor && (
        <AiAdvisorModal
          state={gameState}
          onClose={() => setShowAiAdvisor(false)}
        />
      )}

      {showCustomDecree && (
        <CustomDecreeModal
          state={gameState}
          onClose={() => setShowCustomDecree(false)}
          onEnactPolicy={handleEnactPolicy}
        />
      )}

      {gameState.gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-5 text-slate-100">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    {isAr ? gameState.gameOver.titleAr : gameState.gameOver.titleEn}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr
                      ? `المدة المنجزة: ${gameState.gameOver.monthsServed} شهراً`
                      : `Tenure served: ${gameState.gameOver.monthsServed} months`}
                  </p>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-600 flex flex-col items-center justify-center text-white shadow-lg shrink-0">
                <span className="text-[10px] font-bold uppercase opacity-90">{isAr ? 'التقييم' : 'Grade'}</span>
                <span className="text-2xl font-black leading-none">{gameState.gameOver.grade}</span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {isAr ? gameState.gameOver.descriptionAr : gameState.gameOver.descriptionEn}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400">{isAr ? 'الرضا النهائي' : 'Final Approval'}</div>
                <div className="text-lg font-black text-emerald-400">{gameState.gameOver.finalApproval.toFixed(1)}%</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400">{isAr ? 'الاستقرار' : 'Stability'}</div>
                <div className="text-lg font-black text-sky-400">{gameState.gameOver.finalStability}/100</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400">{isAr ? 'متوسط النمو' : 'Avg Growth'}</div>
                <div className="text-lg font-black text-amber-400">{gameState.gameOver.gdpGrowthAvg}%</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] text-slate-400">{isAr ? 'الأهداف الاستراتيجية' : 'Goals Met'}</div>
                <div className="text-lg font-black text-purple-400">
                  {gameState.gameOver.goalsCompleted}/{gameState.gameOver.goalsTotal}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-800">
              {gameState.gameOver.reason === 'term_completed' && (
                <button
                  onClick={() =>
                    setGameState(prev => ({
                      ...prev,
                      gameOver: null,
                      executedOneTimeActions: [...(prev.executedOneTimeActions || []), 'endless_mode_unlocked']
                    }))
                  }
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4" />
                  <span>{isAr ? 'متابعة الولاية المفتوحة (اللعب المستمر)' : 'Continue Endless Governance'}</span>
                </button>
              )}
              <button
                onClick={() => {
                  const initial = getInitialGameState();
                  setGameState(initial);
                  saveGameState('autosave', initial);
                  setActiveHub('map_canvas');
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isAr ? 'بدء ولاية حكومية جديدة' : 'Start New Mandate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
