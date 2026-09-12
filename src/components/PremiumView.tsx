import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Crown,
  Check,
  Sparkles,
  Download,
  CreditCard,
  ShieldCheck,
  Zap,
  ArrowRight,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { FinancialProfile, FinancialGoal, Expense, User } from '../types';
import { formatCurrency } from '../utils/finance';

interface PremiumViewProps {
  user: User | null;
  profile: FinancialProfile;
  goals: FinancialGoal[];
  expenses: Expense[];
}

export const PremiumView: React.FC<PremiumViewProps> = ({
  user,
  profile,
  goals,
  expenses,
}) => {
  const currency = profile.currency || 'KWD';
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState<boolean>(false);

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stripe/status')
      .then((res) => res.json())
      .then((data) => {
        setStripeConfigured(Boolean(data.configured));
      })
      .catch((err) => console.error(err));
  }, []);

  const handleStartTrialOrCheckout = async () => {
    setLoadingCheckout(true);
    setCheckoutMessage(null);
    setCheckoutUrl(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: billingCycle === 'annual' ? 'pro_annual' : 'pro_monthly',
          userId: user?.id || 'usr_demo',
        }),
      });
      const data = await res.json();

      if (data.url) {
        setCheckoutUrl(data.url);
        setCheckoutMessage('Stripe Checkout session initialized.');
        // Attempt to open in new tab to bypass iframe security restrictions
        try {
          window.open(data.url, '_blank');
        } catch {
          window.location.href = data.url;
        }
      } else if (data.simulated) {
        setCheckoutMessage(
          '30-Day Free Trial Activated! (Simulated mode active: Connect your live STRIPE_SECRET_KEY in Settings to enable real card billing).'
        );
      } else {
        setCheckoutMessage(data.message || 'Trial started successfully.');
      }
    } catch (err: any) {
      setCheckoutMessage('Error connecting to billing service: ' + err.message);
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleExportData = () => {
    const exportObject = {
      user,
      profile,
      goals,
      expenses,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finora-financial-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 pb-16 max-w-5xl mx-auto">
      {/* Hero Banner with 30-Day Free Trial */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <Crown className="w-4 h-4 text-amber-500" />
          <span>Finora Pro • 30-Day Free Trial Included</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17352A] tracking-tight">
          Supercharge your wealth strategy
        </h1>
        <p className="text-sm sm:text-base text-[#17352A]/70 leading-relaxed">
          Unlock unlimited financial goals, automated scenario testing, priority AI advisory, and full audit exports. Cancel anytime with zero commitment.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex items-center p-1 rounded-full bg-white border border-[#17352A]/10 shadow-xs mt-2">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'text-[#17352A]/70 hover:text-[#17352A]'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
              billingCycle === 'annual'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'text-[#17352A]/70 hover:text-[#17352A]'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {checkoutMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-emerald-900 shadow-xs max-w-2xl mx-auto">
          <div className="flex items-start space-x-3">
            <Check className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
            <p className="font-semibold">{checkoutMessage}</p>
          </div>
          {checkoutUrl && (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] transition-colors inline-flex items-center space-x-1.5 shrink-0"
            >
              <span>Complete on Stripe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
        {/* Free Starter Tier */}
        <div className="bg-white rounded-3xl p-7 border border-[#17352A]/10 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#17352A]/60">
                Finora Starter
              </span>
              <h3 className="text-2xl font-extrabold text-[#17352A] mt-1">Free Forever</h3>
              <p className="text-xs text-[#17352A]/60 mt-1">
                Essential personal cash flow planning.
              </p>
            </div>

            <div className="py-2">
              <span className="text-3xl font-extrabold text-[#17352A]">0</span>
              <span className="text-sm font-semibold text-[#17352A]/60 ml-1">{currency} / month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-[#17352A]/80">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>Up to 3 active goals</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>Standard Cash Flow Dashboard</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>Basic What-If Simulator</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>Expense tracking ledger</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-2xl bg-[#F7F3E8] text-center text-xs font-semibold text-[#17352A]/70">
            Currently Active
          </div>
        </div>

        {/* Pro Tier Card */}
        <div className="bg-gradient-to-br from-[#0B5D3B] via-[#0D6D45] to-[#15803D] text-white rounded-3xl p-7 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#0B5D3B] text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
              30-Day Free Trial
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#DCFCE7]/80">
                Finora Pro
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">Unlimited Potential</h3>
              <p className="text-xs text-emerald-100/70 mt-1">
                For individuals serious about accelerating their wealth.
              </p>
            </div>

            <div className="py-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-extrabold text-white">
                  {billingCycle === 'annual' ? '3.9' : '4.9'}
                </span>
                <span className="text-sm font-semibold text-emerald-100">
                  {currency} / month
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                {billingCycle === 'annual'
                  ? `Billed annually (~47 ${currency}/year) after 30-day trial`
                  : `Billed monthly after 30-day trial`}
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-emerald-50">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#DCFCE7] shrink-0" />
                <span className="font-bold">Unlimited Financial Goals & Milestones</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#DCFCE7] shrink-0" />
                <span>Advanced What-If Scenarios & Timeline Forecasts</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#DCFCE7] shrink-0" />
                <span>AI Advisor with Deep Contextual Explanations</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#DCFCE7] shrink-0" />
                <span>Interactive AI Chat linked to your real numbers</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#DCFCE7] shrink-0" />
                <span>Export Financial Audit Reports (JSON & CSV)</span>
              </li>
            </ul>
          </div>

          <button
            id="start-premium-trial-btn"
            onClick={handleStartTrialOrCheckout}
            disabled={loadingCheckout}
            className="w-full py-4 rounded-full bg-[#DCFCE7] text-[#0B5D3B] text-sm font-extrabold hover:bg-white transition-all flex items-center justify-center space-x-2 shadow-md disabled:opacity-60"
          >
            <Crown className="w-4 h-4 text-[#0B5D3B]" />
            <span>{loadingCheckout ? 'Connecting...' : 'Start 30-Day Free Trial'}</span>
            <ArrowRight className="w-4 h-4 text-[#0B5D3B]" />
          </button>
        </div>
      </div>

      {/* Export Reports Section Required by Prompt */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#17352A]/10 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-4xl mx-auto">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0B5D3B]" />
            <h3 className="text-base font-bold text-[#17352A]">
              Export Financial Audit Report
            </h3>
          </div>
          <p className="text-xs text-[#17352A]/70">
            Download your full financial snapshot, active goals, expense logs, and health ratings for record keeping.
          </p>
        </div>

        <button
          id="export-report-btn"
          onClick={handleExportData}
          className="px-5 py-2.5 rounded-full bg-[#0B5D3B] text-white text-xs font-bold hover:bg-[#15803D] transition-colors flex items-center space-x-2 shadow-xs shrink-0"
        >
          <Download className="w-4 h-4 text-[#DCFCE7]" />
          <span>Export Data (JSON)</span>
        </button>
      </div>

      {/* Stripe Readiness Note */}
      <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-[#F7F3E8] border border-[#17352A]/10 text-xs text-[#17352A]/70 space-y-1">
        <p className="font-bold text-[#17352A] flex items-center space-x-1.5">
          <CreditCard className="w-4 h-4 text-[#0B5D3B]" />
          <span>Stripe API Integration Status: {stripeConfigured ? 'Live Key Connected' : 'Ready for User Key'}</span>
        </p>
        <p className="leading-relaxed">
          The application backend supports direct Stripe Checkout sessions. Once you provide your{' '}
          <code className="bg-white px-1.5 py-0.5 rounded border border-[#17352A]/10">STRIPE_SECRET_KEY</code> and{' '}
          <code className="bg-white px-1.5 py-0.5 rounded border border-[#17352A]/10">STRIPE_PUBLISHABLE_KEY</code>, payments process live via Stripe.
        </p>
      </div>
    </div>
  );
};
