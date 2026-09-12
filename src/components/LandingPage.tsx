import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Shield,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Target,
  SlidersHorizontal,
  Bot,
  PieChart,
  Eye,
  Zap,
} from 'lucide-react';
import { FinancialCard3D } from './3D/FinancialCard3D';
import { FinancialProfile, User } from '../types';
import { formatCurrency } from '../utils/finance';

interface LandingPageProps {
  onGetStarted: () => void;
  onSeeHowItWorks: () => void;
  profile: FinancialProfile | null;
  user: User | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSeeHowItWorks,
  profile,
  user,
}) => {
  const currency = profile?.currency || 'KWD';
  const availableToSave = profile ? profile.availableToSave : 400;
  const income = profile ? profile.monthlyIncome : 900;
  const savings = profile ? profile.currentSavings : 2000;
  const healthScore = profile ? profile.healthScore : 88;

  return (
    <div className="relative overflow-hidden pb-20">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#DCFCE7]/60 rounded-full blur-3xl opacity-70" />
        <div className="absolute top-28 right-1/4 w-80 h-80 bg-[#15803D]/10 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 lg:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 text-center lg:text-left space-y-6"
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-[#15803D]/20 shadow-xs text-xs font-semibold text-[#0B5D3B]">
              <span className="flex h-2 w-2 rounded-full bg-[#15803D]" />
              <span>FinTech Personal Advisory Engine</span>
              <span className="text-[#17352A]/40">•</span>
              <span className="text-[#17352A]/70">Deterministic Math & AI</span>
            </div>

            {/* Main Tagline & Brand Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#17352A] tracking-tight leading-[1.12]">
                Understand your money.{' '}
                <span className="text-[#0B5D3B] block sm:inline">Plan your future.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#17352A]/80 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Your AI-powered personal financial advisor. Calculate your true savings rate,
                test what-if scenarios in real-time, and hit every life goal with mathematical certainty.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="hero-get-started-btn"
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#0B5D3B] text-white text-base font-bold shadow-lg shadow-[#0B5D3B]/25 hover:bg-[#15803D] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center space-x-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#DCFCE7]" />
              </button>

              <button
                id="hero-see-how-it-works-btn"
                onClick={onSeeHowItWorks}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white text-[#17352A] border border-[#17352A]/15 text-base font-semibold hover:border-[#0B5D3B] hover:text-[#0B5D3B] hover:bg-[#DCFCE7]/20 transition-all flex items-center justify-center space-x-2 shadow-xs"
              >
                <Eye className="w-4 h-4 text-[#0B5D3B]" />
                <span>See How It Works</span>
              </button>
            </div>

            {/* Trust & Methodology highlights */}
            <div className="pt-6 border-t border-[#17352A]/10 grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-xs text-[#17352A]/60 font-medium">Core Calculation</p>
                <p className="text-sm sm:text-base font-bold text-[#0B5D3B]">100% Code Math</p>
              </div>
              <div>
                <p className="text-xs text-[#17352A]/60 font-medium">Privacy Model</p>
                <p className="text-sm sm:text-base font-bold text-[#0B5D3B]">User Isolated</p>
              </div>
              <div>
                <p className="text-xs text-[#17352A]/60 font-medium">Advisory</p>
                <p className="text-sm sm:text-base font-bold text-[#0B5D3B]">Contextual AI</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Right Column: 3D Financial Element & Live Preview Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <FinancialCard3D
              userName={user?.name || 'Ahmad Al-Kandari'}
              currency={currency}
              savings={savings}
              healthScore={healthScore}
            />

            {/* Floating Live Metric Badge 1: Available to Save (Bottom Right) */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="hidden sm:flex absolute -bottom-5 -right-2 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-[#17352A]/10 items-center space-x-3.5 z-30"
            >
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#0B5D3B]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#17352A]/60 font-semibold">
                  Monthly Available to Save
                </p>
                <p className="text-lg font-extrabold text-[#0B5D3B]">
                  +{formatCurrency(availableToSave, currency, false)}
                </p>
              </div>
            </motion.div>

            {/* Floating Live Metric Badge 2: Goal On Track (Top Left - away from currency coin) */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="hidden sm:flex absolute -top-5 -left-2 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-[#17352A]/10 items-center space-x-3 z-30"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#17352A]">Vehicle Target: 25%</p>
                <p className="text-[10px] text-emerald-700 font-medium">Achievable on current plan</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Feature Architecture Section */}
      <section className="mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#0B5D3B] text-xs font-bold uppercase tracking-wider">
            <span>Built For Clarity</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17352A]">
            Everything you need to master your wealth
          </h2>
          <p className="text-[#17352A]/70 text-base">
            No complex jargon. Strict separation between deterministic math calculations and
            high-level AI guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs hover:shadow-md hover:border-[#15803D]/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#0B5D3B] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#17352A] mb-2">Automated Cash Flow</h3>
            <p className="text-sm text-[#17352A]/70 leading-relaxed">
              Instant calculation of net cash flow, savings rate, and emergency buffer based on pure code math.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs hover:shadow-md hover:border-[#15803D]/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0B5D3B] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#17352A] mb-2">Milestone Goals</h3>
            <p className="text-sm text-[#17352A]/70 leading-relaxed">
              Cars, homes, travel or emergency funds. Real-time feasibility analysis and timeline forecasts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs hover:shadow-md hover:border-[#15803D]/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#17352A] mb-2">What-If Simulator</h3>
            <p className="text-sm text-[#17352A]/70 leading-relaxed">
              See the immediate impact of saving 50 KWD more, cutting dining, or extending goal dates with live sliders.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs hover:shadow-md hover:border-[#15803D]/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#17352A] mb-2">Contextual AI Advisor</h3>
            <p className="text-sm text-[#17352A]/70 leading-relaxed">
              Tailored executive summaries, 3 practical recommendations, and interactive chat trained on your numbers.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Interactive Preview CTA */}
      <section className="mt-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-[#0B5D3B] text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          {/* Sheen & accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to take complete control of your financial destiny?
            </h3>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Start with the 30-day free trial. Setup takes under 60 seconds with your salary and monthly commitments.
            </p>
            <div className="pt-2">
              <button
                id="cta-open-dashboard-btn"
                onClick={onGetStarted}
                className="px-8 py-3.5 rounded-full bg-[#DCFCE7] text-[#0B5D3B] font-bold text-sm sm:text-base hover:bg-white transition-colors shadow-md"
              >
                Launch Finora Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
