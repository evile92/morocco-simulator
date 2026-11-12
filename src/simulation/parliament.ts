import { PoliticalParty, Policy, ParliamentaryVote } from '../types/game';

export function simulateParliamentVote(
  policy: Policy,
  parties: PoliticalParty[],
  governmentApproval: number,
  formattedDate: string
): ParliamentaryVote {
  let totalAyes = 0;
  let totalNays = 0;
  let totalAbstentions = 0;
  const partyVotes: Record<string, { ayes: number; nays: number; abstentions: number }> = {};

  for (const party of parties) {
    const seats = party.seats;
    let probAye = 0.5;

    if (party.isGovernment) {
      // Coalition compatibility slightly affects whip discipline among coalition partners
      const govCompat = Object.values(party.coalitionCompatibility || {});
      const avgCompat = govCompat.length > 0 ? govCompat.reduce((a, b) => a + b, 0) / govCompat.length : 70;
      const harmonyBoost = (avgCompat - 65) * 0.002;
      probAye = Math.max(0.72, Math.min(0.98, 0.88 + (governmentApproval / 100) * 0.1 + harmonyBoost));
    } else {
      // Opposition party vote depends on ideological alignment and opposition intensity
      let ideologicalMatch = 0.5;

      // Economic position match
      if (policy.category === 'social' || policy.category === 'subsidies' || policy.category === 'employment') {
        if (party.economicPosition === 'left' || party.economicPosition === 'center-left') {
          ideologicalMatch += 0.3; // Left opposition supports social programs
        }
      }
      if (policy.category === 'taxation') {
        if (policy.id.includes('progressive') || policy.id.includes('relief')) {
          if (party.economicPosition === 'left') ideologicalMatch += 0.25;
        } else if (policy.id.includes('fuel')) {
          ideologicalMatch -= 0.4; // Opposition fiercely rejects fuel taxes
        }
      }
      if (policy.category === 'water' || policy.category === 'infrastructure') {
        // Broad national consensus on water and large national infrastructure
        ideologicalMatch += 0.2;
      }
      if (policy.category === 'culture' && party.id === 'mp') {
        ideologicalMatch += 0.4; // Popular Movement strongly supports Amazigh language
      }

      // Opposition aggressiveness penalty
      const oppositionPenalty = (party.oppositionIntensity / 100) * 0.4;
      probAye = Math.max(0.05, Math.min(0.95, ideologicalMatch - oppositionPenalty));
    }

    const ayes = Math.round(seats * probAye);
    const remaining = seats - ayes;
    const nays = Math.round(remaining * 0.85);
    const abstentions = remaining - nays;

    totalAyes += ayes;
    totalNays += nays;
    totalAbstentions += abstentions;

    partyVotes[party.id] = { ayes, nays, abstentions };
  }

  // Absolute majority threshold in 395-seat chamber is 198
  const passed = totalAyes >= 198 || (totalAyes > totalNays && totalAyes >= 160);

  return {
    id: `vote_${policy.id}_${Date.now()}`,
    policyId: policy.id,
    titleEn: policy.titleEn,
    titleAr: policy.titleAr,
    ayes: totalAyes,
    nays: totalNays,
    abstentions: totalAbstentions,
    passed,
    date: formattedDate,
    partyVotes
  };
}
