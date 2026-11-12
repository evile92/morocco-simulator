import { GovernmentState, PoliticalParty, Minister } from '../types/game';

/**
 * Computes pairwise ideological harmony (0-100) among governing coalition partners.
 */
export function calculateCoalitionHarmony(
  current: GovernmentState,
  parties: PoliticalParty[]
): number {
  const coalitionIds = Array.from(new Set([current.rulingPartyId, ...(current.coalitionPartyIds || [])]));
  const coalitionParties = parties.filter(p => coalitionIds.includes(p.id));
  if (coalitionParties.length <= 1) return 80;

  let pairSum = 0;
  let pairCount = 0;
  for (let i = 0; i < coalitionParties.length; i++) {
    for (let j = i + 1; j < coalitionParties.length; j++) {
      const a = coalitionParties[i];
      const b = coalitionParties[j];
      const compatAB = a.coalitionCompatibility?.[b.id];
      const compatBA = b.coalitionCompatibility?.[a.id];
      const score =
        compatAB !== undefined && compatBA !== undefined
          ? (compatAB + compatBA) / 2
          : compatAB ?? compatBA ?? 55;
      pairSum += score;
      pairCount++;
    }
  }

  return pairCount > 0 ? Math.round(pairSum / pairCount) : 70;
}

export function calculateGovernmentStability(
  current: GovernmentState,
  parties: PoliticalParty[],
  nationalApproval: number,
  nationalTension: number,
  monthlyDeficitBillionMAD: number,
  gameMode: string
): { stability: number; isCrisis: boolean; crisisReason?: string; coalitionHarmony: number } {
  const coalitionHarmony = calculateCoalitionHarmony(current, parties);

  if (gameMode === 'sandbox') {
    return { stability: 95, isCrisis: false, coalitionHarmony };
  }

  // 1. Parliamentary majority strength
  // 198 is exact 50%+1. A majority of 270 gives strong cushion
  const majorityBonus = ((current.parliamentarySeats - 198) / 100) * 20;

  // 2. Public approval component
  const approvalComponent = (nationalApproval - 50) * 0.6;

  // 3. Social tension penalty (high tension directly undermines cabinet)
  const tensionPenalty = Math.max(0, (nationalTension - 45) * 0.7);

  // 4. Minister loyalty, competence & corruption risk
  const ministerCount = Math.max(1, current.ministers.length);
  const avgMinisterLoyalty = current.ministers.reduce((acc, m) => acc + m.loyalty, 0) / ministerCount;
  const avgMinisterCompetence = current.ministers.reduce((acc, m) => acc + m.competence, 0) / ministerCount;
  const avgCorruptionRisk = current.ministers.reduce((acc, m) => acc + m.corruptionRisk, 0) / ministerCount;
  const cabinetStrength = ((avgMinisterLoyalty + avgMinisterCompetence) / 2 - 75) * 0.4;
  const corruptionPenalty = Math.max(0, (avgCorruptionRisk - 35) * 0.18);

  // 5. Coalition compatibility factor
  const coalitionFactor = (coalitionHarmony - 65) * 0.25;

  // 6. Fiscal stress penalty (deficits > 5B MAD/month erode stability)
  const fiscalPenalty = monthlyDeficitBillionMAD < -5.0 ? Math.abs(monthlyDeficitBillionMAD + 5.0) * 1.5 : 0;

  const rawStability =
    65 +
    majorityBonus +
    approvalComponent -
    tensionPenalty +
    cabinetStrength +
    coalitionFactor -
    corruptionPenalty -
    fiscalPenalty;
  const stability = Math.max(5, Math.min(98, Math.round(rawStability)));

  let isCrisis = false;
  let crisisReason: string | undefined;

  if (stability < 25) {
    isCrisis = true;
    if (nationalTension > 75) {
      crisisReason = 'Widespread social unrest and protest waves have paralyzed government authority.';
    } else if (current.parliamentarySeats < 198) {
      crisisReason = 'Government has lost its absolute parliamentary majority in the House of Representatives.';
    } else if (nationalApproval < 30) {
      crisisReason = 'Severe collapse in citizen trust and public approval has triggered a legitimacy crisis.';
    } else {
      crisisReason = 'Severe cabinet discord and economic headwinds threaten government survival.';
    }
  }

  return { stability, isCrisis, crisisReason, coalitionHarmony };
}

export function reshuffleMinister(
  ministers: Minister[],
  portfolio: Minister['portfolio'],
  newMinister: Partial<Minister>
): Minister[] {
  return ministers.map(m => {
    if (m.portfolio === portfolio) {
      return { ...m, ...newMinister };
    }
    return m;
  });
}
