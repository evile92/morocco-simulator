import { PoliticalParty, RegionData, DemographicGroup, EconomicState } from '../types/game';

export function simulateElection(
  parties: PoliticalParty[],
  regions: RegionData[],
  demographics: DemographicGroup[],
  economy: EconomicState,
  nationalApproval: number
): {
  seatsPerParty: Record<string, number>;
  popularVotePercent: Record<string, number>;
  voterTurnout: number;
} {
  // 1. Calculate Dynamic Voter Turnout
  // Economic vitality, high approval, or high civic tension drives voter mobilization
  const avgDemoTurnout = demographics.reduce((acc, d) => acc + (d.turnoutPropensity * d.populationShare), 0) / 100;
  const economicSatisfactionBonus = (economy.realGdpGrowthRate - 3.0) * 1.8;
  const inflationPenalty = economy.inflationRate > 3.5 ? -2.5 : 1.0;
  const rawTurnout = avgDemoTurnout + economicSatisfactionBonus + inflationPenalty + (Math.random() * 4 - 2);
  const voterTurnout = Number(Math.max(38.0, Math.min(72.0, rawTurnout)).toFixed(1));

  // 2. Compute Raw Vote Score per Party across all Regions and Demographics
  const voteScores: Record<string, number> = {};
  parties.forEach(p => { voteScores[p.id] = 0; });

  // Macro performance multipliers for Government vs Opposition
  // Below 50% approval, government parties face heavy voter backlash
  const govBaseMultiplier = Math.pow(nationalApproval / 52, 1.6);
  const oppBaseMultiplier = Math.pow(Math.max(20, 100 - nationalApproval) / 48, 1.4);

  // Economic headwinds penalty (Inflation and youth unemployment hit ruling coalition)
  const economicHeadwinds = (economy.inflationRate > 3.0 ? 0.88 : 1.05) *
                            (economy.youthUnemploymentRate > 30 ? 0.90 : 1.02);

  // Demographic contributions with ideological swing
  for (const demo of demographics) {
    const demoWeight = demo.populationShare;
    const demoSatisfactionFactor = demo.satisfaction / 55;

    for (const [partyId, weight] of Object.entries(demo.partyLeanings)) {
      if (voteScores[partyId] !== undefined) {
        const party = parties.find(p => p.id === partyId);
        let performanceModifier = 1.0;

        if (party?.isGovernment) {
          performanceModifier = govBaseMultiplier * demoSatisfactionFactor * economicHeadwinds;
        } else {
          performanceModifier = oppBaseMultiplier * (2 - Math.min(1.8, demoSatisfactionFactor));
        }

        // Add campaign volatility factor per party (±8% live variance)
        const campaignNoise = 0.92 + Math.random() * 0.16;

        voteScores[partyId] += demoWeight * weight * Math.max(0.15, performanceModifier) * campaignNoise;
      }
    }
  }

  // Regional strongholds with localized tension punishment
  for (const reg of regions) {
    const regWeight = reg.gdpContributionPercent * 1.5;
    const regSatisfactionFactor = reg.satisfaction / 55;
    const regTensionPenalty = Math.max(0.4, 1 - (reg.socialTension / 100) * 0.7);

    for (const [partyId, share] of Object.entries(reg.partySupport)) {
      if (voteScores[partyId] !== undefined) {
        const party = parties.find(p => p.id === partyId);
        let regPartyModifier = 1.0;

        if (party?.isGovernment) {
          // Regions in crisis severely punish ruling coalition parties
          regPartyModifier = regSatisfactionFactor * regTensionPenalty;
        } else {
          // Opposition soars in troubled or marginalized regions
          regPartyModifier = (1.5 - regSatisfactionFactor * 0.6) * (1 + (reg.socialTension / 120));
        }

        const localCampaignNoise = 0.90 + Math.random() * 0.20;
        voteScores[partyId] += regWeight * share * Math.max(0.2, regPartyModifier) * localCampaignNoise;
      }
    }
  }

  // Convert raw scores to popular vote percentages
  const totalScore = Object.values(voteScores).reduce((a, b) => a + b, 0);
  const popularVotePercent: Record<string, number> = {};

  for (const party of parties) {
    const pct = (voteScores[party.id] / totalScore) * 100;
    popularVotePercent[party.id] = Number(pct.toFixed(2));
  }

  // 3. Proportional Representation Seat Allocation (395 Seats Total)
  // Largest Remainder Method (Hare Quota)
  const totalSeats = 395;
  const quota = 100 / totalSeats;

  const seatsPerParty: Record<string, number> = {};
  const remainders: { partyId: string; remainder: number }[] = [];
  let allocatedSeats = 0;

  for (const party of parties) {
    const pct = popularVotePercent[party.id];
    const initialSeats = Math.floor(pct / quota);
    seatsPerParty[party.id] = initialSeats;
    allocatedSeats += initialSeats;

    const remainder = pct - (initialSeats * quota);
    remainders.push({ partyId: party.id, remainder });
  }

  // Allocate remaining seats by largest remainder
  remainders.sort((a, b) => b.remainder - a.remainder);
  let idx = 0;
  while (allocatedSeats < totalSeats && idx < remainders.length) {
    seatsPerParty[remainders[idx].partyId] += 1;
    allocatedSeats++;
    idx++;
  }

  return {
    seatsPerParty,
    popularVotePercent,
    voterTurnout
  };
}
