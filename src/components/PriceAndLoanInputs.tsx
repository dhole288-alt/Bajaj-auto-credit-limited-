import React from 'react';
import { Scheme } from '../types/finance';
import { IndianRupee, Shield, Wrench, Lock, Unlock, Percent, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface PriceAndLoanInputsProps {
  scheme: Scheme;
  showroomOrp: number;
  setShowroomOrp: (val: number) => void;
  sfdcOrp: number;
  setSfdcOrp: (val: number) => void;
  loanAmount: number;
  setLoanAmount: (val: number) => void;
  customRoi: number | undefined;
  setCustomRoi: (val: number | undefined) => void;
  paRequired: boolean;
  setPaRequired: (val: boolean) => void;
  rsaRequired: boolean;
  setRsaRequired: (val: boolean) => void;
  calculatedRoi: number;
  maxLtvAmount: number;
}

export const PriceAndLoanInputs: React.FC<PriceAndLoanInputsProps> = ({
  scheme,
  showroomOrp,
  setShowroomOrp,
  sfdcOrp,
  setSfdcOrp,
  loanAmount,
  setLoanAmount,
  customRoi,
  setCustomRoi,
  paRequired,
  setPaRequired,
  rsaRequired,
  setRsaRequired,
  calculatedRoi,
  maxLtvAmount,
}) => {
  const currentLtvPercent = sfdcOrp > 0 ? (loanAmount / sfdcOrp) * 100 : 0;
  const isLtvExceeded = currentLtvPercent > scheme.maxLtvPercent + 0.01;

  const handlePercentageChipClick = (percent: number) => {
    const targetLtv = Math.min(percent, scheme.maxLtvPercent);
    const calculatedLoan = Math.round((sfdcOrp * targetLtv) / 100);
    setLoanAmount(calculatedLoan);
  };

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-3d shadow-3d-hover space-y-5 border border-[#024b9c]/20 dark:border-blue-500/20">
      <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <span className="p-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md glow-gold">
          <IndianRupee className="w-4 h-4" />
        </span>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            2. Price & Loan Inputs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Vehicle pricing & loan amount auto-calculated with LTV cap rules
          </p>
        </div>
      </div>

      {/* Showroom ORP & SFDC ORP Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Showroom ORP */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span>Showroom ORP</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">(On Road)</span>
            </span>
          </label>
          <div className="relative group">
            <span className="absolute left-3.5 top-3 text-[#024b9c] dark:text-blue-400 font-black text-base">₹</span>
            <input
              id="showroom-orp-input"
              type="number"
              value={showroomOrp || ''}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                setShowroomOrp(val);
                if (sfdcOrp === 0 || sfdcOrp === showroomOrp) {
                  setSfdcOrp(val);
                }
              }}
              placeholder="e.g. 105000"
              className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-base focus:outline-none focus:border-[#024b9c] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#024b9c]/10 shadow-inner transition-all"
            />
          </div>
        </div>

        {/* SFDC ORP */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span>SFDC System ORP</span>
              <span className="text-[10px] text-[#024b9c] dark:text-blue-400 font-bold">(LTV Base)</span>
            </span>
          </label>
          <div className="relative group">
            <span className="absolute left-3.5 top-3 text-[#024b9c] dark:text-blue-400 font-black text-base">₹</span>
            <input
              id="sfdc-orp-input"
              type="number"
              value={sfdcOrp || ''}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                setSfdcOrp(val);
              }}
              placeholder="e.g. 100000"
              className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-base focus:outline-none focus:border-[#024b9c] dark:focus:border-blue-400 focus:ring-4 focus:ring-[#024b9c]/10 shadow-inner transition-all"
            />
          </div>
        </div>
      </div>

      {/* Maximum Eligible LTV Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-[#024b9c] to-blue-900 text-white shadow-md flex items-center justify-between border border-blue-400/30">
        <div>
          <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Maximum Sanctionable Loan ({scheme.maxLtvPercent}% LTV)</span>
          </p>
          <p className="text-xl font-black text-white mt-0.5">
            <AnimatedNumber value={maxLtvAmount} />
          </p>
        </div>
        <div className="text-right bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
          <span className="text-[10px] uppercase font-extrabold text-blue-200 block">Scheme Cap</span>
          <p className="text-sm font-black text-white">{scheme.maxLtvPercent}% LTV</p>
        </div>
      </div>

      {/* Requested Loan Amount & Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Requested Loan Amount
          </label>
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-500 font-medium">Applied LTV:</span>
            <span className={`font-black px-2 py-0.5 rounded-md text-xs ${isLtvExceeded ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
              {currentLtvPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-3 text-[#024b9c] dark:text-blue-400 font-black text-lg">₹</span>
          <input
            id="loan-amount-input"
            type="number"
            value={loanAmount || ''}
            onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
            className={`w-full pl-9 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800/80 border-2 ${
              isLtvExceeded ? 'border-red-500 text-red-600 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-[#024b9c] dark:focus:border-blue-400 focus:ring-[#024b9c]/10'
            } font-black text-lg focus:outline-none focus:ring-4 shadow-inner transition-all`}
          />
        </div>

        {isLtvExceeded && (
          <p className="text-xs text-red-500 font-bold flex items-center space-x-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Requested loan exceeds max allowed scheme LTV cap of ₹{maxLtvAmount.toLocaleString('en-IN')}</span>
          </p>
        )}

        {/* LTV Visual Progress Indicator Bar */}
        <div className="space-y-1">
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isLtvExceeded ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 via-[#024b9c] to-amber-400'
              }`}
              style={{ width: `${Math.min((currentLtvPercent / (scheme.maxLtvPercent || 100)) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>Min: ₹10,000</span>
            <span>Max Cap: ₹{maxLtvAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Range Slider */}
        <input
          id="loan-amount-slider"
          type="range"
          min={10000}
          max={Math.max(sfdcOrp, 150000)}
          step={500}
          value={loanAmount}
          onChange={(e) => setLoanAmount(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#024b9c]"
        />

        {/* Quick LTV % Chips */}
        <div className="flex items-center space-x-2 pt-1 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">LTV Chips:</span>
          {[70, 80, 85, 90, 95, 100].map((pct) => {
            const isDisabled = pct > scheme.maxLtvPercent;
            return (
              <button
                key={pct}
                type="button"
                disabled={isDisabled}
                onClick={() => handlePercentageChipClick(pct)}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all shadow-2xs ${
                  isDisabled
                    ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                    : Math.abs(currentLtvPercent - pct) < 1
                    ? 'bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-xs scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {pct}%
              </button>
            );
          })}
        </div>
      </div>

      {/* ROI & Insurance Addons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* ROI Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <Percent className="w-3.5 h-3.5 text-[#024b9c]" />
              <span>Applied ROI (% p.a.)</span>
            </label>
            <button
              type="button"
              onClick={() => {
                if (customRoi !== undefined) {
                  setCustomRoi(undefined);
                } else {
                  setCustomRoi(calculatedRoi);
                }
              }}
              className="text-[11px] font-bold text-[#024b9c] dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              {customRoi !== undefined ? (
                <>
                  <Unlock className="w-3 h-3 text-amber-500" />
                  <span>Auto ROI</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-blue-500" />
                  <span>Manual ROI</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <input
              id="roi-input"
              type="number"
              step="0.01"
              value={customRoi !== undefined ? customRoi : calculatedRoi}
              onChange={(e) => setCustomRoi(Number(e.target.value))}
              disabled={customRoi === undefined}
              className={`w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm ${
                customRoi === undefined ? 'opacity-90 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed' : ''
              }`}
            />
            <span className="absolute right-3.5 top-3 text-xs font-black text-slate-400">%</span>
          </div>
        </div>

        {/* Insurance & RSA Add-ons */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Mandatory / Optional Add-ons
          </label>
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
              <input
                id="pa-checkbox"
                type="checkbox"
                checked={paRequired}
                onChange={(e) => setPaRequired(e.target.checked)}
                className="w-4 h-4 rounded-lg text-[#024b9c] focus:ring-[#024b9c] cursor-pointer"
              />
              <Shield className="w-3.5 h-3.5 text-[#024b9c]" />
              <span>PA Cover (₹{scheme.paCharge})</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
              <input
                id="rsa-checkbox"
                type="checkbox"
                checked={rsaRequired}
                onChange={(e) => setRsaRequired(e.target.checked)}
                className="w-4 h-4 rounded-lg text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <Wrench className="w-3.5 h-3.5 text-amber-500" />
              <span>RSA Support (Auto Vehicle + Tenure)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
