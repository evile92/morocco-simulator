import { ForeignRelation, Policy } from '../types/game';

export function simulateForeignRelations(
  relations: ForeignRelation[],
  activePolicies: Policy[],
  gameMode: string
): ForeignRelation[] {
  const policyDeltas: Record<string, number> = {};

  for (const p of activePolicies) {
    if (p.modifiers.foreignRelationDelta) {
      for (const [k, v] of Object.entries(p.modifiers.foreignRelationDelta)) {
        policyDeltas[k] = (policyDeltas[k] || 0) + v;
      }
    }
  }

  return relations.map(country => {
    let delta = (policyDeltas[country.id] || 0);

    // Hard mode slightly increases geopolitical tension
    if (gameMode === 'hard' && country.status === 'tense') {
      delta -= 0.5;
    }

    // Mean reversion to baseline (5% per month)
    const baseline = country.id === 'algeria' ? -75 : country.id === 'usa' ? 92 : country.id === 'spain' ? 82 : 70;
    const reversion = (baseline - country.relationshipScore) * 0.05;

    const newScore = Math.max(-100, Math.min(100, country.relationshipScore + reversion + delta));

    let status: ForeignRelation['status'] = 'neutral';
    if (newScore >= 75) status = 'strategic_ally';
    else if (newScore >= 50) status = 'friendly';
    else if (newScore >= 0) status = 'neutral';
    else if (newScore >= -50) status = 'tense';
    else status = 'adversarial';

    // Trade volume slightly grows with warm relations
    const tradeGrowth = (newScore / 100) * 0.005;
    const newTrade = Math.max(1.0, country.tradeVolumeBillionMAD * (1 + tradeGrowth));

    return {
      ...country,
      relationshipScore: Number(newScore.toFixed(1)),
      tradeVolumeBillionMAD: Number(newTrade.toFixed(1)),
      status
    };
  });
}
