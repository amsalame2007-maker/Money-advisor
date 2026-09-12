import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Coins,
  ArrowRightLeft,
  CheckCircle2,
  TrendingUp,
  Globe2,
  RefreshCw,
} from 'lucide-react';
import { CurrencyCode } from '../types';
import { formatCurrency } from '../utils/finance';

interface CurrencyConverterViewProps {
  currentProfileCurrency: CurrencyCode;
  onUpdateProfileCurrency: (newCurrency: CurrencyCode) => Promise<void>;
}

export const FX_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  KWD: 3.25, // 1 KWD = ~3.25 USD
  EUR: 1.08,
  GBP: 1.28,
  SAR: 0.27,
  AED: 0.272,
  QAR: 0.274,
  BHD: 2.65,
  OMR: 2.60,
};

export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  KWD: 'Kuwaiti Dinar (د.ك)',
  SAR: 'Saudi Riyal (ر.س)',
  AED: 'UAE Dirham (د.إ)',
  QAR: 'Qatari Riyal (ر.ق)',
  BHD: 'Bahraini Dinar (د.ب)',
  OMR: 'Omani Rial (ر.ع)',
  USD: 'US Dollar ($)',
  EUR: 'Euro (€)',
  GBP: 'British Pound (£)',
};

export const CurrencyConverterView: React.FC<CurrencyConverterViewProps> = ({
  currentProfileCurrency,
  onUpdateProfileCurrency,
}) => {
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>(currentProfileCurrency);
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('USD');
  const [amount, setAmount] = useState<string>('100');
  const [isUpdatingPrimary, setIsUpdatingPrimary] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Convert via USD bridge
  const convert = (val: number, from: CurrencyCode, to: CurrencyCode) => {
    const inUsd = val * FX_RATES_TO_USD[from];
    return inUsd / FX_RATES_TO_USD[to];
  };

  const convertedValue = convert(Number(amount) || 0, fromCurrency, toCurrency);
  const singleRate = convert(1, fromCurrency, toCurrency);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleSetPrimary = async (c: CurrencyCode) => {
    setIsUpdatingPrimary(true);
    try {
      await onUpdateProfileCurrency(c);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingPrimary(false);
    }
  };

  const supportedList: CurrencyCode[] = ['KWD', 'SAR', 'AED', 'QAR', 'BHD', 'OMR', 'USD', 'EUR', 'GBP'];

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#17352A]/10 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B5D3B] text-xs font-bold uppercase tracking-wider mb-1">
            <Coins className="w-3.5 h-3.5" />
            <span>Multi-Currency FX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17352A] tracking-tight">
            Currency Converter & Profile Settings
          </h1>
          <p className="text-sm text-[#17352A]/70">
            Convert amounts across GCC and global currencies, or switch your application’s primary accounting denomination.
          </p>
        </div>
      </div>

      {/* Main FX Calculator Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#17352A]/10 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-[#17352A] pb-3 border-b border-[#17352A]/10 flex items-center justify-between">
          <span>Real-time Financial Calculator</span>
          <span className="text-xs text-[#17352A]/50 font-normal">
            1 {fromCurrency} = {singleRate.toFixed(3)} {toCurrency}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-11 gap-4 items-center">
          {/* From Input */}
          <div className="sm:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-[#17352A]/70">From</label>
            <div className="space-y-2">
              <input
                id="fx-amount-input"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#17352A]/20 text-lg font-bold text-[#17352A] focus:outline-none focus:border-[#0B5D3B]"
                placeholder="Amount"
              />
              <select
                id="fx-from-currency-select"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 rounded-xl border border-[#17352A]/15 bg-[#F7F3E8] text-xs font-bold text-[#17352A] focus:outline-none"
              >
                {supportedList.map((c) => (
                  <option key={c} value={c}>
                    {c} - {CURRENCY_NAMES[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="sm:col-span-1 flex justify-center pt-4 sm:pt-0">
            <button
              id="fx-swap-btn"
              type="button"
              onClick={handleSwap}
              className="p-3 rounded-full bg-[#F7F3E8] hover:bg-[#DCFCE7] text-[#0B5D3B] border border-[#17352A]/10 transition-colors shadow-xs"
              title="Swap Currencies"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To Output */}
          <div className="sm:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-[#17352A]/70">Converted To</label>
            <div className="space-y-2">
              <div className="w-full px-4 py-3 rounded-2xl bg-[#DCFCE7]/40 border border-[#15803D]/20 text-lg font-extrabold text-[#0B5D3B] min-h-[50px] flex items-center">
                {formatCurrency(convertedValue, toCurrency, false)}
              </div>
              <select
                id="fx-to-currency-select"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 rounded-xl border border-[#17352A]/15 bg-[#F7F3E8] text-xs font-bold text-[#17352A] focus:outline-none"
              >
                {supportedList.map((c) => (
                  <option key={c} value={c}>
                    {c} - {CURRENCY_NAMES[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Set Primary Profile Currency Selector */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#17352A]/10 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#17352A]/10">
          <div>
            <h3 className="text-base font-bold text-[#17352A]">
              Application Primary Currency
            </h3>
            <p className="text-xs text-[#17352A]/60">
              Currently active: <span className="font-bold text-[#0B5D3B]">{currentProfileCurrency}</span>
            </p>
          </div>
          {savedSuccess && (
            <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Updated!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {supportedList.map((c) => {
            const isActive = currentProfileCurrency === c;
            return (
              <button
                key={c}
                id={`currency-choice-${c}`}
                type="button"
                disabled={isUpdatingPrimary}
                onClick={() => handleSetPrimary(c)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'border-[#0B5D3B] bg-[#DCFCE7] shadow-xs'
                    : 'border-[#17352A]/10 bg-white hover:bg-[#F7F3E8]'
                }`}
              >
                <span className="block text-xs font-bold text-[#0B5D3B]">{c}</span>
                <span className="block text-xs font-semibold text-[#17352A] mt-0.5">
                  {CURRENCY_NAMES[c]}
                </span>
                {isActive && (
                  <span className="inline-block text-[10px] text-emerald-800 font-bold mt-1">
                    ✓ Active Currency
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
