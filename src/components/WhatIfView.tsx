import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  SlidersHorizontal,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  HeartPulse,
} from 'lucide-react';
import { FinancialProfile, FinancialGoal } from '../types';
import { formatCurrency, simulateWhatIf } from '../utils/finance';

interface WhatIfViewProps {
  profile: FinancialProfile;
  goals: FinancialGoal[];
}

export const WhatIfView: React.FC<WhatIfViewProps> = ({ profile, goals }) => {
  const currency = profile.currency || 'KWD';

  // Interactive slider states
  const [extraIncome, setExtraIncome] = useState<number>(0);
  const [reducedExpenses, setReducedExpenses] = useState<number>(0);
  const [extraMonthlySaving, setExtraMonthlySaving] = useState<number>(50); // Default to prompt's example +50 KWD
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    goals.length > 0 ? goals[0].id : ''
  );

  const selectedGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];

  const simulation = simulateWhatIf({
    currentProfile: profile,
    extraIncome,
    reducedExpenses,
    additionalMonthlySaving: extraMonthlySaving,
    goal: selectedGoal,
  });

  const handleReset = () => {
    setExtraIncome(0);
    setReducedExpenses(0);
    setExtraMonthlySaving(0);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Interactive Financial Lab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17352A] tracking-tight">
            What-If Scenario Simulator
          </h1>
          <p className="text-sm text-[#17352A]/70">
            See the exact real-time mathematical impact of small lifestyle tweaks on your timeline and wealth.
          </p>
        </div>

        <button
          id="what-if-reset-btn"
          onClick={handleReset}
          className="px-4 py-2 rounded-full border border-[#17352A]/20 bg-white text-xs font-semibold text-[#17352A] hover:bg-[#F7F3E8] transition-all flex items-center space-x-1.5 self-start sm:self-center shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sliders</span>
        </button>
      </div>

      {/* Main Grid: Sliders on Left, Live Comparison on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Controls (Sliders) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#17352A]/10 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-[#17352A] pb-3 border-b border-[#17352A]/10">
            Adjust Hypothetical Variables
          </h2>

          {/* Quick Preset Prompt Chips */}
          <div>
            <label className="block text-xs font-semibold text-[#17352A]/80 mb-2">
              Popular Experiment Presets
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setExtraMonthlySaving(50)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  extraMonthlySaving === 50
                    ? 'bg-[#0B5D3B] text-white shadow-xs'
                    : 'bg-[#F7F3E8] text-[#17352A] hover:bg-[#DCFCE7]/60'
                }`}
              >
                +50 {currency} / mo
              </button>
              <button
                type="button"
                onClick={() => setExtraMonthlySaving(100)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  extraMonthlySaving === 100
                    ? 'bg-[#0B5D3B] text-white shadow-xs'
                    : 'bg-[#F7F3E8] text-[#17352A] hover:bg-[#DCFCE7]/60'
                }`}
              >
                +100 {currency} / mo
              </button>
              <button
                type="button"
                onClick={() => {
                  setReducedExpenses(60);
                  setExtraMonthlySaving(50);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F7F3E8] text-[#17352A] hover:bg-[#DCFCE7]/60"
              >
                Cut Dining + Save 50
              </button>
            </div>
          </div>

          {/* Slider 1: Extra Monthly Dedicated Savings */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#F7F3E8]/80 border border-[#17352A]/5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#17352A]">Extra Monthly Savings Allocation</span>
              <span className="font-extrabold text-[#0B5D3B] text-sm">
                +{formatCurrency(extraMonthlySaving, currency, false)}/mo
              </span>
            </div>
            <input
              id="slider-extra-savings"
              type="range"
              min="0"
              max="500"
              step="10"
              value={extraMonthlySaving}
              onChange={(e) => setExtraMonthlySaving(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B5D3B]"
            />
            <div className="flex justify-between text-[10px] text-[#17352A]/50 font-medium">
              <span>0 {currency}</span>
              <span>250 {currency}</span>
              <span>500 {currency}</span>
            </div>
          </div>

          {/* Slider 2: Reduced Expenses */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#F7F3E8]/80 border border-[#17352A]/5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#17352A]">Trim Discretionary Expenses</span>
              <span className="font-extrabold text-amber-700 text-sm">
                -{formatCurrency(reducedExpenses, currency, false)}/mo
              </span>
            </div>
            <input
              id="slider-reduced-expenses"
              type="range"
              min="0"
              max={Math.min(500, profile.monthlyExpenses)}
              step="10"
              value={reducedExpenses}
              onChange={(e) => setReducedExpenses(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-[#17352A]/50 font-medium">
              <span>0 {currency}</span>
              <span>Cut 100 {currency}</span>
              <span>Cut {Math.min(500, profile.monthlyExpenses)} {currency}</span>
            </div>
          </div>

          {/* Slider 3: Side Income Boost */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#F7F3E8]/80 border border-[#17352A]/5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#17352A]">Additional Side Income</span>
              <span className="font-extrabold text-[#15803D] text-sm">
                +{formatCurrency(extraIncome, currency, false)}/mo
              </span>
            </div>
            <input
              id="slider-extra-income"
              type="range"
              min="0"
              max="1000"
              step="25"
              value={extraIncome}
              onChange={(e) => setExtraIncome(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#15803D]"
            />
            <div className="flex justify-between text-[10px] text-[#17352A]/50 font-medium">
              <span>0 {currency}</span>
              <span>+500 {currency}</span>
              <span>+1,000 {currency}</span>
            </div>
          </div>

          {/* Goal Selector for milestone calculation */}
          {goals.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-[#17352A]">
                Select Goal to Accelerate
              </label>
              <select
                id="simulator-goal-select"
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#17352A]/20 bg-white text-xs font-semibold text-[#17352A] focus:outline-none focus:border-[#0B5D3B]"
              >
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({formatCurrency(g.targetAmount, currency, false)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Live Mathematical Comparison (Current Plan vs New Scenario) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Comparison Cards: Current Plan vs New Scenario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Plan Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#17352A]/10">
                <span className="text-xs uppercase font-bold tracking-wider text-[#17352A]/60">
                  Current Baseline
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                  Actual
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#17352A]/70">Monthly Income:</span>
                  <span className="font-bold text-[#17352A]">
                    {formatCurrency(simulation.current.income, currency, false)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#17352A]/70">Monthly Expenses:</span>
                  <span className="font-bold text-[#17352A]">
                    {formatCurrency(simulation.current.expenses, currency, false)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-[#17352A]/10">
                  <span className="font-semibold text-[#17352A]">Available to Save:</span>
                  <span className="font-extrabold text-[#0B5D3B]">
                    {formatCurrency(simulation.current.availableToSave, currency, false)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#17352A]/70">Savings Rate:</span>
                  <span className="font-bold text-[#0B5D3B]">{simulation.current.savingsRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#17352A]/70">Health Index:</span>
                  <span className="font-bold text-[#17352A]">{simulation.current.healthScore}/100</span>
                </div>
              </div>
            </div>

            {/* New Scenario Card */}
            <div className="bg-gradient-to-br from-[#0B5D3B] via-[#0D6D45] to-[#15803D] text-white rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/20">
                <span className="text-xs uppercase font-bold tracking-wider text-[#DCFCE7]">
                  Simulated Scenario
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B5D3B] font-extrabold">
                  What-If
                </span>
              </div>

              <div className="space-y-3 text-xs text-emerald-50">
                <div className="flex justify-between">
                  <span>Simulated Inflow:</span>
                  <span className="font-bold text-white">
                    {formatCurrency(simulation.simulated.income, currency, false)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trimmed Outflow:</span>
                  <span className="font-bold text-white">
                    {formatCurrency(simulation.simulated.expenses, currency, false)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/20 text-white">
                  <span className="font-semibold">New Savings Margin:</span>
                  <span className="font-extrabold text-[#DCFCE7] text-base">
                    +{formatCurrency(simulation.simulated.availableToSave, currency, false)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>New Savings Rate:</span>
                  <span className="font-bold text-[#DCFCE7]">{simulation.simulated.savingsRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Projected Health Score:</span>
                  <span className="font-extrabold text-white text-sm">
                    {simulation.simulated.healthScore}/100
                    {simulation.simulated.scoreDelta !== 0 && (
                      <span className="ml-1 text-[11px] text-[#DCFCE7]">
                        ({simulation.simulated.scoreDelta > 0 ? '+' : ''}
                        {simulation.simulated.scoreDelta} pts)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Goal Completion Projection Banner */}
          {simulation.goalComparison && (
            <div className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#0B5D3B]" />
                  <h3 className="text-base font-bold text-[#17352A]">
                    Milestone Horizon: {simulation.goalComparison.goalName}
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#0B5D3B] font-bold">
                  {simulation.goalComparison.monthsFaster > 0
                    ? `${simulation.goalComparison.monthsFaster} Months Faster!`
                    : 'Current Pace'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#F7F3E8] border border-[#17352A]/5">
                  <p className="text-[10px] uppercase font-semibold text-[#17352A]/60">Original Horizon</p>
                  <p className="text-lg font-bold text-[#17352A] mt-1">
                    {simulation.goalComparison.currentMonthsRemaining} Months
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#DCFCE7]/60 border border-[#15803D]/20">
                  <p className="text-[10px] uppercase font-semibold text-[#0B5D3B]">New Projected Horizon</p>
                  <p className="text-lg font-extrabold text-[#0B5D3B] mt-1">
                    {simulation.goalComparison.newMonthsRemaining} Months
                  </p>
                  <p className="text-[10px] text-[#15803D]">{simulation.goalComparison.projectedDate}</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <p className="text-[10px] uppercase font-semibold text-amber-900">Total Capital Accelerated</p>
                  <p className="text-lg font-extrabold text-amber-950 mt-1">
                    +{formatCurrency(extraMonthlySaving * 12, currency, false)} / yr
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#17352A]/70 italic pt-1">
                Mathematical certainty: Committing {extraMonthlySaving} {currency} more per month reduces the time to fully achieve this target by {simulation.goalComparison.monthsFaster} months.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
