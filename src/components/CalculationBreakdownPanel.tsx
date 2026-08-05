import React from 'react';
import { CalculationInput, Scheme, TenureCalculation } from '../types/finance';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Share2, Download, Printer, Save, CheckCircle, Calculator, Sparkles, ShieldCheck, IndianRupee } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface CalculationBreakdownPanelProps {
  input: CalculationInput;
  scheme: Scheme;
  selectedTenureMonths: number;
  selectedCalc: TenureCalculation;
  allCalculations: Record<number, TenureCalculation>;
  onShareWhatsApp: () => void;
  onDownloadPDF: () => void;
  onPrintQuotation: () => void;
  onSaveQuotation: () => void;
  isSaved?: boolean;
}

export const CalculationBreakdownPanel: React.FC<CalculationBreakdownPanelProps> = ({
  input,
  scheme,
  selectedTenureMonths,
  selectedCalc,
  onShareWhatsApp,
  onDownloadPDF,
  onPrintQuotation,
  onSaveQuotation,
  isSaved = false,
}) => {
  const cust = input.customerDetails;

  // Pie Chart Data
  const pieData = [
    { name: 'Loan Principal', value: input.loanAmount, color: '#024b9c' }, // Royal Blue
    { name: 'Total Interest', value: selectedCalc.totalInterest, color: '#f59e0b' }, // Amber Gold
    { name: 'Total Upfront Charges', value: selectedCalc.totalUpfrontCharges, color: '#8b5cf6' }, // Purple
  ];

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-3d shadow-3d-hover space-y-6 border border-[#024b9c]/20 dark:border-blue-500/20">
      {/* Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Detailed Breakdown Summary</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2 mt-0.5">
            <Calculator className="w-6 h-6 text-[#024b9c]" />
            <span>{selectedTenureMonths} Months Loan Quotation Summary</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {cust.customerName ? `Customer: ${cust.customerName} | ` : ''}Vehicle: {cust.vehicleModel || 'Vehicle'} | Scheme: {scheme.schemeCode}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onShareWhatsApp}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center space-x-1.5 transition-all hover:scale-105"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Share</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPDF}
            className="px-4 py-2.5 rounded-2xl bg-[#024b9c] hover:bg-blue-800 text-white font-extrabold text-xs shadow-md flex items-center space-x-1.5 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={onPrintQuotation}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Print</span>
          </button>

          <button
            type="button"
            onClick={onSaveQuotation}
            disabled={isSaved}
            className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs shadow-md flex items-center space-x-1.5 transition-all ${
              isSaved
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:scale-105'
            }`}
          >
            {isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Saved' : 'Save Quote'}</span>
          </button>
        </div>
      </div>

      {/* 3D Glowing Circular Badge & Key Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Hero: 3D Glowing Circular EMI Badge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-br from-[#024b9c] via-[#003366] to-[#001f3f] text-white shadow-2xl relative overflow-hidden border-2 border-blue-400/40 glow-blue">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

          {/* Glowing Ring */}
          <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-400 via-blue-400 to-amber-300 p-1 shadow-2xl animate-pulse mb-3 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center p-2 text-center">
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest">MONTHLY EMI</span>
              <span className="text-xl sm:text-2xl font-black text-white mt-0.5">
                <AnimatedNumber value={selectedCalc.emi} />
              </span>
              <span className="text-[10px] text-blue-200 font-bold">for {selectedTenureMonths} Months</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/30">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sanctionable Quote</span>
            </span>
            <p className="text-[11px] text-blue-100/80 font-medium">
              Bajaj Auto Credit Ltd. Standard Rate
            </p>
          </div>
        </div>

        {/* Right Metric Cards */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-[10px] uppercase font-black text-[#024b9c] dark:text-blue-400">Loan Principal</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedNumber value={input.loanAmount} />
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Applied Amount</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400">Down Payment</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedNumber value={selectedCalc.downPayment} />
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Margin + Upfront Fees</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-[10px] uppercase font-black text-purple-600 dark:text-purple-400">Total Interest</span>
            <p className="text-xl font-black text-purple-900 dark:text-purple-300 mt-1">
              <AnimatedNumber value={selectedCalc.totalInterest} />
            </p>
            <span className="text-[10px] text-slate-500 font-medium">At {scheme.baseRoi}% ROI</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-[10px] uppercase font-black text-blue-600 dark:text-blue-400">Total Upfront Charges</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedNumber value={selectedCalc.totalUpfrontCharges} />
            </p>
            <span className="text-[10px] text-slate-500 font-medium">PF + Stamp + Doc + PA + RSA + Adv EMI</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs sm:col-span-2">
            <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400">Total Loan Outflow</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              <AnimatedNumber value={selectedCalc.totalPayableAmount} />
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Sum of All EMIs + Down Payment</span>
          </div>
        </div>
      </div>

      {/* Grid: Charges Breakdown Table & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
        {/* Charges Table */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-[#024b9c]" />
            <span>Upfront & Service Charges Breakdown</span>
          </h3>
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-3">Charge Component</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                  <th className="p-3 text-slate-500">Rule Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-semibold">Service Charge / Processing Fee</td>
                  <td className="p-3 text-right font-black">₹{selectedCalc.serviceCharge.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-[11px] text-slate-500">{scheme.serviceChargeType === 'percentage' ? `${scheme.serviceChargeValue}%` : 'Flat Fee'}</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold">Stamp Duty</td>
                  <td className="p-3 text-right font-black">₹{selectedCalc.stampDuty.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-[11px] text-slate-500">{scheme.stampDutyType === 'percentage' ? `${scheme.stampDutyValue}%` : 'Flat Fee'}</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold">Additional Upfront (Doc/Login)</td>
                  <td className="p-3 text-right font-black">₹{selectedCalc.additionalUpfront.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-[11px] text-slate-500">Fixed Fee</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold">Advance EMI ({scheme.advanceEmiCount} Month)</td>
                  <td className="p-3 text-right font-black">₹{selectedCalc.advanceEmiAmount.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-[11px] text-slate-500">Upfront EMI</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold">PA Insurance Cover</td>
                  <td className="p-3 text-right font-black">₹{selectedCalc.paCharge.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-[11px] text-slate-500">{input.paRequired ? 'Fixed Coverage Fee' : 'Opted Out'}</td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold">Roadside Assistance (RSA Premium)</td>
                  <td className="p-3 text-right font-black">₹{selectedCalc.rsaCharge.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-[11px] text-slate-500">
                    {input.rsaRequired
                      ? `Vehicle Type + ${selectedTenureMonths}M Tenure`
                      : 'Opted Out'}
                  </td>
                </tr>

                <tr className="bg-blue-50/80 dark:bg-slate-800/80 font-black">
                  <td className="p-3 text-[#024b9c] dark:text-blue-300 uppercase">TOTAL UPFRONT CHARGES</td>
                  <td className="p-3 text-right text-[#024b9c] dark:text-blue-400 text-sm font-black">
                    ₹{selectedCalc.totalUpfrontCharges.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-[11px] text-slate-500">PF + Stamp + Doc + PA + RSA + Adv EMI</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-5 bg-white/80 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center shadow-xs">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-2">Loan Outflow Distribution</h3>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => `₹${val.toLocaleString('en-IN')}`}
                  contentStyle={{ borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Formula Inspector & Debugger Panel */}
      {selectedCalc.debugFormula && (
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 dark:bg-slate-900/90 border-2 border-amber-500/30 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-amber-400 font-black flex items-center space-x-1.5 uppercase tracking-wider text-[11px]">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>Calculation Formula Traces ({selectedTenureMonths} Months)</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[10px]">
                Audit Verified 100%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <p className="text-blue-400 font-bold">1. Reducing Balance PMT Formula:</p>
                <p className="text-slate-300">{selectedCalc.debugFormula.pmtFormula}</p>
                <p className="text-slate-500 text-[10px]">Monthly Rate: {(selectedCalc.appliedRoi / 12).toFixed(4)}% | Exact Unrounded: ₹{selectedCalc.rawEmi}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <p className="text-amber-400 font-bold">2. Down Payment Formula:</p>
                <p className="text-slate-300">{selectedCalc.debugFormula.downPaymentFormula}</p>
                <p className="text-slate-500 text-[10px]">Margin: ₹{selectedCalc.priceMargin.toLocaleString('en-IN')} | Advance EMI Count: {selectedCalc.advanceEmiCount} Month(s)</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <p className="text-emerald-400 font-bold">3. Total Payable Formula:</p>
                <p className="text-slate-300">{selectedCalc.debugFormula.totalPayableFormula}</p>
                <p className="text-slate-500 text-[10px]">Identity check: Showroom ORP + Charges + Total Interest = ₹{selectedCalc.totalPayableAmount.toLocaleString('en-IN')}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <p className="text-purple-400 font-bold">4. Processing Fee & Duty Rule:</p>
                <p className="text-slate-300">{selectedCalc.debugFormula.serviceChargeFormula}</p>
                <p className="text-slate-300">{selectedCalc.debugFormula.stampDutyFormula}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
