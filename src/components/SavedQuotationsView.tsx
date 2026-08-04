import React, { useState } from 'react';
import { QuotationRecord } from '../types/finance';
import { FileSpreadsheet, Download, Printer, Share2, Trash2, Search, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { exportQuotationsToExcel } from '../utils/excelParser';
import { generateQuotationPDF } from '../utils/pdfGenerator';

interface SavedQuotationsViewProps {
  savedQuotations: QuotationRecord[];
  onLoadQuotation: (record: QuotationRecord) => void;
  onDeleteQuotation: (id: string) => void;
  onShareWhatsApp: (record: QuotationRecord) => void;
  onPrintQuotation: (record: QuotationRecord) => void;
}

export const SavedQuotationsView: React.FC<SavedQuotationsViewProps> = ({
  savedQuotations,
  onLoadQuotation,
  onDeleteQuotation,
  onShareWhatsApp,
  onPrintQuotation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuotes = savedQuotations.filter((q) => {
    const term = searchTerm.toLowerCase();
    const cust = q.input.customerDetails;
    return (
      q.quoteNumber.toLowerCase().includes(term) ||
      cust.customerName.toLowerCase().includes(term) ||
      cust.mobileNumber.toLowerCase().includes(term) ||
      cust.vehicleModel.toLowerCase().includes(term) ||
      q.scheme.schemeCode.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Historical Lead Records</span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2 mt-0.5">
            <FileSpreadsheet className="w-5 h-5 text-orange-500" />
            <span>Saved Customer Quotations ({savedQuotations.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Access saved calculations, generate instant PDFs, share via WhatsApp or export to Excel
          </p>
        </div>

        {savedQuotations.length > 0 && (
          <button
            type="button"
            onClick={() => exportQuotationsToExcel(savedQuotations)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export All Quotes to Excel</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by customer name, mobile, quote #, vehicle model, or scheme code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quotations List */}
      {filteredQuotes.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Saved Quotations Found</p>
          <p className="text-xs text-slate-500">
            Calculate a loan scheme in the main calculator and click "Save Quote" to store it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuotes.map((q) => {
            const cust = q.input.customerDetails;
            const calc = q.tenureCalculations[q.selectedTenureMonths];

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400">{q.quoteNumber}</span>
                    <p className="text-[10px] text-slate-400">{new Date(q.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-[10px] font-bold">
                    {q.selectedTenureMonths} Months
                  </span>
                </div>

                {/* Customer Details */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {cust.customerName || 'Unnamed Customer'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {cust.mobileNumber} • {cust.vehicleModel || 'Vehicle'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1">
                    Scheme: {q.scheme.schemeCode} ({q.scheme.schemeName})
                  </p>
                </div>

                {/* Figures Box */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Monthly EMI</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      ₹{calc?.emi.toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Down Payment</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      ₹{calc?.downPayment.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => onShareWhatsApp(q)}
                      className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      title="Share WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => generateQuotationPDF(q)}
                      className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onPrintQuotation(q)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 transition-colors"
                      title="Print"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteQuotation(q.id)}
                      className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete Quote"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onLoadQuotation(q)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs hover:bg-slate-800 flex items-center space-x-1 transition-colors"
                  >
                    <span>Load</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
