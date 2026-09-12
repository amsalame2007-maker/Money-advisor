import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Target,
  ReceiptText,
  Server,
  Sparkles,
  Wallet,
  Coins,
  CheckCircle2,
  Database,
  Bot,
  CreditCard,
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  KeyRound,
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  CurrencyCode,
  FinancialProfile,
  GoalCategory,
  ExpenseCategory,
  SystemStatus,
  User,
} from '../types';
import { CATEGORIES } from './ExpensesView';

// ==========================================
// 1. Profile / Onboarding Modal
// ==========================================
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FinancialProfile;
  userName: string;
  onSave: (data: {
    name: string;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyDebt: number;
    currentSavings: number;
    currency: CurrencyCode;
  }) => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  userName,
  onSave,
}) => {
  const [name, setName] = useState(userName || 'Ahmad Al-Kandari');
  const [income, setIncome] = useState(String(profile.monthlyIncome || 900));
  const [expenses, setExpenses] = useState(String(profile.monthlyExpenses || 350));
  const [debt, setDebt] = useState(String(profile.monthlyDebt || 150));
  const [savings, setSavings] = useState(String(profile.currentSavings || 2000));
  const [currency, setCurrency] = useState<CurrencyCode>(profile.currency || 'KWD');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name: name.trim() || 'Ahmad',
        monthlyIncome: Number(income) || 0,
        monthlyExpenses: Number(expenses) || 0,
        monthlyDebt: Number(debt) || 0,
        currentSavings: Number(savings) || 0,
        currency,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#17352A]/10 space-y-6 my-8"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#17352A]/10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B5D3B]">
              Profile Configuration
            </span>
            <h3 className="text-xl font-extrabold text-[#17352A] mt-1">
              Financial Baseline
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#17352A]/40 hover:text-[#17352A] hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs focus:outline-none focus:border-[#0B5D3B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs focus:outline-none focus:border-[#0B5D3B] bg-white"
              >
                {(['KWD', 'USD', 'EUR', 'GBP', 'SAR', 'AED'] as CurrencyCode[]).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                الدخل الشهري (Monthly Income) ({currency}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="مثال: 900"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs font-semibold focus:outline-none focus:border-[#0B5D3B]"
              />
              <span className="text-[10px] text-[#17352A]/50 mt-0.5 block">
                الراتب أو الدخل الشهري الإجمالي
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                المصروف الشهري (Monthly Expenses) ({currency}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="مثال: 500"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs font-semibold focus:outline-none focus:border-[#0B5D3B]"
              />
              <span className="text-[10px] text-[#17352A]/50 mt-0.5 block">
                المصروف الشهري التقديري الثابت
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                الالتزامات والأقساط (Monthly Debt) ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={debt}
                onChange={(e) => setDebt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs font-semibold focus:outline-none focus:border-[#0B5D3B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                المدخرات الحالية (Current Savings) ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="مثال: 2000"
                value={savings}
                onChange={(e) => setSavings(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs font-semibold focus:outline-none focus:border-[#0B5D3B]"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F7F3E8] text-[11px] text-[#17352A]/70 leading-relaxed">
            All basic financial ratios and health indices are calculated strictly via mathematical code formulas.
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-[#17352A]/20 text-xs font-semibold text-[#17352A] hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Financial Profile'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// 2. Add Goal Modal
// ==========================================
interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onAddGoal: (data: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    category: GoalCategory;
  }) => Promise<void>;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  currency,
  onAddGoal,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Car');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || Number(targetAmount) <= 0) return;

    setLoading(true);
    try {
      await onAddGoal({
        name: name.trim(),
        category,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount) || 0,
        targetDate,
      });
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categoriesList: GoalCategory[] = [
    'Car',
    'Travel',
    'Education',
    'Housing',
    'Emergency Fund',
    'Major Purchase',
    'Custom Goal',
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#17352A]/10 space-y-5 my-8"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#17352A]/10">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-[#0B5D3B]" />
            <h3 className="text-lg font-bold text-[#17352A]">Create Financial Goal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#17352A]/40 hover:text-[#17352A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17352A] mb-1">
              Goal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. New SUV or Tokyo Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs focus:outline-none focus:border-[#0B5D3B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17352A] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GoalCategory)}
              className="w-full px-3 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs bg-white focus:outline-none focus:border-[#0B5D3B]"
            >
              {categoriesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Target Amount ({currency}) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="8000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs font-semibold focus:outline-none focus:border-[#0B5D3B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Current Saved ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs font-semibold focus:outline-none focus:border-[#0B5D3B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17352A] mb-1">
              Target Completion Date *
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-[#17352A]/20 text-xs focus:outline-none focus:border-[#0B5D3B]"
            />
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-[#17352A]/20 text-xs font-semibold text-[#17352A] hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] shadow-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Save Goal'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// 3. Add Expense Modal
// ==========================================
interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onAddExpense: (data: {
    amount: number;
    category: ExpenseCategory;
    date: string;
    description: string;
  }) => Promise<void>;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  currency,
  onAddExpense,
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      await onAddExpense({
        amount: Number(amount),
        category,
        date,
        description: description.trim() || category,
      });
      setAmount('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#17352A]/10 space-y-5 my-8"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#17352A]/10">
          <div className="flex items-center space-x-2">
            <ReceiptText className="w-5 h-5 text-[#0B5D3B]" />
            <h3 className="text-lg font-bold text-[#17352A]">Log Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#17352A]/40 hover:text-[#17352A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17352A] mb-1">
              Amount ({currency}) *
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              required
              placeholder="e.g. 25"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-sm font-semibold focus:outline-none focus:border-[#0B5D3B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17352A] mb-1">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.name;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                      isSelected
                        ? 'border-[#0B5D3B] bg-[#DCFCE7]'
                        : 'border-[#17352A]/10 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0B5D3B]' : cat.color}`} />
                    <span className="text-[9px] font-bold text-[#17352A] truncate w-full">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#17352A]/20 text-xs focus:outline-none focus:border-[#0B5D3B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Merchant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#17352A]/20 text-xs focus:outline-none focus:border-[#0B5D3B]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-[#17352A]/20 text-xs font-semibold text-[#17352A] hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] shadow-sm disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Log Transaction'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// 4. System Status Modal (MongoDB, Gemini, Stripe)
// ==========================================
interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SystemStatus | null;
  onRefresh: () => void;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#17352A]/10 space-y-6 my-8"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#17352A]/10">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-[#0B5D3B]" />
            <h3 className="text-xl font-extrabold text-[#17352A]">
              Infrastructure & Services Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#17352A]/40 hover:text-[#17352A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Database Info Card */}
          <div className="p-4 rounded-2xl bg-[#F7F3E8] border border-[#17352A]/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#0B5D3B]" />
                <span className="font-bold text-[#17352A]">Data Persistence Layer</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B5D3B] font-extrabold text-[10px]">
                {status?.database.type === 'mongodb' ? 'MongoDB Active' : 'Persistent Storage Active'}
              </span>
            </div>
            <p className="text-[#17352A]/70 leading-relaxed">
              {status?.database.message || 'Connected to MongoDB Atlas Cluster'}
            </p>
            <div className="text-[10px] text-[#17352A]/60 pt-1 border-t border-[#17352A]/10">
              To connect your own MongoDB cluster, set <code className="bg-white px-1 py-0.5 rounded">MONGODB_URI</code> in Settings.
            </div>
          </div>

          {/* AI Intelligence Service Card */}
          <div className="p-4 rounded-2xl bg-[#F7F3E8] border border-[#17352A]/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-[#0B5D3B]" />
                <span className="font-bold text-[#17352A]">AI Intelligence Engine</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-extrabold text-[10px]">
                {status?.ai.configured ? 'Gemini Connected' : 'Deterministic Advisory Active'}
              </span>
            </div>
            <p className="text-[#17352A]/70 leading-relaxed">
              {status?.ai.model}
            </p>
          </div>

          {/* Stripe Billing Integration Card */}
          <div className="p-4 rounded-2xl bg-[#F7F3E8] border border-[#17352A]/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-[#0B5D3B]" />
                <span className="font-bold text-[#17352A]">Stripe API Payments</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                  status?.stripe.configured
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {status?.stripe.configured ? 'Stripe Gateway Active' : 'Ready for Keys'}
              </span>
            </div>
            <p className="text-[#17352A]/70 leading-relaxed">
              Accepts <code className="bg-white px-1 py-0.5 rounded">STRIPE_SECRET_KEY</code> and <code className="bg-white px-1 py-0.5 rounded">STRIPE_PUBLISHABLE_KEY</code>. In development and trial mode, subscription flows are fully interactive.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={onRefresh}
            className="px-4 py-2 rounded-full border border-[#17352A]/20 text-xs font-semibold text-[#17352A] hover:bg-slate-50"
          >
            Refresh Status
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D]"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// 5. Auth Modal (Log In / Sign Up with 6-digit verification)
// ==========================================
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [step, setStep] = useState<'form' | 'verify'>('form');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('KWD');
  const [verificationCode, setVerificationCode] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setError(null);
    setInfoMessage(null);
    setStep('form');
    setVerificationCode('');
    setSimulatedCode(null);
  };

  const handleSwitchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    resetForm();
  };

  // 1. Submit Log In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to sign in');
      }

      if (data.user) {
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Could not sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Sign Up Step 1: Send 6-digit verification code
  const handleSignUpInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    // Client-side validations
    if (!firstName.trim()) {
      setError('First name is required (الاسم الأول مطلوب)');
      return;
    }
    if (!lastName.trim()) {
      setError('Last name is required (الاسم الثاني مطلوب)');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address (يرجى إدخال بريد إلكتروني صحيح)');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long (كلمة المرور يجب أن تكون 8 أحرف على الأقل)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          currency,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setStep('verify');
      setInfoMessage(`We sent a 6-digit confirmation code to ${email.trim()}`);
      if (data.code) {
        setSimulatedCode(data.code);
        setVerificationCode(data.code); // Pre-fill for quick testing
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send confirmation code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Sign Up Step 2: Verify 6-digit code and create account
  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code (رمز التحقق يتكون من 6 أرقام)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-and-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid or expired code');
      }

      if (data.user) {
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#17352A]/10 space-y-6 my-8"
      >
        {/* Header & Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-[#17352A]/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#DCFCE7]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#17352A]">
                {mode === 'login' ? 'Log In to Finora' : 'Create an Account'}
              </h3>
              <p className="text-[11px] text-[#17352A]/60">
                {mode === 'login' ? 'Welcome back! Access your finances' : '30-day trial included • Fast 6-digit confirmation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#17352A]/40 hover:text-[#17352A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Log In / Sign Up */}
        <div className="flex bg-[#F7F3E8] p-1 rounded-2xl border border-[#17352A]/10">
          <button
            type="button"
            onClick={() => handleSwitchMode('login')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-white text-[#0B5D3B] shadow-xs'
                : 'text-[#17352A]/60 hover:text-[#17352A]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('signup')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#0B5D3B] shadow-xs'
                : 'text-[#17352A]/60 hover:text-[#17352A]'
            }`}
          >
            Sign Up (حساب جديد)
          </button>
        </div>

        {/* Status/Error alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start space-x-2.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#15803D]" />
            <div className="leading-relaxed">
              <p className="font-semibold">{infoMessage}</p>
              {simulatedCode && (
                <p className="mt-1 font-mono text-[11px] bg-emerald-100/70 px-2 py-0.5 rounded text-emerald-950 inline-block font-bold">
                  Demo Code: {simulatedCode}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Mode: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#17352A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs font-medium focus:outline-none focus:border-[#0B5D3B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#17352A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs font-medium focus:outline-none focus:border-[#0B5D3B]"
                />
              </div>
              <span className="block text-[10px] text-[#17352A]/50 mt-1">
                Demo accounts can also sign in directly by email.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Signing in...' : 'Log In to Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Mode: SIGN UP */}
        {mode === 'signup' && step === 'form' && (
          <form onSubmit={handleSignUpInit} className="space-y-3.5">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#17352A] mb-1">
                  الاسم الأول (First) *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#17352A]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs font-medium focus:outline-none focus:border-[#0B5D3B]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17352A] mb-1">
                  الاسم الثاني (Last) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الكندري"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs font-medium focus:outline-none focus:border-[#0B5D3B]"
                />
              </div>
            </div>
            <p className="text-[10px] text-[#0B5D3B] font-medium -mt-1">
              * سيتم مناداتك داخل التطبيق والترحيب بك باسمك الأول فقط.
            </p>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Email Address (البريد الإلكتروني) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#17352A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs font-medium focus:outline-none focus:border-[#0B5D3B]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#17352A]">
                  Password (كلمة المرور) *
                </label>
                <span
                  className={`text-[10px] font-bold ${
                    password.length >= 8 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {password.length}/8 حروف كحد أدنى
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#17352A]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="8 أحرف على الأقل"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none ${
                    password.length > 0 && password.length < 8
                      ? 'border-amber-400 focus:border-amber-600 bg-amber-50/30'
                      : 'border-[#17352A]/20 focus:border-[#0B5D3B]'
                  }`}
                />
              </div>
            </div>

            {/* Preferred Currency */}
            <div>
              <label className="block text-xs font-semibold text-[#17352A] mb-1">
                Account Currency (العملة الأساسية)
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2.5 rounded-2xl border border-[#17352A]/20 text-xs font-semibold bg-white focus:outline-none focus:border-[#0B5D3B]"
              >
                <option value="KWD">KWD - د.ك (Kuwaiti Dinar)</option>
                <option value="SAR">SAR - ر.س (Saudi Riyal)</option>
                <option value="AED">AED - د.إ (UAE Dirham)</option>
                <option value="QAR">QAR - ر.ق (Qatari Riyal)</option>
                <option value="BHD">BHD - د.ب (Bahraini Dinar)</option>
                <option value="OMR">OMR - ر.ع (Omani Rial)</option>
                <option value="USD">USD - $ (US Dollar)</option>
                <option value="EUR">EUR - € (Euro)</option>
                <option value="GBP">GBP - £ (British Pound)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || password.length < 8}
                className="w-full py-3 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Generating 6-digit code...' : 'Continue & Verify Email (إرسال كود التأكيد)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Mode: SIGN UP Step 2: VERIFICATION CODE */}
        {mode === 'signup' && step === 'verify' && (
          <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0B5D3B] flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#17352A]">
                أدخل كود التأكيد (6 أرقام)
              </h4>
              <p className="text-xs text-[#17352A]/70">
                تم إرسال رمز التحقق إلى: <span className="font-bold text-[#17352A]">{email}</span>
              </p>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full py-3 px-4 text-center tracking-[0.5em] font-mono text-xl font-extrabold rounded-2xl border border-[#17352A]/25 focus:outline-none focus:border-[#0B5D3B] bg-slate-50"
              />
              <span className="block text-center text-[11px] text-[#17352A]/50 mt-1.5">
                Enter the 6-digit confirmation code
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full py-3 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Confirm Code & Create Account (تأكيد الحساب)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full py-2 rounded-full text-xs font-semibold text-[#17352A]/70 hover:text-[#17352A]"
              >
                ← Back to edit information (تعديل البيانات)
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
