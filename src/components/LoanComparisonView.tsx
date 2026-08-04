import React, { useState } from 'react';
import { Scheme, CalculationInput, TenureCalculation } from '../types/finance';
import { calculateTenureDetails } from '../utils/financeCalculator';
import { BarChart3, CheckCircle, ArrowRight, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LoanComparisonViewProps {
  schemes: Scheme[];
  currentScheme: Scheme;
  currentInput: CalculationInput;
  allCalculations: Record<number, TenureCalculation>;
  onSelectTenure: (tenure: number) => void;
}

export const LoanComparisonView: React.FC<LoanComparisonViewProps> = ({
  schemes,
  currentScheme,
  currentInput,
  allCalculations,
  onSelectTenure,
}) => {
  const [tenureOptionA, setTenureOptionA] = useState<number>(24);
  const [tenureOptionB, setTenureOptionB] = useState<number>(36);
  const [comparedSchemeId, setComparedSchemeId] = useState<string>(currentScheme.id);

  const tenures = [12, 18, 24, 30, 36, 42];

  const comparedScheme = schemes.find((s) => s.id === comparedSchemeId) || currentScheme;

  const calcA = calculateTenureDetails(currentInput, currentScheme, tenureOptionA);
  const calcB = calculateTenureDetails(currentInput, comparedScheme, tenureOptionB);

  // Chart data for comparison
  const chartData = [
    {
      metric: 'Monthly EMI',
      OptionA: calcA.emi,
      OptionB: calcB.emi,
    },
    {
      metric: 'Down Payment',
      OptionA: calcA.downPayment,
      OptionB: calcB.downPayment,
    },
    {
      metric: 'Total Interest',
      OptionA: calcA.totalInterest,
      OptionB: calcB.totalInterest,
    },
    {
      metric: 'Total Charges',
      OptionA: calcA.totalCharges,
      OptionB: calcB.totalCharges,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Side-by-Side Analysis</span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2 mt-0.5">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Loan & Tenure Comparison Tool</span>
            </h2>
            <p className="text-xs text-slate-500">
              Compare 2 tenure terms or scheme options side-by-side to find the optimal finance plan
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Compare Scheme:</span>
            <select
              value={comparedSchemeId}
              onChange={(e) => setComparedSchemeId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.schemeCode} ({s.schemeName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Option Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A Selector */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Option A: {currentScheme.schemeCode}
              </span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Current Active Plan</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tenure:</span>
              <select
                value={tenureOptionA}
                onChange={(e) => setTenureOptionA(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white text-xs font-extrabold"
              >
                {tenures.map((t) => (
                  <option key={t} value={t}>
                    {t} Months (EMI: ₹{allCalculations[t]?.emi.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Option B Selector */}
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Option B: {comparedScheme.schemeCode}
              </span>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Comparison Target</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tenure:</span>
              <select
                value={tenureOptionB}
                onChange={(e) => setTenureOptionB(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-slate-900 dark:text-white text-xs font-extrabold"
              >
                {tenures.map((t) => (
                  <option key={t} value={t}>
                    {t} Months
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Side by Side Comparison Matrix Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3">Financial Parameter</th>
                <th className="p-3 bg-blue-100/60 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200">
                  Option A ({tenureOptionA} Months)
                </th>
                <th className="p-3 bg-amber-100/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200">
                  Option B ({tenureOptionB} Months)
                </th>
                <th className="p-3 text-right">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-3 font-bold">Monthly EMI</td>
                <td className={`p-3 font-extrabold text-sm ${calcA.emi <= calcB.emi ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                  ₹{calcA.emi.toLocaleString('en-IN')} {calcA.emi < calcB.emi && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-1">Lower EMI</span>}
                </td>
                <td className={`p-3 font-extrabold text-sm ${calcB.emi <= calcA.emi ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                  ₹{calcB.emi.toLocaleString('en-IN')} {calcB.emi < calcA.emi && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-1">Lower EMI</span>}
                </td>
                <td className="p-3 text-right font-semibold text-slate-600 dark:text-slate-400">
                  ₹{Math.abs(calcA.emi - calcB.emi).toLocaleString('en-IN')} / mo
                </td>
              </tr>

              <tr>
                <td className="p-3 font-bold">Down Payment Required</td>
                <td className={`p-3 font-bold ${calcA.downPayment <= calcB.downPayment ? 'text-emerald-600' : ''}`}>
                  ₹{calcA.downPayment.toLocaleString('en-IN')}
                </td>
                <td className={`p-3 font-bold ${calcB.downPayment <= calcA.downPayment ? 'text-emerald-600' : ''}`}>
                  ₹{calcB.downPayment.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-right font-semibold text-slate-600 dark:text-slate-400">
                  ₹{Math.abs(calcA.downPayment - calcB.downPayment).toLocaleString('en-IN')}
                </td>
              </tr>

              <tr>
                <td className="p-3 font-bold">Total Interest Cost</td>
                <td className={`p-3 font-bold ${calcA.totalInterest <= calcB.totalInterest ? 'text-emerald-600' : 'text-orange-600'}`}>
                  ₹{calcA.totalInterest.toLocaleString('en-IN')}
                </td>
                <td className={`p-3 font-bold ${calcB.totalInterest <= calcA.totalInterest ? 'text-emerald-600' : 'text-orange-600'}`}>
                  ₹{calcB.totalInterest.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-right font-semibold text-slate-600 dark:text-slate-400">
                  ₹{Math.abs(calcA.totalInterest - calcB.totalInterest).toLocaleString('en-IN')}
                </td>
              </tr>

              <tr>
                <td className="p-3 font-bold">Upfront Charges Sum</td>
                <td className="p-3 font-medium">₹{calcA.totalCharges.toLocaleString('en-IN')}</td>
                <td className="p-3 font-medium">₹{calcB.totalCharges.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right font-semibold text-slate-600 dark:text-slate-400">
                  ₹{Math.abs(calcA.totalCharges - calcB.totalCharges).toLocaleString('en-IN')}
                </td>
              </tr>

              <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold">
                <td className="p-3 text-slate-900 dark:text-white">TOTAL OUTFLOW COST</td>
                <td className="p-3 text-blue-700 dark:text-blue-300 font-extrabold text-sm">
                  ₹{calcA.totalPayableAmount.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-amber-700 dark:text-amber-300 font-extrabold text-sm">
                  ₹{calcB.totalPayableAmount.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-right text-slate-900 dark:text-white font-black text-sm">
                  ₹{Math.abs(calcA.totalPayableAmount - calcB.totalPayableAmount).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recharts Visual Comparison Bar Chart */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Visual Comparison Chart</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val: number) => `₹${val.toLocaleString('en-IN')}`} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="OptionA" name={`Option A (${tenureOptionA}M)`} fill="#1E40AF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="OptionB" name={`Option B (${tenureOptionB}M)`} fill="#F97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
