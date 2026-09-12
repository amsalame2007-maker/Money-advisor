import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Target,
  ShieldAlert,
  RotateCw,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { AIAdvisorAnalysis, FinancialProfile, FinancialGoal } from '../types';
import { formatCurrency } from '../utils/finance';

interface AIAdvisorViewProps {
  profile: FinancialProfile;
  goals: FinancialGoal[];
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({ profile, goals }) => {
  const currency = profile.currency || 'KWD';
  const [analysis, setAnalysis] = useState<AIAdvisorAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalysis = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/ai/advisor', {
        headers: {
          'x-user-id': 'usr_demo',
        },
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching advisor analysis:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [profile.lastUpdated]);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B5D3B] text-xs font-bold uppercase tracking-wider mb-1">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Executive Brief</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17352A] tracking-tight">
            AI Financial Advisor
          </h1>
          <p className="text-sm text-[#17352A]/70">
            Synthesizing your live salary, obligations, liquid reserves, and goal feasibility into actionable guidance.
          </p>
        </div>

        <button
          id="advisor-refresh-btn"
          onClick={fetchAnalysis}
          disabled={refreshing}
          className="px-4 py-2 rounded-full border border-[#0B5D3B]/30 bg-white text-xs font-bold text-[#0B5D3B] hover:bg-[#DCFCE7]/40 transition-all flex items-center space-x-1.5 self-start sm:self-center shadow-xs disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Re-analyzing...' : 'Refresh Briefing'}</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#17352A]/10 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#0B5D3B] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#17352A]">Evaluating cash flows & goals...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-br from-[#0B5D3B] to-[#15803D] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#DCFCE7]" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#DCFCE7]">
                  Executive Financial Summary
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                {analysis.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Algorithmic Engine'}
              </span>
            </div>

            <p className="text-base sm:text-lg text-emerald-50 leading-relaxed font-normal">
              {analysis.financialSummary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/15 text-xs">
              <div>
                <span className="text-[10px] uppercase text-emerald-200/70">Savings Rate</span>
                <p className="font-extrabold text-white text-base">{profile.savingsRate}%</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-200/70">Available/Mo</span>
                <p className="font-extrabold text-[#DCFCE7] text-base">
                  {formatCurrency(profile.availableToSave, currency, false)}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-200/70">Reserve Coverage</span>
                <p className="font-extrabold text-white text-base">
                  {profile.healthBreakdown.emergencyMonths} Mo
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-200/70">Health Index</span>
                <p className="font-extrabold text-white text-base">{profile.healthScore}/100</p>
              </div>
            </div>
          </div>

          {/* Strengths & Concerns Dual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#17352A]/10">
                <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
                <h3 className="text-base font-bold text-[#17352A]">Identified Strengths</h3>
              </div>
              <ul className="space-y-3">
                {analysis.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-[#17352A] leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-[#0B5D3B] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      ✓
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Concerns */}
            <div className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#17352A]/10">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-[#17352A]">Areas Requiring Attention</h3>
              </div>
              <ul className="space-y-3">
                {analysis.concerns.map((c, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-[#17352A] leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      !
                    </span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3 Practical Recommendations */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#17352A]/10 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#17352A]/10">
              <Lightbulb className="w-5 h-5 text-[#0B5D3B]" />
              <h3 className="text-base font-bold text-[#17352A]">
                3 Actionable Next Steps
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {analysis.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#F7F3E8] border border-[#17352A]/5 flex flex-col justify-between space-y-3 hover:border-[#0B5D3B]/30 transition-all"
                >
                  <div className="space-y-2">
                    <span className="w-6 h-6 rounded-full bg-[#0B5D3B] text-white flex items-center justify-center text-xs font-extrabold shadow-2xs">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-[#17352A] leading-relaxed font-medium">
                      {rec}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#0B5D3B]">
                    High Impact
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Goal-Specific Advice */}
          <div className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#17352A]/10">
              <Target className="w-5 h-5 text-[#0B5D3B]" />
              <h3 className="text-base font-bold text-[#17352A]">Goal-Specific Evaluation</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#17352A]/85 leading-relaxed">
              {analysis.goalSpecificAdvice}
            </p>
          </div>

          {/* Clear Educational Disclaimer Required by Prompt */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-start space-x-3 text-xs text-slate-700">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Educational Disclaimer:</strong> {analysis.disclaimer} Always consult a licensed professional for legal, tax, or formal investment decisions.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
