import { DemographicGroup, RegionData, CityData, Policy, EconomicState, WaterState, FiscalLevers } from '../types/game';

export function simulateOpinion(
  demographics: DemographicGroup[],
  regions: RegionData[],
  cities: CityData[],
  economy: EconomicState,
  water: WaterState,
  activePolicies: Policy[],
  recentProtestCount: number,
  fiscalLevers?: FiscalLevers
): {
  nextDemographics: DemographicGroup[];
  nextRegions: RegionData[];
  nextCities: CityData[];
  nationalApproval: number;
  nationalTrust: number;
} {
  // Aggregate policy modifiers for demographics and regions
  const demoModifiers: Record<string, number> = {};
  const regModifiers: Record<string, number> = {};
  let generalApprovalDelta = 0;
  let policyTensionDelta = 0;

  for (const p of activePolicies) {
    if (p.modifiers.approvalDelta) generalApprovalDelta += p.modifiers.approvalDelta;
    if (p.modifiers.socialTensionDelta) policyTensionDelta += p.modifiers.socialTensionDelta;
    if (p.modifiers.demographicSatisfactionDelta) {
      for (const [k, v] of Object.entries(p.modifiers.demographicSatisfactionDelta)) {
        demoModifiers[k] = (demoModifiers[k] || 0) + v;
      }
    }
    if (p.modifiers.regionalSatisfactionDelta) {
      for (const [k, v] of Object.entries(p.modifiers.regionalSatisfactionDelta)) {
        regModifiers[k] = (regModifiers[k] || 0) + v;
      }
    }
  }

  if (fiscalLevers) {
    // Public social spending and subsidies boost general approval
    generalApprovalDelta += (fiscalLevers.maqassaSubsidyBillionMAD - 3.5) * 0.9;
    generalApprovalDelta += (fiscalLevers.healthcareBudgetBillionMAD - 4.2) * 0.7;
    generalApprovalDelta += (fiscalLevers.educationBudgetBillionMAD - 6.8) * 0.5;
    generalApprovalDelta -= (fiscalLevers.vatRatePercent - 20) * 0.6;
  }

  // Macro drag on public sentiment
  const inflationPain = Math.max(0, (economy.inflationRate - 2.5) * 2.2);
  const youthJobPain = Math.max(0, (economy.youthUnemploymentRate - 28) * 0.8);
  const waterPain = water.droughtLevel === 'catastrophic' ? 8.0 : water.droughtLevel === 'extreme' ? 5.0 : water.droughtLevel === 'severe' ? 2.5 : 0;
  const protestPenalty = recentProtestCount * 3.0;

  // 1. Update Demographic Groups
  const nextDemographics = demographics.map(d => {
    let groupDelta = generalApprovalDelta * 0.2 + (demoModifiers[d.id] || 0);

    // Group specific pain points & fiscal lever sensitivities
    if (d.id === 'low_income' || d.id === 'retirees' || d.id === 'workers') {
      groupDelta -= inflationPain * 1.5;
      if (fiscalLevers) {
        groupDelta += (fiscalLevers.maqassaSubsidyBillionMAD - 3.5) * 1.8;
        groupDelta += (fiscalLevers.healthcareBudgetBillionMAD - 4.2) * 1.2;
        groupDelta -= (fiscalLevers.vatRatePercent - 20) * 1.1;
      }
    }
    if (d.id === 'middle_income' || d.id === 'private_employees') {
      groupDelta -= inflationPain * 1.0;
      if (fiscalLevers) {
        groupDelta -= (fiscalLevers.incomeTaxRatePercent - 30) * 1.1;
        groupDelta += (fiscalLevers.healthcareBudgetBillionMAD - 4.2) * 0.9;
      }
    }
    if (d.id === 'public_employees') {
      if (fiscalLevers) {
        groupDelta += (fiscalLevers.publicWagesBillionMAD - 13.5) * 2.2;
        groupDelta -= (fiscalLevers.incomeTaxRatePercent - 30) * 0.8;
      }
    }
    if (d.id === 'young_people' || d.id === 'students') {
      groupDelta -= youthJobPain * 1.4;
      if (fiscalLevers) {
        groupDelta += (fiscalLevers.educationBudgetBillionMAD - 6.8) * 1.6;
        groupDelta += (fiscalLevers.infrastructureBudgetBillionMAD - 5.5) * 0.8;
      }
    }
    if (d.id === 'farmers') {
      groupDelta -= waterPain * 1.8;
      if (fiscalLevers) {
        groupDelta += (fiscalLevers.maqassaSubsidyBillionMAD - 3.5) * 0.8;
      }
    }
    if (d.id === 'business_owners' || d.id === 'high_income') {
      groupDelta += (economy.realGdpGrowthRate - 3.0) * 1.5 - (economy.bamInterestRate - 2.5) * 1.2;
      if (fiscalLevers) {
        groupDelta += (28 - fiscalLevers.corporateTaxRatePercent) * 1.6;
        groupDelta += (fiscalLevers.infrastructureBudgetBillionMAD - 5.5) * 0.9;
      }
    }

    // Mean reversion to 50
    const reversion = (50 - d.satisfaction) * 0.05;
    const newSat = Math.max(10, Math.min(95, d.satisfaction + reversion + groupDelta * 0.25 - protestPenalty * 0.3));

    return {
      ...d,
      satisfaction: Number(newSat.toFixed(1))
    };
  });

  // 2. Update Regions
  const nextRegions = regions.map(r => {
    let regDelta = generalApprovalDelta * 0.15 + (regModifiers[r.id] || 0);

    // Regional vulnerabilities
    if (r.waterStressIndex > 70) {
      regDelta -= waterPain * 1.2;
    }
    if (r.unemploymentRate > 14) {
      regDelta -= (r.unemploymentRate - 14) * 0.9;
    }

    const reversion = (55 - r.satisfaction) * 0.04;
    const newSat = Math.max(15, Math.min(95, r.satisfaction + reversion + regDelta * 0.2 - protestPenalty * 0.25));

    // Tension is inverse to satisfaction, amplified by unemployment & water stress, and modulated by active social policy effects
    const rawTension = (100 - newSat) * 0.75 + (r.unemploymentRate * 1.2) + (r.waterStressIndex * 0.15) + policyTensionDelta * 0.4;
    const newTension = Math.max(5, Math.min(95, rawTension));
    const newProtestRisk = Math.max(5, Math.min(95, newTension * 0.85 + (r.youthUnemploymentRate * 0.2)));

    return {
      ...r,
      satisfaction: Number(newSat.toFixed(1)),
      socialTension: Number(newTension.toFixed(1)),
      protestRisk: Number(newProtestRisk.toFixed(1))
    };
  });

  // 3. Update Cities based on their parent region
  const regionSatMap = new Map(nextRegions.map(r => [r.id, r.satisfaction]));
  const regionTensionMap = new Map(nextRegions.map(r => [r.id, r.socialTension]));

  const nextCities = cities.map(c => {
    const parentSat = regionSatMap.get(c.regionId) || 55;
    const parentTension = regionTensionMap.get(c.regionId) || 40;

    const newSat = Math.max(15, Math.min(95, c.satisfaction * 0.7 + parentSat * 0.3));
    const newTension = Math.max(5, Math.min(95, c.socialTension * 0.7 + parentTension * 0.3));

    return {
      ...c,
      satisfaction: Number(newSat.toFixed(1)),
      socialTension: Number(newTension.toFixed(1))
    };
  });

  // Calculate National Weighted Approval
  const totalPop = nextDemographics.reduce((acc, d) => acc + d.populationShare, 0);
  const nationalApproval = nextDemographics.reduce((acc, d) => acc + (d.satisfaction * d.populationShare), 0) / totalPop;

  // National Trust
  const avgRegionSatisfaction = nextRegions.reduce((acc, r) => acc + r.satisfaction, 0) / nextRegions.length;
  const nationalTrust = Math.max(10, Math.min(95, (nationalApproval * 0.6) + (avgRegionSatisfaction * 0.4) - (protestPenalty * 1.2)));

  return {
    nextDemographics,
    nextRegions,
    nextCities,
    nationalApproval: Number(nationalApproval.toFixed(1)),
    nationalTrust: Number(nationalTrust.toFixed(1))
  };
}
