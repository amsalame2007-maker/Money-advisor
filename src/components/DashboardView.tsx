import React from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  ArrowDownRight,
  PiggyBank,
  HeartPulse,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  SlidersHorizontal,
  Bot,
  Target,
  Sparkles,
  Calendar,
  CheckCircle2,
  Pencil,
} from 'lucide-react';
import {
  FinancialProfile,
  FinancialGoal,
  Expense,
  User,
} from '../types';
import { formatCurrency } from '../utils/finance';

interface DashboardViewProps {
  profile: FinancialProfile;
  goals: FinancialGoal[];
  expenses: Expense[];
  user: User | null;
  onOpenAddExpense: () => void;
  onOpenAddGoal: () => void;
  onOpenEditProfile: () => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  goals,
  expenses,
  user,
  onOpenAddExpense,
  onOpenAddGoal,
  onOpenEditProfile,
  onNavigate,
}) => {
  const currency = profile.currency || 'KWD';
  const income = profile.monthlyIncome;
  const expenseAmt = profile.monthlyExpenses;
  const debt = profile.monthlyDebt;
  const availableToSave = profile.availableToSave;
  const savings = profile.currentSavings;
  const savingsRate = profile.savingsRate;
  const healthScore = profile.healthScore;
  const healthStatus = profile.healthStatus;
  const breakdown = profile.healthBreakdown;

  // Chart Percentages calculation
  const totalInflow = Math.max(income, 1);
  const expensePercent = Math.min(100, Math.round((expenseAmt / totalInflow) * 100));
  const debtPercent = Math.min(100, Math.round((debt / totalInflow) * 100));
  const savingsPercent = Math.max(0, Math.min(100, Math.round((availableToSave / totalInflow) * 100)));

  const getHealthBadgeColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'bg-[#DCFCE7] text-[#0B5D3B] border-[#15803D]/30';
      case 'Good':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Fair':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-50 text-rose-800 border-rose-300';
    }
  };

  const firstNameOnly = user
    ? user.firstName || user.name.split(' ')[0] || 'Ahmad'
    : 'Ahmad';

  return (
    <div className="space-y-8 pb-16">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B5D3B] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
              Live Financial Profile
            </span>
            <span className="text-xs text-[#17352A]/50">
              Updated {new Date(profile.lastUpdated).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17352A] mt-1 tracking-tight">
            Welcome back, {firstNameOnly}
          </h1>
          <p className="text-sm text-[#17352A]/70">
            Here is your current financial posture and trajectory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dashboard-edit-profile-btn"
            onClick={onOpenEditProfile}
            className="px-4 py-2 rounded-full border border-[#0B5D3B]/30 bg-emerald-50/50 text-xs font-bold text-[#0B5D3B] hover:bg-[#DCFCE7] hover:border-[#0B5D3B] transition-all shadow-xs flex items-center space-x-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>تعديل الراتب والمصروف (Edit Salary & Budget)</span>
          </button>
          <button
            id="dashboard-add-expense-btn"
            onClick={onOpenAddExpense}
            className="px-4 py-2 rounded-full bg-white border border-[#0B5D3B]/30 text-xs font-semibold text-[#0B5D3B] hover:bg-[#DCFCE7]/40 transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل صرف (Log Expense)</span>
          </button>
          <button
            id="dashboard-add-goal-btn"
            onClick={onOpenAddGoal}
            className="px-4 py-2 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Primary Key Metrics 5-Card Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Monthly Income */}
        <div
          onClick={onOpenEditProfile}
          className="bg-white rounded-3xl p-5 border border-[#17352A]/10 shadow-xs hover:border-[#0B5D3B] hover:shadow-md transition-all cursor-pointer group relative"
          title="اضغط هنا لتعديل راتبك أو دخلك الشهري"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#17352A]/60 flex items-center space-x-1">
              <span>Monthly Income</span>
              <span className="text-[10px] text-[#0B5D3B] font-bold group-hover:underline flex items-center ml-1">
                <Pencil className="w-2.5 h-2.5 inline mr-0.5" /> تعديل
              </span>
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0B5D3B] flex items-center justify-center group-hover:bg-[#0B5D3B] group-hover:text-white transition-colors">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#17352A] tracking-tight">
            {formatCurrency(income, currency, false)}
          </p>
          <p className="text-[11px] text-[#17352A]/60 mt-1 flex items-center justify-between">
            <span>Verified monthly inflow</span>
            <span className="text-[10px] text-[#0B5D3B] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتعديل ←</span>
          </p>
        </div>

        {/* 2. Monthly Expenses */}
        <div
          onClick={onOpenEditProfile}
          className="bg-white rounded-3xl p-5 border border-[#17352A]/10 shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group relative"
          title="اضغط هنا لتعديل مصروفك الشهري الثابت"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#17352A]/60 flex items-center space-x-1">
              <span>Monthly Expenses</span>
              <span className="text-[10px] text-amber-700 font-bold group-hover:underline flex items-center ml-1">
                <Pencil className="w-2.5 h-2.5 inline mr-0.5" /> تعديل
              </span>
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#17352A] tracking-tight">
            {formatCurrency(expenseAmt, currency, false)}
          </p>
          <p className="text-[11px] text-[#17352A]/60 mt-1 flex items-center justify-between">
            <span>{Math.round((expenseAmt / totalInflow) * 100)}% of monthly earnings</span>
            <span className="text-[10px] text-amber-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتعديل ←</span>
          </p>
        </div>

        {/* 3. Available to Save */}
        <div className="bg-white rounded-3xl p-5 border border-[#17352A]/10 shadow-xs hover:border-[#15803D]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0B5D3B]">
              Available to Save
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#0B5D3B] flex items-center justify-center font-bold text-xs">
              {savingsRate}%
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#0B5D3B] tracking-tight">
            {formatCurrency(availableToSave, currency, false)}
          </p>
          <p className="text-[11px] text-[#0B5D3B] font-medium mt-1">
            {availableToSave > 0 ? 'Surplus ready for goals' : 'Adjust expenses or debt'}
          </p>
        </div>

        {/* 4. Current Savings */}
        <div className="bg-white rounded-3xl p-5 border border-[#17352A]/10 shadow-xs hover:border-[#15803D]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#17352A]/60">
              Current Savings
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#17352A] tracking-tight">
            {formatCurrency(savings, currency, false)}
          </p>
          <p className="text-[11px] text-[#17352A]/60 mt-1">
            Covers {breakdown.emergencyMonths} months living costs
          </p>
        </div>

        {/* 5. Financial Health Score */}
        <div className="bg-gradient-to-br from-[#0B5D3B] to-[#15803D] text-white rounded-3xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#DCFCE7]/80">
              Health Score
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
              {healthStatus}
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold tracking-tight text-white">{healthScore}</span>
              <span className="text-sm text-[#DCFCE7]/70 font-semibold">/100</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#DCFCE7] h-full rounded-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-emerald-100/80">Computed via 4 core pillars</p>
        </div>
      </div>

      {/* Row 2: Financial Health Breakdown & Income vs Expenses vs Savings Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Financial Health Section (4 Pillars: Cash Flow, Savings, Debt, Goal Progress) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#17352A]/10">
            <div className="flex items-center space-x-2">
              <HeartPulse className="w-5 h-5 text-[#0B5D3B]" />
              <h2 className="text-lg font-bold text-[#17352A]">Financial Health Pillars</h2>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getHealthBadgeColor(healthStatus)}`}>
              {healthStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pillar 1: Cash Flow */}
            <div className="p-4 rounded-2xl bg-[#F7F3E8] border border-[#17352A]/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#17352A]">1. Cash Flow & Rate</span>
                <span className="font-bold text-[#0B5D3B]">{breakdown.cashFlowScore}/25 pts</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#15803D] h-full rounded-full"
                  style={{ width: `${(breakdown.cashFlowScore / 25) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-[#17352A]/70">
                Savings rate at <strong>{savingsRate}%</strong> ({formatCurrency(availableToSave, currency, false)}/mo margin)
              </p>
            </div>

            {/* Pillar 2: Savings Buffer */}
            <div className="p-4 rounded-2xl bg-[#F7F3E8] border border-[#17352A]/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#17352A]">2. Emergency Buffer</span>
                <span className="font-bold text-[#0B5D3B]">{breakdown.savingsBufferScore}/25 pts</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#15803D] h-full rounded-full"
                  style={{ width: `${(breakdown.savingsBufferScore / 25) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-[#17352A]/70">
                Current savings sustain <strong>{breakdown.emergencyMonths} months</strong> of recurring needs.
              </p>
            </div>

            {/* Pillar 3: Debt Load */}
            <div className="p-4 rounded-2xl bg-[#F7F3E8] border border-[#17352A]/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#17352A]">3. Debt Obligation</span>
                <span className="font-bold text-[#0B5D3B]">{breakdown.debtLoadScore}/25 pts</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#15803D] h-full rounded-full"
                  style={{ width: `${(breakdown.debtLoadScore / 25) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-[#17352A]/70">
                Debt payments take <strong>{breakdown.debtToIncomeRatio}%</strong> of income ({formatCurrency(debt, currency, false)}/mo).
              </p>
            </div>

            {/* Pillar 4: Goal Progress */}
            <div className="p-4 rounded-2xl bg-[#F7F3E8] border border-[#17352A]/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#17352A]">4. Goal Feasibility</span>
                <span className="font-bold text-[#0B5D3B]">{breakdown.goalProgressScore}/25 pts</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#15803D] h-full rounded-full"
                  style={{ width: `${(breakdown.goalProgressScore / 25) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-[#17352A]/70">
                {goals.length} active target(s) registered with real-time tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-[#17352A]/60">
              Want actionable steps to raise your score?
            </p>
            <button
              id="dash-consult-advisor-btn"
              onClick={() => onNavigate('advisor')}
              className="text-xs font-bold text-[#0B5D3B] hover:text-[#15803D] flex items-center space-x-1"
            >
              <span>View AI Advisor Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Income vs Expenses vs Savings Visual Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#17352A]/10">
            <div>
              <h2 className="text-lg font-bold text-[#17352A]">Income vs Expenses vs Savings</h2>
              <p className="text-xs text-[#17352A]/60">Monthly cash distribution overview</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-[#17352A]/60">Total Earnings</span>
              <p className="text-sm font-bold text-[#17352A]">{formatCurrency(income, currency, false)}</p>
            </div>
          </div>

          {/* Segmented Visual Stacked Bar Chart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#17352A]">
              <span>Monthly Inflow Allocation</span>
              <span>100% Breakdown</span>
            </div>

            <div className="w-full h-8 rounded-full overflow-hidden flex bg-slate-100 p-1 border border-[#17352A]/10 shadow-inner">
              {/* Expenses segment */}
              <div
                className="bg-amber-500 h-full rounded-l-full transition-all duration-500 relative group"
                style={{ width: `${expensePercent}%` }}
                title={`Expenses: ${expenseAmt} ${currency} (${expensePercent}%)`}
              />
              {/* Debt segment */}
              {debtPercent > 0 && (
                <div
                  className="bg-rose-500 h-full transition-all duration-500 relative group"
                  style={{ width: `${debtPercent}%` }}
                  title={`Debt: ${debt} ${currency} (${debtPercent}%)`}
                />
              )}
              {/* Savings segment */}
              <div
                className="bg-[#15803D] h-full rounded-r-full transition-all duration-500 relative group flex items-center justify-center text-white text-[10px] font-bold"
                style={{ width: `${savingsPercent}%` }}
                title={`Available to Save: ${availableToSave} ${currency} (${savingsPercent}%)`}
              >
                {savingsPercent >= 15 ? `${savingsPercent}%` : ''}
              </div>
            </div>

            {/* Legend & Exact Values */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/50">
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-[11px] font-semibold text-amber-900">Expenses</span>
                </div>
                <p className="text-sm font-extrabold text-amber-950">
                  {formatCurrency(expenseAmt, currency, false)}
                </p>
                <p className="text-[10px] text-amber-800/80">{expensePercent}% of income</p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/50">
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[11px] font-semibold text-rose-900">Debt Repay</span>
                </div>
                <p className="text-sm font-extrabold text-rose-950">
                  {formatCurrency(debt, currency, false)}
                </p>
                <p className="text-[10px] text-rose-800/80">{debtPercent}% of income</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#DCFCE7]/60 border border-[#15803D]/20">
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
                  <span className="text-[11px] font-semibold text-[#0B5D3B]">Available Save</span>
                </div>
                <p className="text-sm font-extrabold text-[#0B5D3B]">
                  {formatCurrency(availableToSave, currency, false)}
                </p>
                <p className="text-[10px] text-[#15803D]">{savingsPercent}% surplus</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F3E8] border border-[#17352A]/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-[#0B5D3B]" />
              <span className="text-xs font-semibold text-[#17352A]">
                Want to test adjusting your savings rate?
              </span>
            </div>
            <button
              id="dash-open-simulator-btn"
              onClick={() => onNavigate('simulator')}
              className="text-xs font-bold text-[#0B5D3B] hover:text-[#15803D] flex items-center space-x-1"
            >
              <span>What-If Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Financial Goals Summary & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Financial Goals */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#17352A]/10">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-[#0B5D3B]" />
              <h2 className="text-lg font-bold text-[#17352A]">Financial Goals</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                {goals.length}
              </span>
            </div>
            <button
              id="dash-all-goals-btn"
              onClick={() => onNavigate('goals')}
              className="text-xs font-bold text-[#0B5D3B] hover:text-[#15803D] flex items-center space-x-1"
            >
              <span>Manage Goals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-8 bg-[#F7F3E8] rounded-2xl border border-dashed border-[#17352A]/20 p-6">
              <p className="text-sm font-semibold text-[#17352A]">No goals established yet</p>
              <p className="text-xs text-[#17352A]/60 mt-1 mb-4">
                Set milestones like an emergency fund, vehicle, travel, or home purchase.
              </p>
              <button
                id="dash-empty-add-goal-btn"
                onClick={onOpenAddGoal}
                className="px-4 py-2 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D]"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {goals.slice(0, 3).map((goal) => {
                const percent = Math.min(
                  100,
                  Math.round((goal.currentAmount / goal.targetAmount) * 100)
                );
                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-2xl bg-[#F7F3E8]/80 border border-[#17352A]/10 hover:border-[#0B5D3B]/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white text-[#0B5D3B] border border-[#17352A]/10">
                          {goal.category}
                        </span>
                        <h4 className="font-bold text-[#17352A] text-sm mt-1">{goal.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-[#0B5D3B]">
                          {formatCurrency(goal.currentAmount, currency, false)}
                        </span>
                        <span className="text-xs text-[#17352A]/60 block">
                          of {formatCurrency(goal.targetAmount, currency, false)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0B5D3B] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#17352A]/70 pt-0.5">
                      <span className="font-medium">
                        Target: {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                      <span className="font-bold text-[#0B5D3B]">{percent}% saved</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Expenses List */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#17352A]/10">
            <h2 className="text-lg font-bold text-[#17352A]">Recent Expenses</h2>
            <button
              id="dash-view-all-expenses-btn"
              onClick={() => onNavigate('expenses')}
              className="text-xs font-bold text-[#0B5D3B] hover:text-[#15803D] flex items-center space-x-1"
            >
              <span>View All ({expenses.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-8 bg-[#F7F3E8] rounded-2xl p-6 text-xs text-[#17352A]/60">
              No expenses recorded yet this month.
            </div>
          ) : (
            <div className="space-y-2.5">
              {expenses.slice(0, 4).map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F3E8]/60 border border-[#17352A]/5 hover:bg-white transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[#17352A]">{exp.description || exp.category}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-[#17352A]/60">
                      <span className="px-1.5 py-0.5 rounded-md bg-white border border-[#17352A]/10 font-medium">
                        {exp.category}
                      </span>
                      <span>{exp.date}</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#17352A]">
                    -{formatCurrency(exp.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            id="dash-quick-log-expense-btn"
            onClick={onOpenAddExpense}
            className="w-full py-2.5 rounded-full border border-dashed border-[#0B5D3B]/40 text-[#0B5D3B] hover:bg-[#DCFCE7]/30 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
};
