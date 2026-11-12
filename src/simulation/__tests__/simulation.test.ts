import { describe, it, expect } from 'vitest';
import { getInitialGameState, advanceMonth, evaluateStrategicGoals } from '../engine';
import { simulateWater } from '../water';
import { chargeTreasury } from '../budget';
import { calculateCoalitionHarmony } from '../government';
import {
  enactPolicyAction,
  resolveCrisisChoiceAction,
  regionalInterventionAction,
  diplomaticAction
} from '../actions';
import { getConfiguredDeepSeekKey } from '../../ai/deepseek';
import { hydrateGameState } from '../../storage/saveManager';
import type { GameEvent, Policy, PoliticalParty } from '../../types/game';

describe('Morocco Simulator core simulation & MoroccoAPI integration', () => {
  it('initializes with calibrated budget, RGPH 2024 data, 25 dams, and 5 strategic goals', () => {
    const state = getInitialGameState();

    expect(state.budget.totalMonthlyRevenue).toBe(47.7);
    expect(state.budget.totalMonthlyExpense).toBe(51.9);
    expect(state.budget.monthlyBalance).toBe(-4.2);

    expect(state.water.dams?.length).toBe(25);

    const casablanca = state.regions.find(r => r.id === 'casablanca_settat');
    expect(casablanca?.population).toBe(7688967);

    expect(state.goals?.length).toBe(5);
    expect(state.gameOver).toBeNull();
  });

  it('hydrates legacy save payloads safely with backfilled fields', () => {
    const base = getInitialGameState();
    const raw = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
    delete raw.actionCooldowns;
    delete raw.executedOneTimeActions;
    delete raw.goals;
    delete raw.gameOver;
    if (raw.water && typeof raw.water === 'object') {
      const waterRaw = raw.water as Record<string, unknown>;
      delete waterRaw.appliedDesalinationPolicyIds;
      delete waterRaw.dams;
    }

    const hydrated = hydrateGameState(raw);
    expect(hydrated.actionCooldowns).toEqual({});
    expect(hydrated.executedOneTimeActions).toEqual([]);
    expect(hydrated.goals?.length).toBe(5);
    expect(hydrated.water.dams?.length).toBe(25);
    expect(hydrated.water.appliedDesalinationPolicyIds).toEqual([]);
    expect(hydrated.gameOver).toBeNull();
  });

  it('applies desalination policy capacity once instead of compounding every month', () => {
    const state = getInitialGameState();
    const desalPolicy = state.policies.find(p => p.id === 'water_desalination_expansion');
    expect(desalPolicy).toBeDefined();

    const enacted: Policy = {
      ...desalPolicy!,
      implemented: true,
      monthImplemented: 1
    };

    const baselineM3 = state.water.desalinationDailyM3;
    const baselinePlants = state.water.operationalDesalinationPlants;

    const m1 = simulateWater(state.water, 2, [enacted], 'normal');
    expect(m1.nextWater.desalinationDailyM3).toBe(baselineM3 + (enacted.modifiers.desalinationDelta || 0));
    expect(m1.nextWater.operationalDesalinationPlants).toBe(baselinePlants + 1);
    expect(m1.nextWater.appliedDesalinationPolicyIds).toContain(enacted.id);

    const m2 = simulateWater(m1.nextWater, 3, [enacted], 'normal');
    const m3 = simulateWater(m2.nextWater, 4, [enacted], 'normal');

    expect(m2.nextWater.desalinationDailyM3).toBe(m1.nextWater.desalinationDailyM3);
    expect(m3.nextWater.desalinationDailyM3).toBe(m1.nextWater.desalinationDailyM3);
    expect(m3.nextWater.operationalDesalinationPlants).toBe(baselinePlants + 1);
  });

  it('persists custom decrees, prevents duplicate enactment, and enforces treasury sufficiency', () => {
    const initial = getInitialGameState();
    const customDecree: Policy = {
      id: 'custom_test_decree_1',
      category: 'economy',
      titleEn: 'Custom Industrial Rebate',
      titleAr: 'مرسوم تحفيز صناعي خاص',
      descriptionEn: 'Test custom decree',
      descriptionAr: 'مرسوم تجريبي',
      upfrontCostBillionMAD: 2.0,
      monthlyCostBillionMAD: 0.1,
      requiresParliamentApproval: false,
      implemented: false,
      expectedProsEn: ['Boosts FDI'],
      expectedProsAr: ['يدعم الاستثمار'],
      expectedRisksEn: ['Costs 2B MAD'],
      expectedRisksAr: ['كلفة 2 مليار درهم'],
      modifiers: {
        fdiBillionMAD: 0.5,
        gdpGrowthDelta: 0.2
      }
    };

    const first = enactPolicyAction(initial, customDecree);
    expect(first.notice.passed).toBe(true);
    const persisted = first.state.policies.find(p => p.id === 'custom_test_decree_1');
    expect(persisted?.implemented).toBe(true);
    expect(first.state.budget.treasuryReservesBillionMAD).toBeCloseTo(
      initial.budget.treasuryReservesBillionMAD - 2.0,
      1
    );

    const duplicate = enactPolicyAction(first.state, customDecree);
    expect(duplicate.notice.passed).toBe(false);

    const expensiveDecree: Policy = {
      ...customDecree,
      id: 'custom_too_expensive',
      upfrontCostBillionMAD: 9999
    };
    const unaffordable = enactPolicyAction(first.state, expensiveDecree);
    expect(unaffordable.notice.passed).toBe(false);
    expect(unaffordable.state.policies.find(p => p.id === 'custom_too_expensive')).toBeUndefined();
  });

  it('applies full CrisisChoice effects and finances deficit shortfalls through debt', () => {
    const initial = getInitialGameState();
    const crisis: GameEvent = {
      id: 'test_crisis_full_effects',
      type: 'economic',
      titleEn: 'Test Supply Shock',
      titleAr: 'أزمة اختبارية',
      descriptionEn: 'Test description',
      descriptionAr: 'وصف اختباري',
      severity: 'high',
      monthOccurred: 1,
      affectedRegionId: 'souss_massa',
      choices: [
        {
          id: 'full_package',
          textEn: 'Full Intervention',
          textAr: 'تدخل شامل',
          costBillionMAD: initial.budget.treasuryReservesBillionMAD + 10,
          consequencesEn: ['Stabilizes region'],
          consequencesAr: ['يهدئ الجهة'],
          effects: {
            approvalDelta: 4,
            stabilityDelta: 3,
            budgetExpenseDelta: 0.5,
            socialTensionDelta: -5,
            regionalSatisfactionDelta: 7,
            inflationDelta: 0.4,
            gdpGrowthDelta: 0.3,
            foreignRelationDelta: { france: 8 }
          }
        }
      ]
    };

    const withCrisis = { ...initial, activeCrises: [crisis] };
    const resolved = resolveCrisisChoiceAction(withCrisis, crisis.id, 'full_package');

    const initSouss = initial.regions.find(r => r.id === 'souss_massa')!;
    const afterSouss = resolved.regions.find(r => r.id === 'souss_massa')!;
    expect(afterSouss.satisfaction).toBe(Math.min(95, Number((initSouss.satisfaction + 7).toFixed(1))));
    expect(afterSouss.socialTension).toBe(Math.max(5, Number((initSouss.socialTension - 5).toFixed(1))));

    expect(resolved.economy.inflationRate).toBeCloseTo(initial.economy.inflationRate + 0.4, 2);
    expect(resolved.economy.realGdpGrowthRate).toBeCloseTo(initial.economy.realGdpGrowthRate + 0.3, 2);

    const initFrance = initial.foreignRelations.find(f => f.id === 'france')!;
    const afterFrance = resolved.foreignRelations.find(f => f.id === 'france')!;
    expect(afterFrance.relationshipScore).toBe(Math.min(100, initFrance.relationshipScore + 8));

    expect(resolved.budget.treasuryReservesBillionMAD).toBe(0);
    expect(resolved.budget.publicDebtBillionMAD).toBeGreaterThan(initial.budget.publicDebtBillionMAD);
    expect(resolved.budget.totalMonthlyExpense).toBeCloseTo(initial.budget.totalMonthlyExpense + 0.5, 2);
  });

  it('enforces regional cooldowns and diplomatic one-time / duplicate pact locks', () => {
    const initial = getInitialGameState();

    const reg1 = regionalInterventionAction(initial, 'casablanca_settat', 'job_stimulus');
    expect(reg1.notice.passed).toBe(true);
    expect(reg1.state.actionCooldowns?.['reg_casablanca_settat']).toBe(2);

    const reg2 = regionalInterventionAction(reg1.state, 'casablanca_settat', 'water_roads');
    expect(reg2.notice.passed).toBe(false);

    const port1 = diplomaticAction(initial, 'sahara_dossier', 'sahara_dakhla_port');
    expect(port1.notice.passed).toBe(true);
    expect(port1.state.executedOneTimeActions).toContain('sahara_dakhla_port');

    const port2 = diplomaticAction(port1.state, 'sahara_dossier', 'sahara_dakhla_port');
    expect(port2.notice.passed).toBe(false);

    const noFtaCountry = initial.foreignRelations.find(c => !c.freeTradeAgreement);
    expect(noFtaCountry).toBeDefined();

    const trade1 = diplomaticAction(initial, noFtaCountry!.id, 'sign_trade');
    expect(trade1.notice.passed).toBe(true);
    const updatedCountry = trade1.state.foreignRelations.find(c => c.id === noFtaCountry!.id)!;
    expect(updatedCountry.freeTradeAgreement).toBe(true);

    const trade2 = diplomaticAction(trade1.state, noFtaCountry!.id, 'sign_trade');
    expect(trade2.notice.passed).toBe(false);
  });

  it('surfaces Article 105 no-confidence crisis and issues emergency T-bills on negative reserves', () => {
    const base = getInitialGameState();
    const stressed = {
      ...base,
      government: {
        ...base.government,
        parliamentarySeats: 170,
        approvalRating: 18,
        stability: 18
      },
      budget: {
        ...base.budget,
        treasuryReservesBillionMAD: 0.5
      }
    };

    const next = advanceMonth(stressed, 1);

    const noConfidence = next.activeCrises.find(c => c.id.startsWith('motion_no_confidence_'));
    expect(noConfidence).toBeDefined();
    expect(
      next.newsFeed.some(
        n => n.id.includes('motion_no_confidence_') || n.headlineAr.includes('ملتمس الرقابة')
      )
    ).toBe(true);

    expect(next.budget.treasuryReservesBillionMAD).toBeGreaterThanOrEqual(0);
    expect(next.budget.publicDebtBillionMAD).toBeGreaterThan(stressed.budget.publicDebtBillionMAD);
    expect(next.newsFeed.some(n => n.id.startsWith('news_bond_'))).toBe(true);
  });

  it('computes lower coalition harmony for polarized parties and exposes no hardcoded DeepSeek key', () => {
    const base = getInitialGameState();
    const partyA: PoliticalParty = {
      id: 'test_left',
      acronym: 'TL',
      nameEn: 'Test Left',
      nameAr: 'يسار',
      color: '#ef4444',
      ideology: 'democratic_socialist',
      economicPosition: 'left',
      socialPosition: 'progressive',
      seats: 120,
      popularity: 25,
      regionalStrongholds: [],
      targetDemographics: [],
      manifestoEn: 'Left',
      manifestoAr: 'يسار',
      coalitionCompatibility: { test_right: 20, test_center: 45 },
      oppositionIntensity: 60,
      isGovernment: true
    };
    const partyB: PoliticalParty = {
      id: 'test_right',
      acronym: 'TR',
      nameEn: 'Test Right',
      nameAr: 'يمين',
      color: '#3b82f6',
      ideology: 'national_conservative',
      economicPosition: 'right',
      socialPosition: 'conservative',
      seats: 120,
      popularity: 25,
      regionalStrongholds: [],
      targetDemographics: [],
      manifestoEn: 'Right',
      manifestoAr: 'يمين',
      coalitionCompatibility: { test_left: 20, test_center: 88 },
      oppositionIntensity: 30,
      isGovernment: true
    };
    const partyC: PoliticalParty = {
      id: 'test_center',
      acronym: 'TC',
      nameEn: 'Test Center Right',
      nameAr: 'وسط',
      color: '#10b981',
      ideology: 'liberal_technocrat',
      economicPosition: 'center-right',
      socialPosition: 'moderate',
      seats: 120,
      popularity: 25,
      regionalStrongholds: [],
      targetDemographics: [],
      manifestoEn: 'Center',
      manifestoAr: 'وسط',
      coalitionCompatibility: { test_left: 45, test_right: 88 },
      oppositionIntensity: 20,
      isGovernment: true
    };

    const polarizedHarmony = calculateCoalitionHarmony(
      { ...base.government, rulingPartyId: 'test_left', coalitionPartyIds: ['test_left', 'test_right'] },
      [partyA, partyB, partyC]
    );
    const alignedHarmony = calculateCoalitionHarmony(
      { ...base.government, rulingPartyId: 'test_right', coalitionPartyIds: ['test_right', 'test_center'] },
      [partyA, partyB, partyC]
    );

    expect(polarizedHarmony).toBeLessThan(alignedHarmony);
    expect(getConfiguredDeepSeekKey()).toBe('');

    const chargeDenied = chargeTreasury(base.budget, base.budget.treasuryReservesBillionMAD + 5, 'normal', false);
    expect(chargeDenied.ok).toBe(false);
  });

  it('completes a 60-month baseline simulation cleanly without NaN and triggers Game Over summary', () => {
    let state = getInitialGameState();
    for (let i = 0; i < 60; i++) {
      state = advanceMonth({ ...state, isPaused: false });
      if (state.gameOver) break;
    }

    expect(Number.isFinite(state.economy.gdpBillionMAD)).toBe(true);
    expect(Number.isFinite(state.economy.inflationRate)).toBe(true);
    expect(Number.isFinite(state.economy.unemploymentRate)).toBe(true);
    expect(Number.isFinite(state.budget.treasuryReservesBillionMAD)).toBe(true);
    expect(Number.isFinite(state.budget.publicDebtBillionMAD)).toBe(true);
    expect(Number.isFinite(state.water.overallDamFillRate)).toBe(true);
    expect(Number.isFinite(state.government.approvalRating)).toBe(true);
    expect(Number.isFinite(state.government.stability)).toBe(true);

    expect(state.gameOver).not.toBeNull();
    expect(state.isPaused).toBe(true);
    expect(evaluateStrategicGoals(state).length).toBe(5);
  });
});
