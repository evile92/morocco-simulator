import { MetricAttribution, Policy, EconomicState, WaterState } from '../types/game';

export interface AttributionFactors {
  approvalDelta: number;
  tensionDelta: number;
  gdpDelta: number;
  inflationDelta: number;
  damDelta: number;
  balanceDelta: number;
  activePolicies: Policy[];
  economy: EconomicState;
  water: WaterState;
  recentCrisesCount: number;
}

export function generateAttributions(factors: AttributionFactors): MetricAttribution[] {
  const attributions: MetricAttribution[] = [];

  // 1. Government Approval Attribution
  const approvalReasons: { sourceEn: string; sourceAr: string; delta: number }[] = [];

  // Policies impact
  for (const p of factors.activePolicies) {
    if (p.modifiers.approvalDelta) {
      approvalReasons.push({
        sourceEn: `Policy: ${p.titleEn}`,
        sourceAr: `مرسوم: ${p.titleAr}`,
        delta: Number(p.modifiers.approvalDelta.toFixed(1))
      });
    }
  }

  // Macro factors
  if (factors.economy.inflationRate > 3.0) {
    const penalty = -Number(((factors.economy.inflationRate - 2.5) * 0.8).toFixed(1));
    approvalReasons.push({
      sourceEn: `Consumer Price Inflation (${factors.economy.inflationRate}%)`,
      sourceAr: `غلاء أسعار الاستهلاك والتضخم (${factors.economy.inflationRate}%)`,
      delta: penalty
    });
  }

  if (factors.economy.realGdpGrowthRate > 3.5) {
    const bonus = Number(((factors.economy.realGdpGrowthRate - 3.2) * 0.9).toFixed(1));
    approvalReasons.push({
      sourceEn: `Economic Growth & Job Creation (${factors.economy.realGdpGrowthRate}%)`,
      sourceAr: `النمو الاقتصادي وخلق فرص الشغل (${factors.economy.realGdpGrowthRate}%)`,
      delta: bonus
    });
  }

  if (factors.water.droughtLevel !== 'none') {
    const waterDeduct = factors.water.droughtLevel === 'catastrophic' ? -3.0 : factors.water.droughtLevel === 'extreme' ? -2.0 : -1.0;
    approvalReasons.push({
      sourceEn: `Hydraulic Drought Pressures (${factors.water.droughtLevel})`,
      sourceAr: `ضغوط الجفاف وشح المياه (${factors.water.droughtLevel})`,
      delta: waterDeduct
    });
  }

  if (factors.recentCrisesCount > 0) {
    approvalReasons.push({
      sourceEn: `Active Strikes & Protests (${factors.recentCrisesCount} events)`,
      sourceAr: `الاحتجاجات والإضرابات النشطة (${factors.recentCrisesCount})`,
      delta: -Number((factors.recentCrisesCount * 1.5).toFixed(1))
    });
  }

  attributions.push({
    metric: 'approval',
    netDelta: factors.approvalDelta,
    reasons: approvalReasons
  });

  // 2. Social Tension Attribution
  const tensionReasons: { sourceEn: string; sourceAr: string; delta: number }[] = [];

  if (factors.economy.inflationRate > 3.0) {
    tensionReasons.push({
      sourceEn: 'Household Cost of Living & Groceries',
      sourceAr: 'غلاء المعيشة والمواد الغذائية الأساسية',
      delta: Number(((factors.economy.inflationRate - 2.5) * 1.2).toFixed(1))
    });
  }

  if (factors.economy.youthUnemploymentRate > 28.0) {
    tensionReasons.push({
      sourceEn: `Graduate & Youth Unemployment (${factors.economy.youthUnemploymentRate}%)`,
      sourceAr: `بطالة الشباب وحاملي الشهادات (${factors.economy.youthUnemploymentRate}%)`,
      delta: Number(((factors.economy.youthUnemploymentRate - 26) * 0.4).toFixed(1))
    });
  }

  if (factors.water.droughtLevel === 'severe' || factors.water.droughtLevel === 'extreme' || factors.water.droughtLevel === 'catastrophic') {
    tensionReasons.push({
      sourceEn: 'Rural & Regional Water Depletion',
      sourceAr: 'الإجهاد المائي القروي وحصص السقي',
      delta: 1.8
    });
  }

  for (const p of factors.activePolicies) {
    if (p.modifiers.socialTensionDelta) {
      tensionReasons.push({
        sourceEn: `Policy: ${p.titleEn}`,
        sourceAr: `مرسوم: ${p.titleAr}`,
        delta: Number(p.modifiers.socialTensionDelta.toFixed(1))
      });
    }
  }

  attributions.push({
    metric: 'tension',
    netDelta: factors.tensionDelta,
    reasons: tensionReasons
  });

  return attributions;
}
