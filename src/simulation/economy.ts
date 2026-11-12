import { EconomicState, Policy, FiscalLevers } from '../types/game';

export function simulateEconomy(
  current: EconomicState,
  month: number,
  activePolicies: Policy[],
  waterStress: number,
  globalOilPrice: number,
  globalPhosphatePrice: number,
  difficultyMultiplier: number = 1.0,
  fiscalLevers?: FiscalLevers
): { nextEconomy: EconomicState; deltas: { gdp: number; inflation: number; unemployment: number } } {
  // Base growth momentum (Moroccan baseline trend ~3.2% - 3.8%)
  let growthDelta = 0;
  let inflationDelta = 0;
  let unemploymentDelta = 0;
  let youthUnemploymentDelta = 0;
  let fdiBonus = 0;

  // Impact of active policies
  for (const p of activePolicies) {
    if (p.modifiers.gdpGrowthDelta) growthDelta += p.modifiers.gdpGrowthDelta;
    if (p.modifiers.inflationDelta) inflationDelta += p.modifiers.inflationDelta;
    if (p.modifiers.unemploymentDelta) unemploymentDelta += p.modifiers.unemploymentDelta;
    if (p.modifiers.youthUnemploymentDelta) youthUnemploymentDelta += p.modifiers.youthUnemploymentDelta;
    if (p.modifiers.fdiBillionMAD) fdiBonus += p.modifiers.fdiBillionMAD;
  }

  // Monthly global commodity cycles (oil & phosphate mean-reverting random walk)
  const nextCrudeOilPriceUSD = Number(
    Math.max(
      52,
      Math.min(125, globalOilPrice + (76 - globalOilPrice) * 0.08 + (Math.random() - 0.5) * 4.2)
    ).toFixed(1)
  );
  const nextPhosphatePriceUSD = Number(
    Math.max(
      140,
      Math.min(360, globalPhosphatePrice + (245 - globalPhosphatePrice) * 0.06 + (Math.random() - 0.5) * 10.0)
    ).toFixed(1)
  );

  // Impact of Fiscal Policy Levers (Taxation & Ministerial Spending)
  if (fiscalLevers) {
    // Corporate tax below 28% stimulates private investment & GDP growth
    growthDelta += (28 - fiscalLevers.corporateTaxRatePercent) * 0.08;
    unemploymentDelta -= (28 - fiscalLevers.corporateTaxRatePercent) * 0.06;

    // Infrastructure spending above 5.5B boosts GDP growth and lowers unemployment
    growthDelta += (fiscalLevers.infrastructureBudgetBillionMAD - 5.5) * 0.14;
    unemploymentDelta -= (fiscalLevers.infrastructureBudgetBillionMAD - 5.5) * 0.12;
    youthUnemploymentDelta -= (fiscalLevers.educationBudgetBillionMAD - 6.8) * 0.15;

    // VAT increases consumer inflation, while Maqassa subsidies buffer consumer inflation
    inflationDelta += (fiscalLevers.vatRatePercent - 20) * 0.18;
    inflationDelta -= (fiscalLevers.maqassaSubsidyBillionMAD - 3.5) * 0.22;
  }

  // Water / Agriculture drag: Morocco's GDP is historically tied to agricultural rainfall
  // Severe water stress directly depresses agricultural value-added
  const agriDrag = (waterStress > 60 ? (waterStress - 60) * 0.03 : -0.1) * difficultyMultiplier;
  growthDelta -= agriDrag;

  // Commodity price effects
  // High oil price drives inflation up; high phosphate price drives exports and revenue up
  const oilInflationPush = ((nextCrudeOilPriceUSD - 75) / 50) * 0.4;
  inflationDelta += oilInflationPush;

  // Private Investment & FDI dynamics
  const taxCompetitiveness = fiscalLevers ? (28 - fiscalLevers.corporateTaxRatePercent) * 0.6 : 0;
  const infraPull = fiscalLevers ? (fiscalLevers.infrastructureBudgetBillionMAD - 5.5) * 0.8 : 0;
  const fdiFlow = Number(
    Math.max(
      1.5,
      Math.min(12.0, 3.6 + fdiBonus * 0.45 + taxCompetitiveness * 0.12 - (current.bamInterestRate - 2.5) * 0.3)
    ).toFixed(2)
  );
  const privateInvestmentIndex = Number(
    Math.max(
      35,
      Math.min(98, current.privateInvestmentIndex + (fdiFlow - 3.8) * 0.5 + taxCompetitiveness * 0.15 + infraPull * 0.15 - (current.bamInterestRate - 2.75) * 0.6)
    ).toFixed(1)
  );
  growthDelta += (fdiFlow - 3.8) * 0.12;

  // Seasonal tourist cycle: summer months (June-August) and spring (April-May) see high tourism
  const isHighSeason = month >= 4 && month <= 9;
  const tourismReceipts = isHighSeason ? 10.5 + Math.random() * 2.0 : 6.8 + Math.random() * 1.5;

  // Compute new real GDP growth
  // Mean reversion towards potential growth 3.5%
  const currentGrowth = current.realGdpGrowthRate;
  const reversion = (3.5 - currentGrowth) * 0.08;
  const newGrowthRate = Math.max(-2.5, Math.min(7.5, currentGrowth + reversion + growthDelta * 0.15));

  // Compute inflation with Bank Al-Maghrib interest rate response
  // If inflation is high, BAM raises interest rates, cooling inflation
  let newInflation = Math.max(0.5, Math.min(12.0, current.inflationRate + inflationDelta * 0.2 - (current.bamInterestRate - 2.5) * 0.15));
  // BAM policy rate decision
  let newBamRate = current.bamInterestRate;
  if (newInflation > 3.5 && newBamRate < 5.0) {
    newBamRate = Math.min(5.0, newBamRate + 0.25);
  } else if (newInflation < 2.0 && newBamRate > 2.0) {
    newBamRate = Math.max(2.0, newBamRate - 0.25);
  }

  // Compute Unemployment based on Okun's law (growth > 3.5% reduces unemployment)
  const growthSurplus = newGrowthRate - 3.2;
  const okunEffect = growthSurplus * 0.15;
  const newUnemployment = Math.max(7.5, Math.min(19.0, current.unemploymentRate - okunEffect + unemploymentDelta * 0.1));
  const newYouthUnemployment = Math.max(18.0, Math.min(48.0, current.youthUnemploymentRate - okunEffect * 1.8 + youthUnemploymentDelta * 0.1));

  // Nominal GDP calculation (monthly nominal increment)
  const monthlyNominalGrowth = ((newGrowthRate + newInflation) / 100) / 12;
  const newGdpBillionMAD = Math.max(1200, current.gdpBillionMAD * (1 + monthlyNominalGrowth));

  // Trade balance
  const exports = Math.max(25, 38.0 + (newGrowthRate * 0.8) + ((nextPhosphatePriceUSD - 200) / 100) * 2.5);
  const imports = Math.max(35, 52.0 + (newInflation * 0.6) + ((nextCrudeOilPriceUSD - 75) / 50) * 4.0);

  // Sector outputs
  const sectorOutput = {
    agriculture: Math.max(30, Math.min(100, current.sectorOutput.agriculture - agriDrag * 5 + (waterStress < 40 ? 4 : -2))),
    industry: Math.max(40, Math.min(100, current.sectorOutput.industry + growthDelta * 3)),
    services: Math.max(45, Math.min(100, current.sectorOutput.services + (isHighSeason ? 3 : -1))),
    miningPhosphates: Math.max(50, Math.min(100, 75 + ((nextPhosphatePriceUSD - 200) / 100) * 15)),
    tourism: Math.max(30, Math.min(100, isHighSeason ? 88 : 62)),
    energy: Math.max(40, Math.min(100, current.sectorOutput.energy + 0.2))
  };

  // Purchasing power
  const purchasingPower = Math.max(30, Math.min(100, 100 - (newInflation * 5.5) - (newUnemployment * 1.2)));

  const nextEconomy: EconomicState = {
    ...current,
    gdpBillionMAD: Number(newGdpBillionMAD.toFixed(1)),
    realGdpGrowthRate: Number(newGrowthRate.toFixed(2)),
    inflationRate: Number(newInflation.toFixed(2)),
    unemploymentRate: Number(newUnemployment.toFixed(2)),
    youthUnemploymentRate: Number(newYouthUnemployment.toFixed(2)),
    bamInterestRate: Number(newBamRate.toFixed(2)),
    consumerPurchasingPower: Number(purchasingPower.toFixed(1)),
    privateInvestmentIndex,
    fdiBillionMAD: fdiFlow,
    exportsBillionMAD: Number(exports.toFixed(2)),
    importsBillionMAD: Number(imports.toFixed(2)),
    tourismRevenueBillionMAD: Number(tourismReceipts.toFixed(2)),
    phosphatePriceUSD: nextPhosphatePriceUSD,
    crudeOilPriceUSD: nextCrudeOilPriceUSD,
    sectorOutput
  };

  return {
    nextEconomy,
    deltas: {
      gdp: Number((newGdpBillionMAD - current.gdpBillionMAD).toFixed(1)),
      inflation: Number((newInflation - current.inflationRate).toFixed(2)),
      unemployment: Number((newUnemployment - current.unemploymentRate).toFixed(2))
    }
  };
}
