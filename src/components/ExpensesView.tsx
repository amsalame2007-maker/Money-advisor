import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ReceiptText,
  Plus,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  FileText,
  GraduationCap,
  HeartPulse,
  MoreHorizontal,
  Trash2,
  TrendingDown,
  PieChart,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Expense, ExpenseCategory, FinancialProfile } from '../types';
import { formatCurrency } from '../utils/finance';

interface ExpensesViewProps {
  expenses: Expense[];
  profile: FinancialProfile;
  onAddExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

export const CATEGORIES: { name: ExpenseCategory; icon: any; color: string; bg: string }[] = [
  { name: 'Food', icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { name: 'Transport', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { name: 'Shopping', icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  { name: 'Entertainment', icon: Film, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200' },
  { name: 'Bills', icon: FileText, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  { name: 'Education', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  { name: 'Health', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  { name: 'Other', icon: MoreHorizontal, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  profile,
  onAddExpense,
  onDeleteExpense,
}) => {
  const currency = profile.currency || 'KWD';

  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');

  // Stats calculation
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Group by category
  const categoryTotals: Record<ExpenseCategory, number> = {
    Food: 0,
    Transport: 0,
    Shopping: 0,
    Entertainment: 0,
    Bills: 0,
    Education: 0,
    Health: 0,
    Other: 0,
  };

  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
  });

  // Biggest spending category
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const biggestCategory = sortedCategories[0] || ['None', 0];
  const biggestCategoryPct =
    totalExpenses > 0 ? Math.round(((biggestCategory[1] as number) / totalExpenses) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      await onAddExpense({
        amount: Number(amount),
        category,
        date,
        description: description.trim() || category,
      });
      setAmount('');
      setDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExpenses =
    selectedFilterCategory === 'all'
      ? expenses
      : expenses.filter((e) => e.category === selectedFilterCategory);

  const getCategoryMeta = (cat: ExpenseCategory) => {
    return CATEGORIES.find((c) => c.name === cat) || CATEGORIES[7];
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B5D3B] text-xs font-bold uppercase tracking-wider mb-1">
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Expense Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17352A] tracking-tight">
            Expense Tracking & Category Breakdown
          </h1>
          <p className="text-sm text-[#17352A]/70">
            Log transactions to instantly update your Dashboard, Available to Save, and Financial Health index.
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#17352A]/10 shadow-xs">
          <p className="text-xs uppercase font-semibold text-[#17352A]/60">Total Tracked Expenses</p>
          <p className="text-2xl font-extrabold text-[#17352A] mt-1">
            {formatCurrency(totalExpenses, currency, false)}
          </p>
          <p className="text-[11px] text-[#17352A]/60 mt-0.5">{expenses.length} transaction(s) recorded</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#17352A]/10 shadow-xs">
          <p className="text-xs uppercase font-semibold text-amber-700">Biggest Spending Category</p>
          <p className="text-2xl font-extrabold text-[#17352A] mt-1">
            {biggestCategory[0]}
          </p>
          <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
            {formatCurrency(biggestCategory[1] as number, currency, false)} ({biggestCategoryPct}% of expenses)
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#17352A]/10 shadow-xs">
          <p className="text-xs uppercase font-semibold text-[#0B5D3B]">Impact on Available to Save</p>
          <p className="text-2xl font-extrabold text-[#0B5D3B] mt-1">
            {formatCurrency(profile.availableToSave, currency, false)}
          </p>
          <p className="text-[11px] text-[#0B5D3B] font-medium mt-0.5">
            Updated automatically with every log
          </p>
        </div>
      </div>

      {/* Grid: Add Expense Form & Category Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Quick Log Expense Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs space-y-5">
          <h2 className="text-lg font-bold text-[#17352A] pb-3 border-b border-[#17352A]/10 flex items-center space-x-2">
            <Plus className="w-4 h-4 text-[#0B5D3B]" />
            <span>Log New Transaction</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Amount ({currency}) *
              </label>
              <input
                id="expense-amount-input"
                type="number"
                step="any"
                min="0.1"
                required
                placeholder="e.g. 35"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#17352A]/20 text-sm focus:outline-none focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#DCFCE7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Category *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                        isSelected
                          ? 'border-[#0B5D3B] bg-[#DCFCE7] shadow-xs'
                          : 'border-[#17352A]/10 bg-white hover:bg-[#F7F3E8]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#0B5D3B]' : cat.color}`} />
                      <span className="text-[10px] font-bold truncate max-w-full text-[#17352A]">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Date
              </label>
              <input
                id="expense-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs text-[#17352A] focus:outline-none focus:border-[#0B5D3B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Description / Merchant
              </label>
              <input
                id="expense-desc-input"
                type="text"
                placeholder="e.g. Supermarket Grocery Run"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs focus:outline-none focus:border-[#0B5D3B]"
              />
            </div>

            <button
              id="expense-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Add Expense to Ledger'}
            </button>
          </form>
        </div>

        {/* Right: Spending by Category Breakdown Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#17352A]/10">
            <div>
              <h2 className="text-lg font-bold text-[#17352A]">Spending by Category</h2>
              <p className="text-xs text-[#17352A]/60">Cumulative volume distribution</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-[#17352A]/60">Total</span>
              <p className="text-sm font-bold text-[#17352A]">{formatCurrency(totalExpenses, currency, false)}</p>
            </div>
          </div>

          {totalExpenses === 0 ? (
            <div className="text-center py-12 text-xs text-[#17352A]/60 bg-[#F7F3E8] rounded-2xl">
              No expenses recorded yet. Use the form to log your daily purchases.
            </div>
          ) : (
            <div className="space-y-3.5">
              {CATEGORIES.map((cat) => {
                const amt = categoryTotals[cat.name] || 0;
                const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
                if (amt === 0) return null;

                const Icon = cat.icon;
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-lg ${cat.bg}`}>
                          <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                        </div>
                        <span className="font-bold text-[#17352A]">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-[#17352A]">
                          {formatCurrency(amt, currency, false)}
                        </span>
                        <span className="text-[11px] text-[#17352A]/60 ml-2">({pct}%)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0B5D3B] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#17352A]/10">
          <div className="flex items-center space-x-2">
            <ReceiptText className="w-5 h-5 text-[#0B5D3B]" />
            <h2 className="text-lg font-bold text-[#17352A]">Transaction History</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {filteredExpenses.length} entries
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedFilterCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFilterCategory === 'all'
                  ? 'bg-[#0B5D3B] text-white'
                  : 'bg-[#F7F3E8] text-[#17352A] hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedFilterCategory(cat.name)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedFilterCategory === cat.name
                    ? 'bg-[#0B5D3B] text-white'
                    : 'bg-[#F7F3E8] text-[#17352A] hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#17352A]/60">
            No transactions found for this selection.
          </div>
        ) : (
          <div className="divide-y divide-[#17352A]/5">
            {filteredExpenses.map((exp) => {
              const meta = getCategoryMeta(exp.category);
              const Icon = meta.icon;

              return (
                <div
                  key={exp.id}
                  className="py-3.5 flex items-center justify-between hover:bg-[#F7F3E8]/40 px-3 rounded-2xl transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.bg}`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#17352A]">
                        {exp.description || exp.category}
                      </p>
                      <div className="flex items-center space-x-2 text-[10px] text-[#17352A]/60">
                        <span>{exp.category}</span>
                        <span>•</span>
                        <span>{exp.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-extrabold text-[#17352A]">
                      -{formatCurrency(exp.amount, currency)}
                    </span>
                    <button
                      id={`delete-expense-${exp.id}`}
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1.5 rounded-full text-[#17352A]/40 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
