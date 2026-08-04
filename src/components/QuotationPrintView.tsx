import React from 'react';
import { QuotationRecord } from '../types/finance';
import { getBikeImageInfo } from '../data/bikeImages';
import { BajajLogo } from './BajajLogo';

interface QuotationPrintViewProps {
  record: QuotationRecord;
}

export const QuotationPrintView: React.FC<QuotationPrintViewProps> = ({ record }) => {
  const cust = record.input.customerDetails;
  const selectedTenure = record.selectedTenureMonths;
  const currentCalc = record.tenureCalculations[selectedTenure];
  const bikeInfo = getBikeImageInfo(cust.vehicleModel || 'Pulsar 220F ABS');

  if (!currentCalc) return null;

  const tenures = [12, 18, 24, 30, 36, 42];

  return (
    <div className="hidden print:block font-serif text-slate-900 bg-white p-8 max-w-[210mm] mx-auto leading-relaxed selection:bg-none">
      {/* Container Box with Premium Border & Background Gradient */}
      <div className="relative border-4 border-[#005cb9] rounded-2xl p-6 bg-gradient-to-br from-white via-blue-50/20 to-sky-50/40 shadow-none overflow-hidden">
        
        {/* Faded Watermark Image on Right */}
        <div 
          className="absolute right-0 bottom-10 w-[350px] h-[350px] opacity-[0.06] pointer-events-none bg-contain bg-no-repeat bg-right-bottom"
          style={{ backgroundImage: `url(${bikeInfo.imageUrl})` }}
        />

        {/* 1. Official Corporate Header */}
        <div className="flex items-center justify-between border-b-2 border-[#005cb9] pb-4 mb-4">
          <div className="flex items-center space-x-4">
            <BajajLogo size="lg" />
            <div>
              <h1 className="text-2xl font-black text-[#005cb9] uppercase tracking-wider font-serif">
                BAJAJ AUTO CREDIT LIMITED
              </h1>
              <p className="text-xs font-bold text-slate-600">
                Registered Office: Akurdi, Pune - 411035 | CIN: U65923PN2021PLC200000
              </p>
              <p className="text-[11px] font-semibold text-[#005cb9]">
                Official Dealership Vehicle Finance Quotation
              </p>
            </div>
          </div>

          <div className="text-right font-serif">
            <div className="inline-block px-3 py-1 bg-[#005cb9] text-white font-bold text-xs rounded-md uppercase tracking-wider mb-1">
              Ref: {record.quoteNumber}
            </div>
            <p className="text-xs font-bold text-slate-700">
              Date: {new Date(record.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* 2. Top Vehicle Hero Banner */}
        <div className="border-2 border-[#005cb9] rounded-xl p-4 bg-gradient-to-r from-blue-900 via-[#005cb9] to-blue-900 text-white mb-5 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-amber-300/40">
              {bikeInfo.category}
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white font-serif uppercase">
              {bikeInfo.name}
            </h2>
            <p className="text-xs text-blue-100 font-medium italic">
              "{bikeInfo.tagline}"
            </p>
          </div>

          {/* Vehicle HD Image */}
          <div className="w-48 h-28 shrink-0 rounded-lg overflow-hidden border-2 border-white/30 bg-white shadow-md z-10">
            <img
              src={bikeInfo.imageUrl}
              alt={bikeInfo.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 3. Customer & Dealership Details Box */}
        <div className="border-2 border-slate-300 rounded-xl p-4 bg-white/80 mb-5">
          <h3 className="text-sm font-black text-[#005cb9] uppercase border-b border-slate-200 pb-1.5 mb-3 font-serif">
            Customer & Dealership Particulars
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">Customer Name:</span>
              <span className="font-black text-slate-900">{cust.customerName || 'N/A'}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">Dealership & Branch:</span>
              <span className="font-black text-slate-900">{cust.dealerName || 'Wasan & Sons'} {cust.dealerBranch ? `(${cust.dealerBranch})` : ''}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">Contact Number:</span>
              <span className="font-black text-slate-900">{cust.mobileNumber || 'N/A'}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">Financier:</span>
              <span className="font-black text-[#005cb9]">BAJAJ AUTO CREDIT LIMITED</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">Vehicle SKU & Model:</span>
              <span className="font-black text-[#005cb9]">{cust.vehicleSku ? `[${cust.vehicleSku}] ` : ''}{cust.vehicleModel || bikeInfo.name}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">DMA Manager & Code:</span>
              <span className="font-black text-slate-900">{cust.dmaName || 'N/A'} {cust.dmaCode ? `(${cust.dmaCode})` : ''}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">DMA Contact Number:</span>
              <span className="font-black text-slate-900">{cust.dmaContact || 'N/A'}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">Executive ID:</span>
              <span className="font-black text-slate-900">{cust.executiveName || 'EMP-9041'}</span>
            </div>
          </div>
        </div>

        {/* 4. Selected Loan & EMI Summary (Only requested fields) */}
        <div className="border-2 border-[#005cb9] rounded-xl p-4 bg-blue-50/50 mb-5">
          <h3 className="text-sm font-black text-[#005cb9] uppercase border-b border-blue-200 pb-1.5 mb-3 font-serif flex items-center justify-between">
            <span>Sanctioned Finance Summary ({selectedTenure} Months Tenure)</span>
            <span className="text-xs bg-[#005cb9] text-white px-2.5 py-0.5 rounded font-mono">
              Scheme: {record.scheme.schemeCode}
            </span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white border border-blue-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Vehicle On-Road Price</span>
              <span className="text-base font-black text-slate-900 font-serif">
                ₹{record.input.showroomOrp.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 bg-white border border-blue-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Sanctioned Loan Amount</span>
              <span className="text-base font-black text-[#005cb9] font-serif">
                ₹{currentCalc.loanAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 bg-white border border-blue-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Net Down Payment</span>
              <span className="text-base font-black text-amber-700 font-serif">
                ₹{currentCalc.downPayment.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3 bg-[#005cb9] text-white rounded-lg shadow-sm">
              <span className="text-[10px] font-bold text-amber-300 uppercase block">Monthly Installment (EMI)</span>
              <span className="text-lg font-black text-white font-serif">
                ₹{currentCalc.emi.toLocaleString('en-IN')} / mo
              </span>
            </div>
          </div>
        </div>

        {/* 5. Tenure Options Matrix Table */}
        <div className="border-2 border-slate-300 rounded-xl overflow-hidden mb-5">
          <div className="bg-slate-100 p-2.5 border-b border-slate-300">
            <h3 className="text-xs font-black text-[#005cb9] uppercase font-serif">
              Tenure Option Matrix (12 to 42 Months Comparison)
            </h3>
          </div>
          <table className="w-full text-center text-xs border-collapse font-serif">
            <thead>
              <tr className="bg-[#005cb9] text-white font-bold">
                <th className="p-2 border border-blue-800">Tenure (Months)</th>
                <th className="p-2 border border-blue-800">Loan Amount</th>
                <th className="p-2 border border-blue-800">Down Payment</th>
                <th className="p-2 border border-blue-800">Monthly EMI</th>
                <th className="p-2 border border-blue-800">Total Payable Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tenures.map((t) => {
                const calc = record.tenureCalculations[t];
                if (!calc) return null;
                const isSelected = t === selectedTenure;
                return (
                  <tr
                    key={t}
                    className={isSelected ? 'bg-amber-100/80 font-black text-[#005cb9]' : 'hover:bg-slate-50'}
                  >
                    <td className="p-2 border border-slate-300 font-black">
                      {t} Months {isSelected ? '★' : ''}
                    </td>
                    <td className="p-2 border border-slate-300">₹{calc.loanAmount.toLocaleString('en-IN')}</td>
                    <td className="p-2 border border-slate-300">₹{calc.downPayment.toLocaleString('en-IN')}</td>
                    <td className="p-2 border border-slate-300 font-bold text-[#005cb9]">
                      ₹{calc.emi.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2 border border-slate-300 font-bold">
                      ₹{calc.totalPayableAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 6. Premium Marketing Showcase Banner */}
        <div className="border border-blue-300 rounded-xl p-3 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white mb-5">
          <p className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-1 text-center">
            Explore Bajaj Auto High Performance Lineup
          </p>
          <div className="grid grid-cols-5 gap-2 text-center text-[9px] font-bold">
            <div className="p-1.5 bg-white/10 rounded border border-white/10">Pulsar NS400Z</div>
            <div className="p-1.5 bg-white/10 rounded border border-white/10">Pulsar N250</div>
            <div className="p-1.5 bg-white/10 rounded border border-white/10">Pulsar N160</div>
            <div className="p-1.5 bg-white/10 rounded border border-white/10">Pulsar 220F</div>
            <div className="p-1.5 bg-white/10 rounded border border-white/10">Pulsar RS200</div>
          </div>
        </div>

        {/* 7. Terms & Signature Footer */}
        <div className="pt-2 border-t border-slate-300 text-[10px] text-slate-600 space-y-3 font-serif">
          <p className="italic">
            * Terms & Conditions apply. Finance sanction subject to final document verification and credit approval by Bajaj Auto Credit Limited. Quotation valid for 7 days from date of issuance.
          </p>

          <div className="flex justify-between items-end pt-4">
            <div className="text-center w-40">
              <div className="border-b border-slate-400 h-8 mb-1"></div>
              <span className="font-bold block">Customer Signature</span>
            </div>

            <div className="text-center w-48">
              <div className="border-b border-slate-400 h-8 mb-1"></div>
              <span className="font-bold text-[#005cb9] block">Authorized Signatory</span>
              <span className="text-[9px] text-slate-500">Bajaj Auto Credit Limited</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
