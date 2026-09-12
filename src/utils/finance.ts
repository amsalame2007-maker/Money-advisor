import {
  CurrencyCode,
  FinancialGoal,
  FinancialHealthBreakdown,
  FinancialProfile,
} from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  KWD: 'KWD',
  SAR: 'SAR',
  AED: 'AED',
  QAR: 'QAR',
  BHD: 'BHD',
  OMR: 'OMR',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

// Standard conversion rates relative to USD (can be refreshed / adjusted)
export const EXCHANGE_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  KWD: 3.25,   // 1 KWD ≈ 3.25 USD
  BHD: 2.65,   // 1 BHD ≈ 2.65 USD
  OMR: 2.60,   // 1 OMR ≈ 2.60 USD
  GBP: 1.28,   // 1 GBP ≈ 1.28 USD
  EUR: 1.08,   // 1 EUR ≈ 1.08 USD
  SAR: 0.266,  // 1 SAR ≈ 0.266 USD
  AED: 0.272,  // 1 AED ≈ 0.272 USD
  QAR: 0.274,  // 1 QAR ≈ 0.274 USD
};

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  const inUSD = amount * (EXCHANGE_RATES_TO_USD[from] || 1);
  const targetRate = EXCHANGE_RATES_TO_USD[to] || 1;
  return inUSD / targetRate;
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'KWD',
  showDecimals = true
): string {
  const decimals = currency === 'KWD' || currency === 'BHD' || currency === 'OMR' ? 3 : 2;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: showDecimals ? (amount % 1 === 0 ? 0 : Math.min(2, decimals)) : 0,
    maximumFractionDigits: decimals,
  }).format(amount);

  return `${formatted} ${currency}`;
}

export function calculateMonthsRemaining(targetDate: string): number {
  const target = new Date(targetDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.ceil(diffDays / 30.44);
  return Math.max(1, months);
}

export function calculateGoalMetrics(
  goal: {
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
  },
  availableMonthlySaving: number
) {
  const months = calculateMonthsRemaining(goal.targetDate);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const requiredMonthlySaving = months > 0 ? remaining / months : remaining;
  const progressPercent =
    goal.targetAmount > 0
      ? Math.min(100, Math.max(0, Math.round((goal.currentAmount / goal.targetAmount) * 100)))
      : 100;
  const isAchievable = requiredMonthlySaving <= Math.max(0, availableMonthlySaving);

  let adviceNote = '';
  if (!isAchievable) {
    const deficit = requiredMonthlySaving - availableMonthlySaving;
    const neededMonths =
      availableMonthlySaving > 0
        ? Math.ceil(remaining / availableMonthlySaving)
        : 999;
    adviceNote =
      availableMonthlySaving <= 0
        ? 'No positive savings available. Reduce monthly expenses or debt to start funding this goal.'
        : `Requires ${formatCurrency(deficit, 'KWD')} more/mo or extending target by ${Math.max(1, neededMonths - months)} months.`;
  } else {
    adviceNote = 'On track with your current monthly capacity!';
  }

  return {
    monthsRemaining: months,
    remainingAmount: Math.round(remaining * 100) / 100,
    requiredMonthlySaving: Math.round(requiredMonthlySaving * 100) / 100,
    progressPercent,
    isAchievable,
    adviceNote,
  };
}

export function calculateFinancialHealth(
  income: number,
  expenses: number,
  savings: number,
  debt: number,
  goals: FinancialGoal[] = []
): {
  availableToSave: number;
  savingsRate: number;
  healthScore: number;
  healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  breakdown: FinancialHealthBreakdown;
} {
  const safeIncome = Math.max(0, income);
  const safeExpenses = Math.max(0, expenses);
  const safeDebt = Math.max(0, debt);
  const safeSavings = Math.max(0, savings);

  const availableToSave = safeIncome - safeExpenses - safeDebt;
  const savingsRate = safeIncome > 0 ? (availableToSave / safeIncome) * 100 : 0;
  const debtToIncomeRatio = safeIncome > 0 ? (safeDebt / safeIncome) * 100 : 0;
  const totalMonthlyCommitments = safeExpenses + safeDebt;
  const emergencyMonths =
    totalMonthlyCommitments > 0 ? safeSavings / totalMonthlyCommitments : 0;

  // Pillar 1: Cash Flow & Savings Rate (25 pts)
  let cashFlowScore = 0;
  if (savingsRate >= 30) cashFlowScore = 25;
  else if (savingsRate >= 20) cashFlowScore = 21;
  else if (savingsRate >= 10) cashFlowScore = 16;
  else if (savingsRate > 0) cashFlowScore = 10;
  else cashFlowScore = 2;

  // Pillar 2: Savings Buffer / Emergency Fund (25 pts)
  let savingsBufferScore = 0;
  if (emergencyMonths >= 6) savingsBufferScore = 25;
  else if (emergencyMonths >= 3) savingsBufferScore = 20;
  else if (emergencyMonths >= 1) savingsBufferScore = 14;
  else if (safeSavings > 0) savingsBufferScore = 8;
  else savingsBufferScore = 2;

  // Pillar 3: Debt Load (25 pts)
  let debtLoadScore = 0;
  if (debtToIncomeRatio === 0) debtLoadScore = 25;
  else if (debtToIncomeRatio <= 15) debtLoadScore = 20;
  else if (debtToIncomeRatio <= 30) debtLoadScore = 14;
  else if (debtToIncomeRatio <= 45) debtLoadScore = 8;
  else debtLoadScore = 2;

  // Pillar 4: Goals Feasibility (25 pts)
  let goalProgressScore = 20;
  if (goals.length > 0) {
    const totalRequiredSaving = goals.reduce(
      (acc, g) => acc + (g.requiredMonthlySaving || 0),
      0
    );
    if (availableToSave >= totalRequiredSaving && totalRequiredSaving > 0) {
      goalProgressScore = 25;
    } else if (availableToSave > 0) {
      const coverage = (availableToSave / totalRequiredSaving) * 20;
      goalProgressScore = Math.max(5, Math.min(22, Math.round(coverage)));
    } else {
      goalProgressScore = 5;
    }
  }

  const healthScore = Math.min(
    100,
    Math.max(0, cashFlowScore + savingsBufferScore + debtLoadScore + goalProgressScore)
  );

  let healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' = 'Fair';
  if (healthScore >= 80) healthStatus = 'Excellent';
  else if (healthScore >= 65) healthStatus = 'Good';
  else if (healthScore >= 45) healthStatus = 'Fair';
  else healthStatus = 'Needs Attention';

  return {
    availableToSave,
    savingsRate: Math.round(savingsRate * 10) / 10,
    healthScore,
    healthStatus,
    breakdown: {
      cashFlowScore,
      savingsBufferScore,
      debtLoadScore,
      goalProgressScore,
      emergencyMonths: Math.round(emergencyMonths * 10) / 10,
      debtToIncomeRatio: Math.round(debtToIncomeRatio * 10) / 10,
      savingsRate: Math.round(savingsRate * 10) / 10,
    },
  };
}

export function simulateWhatIf(params: {
  currentProfile: FinancialProfile;
  extraIncome: number;
  reducedExpenses: number;
  additionalMonthlySaving: number;
  goal?: FinancialGoal;
}) {
  const { currentProfile, extraIncome, reducedExpenses, additionalMonthlySaving, goal } = params;

  const newIncome = currentProfile.monthlyIncome + extraIncome;
  const newExpenses = Math.max(0, currentProfile.monthlyExpenses - reducedExpenses);
  const newAvailableToSave =
    newIncome - newExpenses - currentProfile.monthlyDebt + additionalMonthlySaving;

  const newHealth = calculateFinancialHealth(
    newIncome,
    newExpenses,
    currentProfile.currentSavings,
    currentProfile.monthlyDebt
  );

  let goalComparison = null;
  if (goal) {
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    const currentMonths = calculateMonthsRemaining(goal.targetDate);
    const newMonthlySavingCapacity = Math.max(0, newAvailableToSave);
    const newMonthsNeeded =
      newMonthlySavingCapacity > 0 ? Math.ceil(remaining / newMonthlySavingCapacity) : 999;
    const monthsSaved = Math.max(0, currentMonths - newMonthsNeeded);

    const projectedFinishDate = new Date();
    projectedFinishDate.setMonth(projectedFinishDate.getMonth() + newMonthsNeeded);

    goalComparison = {
      goalName: goal.name,
      remainingAmount: remaining,
      currentMonthsRemaining: currentMonths,
      newMonthsRemaining: newMonthsNeeded,
      monthsFaster: monthsSaved,
      projectedDate: projectedFinishDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      isFeasibleUnderScenario: newAvailableToSave >= goal.requiredMonthlySaving,
    };
  }

  return {
    current: {
      income: currentProfile.monthlyIncome,
      expenses: currentProfile.monthlyExpenses,
      availableToSave: currentProfile.availableToSave,
      savingsRate: currentProfile.savingsRate,
      healthScore: currentProfile.healthScore,
    },
    simulated: {
      income: newIncome,
      expenses: newExpenses,
      availableToSave: newAvailableToSave,
      savingsRate: newHealth.savingsRate,
      healthScore: newHealth.healthScore,
      scoreDelta: newHealth.healthScore - currentProfile.healthScore,
    },
    goalComparison,
  };
}
