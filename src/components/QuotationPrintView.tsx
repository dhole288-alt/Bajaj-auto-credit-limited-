import React from 'react';
import { QuotationRecord } from '../types/finance';
import { BajajLogo } from './BajajLogo';

interface QuotationPrintViewProps {
  record: QuotationRecord;
}

export const QuotationPrintView: React.FC<QuotationPrintViewProps> = ({ record }) => {
  const { input, scheme, tenureCalculations, selectedTenureMonths, quoteNumber, createdAt } = record;
  const cust = input.customerDetails;
  const selectedCalc = tenureCalculations[selectedTenureMonths];

  const allTenures = [12, 18, 24, 30, 36, 42];

  return (
    <div className="hidden print:block font-sans text-black p-8 bg-white max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <BajajLogo size="lg" />
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-[#024b9c]">VEHICLE FINANCE QUOTATION</h1>
            <p className="text-xs text-slate-600 font-semibold">Official Auto Loan Scheme & EMI Quotation Sheet</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="font-bold">Quote #: {quoteNumber}</p>
          <p className="text-slate-500">Date: {new Date(createdAt).toLocaleDateString('en-IN')}</p>
        </div>
      </div>

      {/* Customer & Dealer Details Grid */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-300 bg-slate-50 text-xs">
        <div className="space-y-1">
          <p><strong>Customer Name:</strong> {cust.customerName || 'N/A'}</p>
          <p><strong>Mobile Number:</strong> {cust.mobileNumber || 'N/A'}</p>
          <p><strong>Vehicle Model:</strong> {cust.vehicleModel || 'N/A'}</p>
        </div>
        <div className="space-y-1">
          <p><strong>Dealer Name:</strong> {cust.dealerName || 'N/A'}</p>
          <p><strong>Scheme Code:</strong> {scheme.schemeCode} ({scheme.schemeName})</p>
          <p><strong>Financier:</strong> {cust.financeCompany || 'Partner Financier'}</p>
        </div>
      </div>

      {/* Selected Option Box */}
      <div className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50/50 space-y-2">
        <h2 className="text-sm font-black text-blue-900 uppercase tracking-wide">
          SELECTED LOAN PLAN: {selectedTenureMonths} MONTHS
        </h2>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Monthly EMI</span>
            <span className="text-base font-black text-blue-900">₹{selectedCalc.emi.toLocaleString('en-IN')}/mo</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Down Payment</span>
            <span className="text-base font-black text-slate-900">₹{selectedCalc.downPayment.toLocaleString('en-IN')}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Loan Amount</span>
            <span className="text-sm font-bold text-slate-800">₹{input.loanAmount.toLocaleString('en-IN')}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase">ROI Rate</span>
            <span className="text-sm font-bold text-slate-800">{scheme.baseRoi}% p.a.</span>
          </div>
        </div>
      </div>

      {/* Charges Breakdown Table */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Upfront Charges Breakdown</h3>
        <table className="w-full text-left text-xs border border-slate-300">
          <thead className="bg-slate-200 font-bold border-b border-slate-300">
            <tr>
              <th className="p-2">Charge Head</th>
              <th className="p-2 text-right">Amount (₹)</th>
              <th className="p-2">Calculation Basis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="p-2 font-medium">Service Charge / Processing Fee</td>
              <td className="p-2 text-right font-bold">₹{selectedCalc.serviceCharge.toLocaleString('en-IN')}</td>
              <td className="p-2 text-[10px] text-slate-600">{scheme.serviceChargeType === 'percentage' ? `${scheme.serviceChargeValue}%` : 'Flat'}</td>
            </tr>
            <tr>
              <td className="p-2 font-medium">Stamp Duty</td>
              <td className="p-2 text-right font-bold">₹{selectedCalc.stampDuty.toLocaleString('en-IN')}</td>
              <td className="p-2 text-[10px] text-slate-600">{scheme.stampDutyType === 'percentage' ? `${scheme.stampDutyValue}%` : 'Flat'}</td>
            </tr>
            <tr>
              <td className="p-2 font-medium">Additional Upfront Fee (Doc/Login)</td>
              <td className="p-2 text-right font-bold">₹{selectedCalc.additionalUpfront.toLocaleString('en-IN')}</td>
              <td className="p-2 text-[10px] text-slate-600">Fixed Fee</td>
            </tr>
            <tr>
              <td className="p-2 font-medium">Advance EMI ({scheme.advanceEmiCount} Month)</td>
              <td className="p-2 text-right font-bold">₹{selectedCalc.advanceEmiAmount.toLocaleString('en-IN')}</td>
              <td className="p-2 text-[10px] text-slate-600">Upfront EMI</td>
            </tr>
            <tr>
              <td className="p-2 font-medium">PA Cover</td>
              <td className="p-2 text-right font-bold">₹{selectedCalc.paCharge.toLocaleString('en-IN')}</td>
              <td className="p-2 text-[10px] text-slate-600">{input.paRequired ? 'Included' : 'Opted Out'}</td>
            </tr>
            <tr>
              <td className="p-2 font-medium">RSA Roadside Support</td>
              <td className="p-2 text-right font-bold">₹{selectedCalc.rsaCharge.toLocaleString('en-IN')}</td>
              <td className="p-2 text-[10px] text-slate-600">{input.rsaRequired ? 'Included' : 'Opted Out'}</td>
            </tr>
            <tr className="bg-slate-100 font-bold">
              <td className="p-2">TOTAL UPFRONT CHARGES</td>
              <td className="p-2 text-right font-extrabold text-sm">₹{selectedCalc.totalCharges.toLocaleString('en-IN')}</td>
              <td className="p-2 text-[10px]">Included in Down Payment</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tenure Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2">All Tenure Options Summary</h3>
        <table className="w-full text-left text-xs border border-slate-300">
          <thead className="bg-slate-200 font-bold border-b border-slate-300">
            <tr>
              <th className="p-2">Tenure</th>
              <th className="p-2 text-right">Monthly EMI</th>
              <th className="p-2 text-right">Down Payment</th>
              <th className="p-2 text-right">Total Interest</th>
              <th className="p-2 text-right">Total Payable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {allTenures.map((t) => {
              const calc = tenureCalculations[t];
              const isSel = t === selectedTenureMonths;
              return (
                <tr key={t} className={isSel ? 'bg-blue-50 font-bold' : ''}>
                  <td className="p-2">{t} Months {isSel && '(Selected)'}</td>
                  <td className="p-2 text-right font-bold">₹{calc.emi.toLocaleString('en-IN')}</td>
                  <td className="p-2 text-right">₹{calc.downPayment.toLocaleString('en-IN')}</td>
                  <td className="p-2 text-right">₹{calc.totalInterest.toLocaleString('en-IN')}</td>
                  <td className="p-2 text-right">₹{calc.totalPayableAmount.toLocaleString('en-IN')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Signature & Disclaimer Footer */}
      <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
        <div>
          <p className="font-bold mb-8">Customer Signature:</p>
          <div className="border-b border-slate-400 w-48"></div>
        </div>
        <div className="text-right">
          <p className="font-bold mb-8">Authorized Dealer / Financier Stamp:</p>
          <div className="border-b border-slate-400 w-48 ml-auto"></div>
        </div>
      </div>
    </div>
  );
};
