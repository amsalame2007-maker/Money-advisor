import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, TrendingUp, DollarSign } from 'lucide-react';
import { CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/finance';

interface FinancialCard3DProps {
  userName?: string;
  currency?: CurrencyCode;
  savings?: number;
  healthScore?: number;
}

export const FinancialCard3D: React.FC<FinancialCard3DProps> = ({
  userName = 'Ahmad',
  currency = 'KWD',
  savings = 2000,
  healthScore = 88,
}) => {
  // Display first name only
  const displayName = userName.split(' ')[0] || userName;
  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000 py-6">
      {/* Ambient background glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-[#15803D]/20 via-[#DCFCE7]/30 to-[#0B5D3B]/20 rounded-3xl blur-2xl opacity-75 -z-10" />

      {/* Floating 3D Gold & Emerald Coins */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
          rotate: [0, 8, -6, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 min-w-[56px] h-14 px-3 rounded-full bg-gradient-to-tr from-[#EAB308] via-[#FDE047] to-[#CA8A04] shadow-xl border-2 border-white/80 flex items-center justify-center text-white z-20"
        style={{
          boxShadow: '0 10px 25px -5px rgba(234, 179, 8, 0.4), inset 0 2px 4px rgba(255,255,255,0.6)',
        }}
      >
        <span className="font-black text-xs sm:text-sm tracking-wider text-[#78350F] drop-shadow-xs select-none">
          {currency}
        </span>
      </motion.div>

      <motion.div
        animate={{
          y: [6, -10, 6],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute -bottom-3 -left-3 w-12 h-12 rounded-full bg-gradient-to-tr from-[#0B5D3B] via-[#15803D] to-[#22C55E] shadow-xl border-2 border-[#DCFCE7]/50 flex items-center justify-center text-white z-20"
        style={{
          boxShadow: '0 10px 20px -5px rgba(11, 93, 59, 0.5), inset 0 2px 4px rgba(255,255,255,0.4)',
        }}
      >
        <TrendingUp className="w-6 h-6 text-white drop-shadow" />
      </motion.div>

      {/* Main 3D Card */}
      <motion.div
        whileHover={{ rotateY: -6, rotateX: 6, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white shadow-2xl border border-white/20 bg-gradient-to-br from-[#0B5D3B] via-[#0D6D45] to-[#15803D]"
        style={{
          boxShadow: '0 25px 50px -12px rgba(11, 93, 59, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Card Glass Sheen Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />

        {/* Subtle geometric background pattern */}
        <svg
          className="absolute -right-16 -bottom-16 w-64 h-64 opacity-10 pointer-events-none"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="6" fill="none" />
          <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="4" fill="none" />
          <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="3" fill="none" />
        </svg>

        {/* Top Row: Brand & Chip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-4 h-4 text-[#DCFCE7]" />
            </div>
            <span className="font-extrabold text-lg tracking-wider">FINORA</span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#DCFCE7]/20 text-[#DCFCE7] border border-[#DCFCE7]/30">
              {currency} • Black Tier
            </span>
          </div>

          {/* Golden 3D EMV Chip */}
          <div className="w-11 h-9 rounded-lg bg-gradient-to-br from-[#FDE047] via-[#EAB308] to-[#A16207] p-1 shadow-inner border border-[#FEF08A]/80 flex flex-col justify-between">
            <div className="h-0.5 bg-black/20 w-full" />
            <div className="h-0.5 bg-black/20 w-3/4" />
            <div className="h-0.5 bg-black/20 w-full" />
          </div>
        </div>

        {/* Middle: Liquid Reserve Balance */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-emerald-100/75 mb-1 font-medium">
            Liquid Savings & Buffer
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {formatCurrency(savings, (currency || 'KWD') as CurrencyCode, false)}
            </span>
          </div>
        </div>

        {/* Bottom Row: User Name, Health Score, Expiry */}
        <div className="flex items-end justify-between pt-4 border-t border-white/10 text-xs text-emerald-100/90">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-emerald-200/60">Account Holder</p>
            <p className="font-semibold text-white tracking-wide">{displayName}</p>
          </div>

          <div className="text-center px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
            <p className="text-[9px] uppercase tracking-wider text-emerald-200/70">Health Index</p>
            <p className="font-bold text-white text-sm">
              <span className="text-[#DCFCE7]">{healthScore}</span>/100
            </p>
          </div>

          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-[#DCFCE7]" />
            <span className="text-[11px] font-medium">Verified</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
