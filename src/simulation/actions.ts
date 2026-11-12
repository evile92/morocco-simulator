import {
  GameState,
  Policy,
  ParliamentaryVote,
  RegionalInterventionType,
  DiplomaticActionType,
  Minister
} from '../types/game';
import { chargeTreasury } from './budget';
import { evaluateStrategicGoals } from './engine';
import { formatGameDate } from '../locales/i18n';

export interface ActionNotice {
  textAr: string;
  textEn: string;
  passed: boolean;
}

/**
 * Enacts either a catalog policy or a newly generated custom decree.
 * Prevents duplicate enactment, checks discretionary treasury sufficiency, and appends custom decrees to state.policies.
 */
export function enactPolicyAction(
  prev: GameState,
  policy: Policy,
  vote?: ParliamentaryVote
): { state: GameState; notice: ActionNotice } {
  const existing = prev.policies.find(p => p.id === policy.id);
  if (existing?.implemented) {
    return {
      state: prev,
      notice: {
        textAr: 'هذا المرسوم أو الإصلاح مفعل بالفعل.',
        textEn: 'This decree or policy is already implemented.',
        passed: false
      }
    };
  }

  if (vote && !vote.passed) {
    return {
      state: {
        ...prev,
        parliamentaryVotes: [vote, ...prev.parliamentaryVotes]
      },
      notice: {
        textAr: `رفض مجلس النواب مشروع القانون (${vote.ayes} موافق مقابل ${vote.nays} معارض). لم يتم إصدار المرسوم!`,
        textEn: `Parliament rejected the bill (${vote.ayes} Ayes vs ${vote.nays} Nays). Policy was not enacted!`,
        passed: false
      }
    };
  }

  const treasuryCheck = chargeTreasury(prev.budget, policy.upfrontCostBillionMAD, prev.gameMode, false);
  if (!treasuryCheck.ok) {
    return {
      state: vote ? { ...prev, parliamentaryVotes: [vote, ...prev.parliamentaryVotes] } : prev,
      notice: {
        textAr: `رصيد الخزينة (${prev.budget.treasuryReservesBillionMAD} مليار درهم) غير كافٍ لتغطية الكلفة الأولية (${policy.upfrontCostBillionMAD} مليار درهم).`,
        textEn: `Insufficient treasury reserves (${prev.budget.treasuryReservesBillionMAD}B MAD) for upfront cost (${policy.upfrontCostBillionMAD}B MAD).`,
        passed: false
      }
    };
  }

  const enactedPolicy: Policy = {
    ...policy,
    implemented: true,
    monthImplemented: prev.elapsedMonths
  };

  const updatedPolicies = existing
    ? prev.policies.map(p => (p.id === policy.id ? enactedPolicy : p))
    : [...prev.policies, enactedPolicy];

  const formattedDate = formatGameDate(prev.currentMonth, prev.currentYear, prev.language);
  const record = {
    id: `dec_${policy.id}_${Date.now()}`,
    month: prev.currentMonth,
    year: prev.currentYear,
    date: formattedDate,
    titleEn: policy.titleEn,
    titleAr: policy.titleAr,
    type: 'policy' as const,
    costBillionMAD: policy.upfrontCostBillionMAD,
    immediateEffectsEn: policy.expectedProsEn.join('. '),
    immediateEffectsAr: policy.expectedProsAr.join('. ')
  };

  const nextState: GameState = {
    ...prev,
    policies: updatedPolicies,
    budget: treasuryCheck.nextBudget,
    decisionHistory: [record, ...prev.decisionHistory],
    parliamentaryVotes: vote ? [vote, ...prev.parliamentaryVotes] : prev.parliamentaryVotes
  };

  return {
    state: {
      ...nextState,
      goals: evaluateStrategicGoals(nextState)
    },
    notice: vote
      ? {
          textAr: `صادق مجلس النواب على مشروع القانون بأغلبية ${vote.ayes} صوتاً مقابل ${vote.nays}!`,
          textEn: `Parliament passed the bill with ${vote.ayes} Ayes against ${vote.nays} Nays!`,
          passed: true
        }
      : {
          textAr: 'تم تفعيل وتنزيل المرسوم الحكومي بنجاح!',
          textEn: 'Government decree successfully enacted!',
          passed: true
        }
  };
}

/**
 * Resolves an active national crisis and applies all configured CrisisChoice effects.
 */
export function resolveCrisisChoiceAction(
  prev: GameState,
  crisisId: string,
  choiceId: string
): GameState {
  const crisis = prev.activeCrises.find(c => c.id === crisisId);
  if (!crisis) return prev;

  const choice = crisis.choices.find(ch => ch.id === choiceId);
  if (!choice) return prev;

  const isSnapElection = crisisId.startsWith('motion_no_confidence_') && choiceId === 'concede_early_elections';
  const remainingCrises = prev.activeCrises.filter(c => c.id !== crisisId);
  const resolved = { ...crisis, resolvedChoiceId: choiceId };

  const { nextBudget } = chargeTreasury(prev.budget, choice.costBillionMAD, prev.gameMode, true);
  const expenseDelta = choice.effects.budgetExpenseDelta || 0;
  const adjustedBudget = expenseDelta !== 0
    ? {
        ...nextBudget,
        totalMonthlyExpense: Number((nextBudget.totalMonthlyExpense + expenseDelta).toFixed(2)),
        monthlyBalance: Number((nextBudget.monthlyBalance - expenseDelta).toFixed(2))
      }
    : nextBudget;

  const newApproval = Math.max(10, Math.min(95, Number((prev.government.approvalRating + (choice.effects.approvalDelta || 0)).toFixed(1))));
  const newStability = Math.max(
    10,
    Math.min(95, Number((isSnapElection ? 45 : prev.government.stability + (choice.effects.stabilityDelta || 0)).toFixed(1)))
  );

  const tensionDelta = choice.effects.socialTensionDelta || 0;
  const regSatDelta = choice.effects.regionalSatisfactionDelta || 0;
  const targetRegionId = choice.effects.affectedRegionId || crisis.affectedRegionId;

  const updatedRegions = prev.regions.map(r => {
    const isTarget = targetRegionId ? r.id === targetRegionId : true;
    const localSatChange = isTarget ? regSatDelta : regSatDelta * 0.2;
    const localTensionChange = isTarget ? tensionDelta : tensionDelta * 0.5;
    return {
      ...r,
      satisfaction: Math.max(10, Math.min(95, Number((r.satisfaction + localSatChange).toFixed(1)))),
      socialTension: Math.max(5, Math.min(95, Number((r.socialTension + localTensionChange).toFixed(1))))
    };
  });

  const updatedEconomy = {
    ...prev.economy,
    inflationRate: Math.max(0.4, Math.min(14, Number((prev.economy.inflationRate + (choice.effects.inflationDelta || 0)).toFixed(2)))),
    realGdpGrowthRate: Math.max(-3.0, Math.min(8.5, Number((prev.economy.realGdpGrowthRate + (choice.effects.gdpGrowthDelta || 0)).toFixed(2))))
  };

  let updatedRelations = prev.foreignRelations;
  if (choice.effects.foreignRelationDelta) {
    const deltaMap = choice.effects.foreignRelationDelta;
    updatedRelations = prev.foreignRelations.map(rel => {
      const delta = deltaMap[rel.id];
      if (!delta) return rel;
      return {
        ...rel,
        relationshipScore: Math.max(-100, Math.min(100, rel.relationshipScore + delta))
      };
    });
  }

  const formattedDate = formatGameDate(prev.currentMonth, prev.currentYear, prev.language);
  const record = {
    id: `crisis_res_${crisis.id}_${Date.now()}`,
    month: prev.currentMonth,
    year: prev.currentYear,
    date: formattedDate,
    titleEn: `${crisis.titleEn} (${choice.textEn})`,
    titleAr: `${crisis.titleAr} (${choice.textAr})`,
    type: 'crisis_resolution' as const,
    costBillionMAD: choice.costBillionMAD,
    immediateEffectsEn: choice.consequencesEn.join('. '),
    immediateEffectsAr: choice.consequencesAr.join('. ')
  };

  const nextState: GameState = {
    ...prev,
    activeCrises: remainingCrises,
    resolvedEvents: [resolved, ...prev.resolvedEvents],
    pendingElection: isSnapElection ? true : prev.pendingElection,
    isPaused: isSnapElection ? true : prev.isPaused,
    activeTab: isSnapElection ? 'elections' : prev.activeTab,
    regions: updatedRegions,
    economy: updatedEconomy,
    foreignRelations: updatedRelations,
    government: {
      ...prev.government,
      approvalRating: newApproval,
      stability: newStability,
      voteOfNoConfidenceWarning: false
    },
    budget: adjustedBudget,
    decisionHistory: [record, ...prev.decisionHistory]
  };

  return {
    ...nextState,
    goals: evaluateStrategicGoals(nextState)
  };
}

/**
 * Executes a regional targeted intervention with treasury validation and a 2-month regional cooldown.
 */
export function regionalInterventionAction(
  prev: GameState,
  regionId: string,
  actionType: RegionalInterventionType
): { state: GameState; notice: ActionNotice } {
  const region = prev.regions.find(r => r.id === regionId);
  if (!region) {
    return {
      state: prev,
      notice: { textAr: 'الجهة غير موجودة.', textEn: 'Region not found.', passed: false }
    };
  }

  const cooldownKey = `reg_${regionId}`;
  const remainingCooldown = prev.actionCooldowns?.[cooldownKey] || 0;
  if (remainingCooldown > 0) {
    return {
      state: prev,
      notice: {
        textAr: `تم إطلاق تدخل بجهة ${region.nameAr} مؤخراً. يرجى انتظار ${remainingCooldown} شهر/أشهر.`,
        textEn: `Recent intervention already underway in ${region.nameEn}. Wait ${remainingCooldown} month(s).`,
        passed: false
      }
    };
  }

  let cost = 0.35;
  let satDelta = 5.0;
  let tensionDelta = -5.5;
  let unempDelta = -0.8;
  let waterStressDelta = 0;
  let titleAr = `برنامج دعم صناعي وتشغيل الشباب بجهة ${region.nameAr}`;
  let titleEn = `Industrial & Youth Employment Stimulus in ${region.nameEn}`;

  if (actionType === 'water_roads') {
    cost = 0.25;
    satDelta = 4.5;
    tensionDelta = -5.0;
    unempDelta = -0.3;
    waterStressDelta = -8.0;
    titleAr = `برنامج استعجالي للماء وفك العزلة بجهة ${region.nameAr}`;
    titleEn = `Emergency Water & Rural Connectivity in ${region.nameEn}`;
  } else if (actionType === 'social_health') {
    cost = 0.15;
    satDelta = 4.0;
    tensionDelta = -4.0;
    unempDelta = -0.1;
    titleAr = `تأهيل المستشفيات وقوافل الدعم الاجتماعي بجهة ${region.nameAr}`;
    titleEn = `Healthcare & Social Relief Package in ${region.nameEn}`;
  }

  const treasuryCheck = chargeTreasury(prev.budget, cost, prev.gameMode, false);
  if (!treasuryCheck.ok) {
    return {
      state: prev,
      notice: {
        textAr: `احتياطي الخزينة غير كافٍ لتنفيذ التدخل (${cost} مليار درهم).`,
        textEn: `Insufficient treasury reserves for regional package (${cost}B MAD).`,
        passed: false
      }
    };
  }

  const formattedDate = formatGameDate(prev.currentMonth, prev.currentYear, prev.language);

  const updatedRegions = prev.regions.map(r => {
    if (r.id !== regionId) return r;
    return {
      ...r,
      satisfaction: Math.min(95, Number((r.satisfaction + satDelta).toFixed(1))),
      socialTension: Math.max(8, Number((r.socialTension + tensionDelta).toFixed(1))),
      unemploymentRate: Math.max(6, Number((r.unemploymentRate + unempDelta).toFixed(1))),
      waterStressIndex: Math.max(10, Number((r.waterStressIndex + waterStressDelta).toFixed(1))),
      reservoirFillRate:
        waterStressDelta < 0 ? Math.min(100, Number((r.reservoirFillRate + 3).toFixed(1))) : r.reservoirFillRate
    };
  });

  const updatedCities = prev.cities.map(c => {
    if (c.regionId !== regionId) return c;
    return {
      ...c,
      satisfaction: Math.min(95, Number((c.satisfaction + satDelta).toFixed(1))),
      socialTension: Math.max(8, Number((c.socialTension + tensionDelta).toFixed(1))),
      unemploymentRate: Math.max(6, Number((c.unemploymentRate + unempDelta).toFixed(1)))
    };
  });

  const newApproval = Math.min(95, Number((prev.government.approvalRating + 1.2).toFixed(1)));
  const record = {
    id: `reg_int_${regionId}_${Date.now()}`,
    month: prev.currentMonth,
    year: prev.currentYear,
    date: formattedDate,
    titleEn,
    titleAr,
    type: 'policy' as const,
    costBillionMAD: cost,
    immediateEffectsEn: `Regional satisfaction +${satDelta}%, Tension ${tensionDelta}%, Unemployment ${unempDelta}%`,
    immediateEffectsAr: `ارتفاع الرضا الجهوي (+${satDelta}%)، تراجع الاحتقان (${tensionDelta}%)، وتحسن التشغيل بجهة ${region.nameAr}.`
  };

  return {
    state: {
      ...prev,
      regions: updatedRegions,
      cities: updatedCities,
      budget: treasuryCheck.nextBudget,
      government: { ...prev.government, approvalRating: newApproval },
      actionCooldowns: {
        ...(prev.actionCooldowns || {}),
        [cooldownKey]: 2
      },
      decisionHistory: [record, ...prev.decisionHistory]
    },
    notice: {
      textAr: `تم تنفيذ التدخل الجهوي في ${region.nameAr} بنجاح!`,
      textEn: `Regional intervention executed in ${region.nameEn}!`,
      passed: true
    }
  };
}

/**
 * Executes bilateral diplomacy or Sahara sovereignty actions with one-time/cooldown protections and treasury checks.
 */
export function diplomaticAction(
  prev: GameState,
  countryId: string,
  actionType: DiplomaticActionType
): { state: GameState; notice: ActionNotice } {
  const executedOneTime = prev.executedOneTimeActions || [];
  const oneTimeKeys = new Set(['sahara_dakhla_port', 'sahara_tiznit_highway', 'sahara_au_expulsion', 'algeria_sever_ties']);

  if (oneTimeKeys.has(actionType) && executedOneTime.includes(actionType)) {
    return {
      state: prev,
      notice: {
        textAr: 'تم تنفيذ هذا القرار الاستراتيجي السيادي مسبقاً ولا يمكن تكراره.',
        textEn: 'This sovereign strategic action has already been executed.',
        passed: false
      }
    };
  }

  const targetCountry = prev.foreignRelations.find(c => c.id === countryId);
  if (!oneTimeKeys.has(actionType) && !targetCountry) {
    return {
      state: prev,
      notice: { textAr: 'الدولة غير موجودة.', textEn: 'Country not found.', passed: false }
    };
  }

  if (actionType === 'sign_trade' && targetCountry?.freeTradeAgreement) {
    return {
      state: prev,
      notice: {
        textAr: `اتفاقية التجارة الحرة مع ${targetCountry.nameAr} موقعة وسارية المفعول بالفعل.`,
        textEn: `A free trade pact with ${targetCountry.nameEn} is already active.`,
        passed: false
      }
    };
  }

  if (actionType === 'sign_defense' && targetCountry?.securityPact) {
    return {
      state: prev,
      notice: {
        textAr: `الاتفاقية الدفاعية مع ${targetCountry.nameAr} مفعلة بالفعل.`,
        textEn: `A defense & security pact with ${targetCountry.nameEn} is already active.`,
        passed: false
      }
    };
  }

  const cooldownKey = `dip_${countryId}`;
  if (!oneTimeKeys.has(actionType) && (prev.actionCooldowns?.[cooldownKey] || 0) > 0) {
    return {
      state: prev,
      notice: {
        textAr: `المسار الدبلوماسي مع ${targetCountry?.nameAr} قيد المتابعة هذا الشهر — يرجى التقدم بالزمن قبل خطوة جديدة.`,
        textEn: `Diplomatic initiative with ${targetCountry?.nameEn} already conducted this month.`,
        passed: false
      }
    };
  }

  const formattedDate = formatGameDate(prev.currentMonth, prev.currentYear, prev.language);
  let cost = 0.05;
  let titleEn = '';
  let titleAr = '';
  let descEn = '';
  let descAr = '';
  let actionCategory: 'diplomacy' | 'society' | 'economy' = 'diplomacy';

  let updatedRelations = [...prev.foreignRelations];
  const updatedEconomy = { ...prev.economy };
  let updatedRegions = [...prev.regions];
  const updatedGovernment = { ...prev.government };

  if (actionType === 'sahara_dakhla_port') {
    cost = 1.20;
    titleEn = 'Sovereign Megaproject: Dakhla Atlantic Megaport Acceleration';
    titleAr = 'مشروع سيادي استراتيجي: تسريع إنجاز ميناء الداخلة الأطلسي';
    descEn = 'Allocated emergency capital injection into deepwater port infrastructure, driving FDI inflows and Atlantic maritime dominance.';
    descAr = 'ضخ ميزانية استعجالية كبرى لتسريع إنجاز ميناء الداخلة الأطلسي، مما يعزز الاستثمارات الخارجية والسيادة البحرية على الواجهة الأطلسية.';
    actionCategory = 'economy';
    updatedEconomy.fdiBillionMAD = Number((updatedEconomy.fdiBillionMAD + 0.6).toFixed(1));
    updatedEconomy.realGdpGrowthRate = Number((updatedEconomy.realGdpGrowthRate + 0.2).toFixed(1));
  } else if (actionType === 'sahara_tiznit_highway') {
    cost = 0.60;
    titleEn = 'National Strategic Axis: Completion of Tiznit-Dakhla Dual Carriageway';
    titleAr = 'المحور الاستراتيجي السيادي: استكمال الطريق السريع تيزنيت - الداخلة';
    descEn = 'Secured full funding for final sections, slashing transit times and cementing economic integration of the Southern Provinces.';
    descAr = 'تأمين التمويل الكامل لأشغال الطريق السريع تيزنيت - العيون - الداخلة لربط الأقاليم الجنوبية بالشبكة الوطنية للطرق السيارة.';
    updatedRegions = updatedRegions.map(r => {
      if (['laayoune_sakia_el_hamra', 'dakhla_oued_ed_dahab', 'guelmim_oued_noun'].includes(r.id)) {
        return {
          ...r,
          satisfaction: Math.min(95, r.satisfaction + 5),
          socialTension: Math.max(10, r.socialTension - 4)
        };
      }
      return r;
    });
  } else if (actionType === 'sahara_au_expulsion') {
    cost = 0.25;
    titleEn = 'Continental Diplomatic Offensive: African Union Sovereignty Blitz';
    titleAr = 'هجوم دبلوماسي قاري: حشد طرد الكيان الوهمي من الاتحاد الإفريقي';
    descEn = 'Intense diplomatic mobilization across African capitals to secure two-thirds majority to formally suspend the separatist entity from the AU.';
    descAr = 'إطلاق جولة دبلوماسية قارية مكثفة لتعبئة أغلبية الثلثين بأديس أبابا لتطهير مقاعد الاتحاد الإفريقي من تمثيل الكيان الانفصالي.';
    updatedGovernment.approvalRating = Math.min(95, updatedGovernment.approvalRating + 4);
  } else if (targetCountry) {
    let updatedCountry = { ...targetCountry };

    if (actionType === 'push_recognition') {
      cost = 0.08;
      const willHaveConsulate = updatedCountry.saharaRecognition === 'autonomy_support' || updatedCountry.hasConsulateInSahara;
      const nextRecognition = updatedCountry.saharaRecognition === 'neutral'
        ? 'autonomy_support' as const
        : 'full_sovereignty' as const;

      updatedCountry = {
        ...updatedCountry,
        saharaRecognition: nextRecognition,
        hasConsulateInSahara: willHaveConsulate || nextRecognition === 'full_sovereignty',
        relationshipScore: Math.min(100, updatedCountry.relationshipScore + 8),
        diplomaticTension: Math.max(0, updatedCountry.diplomaticTension - 5)
      };

      titleEn = `Diplomatic Breakthrough: Sahara Recognition with ${targetCountry.nameEn}`;
      titleAr = `اختراق دبلوماسي: تعزيز الموقف السيادي مع ${targetCountry.nameAr}`;
      descEn = `${targetCountry.nameEn} upgraded stance on Moroccan Sahara to ${nextRecognition === 'full_sovereignty' ? 'Full Sovereignty Recognition' : 'Autonomy Plan Support'}.`;
      descAr = `أكدت ${targetCountry.nameAr} موقفاً متقدماً بدعم ${nextRecognition === 'full_sovereignty' ? 'مغربية الصحراء والسيادة الكاملة وفتح قنصلية' : 'مبادرة الحكم الذاتي تحت السيادة المغربية'}.`;
    } else if (actionType === 'sign_trade') {
      cost = 0.05;
      updatedCountry = {
        ...updatedCountry,
        freeTradeAgreement: true,
        tradeVolumeBillionMAD: Number((updatedCountry.tradeVolumeBillionMAD * 1.15).toFixed(1)),
        relationshipScore: Math.min(100, updatedCountry.relationshipScore + 5)
      };
      titleEn = `Free Trade & Investment Pact with ${targetCountry.nameEn}`;
      titleAr = `توقيع اتفاقية تجارة حرة وشراكة مع ${targetCountry.nameAr}`;
      descEn = `Expanded bilateral trade volumes and preferential customs tariff reduction with ${targetCountry.nameEn}.`;
      descAr = `توسيع المبادلات التجارية وتخفيض الرسوم الجمركية واستقطاب استثمارات من ${targetCountry.nameAr}.`;
    } else if (actionType === 'sign_defense') {
      cost = 0.20;
      updatedCountry = {
        ...updatedCountry,
        securityPact: true,
        securityCooperationScore: Math.min(100, updatedCountry.securityCooperationScore + 12),
        relationshipScore: Math.min(100, updatedCountry.relationshipScore + 6)
      };
      titleEn = `Strategic Defense & Intelligence Alliance: ${targetCountry.nameEn}`;
      titleAr = `توقيع اتفاق دفاعي واستخباراتي استراتيجي: ${targetCountry.nameAr}`;
      descEn = `Enhanced joint military exercises, defense technology transfer, and border security coordination with ${targetCountry.nameEn}.`;
      descAr = `تعزيز التنسيق العسكري والاستخباراتي والمناورات المشتركة ونقل تكنولوجيا الدفاع مع ${targetCountry.nameAr}.`;
    } else if (actionType === 'algeria_reinforce_wall') {
      cost = 0.40;
      updatedCountry = {
        ...updatedCountry,
        diplomaticTension: Math.max(15, updatedCountry.diplomaticTension - 8)
      };
      titleEn = 'Border Fortress: Reinforcing the Defense Sand Wall Eastward';
      titleAr = 'تحصين الحدود: تمديد الجدار الأمني الدفاعي شرقاً ونشر رادارات متقدمة';
      descEn = 'FAR engineering units extended border berm fortifications and active sensor grids, sealing the buffer zone against infiltration.';
      descAr = 'سلاح الهندسة العسكرية للقوات المسلحة الملكية يستكمل تمديد وتحصين الجدار الأمني شرقاً ونشر رادارات مراقبة متطورة لإحكام السيطرة.';
    } else if (actionType === 'algeria_drone_patrol') {
      cost = 0.20;
      updatedCountry = {
        ...updatedCountry,
        securityCooperationScore: Math.min(100, updatedCountry.securityCooperationScore + 10)
      };
      titleEn = 'Combat UAV Air Superiority: Active Buffer Zone Deterrence Patrols';
      titleAr = 'سيادة جوية وردع دفاعي: تسيير دوريات المسيرات المقاتلة (الدرون) بالمنطقة العازلة';
      descEn = 'Royal Moroccan Air Force authorized 24/7 armed UAV reconnaissance over the buffer zone, deterring all hostile movements.';
      descAr = 'القوات الجوية الملكية تفعّل دوريات دائمة لطائرات الدرون المقاتلة على طول خط التماس لرصد ودك أي تحرك معادٍ فوراً.';
    } else if (actionType === 'algeria_sever_ties') {
      cost = 0.02;
      updatedCountry = {
        ...updatedCountry,
        diplomaticTension: 90
      };
      titleEn = 'Strict Sovereign Enforcement: Complete Airspace & Border Transit Ban';
      titleAr = 'قرار سيادي حازم: تشديد حظر الملاحة الجوية وتثبيت قطع العلاقات مع الخصوم';
      descEn = 'Firm refusal of external blackmail, sealing all maritime and aerospace corridors against hostile provocations.';
      descAr = 'تأكيد السيادة الكاملة للمملكة ورفض الابتزاز الخارجي، وتشديد حظر الأجواء والمنافذ البحرية رداً على العداء الممنهج.';
      updatedGovernment.approvalRating = Math.min(95, updatedGovernment.approvalRating + 3);
    } else if (actionType === 'deescalate') {
      cost = 0.03;
      updatedCountry = {
        ...updatedCountry,
        diplomaticTension: Math.max(10, updatedCountry.diplomaticTension - 15),
        relationshipScore: Math.min(100, updatedCountry.relationshipScore + 5)
      };
      titleEn = `De-escalation & Channel Mediation: ${targetCountry.nameEn}`;
      titleAr = `قنوات وساطة وتهدئة التوتر الحدودي: ${targetCountry.nameAr}`;
      descEn = `Backchannel talks opened to mitigate buffer zone military friction with ${targetCountry.nameEn}.`;
      descAr = `فتح قنوات خلفية لتجنب الصدام العسكري ونزع فتيل التوتر الحدودي مع ${targetCountry.nameAr}.`;
    }

    updatedRelations = prev.foreignRelations.map(c => (c.id === countryId ? updatedCountry : c));
  }

  const treasuryCheck = chargeTreasury(prev.budget, cost, prev.gameMode, false);
  if (!treasuryCheck.ok) {
    return {
      state: prev,
      notice: {
        textAr: `رصيد الخزينة غير كافٍ لهذه المبادرة (${cost} مليار درهم).`,
        textEn: `Insufficient treasury reserves for diplomatic operation (${cost}B MAD).`,
        passed: false
      }
    };
  }

  const record = {
    id: `dip_${actionType}_${countryId}_${Date.now()}`,
    month: prev.currentMonth,
    year: prev.currentYear,
    date: formattedDate,
    titleEn,
    titleAr,
    type: 'diplomatic' as const,
    costBillionMAD: cost,
    immediateEffectsEn: descEn,
    immediateEffectsAr: descAr
  };

  const newsBulletin = {
    id: `news_dip_${Date.now()}`,
    date: formattedDate,
    month: prev.currentMonth,
    year: prev.currentYear,
    category: actionCategory,
    headlineEn: titleEn,
    headlineAr: titleAr,
    summaryEn: descEn,
    summaryAr: descAr,
    impact: 'positive' as const
  };

  return {
    state: {
      ...prev,
      foreignRelations: updatedRelations,
      economy: updatedEconomy,
      regions: updatedRegions,
      government: updatedGovernment,
      budget: treasuryCheck.nextBudget,
      executedOneTimeActions: oneTimeKeys.has(actionType)
        ? [...executedOneTime, actionType]
        : executedOneTime,
      actionCooldowns: !oneTimeKeys.has(actionType)
        ? { ...(prev.actionCooldowns || {}), [cooldownKey]: 1 }
        : prev.actionCooldowns,
      decisionHistory: [record, ...prev.decisionHistory],
      newsFeed: [newsBulletin, ...prev.newsFeed]
    },
    notice: {
      textAr: titleAr,
      textEn: titleEn,
      passed: true
    }
  };
}

/**
 * Reshuffles a cabinet minister with optional party reassignment.
 */
export function reshuffleMinisterAction(
  prev: GameState,
  portfolio: Minister['portfolio'],
  newNameEn: string,
  newNameAr: string,
  newPartyId?: string
): GameState {
  const { nextBudget } = chargeTreasury(prev.budget, 0.1, prev.gameMode, true);
  const updatedMinisters = prev.government.ministers.map(m => {
    if (m.portfolio !== portfolio) return m;
    return {
      ...m,
      nameEn: newNameEn,
      nameAr: newNameAr,
      partyId: newPartyId || m.partyId,
      competence: Math.min(95, m.competence + 8),
      loyalty: Math.min(95, m.loyalty + 5),
      corruptionRisk: Math.max(12, Math.round(m.corruptionRisk * 0.6)),
      publicApproval: 65
    };
  });

  const formattedDate = formatGameDate(prev.currentMonth, prev.currentYear, prev.language);
  const record = {
    id: `reshuffle_${portfolio}_${Date.now()}`,
    month: prev.currentMonth,
    year: prev.currentYear,
    date: formattedDate,
    titleEn: `Cabinet Reshuffle: New Minister ${newNameEn} (${portfolio.replace('_', ' ')})`,
    titleAr: `تعديل حكومي: تعيين ${newNameAr} وزيراً لقطاع ${portfolio.replace('_', ' ')}`,
    type: 'reshuffle' as const,
    costBillionMAD: 0.1,
    immediateEffectsEn: 'Replaces outgoing minister, lowering corruption exposure and restoring coalition discipline.',
    immediateEffectsAr: 'ضخ دماء جديدة بالقطاع الوزاري، وتقليص مخاطر الحكامة وتعزيز الانضباط الحكومي.'
  };

  return {
    ...prev,
    budget: nextBudget,
    government: {
      ...prev.government,
      ministers: updatedMinisters,
      stability: Math.min(95, prev.government.stability + 4)
    },
    decisionHistory: [record, ...prev.decisionHistory]
  };
}
