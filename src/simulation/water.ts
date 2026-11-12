import { WaterState, Policy } from '../types/game';

export function simulateWater(
  current: WaterState,
  month: number,
  activePolicies: Policy[],
  gameMode: string
): { nextWater: WaterState; damDelta: number; stressIndex: number } {
  // Morocco Mediterranean/Atlantic rainfall cycle:
  // Wet months: November (11), December (12), January (1), February (2), March (3), April (4)
  // Dry months: May (5), June (6), July (7), August (8), September (9), October (10)
  const isWetSeason = month <= 4 || month >= 11;
  const baseRainfall = isWetSeason
    ? 45 + Math.sin(month) * 25 + (Math.random() * 20 - 10)
    : 8 + (Math.random() * 10);

  // Hard mode increases rainfall deficit
  const droughtHarshness = gameMode === 'hard' ? 1.3 : gameMode === 'sandbox' ? 0.7 : 1.0;
  const simulatedRainfall = Math.max(2, baseRainfall * (1 - (current.annualRainfallDeficit / 100) * 0.4 * droughtHarshness));

  // Monthly evaporation and consumption drain
  // Summer months have high evaporation (~2.5% dam loss per month), winter ~1.0%
  const evaporationRate = (month >= 6 && month <= 9) ? 2.8 : 1.2;
  const agriculturalConsumption = isWetSeason ? 1.0 : 2.2;
  const municipalConsumption = 0.8;
  const naturalInflow = (simulatedRainfall / 50) * 2.8;

  // Policy interventions
  let policyDamBonus = 0;
  let newlyAddedDesalinationM3 = 0;
  let newlyCompletedPlants = 0;
  let targetHighwayFlow = current.waterHighwayFlowM3Sec;

  const appliedDesalinationSet = new Set(current.appliedDesalinationPolicyIds || []);

  for (const p of activePolicies) {
    if (p.modifiers.damFillDelta) policyDamBonus += p.modifiers.damFillDelta;
    // Apply desalination capacity & plant count only once per enacted policy
    if (p.modifiers.desalinationDelta && !appliedDesalinationSet.has(p.id)) {
      newlyAddedDesalinationM3 += p.modifiers.desalinationDelta;
      newlyCompletedPlants += 1;
      appliedDesalinationSet.add(p.id);
    }
    if (p.id === 'water_highway_interconnection') {
      targetHighwayFlow = Math.max(targetHighwayFlow, 15.0);
    }
  }

  // Calculate new dam reservoir fill rate (%)
  const netDamChange = naturalInflow - evaporationRate - (agriculturalConsumption * (1 - current.agriculturalWaterRationingPercent / 100)) - municipalConsumption + (policyDamBonus * 0.1);
  const newFillRate = Math.max(8.0, Math.min(95.0, current.overallDamFillRate + netDamChange));
  const damDelta = Number((newFillRate - current.overallDamFillRate).toFixed(2));

  // Determine drought level
  let droughtLevel: WaterState['droughtLevel'] = 'none';
  if (newFillRate < 18.0) droughtLevel = 'catastrophic';
  else if (newFillRate < 28.0) droughtLevel = 'extreme';
  else if (newFillRate < 40.0) droughtLevel = 'severe';
  else if (newFillRate < 55.0) droughtLevel = 'moderate';

  const nextDesalinationM3 = current.desalinationDailyM3 + newlyAddedDesalinationM3;
  const nextPlants = current.operationalDesalinationPlants + newlyCompletedPlants;

  // Overall national water stress index (0 to 100)
  const stressIndex = Math.max(10, Math.min(100, (100 - newFillRate) * 0.95 - (nextPlants * 1.5)));

  // Urban water security days (higher fill rate & desalination = more days)
  const urbanSecurityDays = Math.round(90 + (newFillRate * 4.5) + (nextDesalinationM3 / 10000) * 1.8);

  // Sync individual dams proportionally across Moroccan river basins
  const updatedDams = current.dams?.map(dam => {
    const basinOffset =
      dam.basin === 'loukkos' || dam.basin === 'sebou'
        ? (isWetSeason ? 0.35 : -0.1)
        : dam.basin === 'souss-massa' || dam.basin === 'tensift'
          ? (isWetSeason ? 0.0 : -0.35)
          : 0;
    const nextDamPct = Number(
      Math.max(5.0, Math.min(99.0, dam.fillingRatePct + damDelta + basinOffset * 0.5)).toFixed(1)
    );
    const nextVolume =
      typeof dam.capacityMm3 === 'number' && dam.capacityMm3 > 0
        ? Number(((nextDamPct / 100) * dam.capacityMm3).toFixed(2))
        : dam.volumeMm3;

    return {
      ...dam,
      fillingRatePct: nextDamPct,
      volumeMm3: nextVolume
    };
  });

  const nextWater: WaterState = {
    ...current,
    overallDamFillRate: Number(newFillRate.toFixed(1)),
    seasonalRainfallMm: Number(simulatedRainfall.toFixed(1)),
    droughtLevel,
    urbanWaterSecurityDays: Math.min(730, urbanSecurityDays),
    desalinationDailyM3: nextDesalinationM3,
    waterHighwayFlowM3Sec: targetHighwayFlow,
    operationalDesalinationPlants: nextPlants,
    appliedDesalinationPolicyIds: Array.from(appliedDesalinationSet),
    dams: updatedDams
  };

  return { nextWater, damDelta, stressIndex: Number(stressIndex.toFixed(1)) };
}
