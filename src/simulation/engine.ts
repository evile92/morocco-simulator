import {
  GameState,
  NewsItem,
  HistoricalSnapshot,
  Policy,
  PoliticalParty,
  DamStatus,
  StrategicGoal,
  GameOverSummary
} from '../types/game';

import partiesData from '../data/parties.json';
import regionsData from '../data/regions.json';
import citiesData from '../data/cities.json';
import countriesData from '../data/countries.json';
import demographicsData from '../data/demographics.json';
import policiesData from '../data/policies.json';
import ministersData from '../data/ministers.json';
import moroccoApiData from '../data/moroccoApiData.json';

import { simulateEconomy } from './economy';
import { simulateWater } from './water';
import { simulateBudget, DEFAULT_FISCAL_LEVERS } from './budget';
import { simulateOpinion } from './opinion';
import { calculateNationalTension, checkForTriggeredCrises, checkForTriggeredCityProtests } from './tension';
import { calculateGovernmentStability } from './government';
import { simulateForeignRelations } from './foreign';
import { generateAttributions } from './attribution';
import { formatGameDate } from '../locales/i18n';

/**
 * Evaluates national 5-year strategic goals based on live state indicators.
 */
export function evaluateStrategicGoals(state: Pick<GameState, 'water' | 'budget' | 'economy' | 'government'>): StrategicGoal[] {
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  const waterPct = Math.max(
    (state.water.overallDamFillRate / 45) * 100,
    ((state.water.desalinationDailyM3 - 350000) / 200000) * 100
  );
  const waterDone = state.water.overallDamFillRate >= 45 || state.water.desalinationDailyM3 >= 550000;

  const fiscalBalanceOk = state.budget.monthlyBalance >= -2.5;
  const debtOk = state.budget.debtToGdpRatio <= 68;
  const fiscalPct =
    (state.budget.monthlyBalance >= -2.5 ? 50 : Math.max(0, 50 - Math.abs(state.budget.monthlyBalance + 2.5) * 6)) +
    (state.budget.debtToGdpRatio <= 68 ? 50 : Math.max(0, 50 - (state.budget.debtToGdpRatio - 68) * 5));

  const youthJobProgress = ((35 - state.economy.youthUnemploymentRate) / (35 - 25)) * 100;
  const youthDone = state.economy.youthUnemploymentRate <= 25;

  const growthProgress = (state.economy.realGdpGrowthRate / 4.2) * 50;
  const inflationProgress = state.economy.inflationRate <= 2.4 ? 50 : Math.max(0, 50 - (state.economy.inflationRate - 2.4) * 18);
  const growthDone = state.economy.realGdpGrowthRate >= 4.2 && state.economy.inflationRate <= 2.4;

  const mandateProgress = (state.government.approvalRating / 64) * 50 + (state.government.stability / 75) * 50;
  const mandateDone = state.government.approvalRating >= 64 && state.government.stability >= 75;

  return [
    {
      id: 'goal_water_security',
      titleEn: 'National Hydraulic Immunity',
      titleAr: 'الحصانة المائية الوطنية',
      descriptionEn: 'End emergency water stress across Moroccan basins through dams or desalination.',
      descriptionAr: 'تجاوز حالة الإجهاد المائي عبر رفع حقينة السدود أو توسيع محطات التحلية.',
      targetDescriptionEn: 'Dam fill ≥ 45% OR Desalination ≥ 550k m³/day',
      targetDescriptionAr: 'ملء السدود ≥ 45% أو قدرة التحلية ≥ 550 ألف م³/يوم',
      completed: waterDone,
      progress: clamp(waterDone ? 100 : waterPct)
    },
    {
      id: 'goal_fiscal_balance',
      titleEn: 'Macro-Fiscal Sustainability',
      titleAr: 'الاستدامة المالية وتقليص العجز',
      descriptionEn: 'Keep sovereign debt under control and narrow the monthly budget deficit.',
      descriptionAr: 'ضبط المديونية العمومية وتقليص العجز الشهري لحماية التصنيف السيادي.',
      targetDescriptionEn: 'Monthly balance ≥ -2.5B & Debt/GDP ≤ 68%',
      targetDescriptionAr: 'الرصيد الشهري ≥ -2.5 مليار والدين ≤ 68% من الناتج',
      completed: fiscalBalanceOk && debtOk,
      progress: clamp(fiscalBalanceOk && debtOk ? 100 : fiscalPct)
    },
    {
      id: 'goal_youth_jobs',
      titleEn: 'Youth Employment Charter',
      titleAr: 'ميثاق تشغيل الشباب',
      descriptionEn: 'Create dynamic private-sector jobs and slash youth unemployment.',
      descriptionAr: 'تحفيز الاستثمار الخاص وتقليص بطالة حاملي الشهادات والشباب.',
      targetDescriptionEn: 'Youth unemployment ≤ 25%',
      targetDescriptionAr: 'بطالة الشباب ≤ 25%',
      completed: youthDone,
      progress: clamp(youthDone ? 100 : youthJobProgress)
    },
    {
      id: 'goal_growth_price_stability',
      titleEn: 'Balanced Economic Takeoff',
      titleAr: 'إقلاع اقتصادي مستقر الأسعار',
      descriptionEn: 'Accelerate real GDP expansion while anchoring consumer inflation.',
      descriptionAr: 'رفع وتيرة النمو الحقيقي مع إبقاء التضخم تحت السيطرة.',
      targetDescriptionEn: 'Real GDP growth ≥ 4.2% & Inflation ≤ 2.4%',
      targetDescriptionAr: 'نمو حقيقي ≥ 4.2% والتضخم ≤ 2.4%',
      completed: growthDone,
      progress: clamp(growthDone ? 100 : growthProgress + inflationProgress)
    },
    {
      id: 'goal_democratic_mandate',
      titleEn: 'Public Trust & Governing Mandate',
      titleAr: 'ثقة المواطنين وتماسك الأغلبية',
      descriptionEn: 'Maintain broad social legitimacy and strong parliamentary stability.',
      descriptionAr: 'الحفاظ على رصيد شعبي مريح وتماسك الائتلاف الحكومي.',
      targetDescriptionEn: 'Approval ≥ 64% & Stability ≥ 75/100',
      targetDescriptionAr: 'الرضا الشعبي ≥ 64% والاستقرار ≥ 75/100',
      completed: mandateDone,
      progress: clamp(mandateDone ? 100 : mandateProgress)
    }
  ];
}

export function buildGameOverSummary(state: GameState, reason: GameOverSummary['reason']): GameOverSummary {
  const goals = evaluateStrategicGoals(state);
  const completedCount = goals.filter(g => g.completed).length;
  const avgGrowth = state.history.length > 0
    ? Number((state.history.reduce((s, h) => s + h.gdpGrowthRate, 0) / state.history.length).toFixed(2))
    : state.economy.realGdpGrowthRate;

  const composite =
    state.government.approvalRating * 0.35 +
    state.government.stability * 0.3 +
    completedCount * 8 +
    Math.max(0, 80 - state.budget.debtToGdpRatio) * 0.4;

  let grade: GameOverSummary['grade'] = 'C';
  if (reason === 'fiscal_default' || reason === 'vote_of_no_confidence') grade = 'F';
  else if (composite >= 85 && completedCount >= 4) grade = 'S';
  else if (composite >= 72 && completedCount >= 3) grade = 'A';
  else if (composite >= 58) grade = 'B';
  else if (composite >= 45) grade = 'C';
  else grade = 'D';

  const titles: Record<GameOverSummary['reason'], { en: string; ar: string; descEn: string; descAr: string }> = {
    term_completed: {
      en: 'Five-Year Constitutional Mandate Completed',
      ar: 'إتمام الولاية الحكومية الكاملة (5 سنوات)',
      descEn: 'Your cabinet reached the scheduled end of its 60-month parliamentary mandate. Review your national scorecard below.',
      descAr: 'أتمت الحكومة ولايتها الدستورية الممتدة على 60 شهراً. إليكم الحصيلة الاستراتيجية لأداء الائتلاف الحكومي.'
    },
    vote_of_no_confidence: {
      en: 'Cabinet Toppled by Vote of No Confidence',
      ar: 'سقوط الحكومة بملتمس الرقابة البرلماني',
      descEn: 'Parliament withdrew confidence under Article 105 following severe instability.',
      descAr: 'سحب مجلس النواب الثقة من الحكومة بموجب الفصل 105 من الدستور بسبب تدهور الاستقرار وتفاقم الأزمات.'
    },
    fiscal_default: {
      en: 'Sovereign Debt Distress Emergency',
      ar: 'أزمة مالية حادة وعجز هيكلي في خدمة الدين العمومي',
      descEn: 'Public debt breached 110% of GDP, triggering emergency international debt restructuring.',
      descAr: 'تجاوز الدين العمومي 110% من الناتج الداخلي الخام مما اضطر الدولة للدخول في إعادة هيكلة مالية عاجلة.'
    }
  };

  return {
    reason,
    titleEn: titles[reason].en,
    titleAr: titles[reason].ar,
    descriptionEn: titles[reason].descEn,
    descriptionAr: titles[reason].descAr,
    grade,
    finalApproval: state.government.approvalRating,
    finalStability: state.government.stability,
    gdpGrowthAvg: avgGrowth,
    goalsCompleted: completedCount,
    goalsTotal: goals.length,
    monthsServed: state.elapsedMonths
  };
}

export function getInitialGameState(): GameState {
  const parties = partiesData as unknown as PoliticalParty[];

  return {
    currentMonth: 1, // January
    currentYear: 2026,
    elapsedMonths: 0,
    isPaused: true,
    gameSpeed: 'normal',
    gameMode: 'normal',
    language: 'ar', // Default Arabic desktop-first
    activeTab: 'dashboard',

    government: {
      primeMinister: 'Aziz Akhannouch',
      primeMinisterAr: 'عزيز أخنوش',
      rulingPartyId: 'rni',
      coalitionPartyIds: ['pam', 'istiqlal'],
      ministers: ministersData as any,
      parliamentarySeats: 270, // RNI (102) + PAM (87) + PI (81) = 270 seats
      stability: 85,
      approvalRating: 58.0,
      publicTrust: 62.0,
      monthsInOffice: 0,
      lastElectionMonth: 0,
      nextScheduledElectionMonth: 60 // 5 years
    },

    parties,
    regions: regionsData as any,
    cities: citiesData as any,

    economy: {
      gdpBillionMAD: 1520.0,
      realGdpGrowthRate: 3.4,
      inflationRate: 2.2,
      unemploymentRate: 12.8,
      youthUnemploymentRate: 31.5,
      bamInterestRate: 2.75,
      consumerPurchasingPower: 72.0,
      privateInvestmentIndex: 68.0,
      fdiBillionMAD: 3.8,
      exportsBillionMAD: 38.5,
      importsBillionMAD: 56.0,
      tourismRevenueBillionMAD: 8.5,
      phosphatePriceUSD: 245.0,
      crudeOilPriceUSD: 78.5,
      sectorOutput: {
        agriculture: 62,
        industry: 78,
        services: 82,
        miningPhosphates: 88,
        tourism: 70,
        energy: 65
      }
    },

    budget: {
      revenues: {
        incomeTax: 7.4,
        corporateTax: 8.2,
        vat: 14.2,
        customs: 5.0,
        tourismTaxes: 1.5,
        stateEnterprisesOcp: 3.9,
        miningRoyalties: 1.3,
        otherRevenues: 6.2
      },
      expenses: {
        education: 6.8,
        healthcare: 4.2,
        infrastructureTransport: 5.5,
        defenseFar: 5.2,
        interiorSecurity: 3.8,
        socialProtectionSubsidies: 3.5,
        agricultureRuralDev: 2.4,
        waterEnvironment: 1.8,
        energyRenewables: 1.5,
        publicWages: 13.5,
        debtService: 3.7
      },
      fiscalLevers: { ...DEFAULT_FISCAL_LEVERS },
      totalMonthlyRevenue: 47.7,
      totalMonthlyExpense: 51.9,
      monthlyBalance: -4.2,
      publicDebtBillionMAD: 1045.0,
      debtToGdpRatio: 68.7,
      treasuryReservesBillionMAD: 85.0,
      sovereignCreditRating: 'BBB',
      borrowingCostSpread: 1.5
    },

    water: {
      overallDamFillRate: 31.5,
      seasonalRainfallMm: 38.0,
      annualRainfallDeficit: 28.0,
      droughtLevel: 'severe',
      urbanWaterSecurityDays: 230,
      agriculturalWaterRationingPercent: 25.0,
      desalinationDailyM3: 350000,
      operationalDesalinationPlants: 9,
      waterHighwayFlowM3Sec: 15.0,
      appliedDesalinationPolicyIds: [],
      dams: (moroccoApiData.dams?.dams || []) as DamStatus[]
    },

    demographics: demographicsData as any,
    foreignRelations: countriesData as any,
    policies: policiesData as unknown as Policy[],

    activeCrises: [],
    activeCityProtests: [
      {
        id: 'protest_fes_0',
        cityId: 'fes',
        cityNameEn: 'Fez',
        cityNameAr: 'فاس',
        regionId: 'fez_meknes',
        demographicGroup: 'students_youth',
        intensity: 'intense',
        demandsEn: [
          'Cancel reduction of medical training years from 7 to 6',
          'Upgrade university hospital medical equipment and internship wards',
          'Guarantee competitive fellowship positions in public health centers'
        ],
        demandsAr: [
          'التراجع عن تقليص سنوات التكوين الطبي من 7 إلى 6 سنوات',
          'تأهيل التجهيزات الطبية بمصالح المستشفى الجامعي الحسن الثاني بفاس',
          'توفير بيئة تدريبية لائقة ومناصب إقامة كافية بالقطاع العام'
        ],
        monthStarted: 0
      },
      {
        id: 'protest_oujda_0',
        cityId: 'oujda',
        cityNameEn: 'Oujda',
        cityNameAr: 'وجدة',
        regionId: 'oriental',
        demographicGroup: 'unemployed_informal',
        intensity: 'mild',
        demandsEn: [
          'Establish economic alternatives to informal border trade',
          'Accelerate hiring in Nador West Med and Oujda Technopole',
          'Urgent microcredit subsidies for youth entrepreneurship'
        ],
        demandsAr: [
          'إيجاد بدائل اقتصادية وتنموية حقيقية بعد إغلاق منافذ التجارة المعيشية',
          'تسريع وتيرة التشغيل بمشاريع ميناء الناظور غرب المتوسط والقطب التكنولوجي بوجدة',
          'تخصيص قروض شرفية ودعم مالي مباشر للشباب حاملي المشاريع'
        ],
        monthStarted: 0
      }
    ],
    resolvedEvents: [],
    newsFeed: [
      {
        id: 'news_init_1',
        date: 'يناير 2026',
        month: 1,
        year: 2026,
        category: 'politics',
        headlineEn: 'New Parliamentary Session Opens in Rabat',
        headlineAr: 'افتتاح الدورة البرلمانية الجديدة بمجلس النواب بالرباط',
        summaryEn: 'Government presents priorities focusing on hydraulic security, health universalization, and investment charter.',
        summaryAr: 'الحكومة تعرض أولوياتها المرتكزة على الأمن المائي، وتعميم الحماية الاجتماعية، وتفعيل ميثاق الاستثمار الجديد.',
        impact: 'positive'
      },
      {
        id: 'news_init_2',
        date: 'يناير 2026',
        month: 1,
        year: 2026,
        category: 'water',
        headlineEn: 'Sebou-Bouregreg Water Highway Transfers Exceed 200 Million m³',
        headlineAr: 'تحويلات الطريق السيار المائي سبو-بورقراق تتجاوز 200 مليون متر مكعب',
        summaryEn: 'Strategic water transfer safeguards continuous drinking water supply for Rabat and Casablanca.',
        summaryAr: 'المشروع الاستراتيجي يؤمن مياه الشرب لساكنة الرباط والدار البيضاء ويخفف الضغط على حوض أم الربيع.',
        impact: 'positive'
      }
    ],
    parliamentaryVotes: [],
    decisionHistory: [],
    history: [
      {
        month: 1,
        year: 2026,
        label: 'يناير 2026',
        gdpBillionMAD: 1520.0,
        gdpGrowthRate: 3.4,
        inflationRate: 2.2,
        unemploymentRate: 12.8,
        youthUnemploymentRate: 31.5,
        publicDebtToGdp: 68.7,
        treasuryReserves: 85.0,
        damFillRate: 31.5,
        approvalRating: 58.0,
        socialTension: 35.0,
        stability: 85
      }
    ],
    monthlyAttributions: [],
    actionCooldowns: {},
    executedOneTimeActions: [],
    goals: evaluateStrategicGoals({
      water: {
        overallDamFillRate: 31.5,
        seasonalRainfallMm: 38.0,
        annualRainfallDeficit: 28.0,
        droughtLevel: 'severe',
        urbanWaterSecurityDays: 230,
        agriculturalWaterRationingPercent: 25.0,
        desalinationDailyM3: 350000,
        operationalDesalinationPlants: 9,
        waterHighwayFlowM3Sec: 15.0
      },
      budget: {
        revenues: {
          incomeTax: 7.4,
          corporateTax: 8.2,
          vat: 14.2,
          customs: 5.0,
          tourismTaxes: 1.5,
          stateEnterprisesOcp: 3.9,
          miningRoyalties: 1.3,
          otherRevenues: 6.2
        },
        expenses: {
          education: 6.8,
          healthcare: 4.2,
          infrastructureTransport: 5.5,
          defenseFar: 5.2,
          interiorSecurity: 3.8,
          socialProtectionSubsidies: 3.5,
          agricultureRuralDev: 2.4,
          waterEnvironment: 1.8,
          energyRenewables: 1.5,
          publicWages: 13.5,
          debtService: 3.7
        },
        totalMonthlyRevenue: 47.7,
        totalMonthlyExpense: 51.9,
        monthlyBalance: -4.2,
        publicDebtBillionMAD: 1045.0,
        debtToGdpRatio: 68.7,
        treasuryReservesBillionMAD: 85.0,
        sovereignCreditRating: 'BBB',
        borrowingCostSpread: 1.5
      },
      economy: {
        gdpBillionMAD: 1520.0,
        realGdpGrowthRate: 3.4,
        inflationRate: 2.2,
        unemploymentRate: 12.8,
        youthUnemploymentRate: 31.5,
        bamInterestRate: 2.75,
        consumerPurchasingPower: 72.0,
        privateInvestmentIndex: 68.0,
        fdiBillionMAD: 3.8,
        exportsBillionMAD: 38.5,
        importsBillionMAD: 56.0,
        tourismRevenueBillionMAD: 8.5,
        phosphatePriceUSD: 245.0,
        crudeOilPriceUSD: 78.5,
        sectorOutput: {
          agriculture: 62,
          industry: 78,
          services: 82,
          miningPhosphates: 88,
          tourism: 70,
          energy: 65
        }
      },
      government: {
        primeMinister: 'Aziz Akhannouch',
        rulingPartyId: 'rni',
        coalitionPartyIds: ['pam', 'istiqlal'],
        ministers: [],
        parliamentarySeats: 270,
        stability: 85,
        approvalRating: 58.0,
        publicTrust: 62.0,
        monthsInOffice: 0,
        lastElectionMonth: 0,
        nextScheduledElectionMonth: 60
      }
    }),
    gameOver: null,
    pendingElection: false
  };
}

export function advanceMonth(prevState: GameState, monthsToAdvance: number = 1): GameState {
  if (prevState.gameOver) return prevState;
  let state = { ...prevState };

  for (let step = 0; step < monthsToAdvance; step++) {
    const nextMonth = state.currentMonth === 12 ? 1 : state.currentMonth + 1;
    const nextYear = state.currentMonth === 12 ? state.currentYear + 1 : state.currentYear;
    const elapsedMonths = state.elapsedMonths + 1;
    const formattedDate = formatGameDate(nextMonth, nextYear, state.language);

    const activePolicies = state.policies.filter(p => p.implemented);

    // 1. Water System Simulation
    const { nextWater, damDelta, stressIndex } = simulateWater(
      state.water,
      nextMonth,
      activePolicies,
      state.gameMode
    );

    // 2. Economy Simulation
    const { nextEconomy, deltas: econDeltas } = simulateEconomy(
      state.economy,
      nextMonth,
      activePolicies,
      stressIndex,
      state.economy.crudeOilPriceUSD,
      state.economy.phosphatePriceUSD,
      state.gameMode === 'hard' ? 1.4 : 1.0,
      state.budget.fiscalLevers
    );

    // 3. State Budget Simulation
    const { nextBudget, balanceDelta, emergencyBondIssued } = simulateBudget(
      state.budget,
      nextEconomy,
      activePolicies,
      state.gameMode
    );

    // 4. Public Opinion & Demographics Simulation
    const {
      nextDemographics,
      nextRegions,
      nextCities,
      nationalApproval,
      nationalTrust
    } = simulateOpinion(
      state.demographics,
      state.regions,
      state.cities,
      nextEconomy,
      nextWater,
      activePolicies,
      state.activeCrises.length,
      nextBudget.fiscalLevers
    );

    // 5. National Social Tension & Government Stability
    const { nationalTension } = calculateNationalTension(nextRegions);
    const { stability } = calculateGovernmentStability(
      state.government,
      state.parties,
      nationalApproval,
      nationalTension,
      nextBudget.monthlyBalance,
      state.gameMode
    );

    // 6. Crises, Corruption Audits & Article 105 Vote of No Confidence Triggers
    const newCrises = checkForTriggeredCrises(
      nextRegions,
      state.activeCrises,
      state.resolvedEvents,
      nextMonth,
      nextEconomy.inflationRate,
      nextWater.overallDamFillRate,
      state.gameMode,
      elapsedMonths
    );

    // Trigger Ministerial Audit Scandal when corruptionRisk is high
    const nextCooldowns: Record<string, number> = {};
    for (const [k, v] of Object.entries(state.actionCooldowns || {})) {
      if (v > 1) nextCooldowns[k] = v - 1;
    }

    const riskyMinister = [...state.government.ministers]
      .filter(m => m.corruptionRisk >= 55)
      .sort((a, b) => b.corruptionRisk - a.corruptionRisk)[0];

    if (
      riskyMinister &&
      !nextCooldowns.corruption_audit &&
      state.activeCrises.length + newCrises.length < 3 &&
      Math.random() < (riskyMinister.corruptionRisk - 40) / 100
    ) {
      nextCooldowns.corruption_audit = 8;
      newCrises.push({
        id: `corruption_audit_${elapsedMonths}`,
        type: 'political',
        titleEn: `Court of Accounts Audit: ${riskyMinister.titleEn} Contracts Questioned`,
        titleAr: `تقرير المجلس الأعلى للحسابات يرصد اختلالات بقطاع: ${riskyMinister.titleAr}`,
        descriptionEn: `Auditors flagged procurement irregularities under ${riskyMinister.nameEn} (risk ${riskyMinister.corruptionRisk}%). Opposition MPs demand immediate accountability.`,
        descriptionAr: `رصد تقرير افتحاص مالي اختلالات في صفقات عمومية تشرف عليها وزارة ${riskyMinister.nameAr} (مؤشر المخاطر ${riskyMinister.corruptionRisk}%). المعارضة تطالب بمساءلة فورية.`,
        severity: 'high',
        monthOccurred: elapsedMonths,
        choices: [
          {
            id: 'audit_transparent_prosecution',
            textEn: 'Refer File to Public Prosecution & Enforce Governance Reforms',
            textAr: 'إحالة الملف على القضاء وفرض مساطر شفافة للصفقات العمومية',
            costBillionMAD: 0.2,
            consequencesEn: ['Strong boost to public trust; temporarily upsets coalition patronage'],
            consequencesAr: ['تعزيز قوي لثقة المواطنين ونزاهة الإدارة مع توتر عابر داخل الأغلبية'],
            effects: { approvalDelta: 5, stabilityDelta: 2, socialTensionDelta: -4 }
          },
          {
            id: 'audit_internal_warning',
            textEn: 'Issue Administrative Warning & Settle Quietly',
            textAr: 'توجيه تنبيه إداري داخلي وتطويق الملف لتجنب هزة داخل الأغلبية',
            costBillionMAD: 0.0,
            consequencesEn: ['Preserves minister seat in the short run but hurts citizen trust'],
            consequencesAr: ['تفادي خلاف داخل التحالف لكنه يثير استياءً لدى الرأي العام والصحافة'],
            effects: { approvalDelta: -4, stabilityDelta: -2, socialTensionDelta: 4 }
          }
        ]
      });
    }

    // Article 105 Vote of No Confidence Check (evaluated BEFORE building updatedCrises & generatedNews)
    let pendingElection = state.pendingElection;
    let voteOfNoConfidenceWarning = state.government.voteOfNoConfidenceWarning || false;
    let govCollapseBulletin: NewsItem | null = null;

    if (stability < 22 || nationalApproval < 20 || state.government.parliamentarySeats < 198) {
      if (!voteOfNoConfidenceWarning) {
        voteOfNoConfidenceWarning = true;
        newCrises.push({
          id: `motion_no_confidence_${elapsedMonths}`,
          type: 'political',
          titleEn: 'Parliamentary Vote of No Confidence Motion (ملتمس الرقابة)',
          titleAr: 'تقديم ملتمس الرقابة وإسقاط الحكومة بمجلس النواب',
          descriptionEn: 'Mounting social tension, hyper-inflation, and collapsing executive stability have prompted opposition parties to submit a Motion of No Confidence under Article 105 of the Moroccan Constitution.',
          descriptionAr: 'بسبب تدهور الاستقرار وتفاقم الاحتقان الاجتماعي، تقدمت فرق المعارضة البرلمانية بملتمس رقابة رسمي لإسقاط الحكومة والمطالبة بانتخابات سابقة لأوانها وفق الفصل 105 من الدستور.',
          severity: 'critical',
          monthOccurred: elapsedMonths,
          choices: [
            {
              id: 'concede_early_elections',
              textEn: 'Dissolve Parliament and Call Snap General Elections',
              textAr: 'حل مجلس النواب والدعوة إلى انتخابات تشريعية سابقة لأوانها',
              costBillionMAD: 0.3,
              consequencesEn: ['Government resigned. Interim administration oversees snap legislative elections.'],
              consequencesAr: ['استقالة الحكومة وإجراء انتخابات تشريعية مبكرة لإعادة تشكيل الأغلبية.'],
              effects: { approvalDelta: 5, stabilityDelta: 30 }
            },
            {
              id: 'emergency_coalition_reshuffle',
              textEn: 'Offer Sweeping Cabinet Concessions & Subsidies',
              textAr: 'تقديم تنازلات كبرى وضخ حزمة دعم استعجالية لإنقاذ الائتلاف',
              costBillionMAD: 2.5,
              consequencesEn: ['Costly treasury concessions temporarily calm parliamentary fury.'],
              consequencesAr: ['ضخ 2.5 مليار درهم في الدعم يشتري هدنة سياسية مؤقتة مع البرلمان.'],
              effects: { approvalDelta: 8, stabilityDelta: 20, budgetExpenseDelta: 2.5 }
            }
          ]
        });
      } else if (stability < 15 || nationalApproval < 15) {
        pendingElection = true;
        voteOfNoConfidenceWarning = false;
        govCollapseBulletin = {
          id: `news_gov_collapse_${nextMonth}_${nextYear}`,
          date: formattedDate,
          month: nextMonth,
          year: nextYear,
          category: 'politics',
          headlineEn: 'Government Falls: Parliament Carries Vote of No Confidence',
          headlineAr: 'سقوط الحكومة رسمياً: مجلس النواب يسحب الثقة وينادي بانتخابات مبكرة',
          summaryEn: 'The executive government has collapsed after losing the confidence of the House of Representatives. Snap general elections inaugurated.',
          summaryAr: 'أعلن رئيس مجلس النواب إسقاط الحكومة رسمياً بعد حجب الثقة عنها بالأغلبية المطلقة، مع إطلاق الاستحقاقات الانتخابية المبكرة.',
          impact: 'negative'
        };
      }
    } else if (stability > 35 && nationalApproval > 30) {
      voteOfNoConfidenceWarning = false;
    }

    const updatedCrises = [...state.activeCrises, ...newCrises];

    // 6b. City-Level Protests & Demands Trigger
    const newProtests = checkForTriggeredCityProtests(
      nextRegions,
      nextCities,
      state.activeCityProtests || [],
      nextMonth,
      elapsedMonths
    );
    const updatedProtests = [...(state.activeCityProtests || []), ...newProtests];

    // 7. Foreign Relations Simulation
    const nextForeignRelations = simulateForeignRelations(
      state.foreignRelations,
      activePolicies,
      state.gameMode
    );

    // 8. Causal Attributions for Transparency
    const approvalDelta = Number((nationalApproval - state.government.approvalRating).toFixed(1));
    const tensionDelta = Number((nationalTension - (state.history[state.history.length - 1]?.socialTension || 35)).toFixed(1));

    const attributions = generateAttributions({
      approvalDelta,
      tensionDelta,
      gdpDelta: econDeltas.gdp,
      inflationDelta: econDeltas.inflation,
      damDelta,
      balanceDelta,
      activePolicies,
      economy: nextEconomy,
      water: nextWater,
      recentCrisesCount: state.activeCrises.length
    });

    // 9. Generate Monthly News Bulletins
    const generatedNews: NewsItem[] = [];

    if (emergencyBondIssued > 0) {
      generatedNews.push({
        id: `news_bond_${elapsedMonths}`,
        date: formattedDate,
        month: nextMonth,
        year: nextYear,
        category: 'economy',
        headlineEn: `Treasury Issues ${emergencyBondIssued}B MAD Emergency T-Bills to Cover Liquidity`,
        headlineAr: `الخزينة العامة تصدر سندات طارئة بقيمة ${emergencyBondIssued} مليار درهم لتغطية السيولة`,
        summaryEn: `Low cash reserves forced the Ministry of Economy & Finance to tap bond markets at a higher spread.`,
        summaryAr: `تراجع احتياطي الخزينة اضطر وزارة الاقتصاد والمالية إلى اللجوء العاجل لسوق السندات مع ارتفاع كلفة الفائدة.`,
        impact: 'negative'
      });
    }

    // Inflation bulletin
    if (Math.abs(econDeltas.inflation) >= 0.3) {
      generatedNews.push({
        id: `news_inf_${nextMonth}_${nextYear}`,
        date: formattedDate,
        month: nextMonth,
        year: nextYear,
        category: 'economy',
        headlineEn: econDeltas.inflation > 0
          ? `Inflation Accelerates to ${nextEconomy.inflationRate}%`
          : `Inflation Eases to ${nextEconomy.inflationRate}%`,
        headlineAr: econDeltas.inflation > 0
          ? `ارتفاع معدل التضخم إلى ${nextEconomy.inflationRate}% بالمملكة`
          : `تراجع مؤشر أسعار الاستهلاك والتضخم إلى ${nextEconomy.inflationRate}%`,
        summaryEn: `Consumer price fluctuations driven by energy imports and seasonal grocery prices.`,
        summaryAr: `تقلبات أسعار الاستهلاك تأثرت بفاتورة الطاقة وأسعار المواد الغذائية بأسواق الجملة.`,
        impact: econDeltas.inflation > 0 ? 'negative' : 'positive'
      });
    }

    // Dam fill bulletin
    if (Math.abs(damDelta) >= 1.0) {
      generatedNews.push({
        id: `news_dam_${nextMonth}_${nextYear}`,
        date: formattedDate,
        month: nextMonth,
        year: nextYear,
        category: 'water',
        headlineEn: damDelta > 0
          ? `Dam Reservoir Fill Rate Rises to ${nextWater.overallDamFillRate}%`
          : `Dam Reserves Contract to ${nextWater.overallDamFillRate}%`,
        headlineAr: damDelta > 0
          ? `تحسن نسبة ملء السدود الوطنية لتصل إلى ${nextWater.overallDamFillRate}%`
          : `تراجع حقينة السدود الوطنية إلى ${nextWater.overallDamFillRate}%`,
        summaryEn: `Ministry of Equipment & Water monitors water basins following seasonal weather cycles.`,
        summaryAr: `وزارة التجهيز والماء تتابع وضعية الأحواض المائية وتدابير التدبير الاستباقي للطلب.`,
        impact: damDelta > 0 ? 'positive' : 'negative'
      });
    }

    // Crisis news
    for (const crisis of newCrises) {
      generatedNews.push({
        id: `news_crisis_${crisis.id}_${nextMonth}_${nextYear}`,
        date: formattedDate,
        month: nextMonth,
        year: nextYear,
        category: crisis.type === 'political' ? 'politics' : 'society',
        headlineEn: crisis.titleEn,
        headlineAr: crisis.titleAr,
        summaryEn: crisis.descriptionEn.substring(0, 160) + '...',
        summaryAr: crisis.descriptionAr.substring(0, 160) + '...',
        regionId: crisis.affectedRegionId,
        impact: 'negative'
      });
    }

    // Protest news
    for (const pr of newProtests) {
      generatedNews.push({
        id: `news_protest_${pr.id}_${nextMonth}_${nextYear}`,
        date: formattedDate,
        month: nextMonth,
        year: nextYear,
        category: 'society',
        headlineEn: `Civic Mobilization & Protests Erupt in ${pr.cityNameEn}`,
        headlineAr: `وقفات احتجاجية ومطالب ميدانية لساكنة مدينة ${pr.cityNameAr}`,
        summaryEn: `Citizens mobilize with demands: ${pr.demandsEn[0]}. Calls for swift government response.`,
        summaryAr: `خروج وقفات احتجاجية للمواطنين للمطالبة بـ: ${pr.demandsAr[0]}. دعوات لفتح حوار واستجابة حكومية عاجلة.`,
        regionId: pr.regionId,
        impact: 'negative'
      });
    }

    if (govCollapseBulletin) {
      generatedNews.unshift(govCollapseBulletin);
    }

    // 10. Check Scheduled Election & Auto-Pause on Election Trigger
    if (elapsedMonths >= state.government.nextScheduledElectionMonth) {
      pendingElection = true;
    }

    // Reduce corruption risk slightly if transparent audit occurred elsewhere, otherwise mild drift
    const nextMinisters = state.government.ministers.map(m =>
      riskyMinister && m.portfolio === riskyMinister.portfolio && nextCooldowns.corruption_audit === 8
        ? { ...m, corruptionRisk: Math.max(15, m.corruptionRisk - 15) }
        : m
    );

    // 11. Record Snapshot
    const snapshot: HistoricalSnapshot = {
      month: nextMonth,
      year: nextYear,
      label: formattedDate,
      gdpBillionMAD: nextEconomy.gdpBillionMAD,
      gdpGrowthRate: nextEconomy.realGdpGrowthRate,
      inflationRate: nextEconomy.inflationRate,
      unemploymentRate: nextEconomy.unemploymentRate,
      youthUnemploymentRate: nextEconomy.youthUnemploymentRate,
      publicDebtToGdp: nextBudget.debtToGdpRatio,
      treasuryReserves: nextBudget.treasuryReservesBillionMAD,
      damFillRate: nextWater.overallDamFillRate,
      approvalRating: nationalApproval,
      socialTension: nationalTension,
      stability
    };

    const intermediateState: GameState = {
      ...state,
      currentMonth: nextMonth,
      currentYear: nextYear,
      elapsedMonths,
      government: {
        ...state.government,
        ministers: nextMinisters,
        stability,
        approvalRating: nationalApproval,
        publicTrust: nationalTrust,
        monthsInOffice: state.government.monthsInOffice + 1,
        voteOfNoConfidenceWarning
      },
      economy: nextEconomy,
      budget: nextBudget,
      water: nextWater,
      demographics: nextDemographics,
      regions: nextRegions,
      cities: nextCities,
      foreignRelations: nextForeignRelations,
      activeCrises: updatedCrises,
      activeCityProtests: updatedProtests,
      newsFeed: [...generatedNews, ...state.newsFeed].slice(0, 50),
      history: [...state.history, snapshot].slice(-120),
      monthlyAttributions: attributions,
      actionCooldowns: nextCooldowns,
      pendingElection
    };

    const goals = evaluateStrategicGoals(intermediateState);
    let gameOver: GameOverSummary | null = null;

    if (nextBudget.debtToGdpRatio >= 110 && state.gameMode !== 'sandbox') {
      gameOver = buildGameOverSummary(intermediateState, 'fiscal_default');
    } else if (
      elapsedMonths >= 60 &&
      !state.executedOneTimeActions?.includes('endless_mode_unlocked')
    ) {
      gameOver = buildGameOverSummary(intermediateState, 'term_completed');
    }

    const shouldAutoPause = Boolean(
      (pendingElection && !state.pendingElection) || gameOver
    );

    state = {
      ...intermediateState,
      goals,
      gameOver,
      isPaused: shouldAutoPause ? true : state.isPaused
    };

    if (gameOver || pendingElection) {
      break;
    }
  }

  return state;
}
