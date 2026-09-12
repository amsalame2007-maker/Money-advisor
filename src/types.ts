export type CurrencyCode = 'KWD' | 'SAR' | 'AED' | 'QAR' | 'BHD' | 'OMR' | 'USD' | 'EUR' | 'GBP';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  currency: CurrencyCode;
  isPremium: boolean;
  trialStartDate: string;
  trialDaysRemaining: number;
}

export interface FinancialHealthBreakdown {
  cashFlowScore: number;       // 0 - 25 pts
  savingsBufferScore: number;  // 0 - 25 pts
  debtLoadScore: number;       // 0 - 25 pts
  goalProgressScore: number;   // 0 - 25 pts
  emergencyMonths: number;
  debtToIncomeRatio: number;
  savingsRate: number;
}

export interface FinancialProfile {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  monthlyDebt: number;
  currency: CurrencyCode;
  availableToSave: number;
  savingsRate: number;
  healthScore: number;
  healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  healthBreakdown: FinancialHealthBreakdown;
  lastUpdated: string;
}

export type GoalCategory =
  | 'Car'
  | 'Travel'
  | 'Education'
  | 'Housing'
  | 'Emergency Fund'
  | 'Major Purchase'
  | 'Custom Goal';

export interface FinancialGoal {
  id: string;
  userId: string;
  name: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO date string
  monthsRemaining: number;
  remainingAmount: number;
  requiredMonthlySaving: number;
  progressPercent: number;
  isAchievable: boolean;
  adviceNote?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Education'
  | 'Health'
  | 'Other';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description: string;
  createdAt: string;
}

export interface AIAdvisorAnalysis {
  financialSummary: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  goalSpecificAdvice: string;
  disclaimer: string;
  source: 'gemini' | 'algorithmic_advisor';
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  relevantMetric?: string;
}

export interface SystemStatus {
  database: {
    type: 'mongodb' | 'persistent_json';
    connected: boolean;
    clusterUriConfigured: boolean;
    message: string;
  };
  ai: {
    geminiConfigured: boolean;
    model: string;
    mode: 'gemini-3.8-flash' | 'intelligent_rules_engine';
  };
  stripe: {
    configured: boolean;
    sandboxMode: boolean;
  };
}
