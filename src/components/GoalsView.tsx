import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Target,
  Plus,
  Car,
  Plane,
  GraduationCap,
  Home,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Trash2,
  Coins,
} from 'lucide-react';
import { FinancialGoal, GoalCategory, FinancialProfile } from '../types';
import { formatCurrency, calculateGoalMetrics, calculateMonthsRemaining } from '../utils/finance';

interface GoalsViewProps {
  goals: FinancialGoal[];
  profile: FinancialProfile;
  onAddGoal: () => void;
  onDepositToGoal: (goalId: string, amount: number) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  profile,
  onAddGoal,
  onDepositToGoal,
  onDeleteGoal,
}) => {
  const currency = profile.currency || 'KWD';
  const availableToSave = profile.availableToSave;

  const [depositModalGoal, setDepositModalGoal] = useState<FinancialGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  const getCategoryIcon = (category: GoalCategory) => {
    switch (category) {
      case 'Car':
        return Car;
      case 'Travel':
        return Plane;
      case 'Education':
        return GraduationCap;
      case 'Housing':
        return Home;
      case 'Emergency Fund':
        return ShieldAlert;
      case 'Major Purchase':
        return ShoppingBag;
      default:
        return Sparkles;
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal || !depositAmount || Number(depositAmount) <= 0) return;

    setIsSubmittingDeposit(true);
    try {
      await onDepositToGoal(depositModalGoal.id, Number(depositAmount));
      setDepositModalGoal(null);
      setDepositAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const totalGoalsTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalsSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress =
    totalGoalsTarget > 0 ? Math.round((totalGoalsSaved / totalGoalsTarget) * 100) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B5D3B] text-xs font-bold uppercase tracking-wider mb-1">
            <Target className="w-3.5 h-3.5" />
            <span>Target Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17352A] tracking-tight">
            Financial Goals & Milestones
          </h1>
          <p className="text-sm text-[#17352A]/70">
            Set ambitious milestones. Finora continuously checks feasibility against your monthly available savings of{' '}
            <span className="font-bold text-[#0B5D3B]">{formatCurrency(availableToSave, currency, false)}</span>.
          </p>
        </div>

        <button
          id="goals-create-goal-btn"
          onClick={onAddGoal}
          className="px-6 py-3 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] transition-all flex items-center justify-center space-x-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#17352A]/10 shadow-xs">
          <p className="text-xs uppercase font-semibold text-[#17352A]/60">Total Target Capital</p>
          <p className="text-2xl font-extrabold text-[#17352A] mt-1">
            {formatCurrency(totalGoalsTarget, currency, false)}
          </p>
          <p className="text-[11px] text-[#17352A]/60 mt-0.5">{goals.length} active target(s)</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#17352A]/10 shadow-xs">
          <p className="text-xs uppercase font-semibold text-[#0B5D3B]">Accumulated Savings</p>
          <p className="text-2xl font-extrabold text-[#0B5D3B] mt-1">
            {formatCurrency(totalGoalsSaved, currency, false)}
          </p>
          <p className="text-[11px] text-[#0B5D3B] font-medium mt-0.5">
            {overallProgress}% of milestone portfolio funded
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#17352A]/10 shadow-xs">
          <p className="text-xs uppercase font-semibold text-[#17352A]/60">Monthly Capacity Available</p>
          <p className="text-2xl font-extrabold text-[#17352A] mt-1">
            {formatCurrency(availableToSave, currency, false)}
          </p>
          <p className="text-[11px] text-[#17352A]/60 mt-0.5">
            Income minus recurring expenses & debt
          </p>
        </div>
      </div>

      {/* Goals Cards Grid */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#17352A]/20 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] text-[#0B5D3B] flex items-center justify-center mx-auto">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#17352A]">No Goals Configured</h3>
          <p className="text-sm text-[#17352A]/70 max-w-md mx-auto">
            Create goals like buying a car, booking travel, funding an emergency buffer, or saving for education.
          </p>
          <button
            id="empty-goals-create-btn"
            onClick={onAddGoal}
            className="px-6 py-2.5 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D]"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const Icon = getCategoryIcon(goal.category);
            const metrics = calculateGoalMetrics(goal, availableToSave);
            const remaining = metrics.remainingAmount;
            const reqMonthly = metrics.requiredMonthlySaving;
            const monthsLeft = metrics.monthsRemaining;
            const isAchievable = metrics.isAchievable;

            return (
              <motion.div
                key={goal.id}
                layout
                className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs hover:border-[#15803D]/40 transition-all flex flex-col justify-between space-y-5"
              >
                <div>
                  {/* Top Bar: Icon, Category, and Status Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#0B5D3B] flex items-center justify-center shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#F7F3E8] text-[#17352A]/80 border border-[#17352A]/10">
                          {goal.category}
                        </span>
                        <h3 className="text-lg font-bold text-[#17352A] mt-1">{goal.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        id={`delete-goal-btn-${goal.id}`}
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1.5 rounded-full text-[#17352A]/40 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Numbers Matrix */}
                  <div className="grid grid-cols-2 gap-3 my-4 p-4 rounded-2xl bg-[#F7F3E8]/80 border border-[#17352A]/5">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-[#17352A]/60">Target Amount</p>
                      <p className="text-sm sm:text-base font-bold text-[#17352A]">
                        {formatCurrency(goal.targetAmount, currency, false)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-[#17352A]/60">Current Saved</p>
                      <p className="text-sm sm:text-base font-bold text-[#0B5D3B]">
                        {formatCurrency(goal.currentAmount, currency, false)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-[#17352A]/60">Remaining Needed</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#17352A]">
                        {formatCurrency(remaining, currency, false)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-[#17352A]/60">Deadline / Horizon</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#17352A]">
                        {monthsLeft} months ({goal.targetDate})
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#17352A]/70">Progress</span>
                      <span className="font-extrabold text-[#0B5D3B]">{metrics.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0B5D3B] h-full rounded-full transition-all duration-500"
                        style={{ width: `${metrics.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Required Monthly Saving Indicator & Feasibility */}
                  <div className="mt-4 pt-3 border-t border-[#17352A]/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#17352A]/70 font-medium">Required Monthly Saving:</span>
                      <span className="font-extrabold text-[#17352A]">
                        {formatCurrency(reqMonthly, currency)} / month
                      </span>
                    </div>

                    {/* Feasibility Alert Box */}
                    {isAchievable ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start space-x-2 text-xs text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[#15803D]">Feasible on current monthly surplus</p>
                          <p className="text-[11px] text-emerald-800">
                            Your monthly available savings ({formatCurrency(availableToSave, currency, false)}) comfortably covers this goal.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start space-x-2 text-xs text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-800">Needs Adjustment</p>
                          <p className="text-[11px] text-amber-900 leading-relaxed">
                            Required saving ({formatCurrency(reqMonthly, currency)}) exceeds monthly available capacity (
                            {formatCurrency(availableToSave, currency)}). Consider extending deadline by{' '}
                            {Math.ceil(remaining / Math.max(1, availableToSave)) - monthsLeft} months or reducing expenses.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action: Deposit Savings Button */}
                <button
                  id={`deposit-goal-btn-${goal.id}`}
                  onClick={() => {
                    setDepositModalGoal(goal);
                    setDepositAmount('');
                  }}
                  className="w-full py-2.5 rounded-full bg-[#F7F3E8] border border-[#0B5D3B]/30 hover:bg-[#DCFCE7]/40 text-[#0B5D3B] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-2xs"
                >
                  <Coins className="w-4 h-4" />
                  <span>Deposit Funds into Goal</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Deposit Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#17352A]/10 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#17352A]/10">
              <div>
                <h3 className="text-lg font-bold text-[#17352A]">Deposit Savings</h3>
                <p className="text-xs text-[#17352A]/60">For {depositModalGoal.name}</p>
              </div>
              <button
                onClick={() => setDepositModalGoal(null)}
                className="text-[#17352A]/40 hover:text-[#17352A] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17352A] mb-1">
                  Deposit Amount ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="e.g. 100"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#17352A]/20 text-sm focus:outline-none focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#DCFCE7]"
                />
              </div>

              <div className="flex items-center space-x-2">
                {[50, 100, 250, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDepositAmount(String(preset))}
                    className="flex-1 py-1.5 rounded-xl bg-[#F7F3E8] border border-[#17352A]/10 text-xs font-semibold hover:bg-[#DCFCE7]/40 text-[#17352A]"
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="flex-1 py-2.5 rounded-full border border-[#17352A]/15 text-xs font-semibold text-[#17352A] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDeposit}
                  className="flex-1 py-2.5 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] disabled:opacity-50"
                >
                  {isSubmittingDeposit ? 'Depositing...' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
