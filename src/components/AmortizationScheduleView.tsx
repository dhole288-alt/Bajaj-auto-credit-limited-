import React, { useState } from 'react';
import { generateAmortizationSchedule } from '../utils/financeCalculator';
import { Scheme } from '../types/finance';
import { Table, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AmortizationScheduleViewProps {
  loanAmount: number;
  roi: number;
  tenureMonths: number;
  emi: number;
  scheme: Scheme;
}

export const AmortizationScheduleView: React.FC<AmortizationScheduleViewProps> = ({
  loanAmount,
  roi,
  tenureMonths,
  emi,
  scheme,
}) => {
  const [activeTenure, setActiveTenure] = useState<number>(tenureMonths);
  const [searchTerm, setSearchTerm] = useState('');

  const schedule = generateAmortizationSchedule(loanAmount, roi, activeTenure, emi, scheme.rateType);

  const totalInterestPaid = schedule.reduce((sum, item) => sum + item.interestPaid, 0);
  const totalPrincipalPaid = schedule.reduce((sum, item) => sum + item.principalPaid, 0);

  const filteredSchedule = schedule.filter((row) => row.month.toString().includes(searchTerm));

  const handleExportExcel = () => {
    const exportData = schedule.map((row) => ({
      'Month #': row.month,
      'Opening Balance (₹)': row.beginningBalance,
      'Monthly EMI (₹)': row.emi,
      'Principal Component (₹)': row.principalPaid,
      'Interest Component (₹)': row.interestPaid,
      'Closing Balance (₹)': row.endingBalance,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Amortization_${activeTenure}M`);
    XLSX.writeFile(workbook, `Loan_Amortization_Schedule_${activeTenure}M.xlsx`);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Month-by-Month Amortization</span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2 mt-0.5">
            <Table className="w-5 h-5 text-blue-600" />
            <span>Repayment Amortization Schedule</span>
          </h2>
          <p className="text-xs text-slate-500">
            Principal: ₹{loanAmount.toLocaleString('en-IN')} | Rate: {roi}% ({scheme.rateType}) | Tenure: {activeTenure} Months
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Schedule to Excel</span>
        </button>
      </div>

      {/* Tenure selector tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-slate-500 shrink-0">Select Tenure:</span>
        {[12, 18, 24, 30, 36, 42].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTenure(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTenure === t
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {t} Months
          </button>
        ))}
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
          <span className="text-[10px] font-bold text-blue-600 uppercase">Total Principal Repaid</span>
          <p className="text-lg font-black text-blue-900 dark:text-blue-200">
            ₹{totalPrincipalPaid.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40">
          <span className="text-[10px] font-bold text-orange-600 uppercase">Total Interest Repaid</span>
          <p className="text-lg font-black text-orange-900 dark:text-orange-200">
            ₹{totalInterestPaid.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Total Loan Outflow</span>
          <p className="text-lg font-black text-slate-900 dark:text-white">
            ₹{(totalPrincipalPaid + totalInterestPaid).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Amortization Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search month #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">{filteredSchedule.length} Months Total</span>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 sticky top-0 z-10">
              <tr>
                <th className="p-2.5">Month #</th>
                <th className="p-2.5 text-right">Opening Balance (₹)</th>
                <th className="p-2.5 text-right">Monthly EMI (₹)</th>
                <th className="p-2.5 text-right text-blue-600">Principal Paid (₹)</th>
                <th className="p-2.5 text-right text-orange-600">Interest Paid (₹)</th>
                <th className="p-2.5 text-right">Closing Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredSchedule.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">Month {row.month}</td>
                  <td className="p-2.5 text-right text-slate-600 dark:text-slate-300 font-medium">
                    ₹{row.beginningBalance.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                    ₹{row.emi.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2.5 text-right font-bold text-blue-600 dark:text-blue-400">
                    ₹{row.principalPaid.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2.5 text-right font-bold text-orange-600 dark:text-orange-400">
                    ₹{row.interestPaid.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2.5 text-right text-slate-600 dark:text-slate-300 font-medium">
                    ₹{row.endingBalance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
