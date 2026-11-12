// Type definitions for Morocco: State & Government Simulator

export type Language = 'en' | 'ar';
export type GameMode = 'sandbox' | 'normal' | 'hard';
export type RegionalInterventionType = 'job_stimulus' | 'water_roads' | 'social_health';
export type DiplomaticActionType =
  | 'push_recognition'
  | 'sign_trade'
  | 'sign_defense'
  | 'deescalate'
  | 'algeria_reinforce_wall'
  | 'algeria_drone_patrol'
  | 'algeria_sever_ties'
  | 'sahara_dakhla_port'
  | 'sahara_tiznit_highway'
  | 'sahara_au_expulsion';
export type ViewTab =
  | 'dashboard'
  | 'map'
  | 'government'
  | 'parliament'
  | 'economy'
  | 'budget'
  | 'society'
  | 'water'
  | 'regions'
  | 'cities'
  | 'parties'
  | 'elections'
  | 'foreign'
  | 'decisions'
  | 'news'
  | 'statistics'
  | 'history'
  | 'settings';

export type TensionLevel = 'calm' | 'mild' | 'noticeable' | 'high' | 'critical';

export interface CityData {
  id: string;
  regionId: string;
  nameEn: string;
  nameAr: string;
  population: number;
  unemploymentRate: number;
  satisfaction: number; // 0-100
  socialTension: number; // 0-100
  keyIndustries: string[];
  localIssues: string[];
  localIssuesAr?: string[];
}

export interface RegionData {
  id: string;
  nameEn: string;
  nameAr: string;
  capitalEn: string;
  capitalAr: string;
  population: number;
  gdpContributionPercent: number; // share of national GDP
  unemploymentRate: number;
  youthUnemploymentRate: number;
  satisfaction: number; // 0-100
  socialTension: number; // 0-100
  protestRisk: number; // 0-100
  waterStressIndex: number; // 0-100 (high = severe stress)
  reservoirFillRate: number; // % fill of local dams
  infrastructureScore: number; // 0-100
  healthcareScore: number; // 0-100
  educationScore: number; // 0-100
  investmentFlowIndex: number; // relative 0-100
  dominantSectors: ('agriculture' | 'industry' | 'tourism' | 'services' | 'mining' | 'fishing' | 'renewables')[];
  partySupport: Record<string, number>; // partyId -> percentage (sums to 100)
  cityIds: string[];
  svgPath?: string;
  centroid: [number, number];
}

export type Ideology =
  | 'liberal_technocrat'
  | 'social_democrat'
  | 'national_conservative'
  | 'islamist_democrat'
  | 'democratic_socialist'
  | 'rural_berberist'
  | 'constitutional_liberal';

export interface PoliticalParty {
  id: string;
  acronym: string;
  nameEn: string;
  nameAr: string;
  color: string;
  ideology: Ideology;
  economicPosition: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
  socialPosition: 'progressive' | 'moderate' | 'traditional' | 'conservative';
  seats: number; // current seats in 395-seat Parliament
  popularity: number; // national polling %
  regionalStrongholds: string[];
  targetDemographics: string[];
  manifestoEn: string;
  manifestoAr: string;
  coalitionCompatibility: Record<string, number>; // 0 to 100 compatibility with other parties
  oppositionIntensity: number; // 0-100
  isGovernment: boolean;
}

export interface Minister {
  id: string;
  portfolio:
    | 'prime_minister'
    | 'economy_finance'
    | 'interior'
    | 'foreign_affairs'
    | 'agriculture_water'
    | 'industry_trade'
    | 'national_education'
    | 'health_social'
    | 'equipment_water'
    | 'energy_transition'
    | 'transport_logistics'
    | 'housing_urbanism'
    | 'digital_transition';
  titleEn: string;
  titleAr: string;
  nameEn: string;
  nameAr: string;
  partyId: string;
  competence: number; // 0-100
  loyalty: number; // 0-100
  publicApproval: number; // 0-100
  corruptionRisk: number; // 0-100
}

export interface GovernmentState {
  primeMinister: string;
  primeMinisterAr?: string;
  rulingPartyId: string;
  coalitionPartyIds: string[];
  ministers: Minister[];
  parliamentarySeats: number; // total seats backing gov (threshold: 198)
  stability: number; // 0-100
  approvalRating: number; // 0-100
  publicTrust: number; // 0-100
  monthsInOffice: number;
  lastElectionMonth: number;
  nextScheduledElectionMonth: number;
  voteOfNoConfidenceWarning?: boolean;
}

export interface EconomicState {
  gdpBillionMAD: number; // nominal GDP (e.g. 1520B MAD)
  realGdpGrowthRate: number; // % annual growth
  inflationRate: number; // % annual CPI
  unemploymentRate: number; // %
  youthUnemploymentRate: number; // %
  bamInterestRate: number; // Bank Al-Maghrib benchmark rate %
  consumerPurchasingPower: number; // Index 0-100 (100 = strong)
  privateInvestmentIndex: number; // Index 0-100
  fdiBillionMAD: number; // Monthly Foreign Direct Investment flow
  exportsBillionMAD: number; // Monthly exports
  importsBillionMAD: number; // Monthly imports
  tourismRevenueBillionMAD: number; // Monthly tourism receipts
  phosphatePriceUSD: number; // USD per metric ton benchmark
  crudeOilPriceUSD: number; // USD per barrel benchmark
  sectorOutput: {
    agriculture: number; // Index 0-100
    industry: number;
    services: number;
    miningPhosphates: number;
    tourism: number;
    energy: number;
  };
}

export interface FiscalLevers {
  corporateTaxRatePercent: number; // baseline 28% (range 15% - 40%)
  incomeTaxRatePercent: number;    // baseline 30% (range 15% - 45%)
  vatRatePercent: number;          // baseline 20% (range 10% - 25%)
  maqassaSubsidyBillionMAD: number;// baseline 3.5B/mo (range 0.5B - 8.0B)
  healthcareBudgetBillionMAD: number; // baseline 4.2B/mo (range 2.0B - 9.0B)
  educationBudgetBillionMAD: number;  // baseline 6.8B/mo (range 3.5B - 12.0B)
  defenseBudgetBillionMAD: number;    // baseline 5.2B/mo (range 3.0B - 10.0B)
  infrastructureBudgetBillionMAD: number; // baseline 5.5B/mo (range 2.0B - 10.0B)
  publicWagesBillionMAD: number;      // baseline 13.5B/mo (range 10.0B - 18.0B)
}

export interface BudgetState {
  revenues: {
    incomeTax: number; // monthly Billion MAD
    corporateTax: number;
    vat: number;
    customs: number;
    tourismTaxes: number;
    stateEnterprisesOcp: number;
    miningRoyalties: number;
    otherRevenues: number;
  };
  expenses: {
    education: number; // monthly Billion MAD
    healthcare: number;
    infrastructureTransport: number;
    defenseFar: number;
    interiorSecurity: number;
    socialProtectionSubsidies: number;
    agricultureRuralDev: number;
    waterEnvironment: number;
    energyRenewables: number;
    publicWages: number;
    debtService: number;
  };
  fiscalLevers?: FiscalLevers;
  totalMonthlyRevenue: number;
  totalMonthlyExpense: number;
  monthlyBalance: number; // Revenue - Expense
  publicDebtBillionMAD: number;
  debtToGdpRatio: number; // %
  treasuryReservesBillionMAD: number;
  sovereignCreditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  borrowingCostSpread: number; // % added to BAM rate
}

export interface DamStatus {
  id: string;
  nameAr: string;
  nameEn: string;
  basin: string;
  basinAr: string;
  basinEn: string;
  capacityMm3: number | null;
  volumeMm3: number | null;
  fillingRatePct: number;
  prevYearFillingRatePct: number | null;
  date: string | null;
}

export interface WaterState {
  overallDamFillRate: number; // % (e.g. 31.5%)
  seasonalRainfallMm: number; // monthly precipitation
  annualRainfallDeficit: number; // % below historical average
  droughtLevel: 'none' | 'moderate' | 'severe' | 'extreme' | 'catastrophic';
  urbanWaterSecurityDays: number; // days of drinking water guaranteed
  agriculturalWaterRationingPercent: number; // % reduction in irrigation
  desalinationDailyM3: number; // m3 daily capacity
  operationalDesalinationPlants: number;
  waterHighwayFlowM3Sec: number; // Sebou-Bouregreg basin transfer m3/s
  appliedDesalinationPolicyIds?: string[];
  dams?: DamStatus[];
}

export interface DemographicGroup {
  id: string;
  nameEn: string;
  nameAr: string;
  populationShare: number; // % of total pop
  satisfaction: number; // 0-100
  turnoutPropensity: number; // 0-100
  partyLeanings: Record<string, number>; // partyId -> weight
  topConcerns: string[];
}

export interface ForeignRelation {
  id: string;
  nameEn: string;
  nameAr: string;
  flagEmoji: string;
  relationshipScore: number; // -100 to +100
  tradeVolumeBillionMAD: number;
  securityCooperationScore: number; // 0-100
  diplomaticTension: number; // 0-100
  status: 'strategic_ally' | 'friendly' | 'neutral' | 'tense' | 'adversarial';
  freeTradeAgreement: boolean;
  securityPact: boolean;
  saharaRecognition: 'full_sovereignty' | 'autonomy_support' | 'neutral' | 'hostile';
  hasConsulateInSahara: boolean;
}

export interface Policy {
  id: string;
  category:
    | 'economy'
    | 'taxation'
    | 'subsidies'
    | 'employment'
    | 'water'
    | 'energy'
    | 'agriculture'
    | 'infrastructure'
    | 'healthcare'
    | 'education'
    | 'housing'
    | 'security'
    | 'social'
    | 'digital'
    | 'foreign'
    | 'culture';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  upfrontCostBillionMAD: number;
  monthlyCostBillionMAD: number;
  requiresParliamentApproval: boolean;
  implemented: boolean;
  monthImplemented?: number;
  expectedProsEn: string[];
  expectedProsAr: string[];
  expectedRisksEn: string[];
  expectedRisksAr: string[];
  // Delta modifiers applied when active
  modifiers: {
    gdpGrowthDelta?: number;
    inflationDelta?: number;
    unemploymentDelta?: number;
    youthUnemploymentDelta?: number;
    fdiBillionMAD?: number;
    revenueDelta?: number;
    expenseDelta?: number;
    damFillDelta?: number;
    desalinationDelta?: number;
    approvalDelta?: number;
    socialTensionDelta?: number;
    demographicSatisfactionDelta?: Record<string, number>;
    regionalSatisfactionDelta?: Record<string, number>;
    foreignRelationDelta?: Record<string, number>;
  };
}

export interface CrisisChoice {
  id: string;
  textEn: string;
  textAr: string;
  costBillionMAD: number;
  consequencesEn: string[];
  consequencesAr: string[];
  effects: {
    socialTensionDelta?: number;
    approvalDelta?: number;
    budgetExpenseDelta?: number;
    inflationDelta?: number;
    gdpGrowthDelta?: number;
    stabilityDelta?: number;
    affectedRegionId?: string;
    regionalSatisfactionDelta?: number;
    foreignRelationDelta?: Record<string, number>;
  };
}

export interface GameEvent {
  id: string;
  type: 'economic' | 'social' | 'political' | 'environmental' | 'international';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  choices: CrisisChoice[];
  resolvedChoiceId?: string;
  monthOccurred: number;
  affectedRegionId?: string;
  isOneTime?: boolean;
}

export interface NewsItem {
  id: string;
  date: string;
  month: number;
  year: number;
  category: 'economy' | 'politics' | 'society' | 'water' | 'diplomacy' | 'regions';
  headlineEn: string;
  headlineAr: string;
  summaryEn: string;
  summaryAr: string;
  regionId?: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface ParliamentaryVote {
  id: string;
  policyId: string;
  titleEn: string;
  titleAr: string;
  ayes: number;
  nays: number;
  abstentions: number;
  passed: boolean;
  date: string;
  partyVotes: Record<string, { ayes: number; nays: number; abstentions: number }>;
}

export interface HistoricalSnapshot {
  month: number;
  year: number;
  label: string;
  gdpBillionMAD: number;
  gdpGrowthRate: number;
  inflationRate: number;
  unemploymentRate: number;
  youthUnemploymentRate: number;
  publicDebtToGdp: number;
  treasuryReserves: number;
  damFillRate: number;
  approvalRating: number;
  socialTension: number;
  stability: number;
}

export interface DecisionRecord {
  id: string;
  month: number;
  year: number;
  date: string;
  titleEn: string;
  titleAr: string;
  type: 'policy' | 'crisis_resolution' | 'reshuffle' | 'budget_reform' | 'diplomatic' | 'sovereign_defense';
  costBillionMAD: number;
  immediateEffectsEn: string;
  immediateEffectsAr: string;
}

export interface CityProtest {
  id: string;
  cityId: string;
  cityNameEn: string;
  cityNameAr: string;
  regionId: string;
  demographicGroup: string;
  demandsEn: string[];
  demandsAr: string[];
  intensity: 'mild' | 'intense' | 'critical';
  monthStarted: number;
}

export interface MetricAttribution {
  metric: string;
  netDelta: number;
  reasons: {
    sourceEn: string;
    sourceAr: string;
    delta: number;
  }[];
}

export interface StrategicGoal {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  targetDescriptionEn: string;
  targetDescriptionAr: string;
  completed: boolean;
  progress: number; // 0-100
}

export interface GameOverSummary {
  reason: 'term_completed' | 'vote_of_no_confidence' | 'fiscal_default';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  finalApproval: number;
  finalStability: number;
  gdpGrowthAvg: number;
  goalsCompleted: number;
  goalsTotal: number;
  monthsServed: number;
}

export interface GameState {
  currentMonth: number; // 1 = Jan, 12 = Dec
  currentYear: number; // Starts 2026
  elapsedMonths: number;
  isPaused: boolean;
  gameSpeed: 'normal' | 'fast';
  gameMode: GameMode;
  language: Language;
  activeTab: ViewTab;

  deepseekApiKey?: string;
  deepseekModel?: string;

  government: GovernmentState;
  parties: PoliticalParty[];
  regions: RegionData[];
  cities: CityData[];
  economy: EconomicState;
  budget: BudgetState;
  water: WaterState;
  demographics: DemographicGroup[];
  foreignRelations: ForeignRelation[];
  policies: Policy[];

  activeCrises: GameEvent[];
  activeCityProtests: CityProtest[];
  resolvedEvents: GameEvent[];
  newsFeed: NewsItem[];
  parliamentaryVotes: ParliamentaryVote[];
  decisionHistory: DecisionRecord[];
  history: HistoricalSnapshot[];
  monthlyAttributions: MetricAttribution[];

  actionCooldowns?: Record<string, number>;
  executedOneTimeActions?: string[];
  goals?: StrategicGoal[];
  gameOver?: GameOverSummary | null;

  pendingElection: boolean;
  electionResults?: {
    seatsPerParty: Record<string, number>;
    popularVotePercent: Record<string, number>;
    voterTurnout: number;
  };
}
