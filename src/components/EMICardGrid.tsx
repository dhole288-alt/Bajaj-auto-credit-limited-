import React from 'react';
import { TenureCalculation } from '../types/finance';
import { Calendar, CheckCircle2, ArrowRight, Share2, Printer, Download, Sparkles, Award } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface EMICardGridProps {
  tenureCalculations: Record<number, TenureCalculation>;
  selectedTenureMonths: number;
  onSelectTenure: (tenure: number) => void;
  onOpenDetails: (tenure: number) => void;
  onShareWhatsApp: (tenure: number) => void;
  onDownloadPDF: (tenure: number) => void;
  onPrintQuotation: (tenure: number) => void;
}

export const EMICardGrid: React.FC<EMICardGridProps> = ({
  tenureCalculations,
  selectedTenureMonths,
  onSelectTenure,
  onOpenDetails,
  onShareWhatsApp,
  onDownloadPDF,
  onPrintQuotation,
}) => {
  const tenures = [12, 18, 24, 30, 36, 42];

  // Helper tags
  const getTenureTag = (t: number) => {
    if (t === 36) return { text: 'MOST POPULAR', color: 'bg-gradient-to-r from-[#024b9c] to-blue-700 text-white shadow-xs' };
    if (t === 42) return { text: 'LOWEST EMI', color: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs' };
    if (t === 12) return { text: 'MIN INTEREST', color: 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-xs' };
    if (t === 24) return { text: 'BALANCED CHOICE', color: 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs' };
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <span className="p-2 rounded-2xl bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-md glow-blue">
              <Calendar className="w-4 h-4 text-amber-300" />
            </span>
            <span>EMI Options Matrix (12 - 42 Months)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Real-time monthly installment options calculated using Bajaj Auto Credit scheme rules
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-[#024b9c] dark:text-blue-400">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Click any 3D card to activate quotation</span>
        </div>
      </div>

      {/* 6 Tenure Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tenures.map((t) => {
          const calc = tenureCalculations[t];
          if (!calc) return null;

          const isSelected = selectedTenureMonths === t;
          const tag = getTenureTag(t);

          return (
            <div
              key={t}
              onClick={() => onSelectTenure(t)}
              className={`relative group rounded-3xl p-5 transition-all duration-300 cursor-pointer border-2 ${
                isSelected
                  ? 'glass-card border-[#024b9c] dark:border-blue-400 shadow-2xl scale-[1.02] ring-4 ring-[#024b9c]/15 glow-blue'
                  : 'glass-card border-slate-200/80 dark:border-slate-800 hover:border-[#024b9c]/60 dark:hover:border-blue-500 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {/* Active Selection Glow Accent */}
              {isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>SELECTED QUOTE</span>
                </div>
              )}

              {/* Card Header */}
              <div className="flex items-center justify-between mb-3.5 mt-1">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-mono text-sm font-black tracking-wide shadow-xs border border-slate-700">
                    {t} Months
                  </span>
                  {tag && (
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${tag.color}`}>
                      {tag.text}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <span className="text-[#024b9c] dark:text-blue-400 flex items-center space-x-1 text-xs font-black">
                    <CheckCircle2 className="w-4 h-4 fill-[#024b9c] text-white" />
                  </span>
                )}
              </div>

              {/* Monthly EMI Hero Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#024b9c] via-[#003366] to-[#001f3f] text-white mb-4 shadow-lg border border-blue-400/30">
                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">MONTHLY EMI</p>
                <div className="flex items-baseline space-x-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    <AnimatedNumber value={calc.emi} />
                  </span>
                  <span className="text-xs text-blue-200 font-bold">/ month</span>
                </div>
              </div>

              {/* Financial Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block">Down Payment</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    ₹{calc.downPayment.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block">Total Interest</span>
                  <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                    ₹{calc.totalInterest.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block">Upfront Charges</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    ₹{calc.totalCharges.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block">Total Outflow</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{calc.totalPayableAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareWhatsApp(t);
                    }}
                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors shadow-2xs"
                    title="Share on WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadPDF(t);
                    }}
                    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#024b9c] dark:text-blue-400 hover:bg-blue-100 transition-colors shadow-2xs"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrintQuotation(t);
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors shadow-2xs"
                    title="Print Quotation"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTenure(t);
                    onOpenDetails(t);
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md flex items-center space-x-1 transition-all hover:scale-105"
                >
                  <span>Select Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
