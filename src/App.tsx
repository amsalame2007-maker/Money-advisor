import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { GoalsView } from './components/GoalsView';
import { WhatIfView } from './components/WhatIfView';
import { ExpensesView } from './components/ExpensesView';
import { AIAdvisorView } from './components/AIAdvisorView';
import { AIChatView } from './components/AIChatView';
import { CurrencyConverterView } from './components/CurrencyConverterView';
import { PremiumView } from './components/PremiumView';
import {
  ProfileModal,
  AddGoalModal,
  AddExpenseModal,
  SystemStatusModal,
  AuthModal,
} from './components/Modals';
import {
  User,
  FinancialProfile,
  FinancialGoal,
  Expense,
  SystemStatus,
  CurrencyCode,
  GoalCategory,
  ExpenseCategory,
} from './types';
import { calculateFinancialHealth } from './utils/finance';
import confetti from 'canvas-confetti';
import { Sparkles, Shield, Heart, Server, CheckCircle, XCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentNotice, setPaymentNotice] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  // Modal open states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isSystemStatusModalOpen, setIsSystemStatusModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Active user ID for data isolation
  const activeUserId = user?.id || 'usr_demo';

  // Load initial app data
  const loadData = async (targetUserId?: string) => {
    try {
      const uid = targetUserId || (user?.id || 'usr_demo');
      const headers = { 'x-user-id': uid };

      const safeJson = async (res: Response) => {
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return null;
        try {
          return await res.json();
        } catch {
          return null;
        }
      };

      const [userRes, finRes, goalsRes, expRes, sysRes] = await Promise.all([
        fetch('/api/user/profile', { headers }),
        fetch('/api/financials', { headers }),
        fetch('/api/goals', { headers }),
        fetch('/api/expenses', { headers }),
        fetch('/api/system/status'),
      ]);

      const [userData, finData, goalsData, expData, sysData] = await Promise.all([
        safeJson(userRes),
        safeJson(finRes),
        safeJson(goalsRes),
        safeJson(expRes),
        safeJson(sysRes),
      ]);

      if (userData) {
        setUser(userData.user || userData);
      }
      if (finData) {
        setProfile(finData.profile || finData);
      }
      if (goalsData) {
        setGoals(goalsData.goals || goalsData);
      }
      if (expData) {
        setExpenses(expData.expenses || expData);
      }
      if (sysData) {
        setSystemStatus(sysData);
      }
    } catch (err) {
      console.error('Error fetching initial application data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthModalOpen(false);
    // Refresh user-specific financial profile and goals for this authenticated account
    loadData(authenticatedUser.id);
    setPaymentNotice({
      type: 'success',
      message: `Welcome back, ${authenticatedUser.firstName || authenticatedUser.name.split(' ')[0]}! You are logged in.`,
    });
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment_success') === 'true') {
        const sessionId = params.get('session_id');
        if (sessionId) {
          fetch('/api/stripe/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_demo' },
            body: JSON.stringify({ sessionId }),
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.isPremium || res.success) {
                setUser((prev) => (prev ? { ...prev, isPremium: true } : prev));
              }
            })
            .catch((err) => console.error('Stripe verify error:', err));
        }
        setPaymentNotice({
          type: 'success',
          message: 'Payment verified! Your 30-day Finora Pro free trial is now active.',
        });
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (params.get('payment_cancelled') === 'true') {
        setPaymentNotice({
          type: 'info',
          message: 'Stripe checkout was canceled. You can resume at any time.',
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Update Profile / Financial parameters
  const handleSaveProfile = async (data: {
    name: string;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyDebt: number;
    currentSavings: number;
    currency: CurrencyCode;
  }) => {
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': activeUserId,
    };

    // Update user info
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: data.name,
        currency: data.currency,
      }),
    });

    // Update financial profile
    const finRes = await fetch('/api/financials', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        monthlyIncome: data.monthlyIncome,
        monthlyExpenses: data.monthlyExpenses,
        monthlyDebt: data.monthlyDebt,
        currentSavings: data.currentSavings,
        currency: data.currency,
      }),
    });

    if (finRes.ok) {
      const updatedFin = await finRes.json();
      setProfile(updatedFin.profile || updatedFin);
      setUser((prev) => (prev ? { ...prev, name: data.name, currency: data.currency } : null));
    }
  };

  // Add a new Goal
  const handleAddGoal = async (goalData: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    category: GoalCategory;
  }) => {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': activeUserId,
      },
      body: JSON.stringify(goalData),
    });

    if (res.ok) {
      const newGoalData = await res.json();
      const newGoal = newGoalData.goal || newGoalData;
      setGoals((prev) => [...prev, newGoal]);
      const finRes = await fetch('/api/financials', { headers: { 'x-user-id': activeUserId } });
      if (finRes.ok) {
        const finData = await finRes.json();
        setProfile(finData.profile || finData);
      }
    }
  };

  // Deposit funds directly to a Goal
  const handleDepositToGoal = async (goalId: string, amount: number) => {
    const res = await fetch(`/api/goals/${goalId}/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': activeUserId,
      },
      body: JSON.stringify({ amount }),
    });

    if (res.ok) {
      const updatedGoalData = await res.json();
      const updatedGoal = updatedGoalData.goal || updatedGoalData;
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)));
    }
  };

  // Delete a Goal
  const handleDeleteGoal = async (goalId: string) => {
    const res = await fetch(`/api/goals/${goalId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': activeUserId },
    });

    if (res.ok) {
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      const finRes = await fetch('/api/financials', { headers: { 'x-user-id': activeUserId } });
      if (finRes.ok) {
        const finData = await finRes.json();
        setProfile(finData.profile || finData);
      }
    }
  };

  // Add an Expense
  const handleAddExpense = async (expenseData: {
    amount: number;
    category: ExpenseCategory;
    date: string;
    description: string;
  }) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': activeUserId,
      },
      body: JSON.stringify(expenseData),
    });

    if (res.ok) {
      const newExpData = await res.json();
      const newExp = newExpData.expense || newExpData;
      setExpenses((prev) => [newExp, ...prev]);
      const finRes = await fetch('/api/financials', { headers: { 'x-user-id': activeUserId } });
      if (finRes.ok) {
        const finData = await finRes.json();
        setProfile(finData.profile || finData);
      }
    }
  };

  // Delete an Expense
  const handleDeleteExpense = async (id: string) => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': activeUserId },
    });

    if (res.ok) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      const finRes = await fetch('/api/financials', { headers: { 'x-user-id': activeUserId } });
      if (finRes.ok) {
        const finData = await finRes.json();
        setProfile(finData.profile || finData);
      }
    }
  };

  // Change Currency
  const handleUpdateProfileCurrency = async (newCurrency: CurrencyCode) => {
    if (!profile) return;
    await handleSaveProfile({
      name: user?.name || 'Ahmad',
      monthlyIncome: profile.monthlyIncome,
      monthlyExpenses: profile.monthlyExpenses,
      monthlyDebt: profile.monthlyDebt,
      currentSavings: profile.currentSavings,
      currency: newCurrency,
    });
  };

  // Deterministic live financial metrics computed directly by code
  const baseIncome = profile?.monthlyIncome ?? 900;
  const baseExpenses = profile?.monthlyExpenses ?? 500;
  const baseSavings = profile?.currentSavings ?? 2000;
  const baseDebt = profile?.monthlyDebt ?? 0;
  const baseCurrency = profile?.currency ?? (user?.currency || 'KWD');

  const healthCalc = calculateFinancialHealth(
    baseIncome,
    baseExpenses,
    baseSavings,
    baseDebt,
    goals
  );

  const activeProfile: FinancialProfile = {
    monthlyIncome: baseIncome,
    monthlyExpenses: baseExpenses,
    currentSavings: baseSavings,
    monthlyDebt: baseDebt,
    currency: baseCurrency,
    availableToSave: healthCalc.availableToSave,
    savingsRate: healthCalc.savingsRate,
    healthScore: healthCalc.healthScore,
    healthStatus: healthCalc.healthStatus,
    healthBreakdown: healthCalc.breakdown,
    lastUpdated: profile?.lastUpdated || new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-[#F7F3E8] text-[#17352A] flex flex-col font-sans selection:bg-[#DCFCE7] selection:text-[#0B5D3B]">
      {/* Top Sticky Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        user={user}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={(mode) => handleOpenAuth(mode || 'login')}
        onOpenSystemStatus={() => setIsSystemStatusModalOpen(true)}
        systemStatus={systemStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {paymentNotice && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between shadow-xs ${
              paymentNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold">
              {paymentNotice.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-[#15803D] shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span>{paymentNotice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setPaymentNotice(null)}
              className="text-xs font-bold px-3 py-1 rounded-full bg-white/80 hover:bg-white text-current shadow-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <LandingPage
                onGetStarted={() => setCurrentView('dashboard')}
                onSeeHowItWorks={() => setCurrentView('simulator')}
                profile={activeProfile}
                user={user}
              />
            </motion.div>
          )}

          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <DashboardView
                profile={activeProfile}
                goals={goals}
                expenses={expenses}
                user={user}
                onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
                onOpenAddGoal={() => setIsAddGoalModalOpen(true)}
                onOpenEditProfile={() => setIsProfileModalOpen(true)}
                onNavigate={(v) => setCurrentView(v)}
              />
            </motion.div>
          )}

          {currentView === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <GoalsView
                goals={goals}
                profile={activeProfile}
                onAddGoal={() => setIsAddGoalModalOpen(true)}
                onDepositToGoal={handleDepositToGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            </motion.div>
          )}

          {currentView === 'simulator' && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <WhatIfView profile={activeProfile} goals={goals} />
            </motion.div>
          )}

          {currentView === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ExpensesView
                expenses={expenses}
                profile={activeProfile}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            </motion.div>
          )}

          {currentView === 'advisor' && (
            <motion.div
              key="advisor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <AIAdvisorView profile={activeProfile} goals={goals} />
            </motion.div>
          )}

          {currentView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <AIChatView profile={activeProfile} goals={goals} />
            </motion.div>
          )}

          {currentView === 'currency' && (
            <motion.div
              key="currency"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <CurrencyConverterView
                currentProfileCurrency={activeProfile.currency}
                onUpdateProfileCurrency={handleUpdateProfileCurrency}
              />
            </motion.div>
          )}

          {currentView === 'premium' && (
            <motion.div
              key="premium"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <PremiumView
                user={user}
                profile={activeProfile}
                goals={goals}
                expenses={expenses}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 border-t border-[#17352A]/10 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#DCFCE7]" />
            </div>
            <span className="font-extrabold text-sm text-[#0B5D3B]">FINORA</span>
            <span className="text-xs text-[#17352A]/60">
              — Understand your money. Plan your future.
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-[#17352A]/60">
            <span>Deterministic Math Engine</span>
            <span>•</span>
            <button
              onClick={() => setIsSystemStatusModalOpen(true)}
              className="hover:text-[#0B5D3B] underline decoration-dotted"
            >
              Cloud & Storage Status
            </button>
            <span>•</span>
            <span>ISO Financial Practice</span>
          </div>
        </div>
      </footer>

      {/* Shared Dialogs / Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={activeProfile}
        userName={user?.name || 'Ahmad Al-Kandari'}
        onSave={handleSaveProfile}
      />

      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        currency={activeProfile.currency}
        onAddGoal={handleAddGoal}
      />

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        currency={activeProfile.currency}
        onAddExpense={handleAddExpense}
      />

      <SystemStatusModal
        isOpen={isSystemStatusModalOpen}
        onClose={() => setIsSystemStatusModalOpen(false)}
        status={systemStatus}
        onRefresh={loadData}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </div>
  );
}
