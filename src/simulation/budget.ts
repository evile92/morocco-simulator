import { BudgetState, EconomicState, Policy, FiscalLevers } from '../types/game';

export const DEFAULT_FISCAL_LEVERS: FiscalLevers = {
  corporateTaxRatePercent: 28,
  incomeTaxRatePercent: 30,
  vatRatePercent: 20,
  maqassaSubsidyBillionMAD: 3.5,
  healthcareBudgetBillionMAD: 4.2,
  educationBudgetBillionMAD: 6.8,
  defenseBudgetBillionMAD: 5.2,
  infrastructureBudgetBillionMAD: 5.5,
  publicWagesBillionMAD: 13.5
};

export function computeBudgetBreakdown(
  current: BudgetState,
  economy: EconomicState,
  activePolicies: Policy[],
  overrideLevers?: FiscalLevers
) {
  const levers: FiscalLevers = {
    ...DEFAULT_FISCAL_LEVERS,
    ...(current.fiscalLevers || {}),
    ...(overrideLevers || {})
  };

  // Baseline monthly fiscal revenue calculation tied to macroeconomic activity (~47.5B MAD/mo)
  const economicActivityMultiplier = economy.gdpBillionMAD / 1500;
  const inflationTaxPush = 1 + (economy.inflationRate / 100) * 0.4;

  let policyRevenueBonus = 0;
  let policyExpenseBonus = 0;

  for (const p of activePolicies) {
    if (p.modifiers.revenueDelta) policyRevenueBonus += p.modifiers.revenueDelta;
    if (p.modifiers.expenseDelta) policyExpenseBonus += p.modifiers.expenseDelta;
    if (p.monthlyCostBillionMAD) policyExpenseBonus += p.monthlyCostBillionMAD;
  }

  // Revenues (Billion MAD / month) dynamically scaled by tax levers
  const incomeTax =
    7.5 * (levers.incomeTaxRatePercent / 30) * economicActivityMultiplier * (1 - (economy.unemploymentRate - 12) * 0.02);
  const corporateTax = 8.1 * (levers.corporateTaxRatePercent / 28) * economicActivityMultiplier;
  const vat = 13.9 * (levers.vatRatePercent / 20) * economicActivityMultiplier * inflationTaxPush;
  const customs = 4.5 * (economy.importsBillionMAD / 50);
  const tourismTaxes = economy.tourismRevenueBillionMAD * 0.18;
  const stateEnterprisesOcp = 3.5 + ((economy.phosphatePriceUSD - 200) / 100) * 0.8;
  const miningRoyalties = 1.3;
  const otherRevenues = 6.2;

  const totalMonthlyRevenue =
    incomeTax +
    corporateTax +
    vat +
    customs +
    tourismTaxes +
    stateEnterprisesOcp +
    miningRoyalties +
    otherRevenues +
    policyRevenueBonus;

  // Expenses (Billion MAD / month) dynamically driven by ministerial spending levers
  const education = levers.educationBudgetBillionMAD;
  const healthcare = levers.healthcareBudgetBillionMAD;
  const infrastructureTransport = levers.infrastructureBudgetBillionMAD;
  const defenseFar = levers.defenseBudgetBillionMAD;
  const interiorSecurity = 3.8;
  const socialProtectionSubsidies =
    levers.maqassaSubsidyBillionMAD + (economy.inflationRate > 3 ? (economy.inflationRate - 3) * 0.25 : 0);
  const agricultureRuralDev = 2.4;
  const waterEnvironment = 1.8;
  const energyRenewables = 1.5;
  const publicWages = levers.publicWagesBillionMAD;
  const monthlyDebtInterest =
    (current.publicDebtBillionMAD * ((economy.bamInterestRate + current.borrowingCostSpread) / 100)) / 12;

  const totalMonthlyExpense =
    education +
    healthcare +
    infrastructureTransport +
    defenseFar +
    interiorSecurity +
    socialProtectionSubsidies +
    agricultureRuralDev +
    waterEnvironment +
    energyRenewables +
    publicWages +
    monthlyDebtInterest +
    policyExpenseBonus;

  const monthlyBalance = totalMonthlyRevenue - totalMonthlyExpense;

  return {
    levers,
    revenues: {
      incomeTax: Number(incomeTax.toFixed(2)),
      corporateTax: Number(corporateTax.toFixed(2)),
      vat: Number(vat.toFixed(2)),
      customs: Number(customs.toFixed(2)),
      tourismTaxes: Number(tourismTaxes.toFixed(2)),
      stateEnterprisesOcp: Number(stateEnterprisesOcp.toFixed(2)),
      miningRoyalties: Number(miningRoyalties.toFixed(2)),
      otherRevenues: Number(otherRevenues.toFixed(2))
    },
    expenses: {
      education: Number(education.toFixed(2)),
      healthcare: Number(healthcare.toFixed(2)),
      infrastructureTransport: Number(infrastructureTransport.toFixed(2)),
      defenseFar: Number(defenseFar.toFixed(2)),
      interiorSecurity: Number(interiorSecurity.toFixed(2)),
      socialProtectionSubsidies: Number(socialProtectionSubsidies.toFixed(2)),
      agricultureRuralDev: Number(agricultureRuralDev.toFixed(2)),
      waterEnvironment: Number(waterEnvironment.toFixed(2)),
      energyRenewables: Number(energyRenewables.toFixed(2)),
      publicWages: Number(publicWages.toFixed(2)),
      debtService: Number(monthlyDebtInterest.toFixed(2))
    },
    totalMonthlyRevenue,
    totalMonthlyExpense,
    monthlyBalance
  };
}

export function simulateBudget(
  current: BudgetState,
  economy: EconomicState,
  activePolicies: Policy[],
  gameMode: string
): { nextBudget: BudgetState; balanceDelta: number; emergencyBondIssued: number } {
  const { levers, revenues, expenses, totalMonthlyRevenue, totalMonthlyExpense, monthlyBalance } =
    computeBudgetBreakdown(current, economy, activePolicies);

  const balanceDelta = Number((monthlyBalance - current.monthlyBalance).toFixed(2));

  // Debt update: deficit adds to debt; surplus reduces debt
  let newDebt = current.publicDebtBillionMAD - monthlyBalance;
  if (gameMode === 'sandbox') {
    newDebt = Math.min(newDebt, current.publicDebtBillionMAD);
  }

  // Treasury reserves & automatic emergency Treasury bill issuance if liquidity depletes
  let newTreasuryReserves = current.treasuryReservesBillionMAD + monthlyBalance;
  let emergencyBondIssued = 0;
  let spreadShock = 0;
  if (gameMode === 'sandbox') {
    newTreasuryReserves = Math.max(250.0, newTreasuryReserves);
  } else if (newTreasuryReserves < 0) {
    // Cover shortfall + establish a 12B MAD working liquidity buffer
    emergencyBondIssued = Number((Math.abs(newTreasuryReserves) + 12.0).toFixed(1));
    newTreasuryReserves += emergencyBondIssued;
    newDebt += 12.0; // Add only net new working float so monthlyBalance deficit isn't double-counted
    spreadShock = 0.35;
  }

  const debtToGdp = (newDebt / economy.gdpBillionMAD) * 100;

  // Sovereign rating determination
  let sovereignCreditRating: BudgetState['sovereignCreditRating'] = 'BBB';
  let borrowingCostSpread = 1.85;

  if (debtToGdp < 58) {
    sovereignCreditRating = 'A';
    borrowingCostSpread = 0.9;
  } else if (debtToGdp < 68) {
    sovereignCreditRating = 'BBB';
    borrowingCostSpread = 1.5;
  } else if (debtToGdp < 78) {
    sovereignCreditRating = 'BB';
    borrowingCostSpread = 2.4;
  } else if (debtToGdp < 88) {
    sovereignCreditRating = 'B';
    borrowingCostSpread = 3.8;
  } else {
    sovereignCreditRating = 'CCC';
    borrowingCostSpread = 5.5;
  }
  borrowingCostSpread = Number((borrowingCostSpread + spreadShock).toFixed(2));

  const nextBudget: BudgetState = {
    revenues,
    expenses,
    fiscalLevers: levers,
    totalMonthlyRevenue: Number(totalMonthlyRevenue.toFixed(2)),
    totalMonthlyExpense: Number(totalMonthlyExpense.toFixed(2)),
    monthlyBalance: Number(monthlyBalance.toFixed(2)),
    publicDebtBillionMAD: Number(newDebt.toFixed(1)),
    debtToGdpRatio: Number(debtToGdp.toFixed(1)),
    treasuryReservesBillionMAD: Number(newTreasuryReserves.toFixed(1)),
    sovereignCreditRating,
    borrowingCostSpread
  };

  return { nextBudget, balanceDelta, emergencyBondIssued };
}

/**
 * Deducts a one-time treasury outlay cleanly. When treasury liquidity is insufficient:
 * - For discretionary reforms (`allowDebtFinancing = false`), blocks the outlay cleanly.
 * - For compulsory crises/settlements (`allowDebtFinancing = true`), converts the shortfall into public debt.
 */
export function chargeTreasury(
  budget: BudgetState,
  costBillionMAD: number,
  gameMode: string,
  allowDebtFinancing: boolean = false
): { ok: boolean; nextBudget: BudgetState; debtFinancedShortfall: number } {
  if (costBillionMAD <= 0) {
    // Negative cost represents an upfront windfall / fine collected
    const adjusted = budget.treasuryReservesBillionMAD - costBillionMAD;
    return {
      ok: true,
      nextBudget: {
        ...budget,
        treasuryReservesBillionMAD: Number(adjusted.toFixed(1))
      },
      debtFinancedShortfall: 0
    };
  }

  if (gameMode === 'sandbox') {
    const sandboxTreasury = Math.max(250.0, budget.treasuryReservesBillionMAD - costBillionMAD);
    return {
      ok: true,
      nextBudget: {
        ...budget,
        treasuryReservesBillionMAD: Number(sandboxTreasury.toFixed(1))
      },
      debtFinancedShortfall: 0
    };
  }

  if (budget.treasuryReservesBillionMAD >= costBillionMAD) {
    return {
      ok: true,
      nextBudget: {
        ...budget,
        treasuryReservesBillionMAD: Number((budget.treasuryReservesBillionMAD - costBillionMAD).toFixed(1))
      },
      debtFinancedShortfall: 0
    };
  }

  if (!allowDebtFinancing) {
    return { ok: false, nextBudget: budget, debtFinancedShortfall: 0 };
  }

  const shortfall = Number((costBillionMAD - Math.max(0, budget.treasuryReservesBillionMAD)).toFixed(1));
  return {
    ok: true,
    nextBudget: {
      ...budget,
      treasuryReservesBillionMAD: 0,
      publicDebtBillionMAD: Number((budget.publicDebtBillionMAD + shortfall).toFixed(1)),
      borrowingCostSpread: Number((budget.borrowingCostSpread + 0.1).toFixed(2))
    },
    debtFinancedShortfall: shortfall
  };
}

