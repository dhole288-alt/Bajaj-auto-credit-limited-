import React, { useState } from 'react';
import { CustomerDetails, LoanEligibilityResult } from '../types/finance';
import { User, Phone, Car, Store, Building, BadgeCheck, AlertCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface CustomerDetailsSectionProps {
  customerDetails: CustomerDetails;
  onChangeDetails: (details: CustomerDetails) => void;
  eligibilityResult?: LoanEligibilityResult;
}

export const CustomerDetailsSection: React.FC<CustomerDetailsSectionProps> = ({
  customerDetails,
  onChangeDetails,
  eligibilityResult,
}) => {
  const [showEligibilityForm, setShowEligibilityForm] = useState(false);

  const handleChange = (field: keyof CustomerDetails, value: any) => {
    onChangeDetails({
      ...customerDetails,
      [field]: value,
    });
  };

  const financeCompanies = [
    'Bajaj Auto Credit Ltd.',
    'Bajaj Finance',
    'TVS Credit',
    'Hero Fincorp',
    'HDFC Bank / Finance',
    'Chola Finance',
    'L&T Financial Services',
    'IDFC FIRST Bank',
    'Kotak Mahindra Prime',
    'Shriram Finance',
  ];

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-3d shadow-3d-hover space-y-4 border border-[#024b9c]/20 dark:border-blue-500/20">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-2xl bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-md glow-blue">
            <User className="w-4 h-4 text-amber-300" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              3. Customer & Dealership Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Lead information & FOIR income eligibility assessment
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowEligibilityForm(!showEligibilityForm)}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#024b9c] dark:text-blue-300 hover:bg-blue-100 text-xs font-extrabold border border-blue-200 dark:border-blue-800 transition-all shadow-2xs"
        >
          <span>{showEligibilityForm ? 'Hide FOIR' : 'FOIR Eligibility'}</span>
          {showEligibilityForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Customer Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
            <User className="w-3.5 h-3.5 text-[#024b9c]" />
            <span>Customer Name</span>
          </label>
          <input
            id="cust-name-input"
            type="text"
            value={customerDetails.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#024b9c] transition-all shadow-2xs"
          />
        </div>

        {/* Mobile Number */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
            <Phone className="w-3.5 h-3.5 text-[#024b9c]" />
            <span>Mobile Number</span>
          </label>
          <input
            id="cust-mobile-input"
            type="tel"
            maxLength={10}
            value={customerDetails.mobileNumber}
            onChange={(e) => handleChange('mobileNumber', e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#024b9c] transition-all shadow-2xs"
          />
        </div>

        {/* Vehicle Model */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-[#024b9c] flex items-center space-x-1">
            <Car className="w-3.5 h-3.5 text-[#024b9c]" />
            <span>Vehicle Model</span>
          </label>
          <input
            id="vehicle-model-input"
            type="text"
            value={customerDetails.vehicleModel}
            onChange={(e) => handleChange('vehicleModel', e.target.value)}
            placeholder="e.g. Pulsar N160 / Chetak EV"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#024b9c] transition-all shadow-2xs"
          />
        </div>

        {/* Dealer Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
            <Store className="w-3.5 h-3.5 text-[#024b9c]" />
            <span>Dealer Name</span>
          </label>
          <input
            id="dealer-name-input"
            type="text"
            value={customerDetails.dealerName}
            onChange={(e) => handleChange('dealerName', e.target.value)}
            placeholder="e.g. Apex Bajaj Showroom"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#024b9c] transition-all shadow-2xs"
          />
        </div>

        {/* Finance Company */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
            <Building className="w-3.5 h-3.5 text-[#024b9c]" />
            <span>Finance Company</span>
          </label>
          <select
            id="financier-select"
            value={customerDetails.financeCompany}
            onChange={(e) => handleChange('financeCompany', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#024b9c] transition-all shadow-2xs"
          >
            {financeCompanies.map((fc) => (
              <option key={fc} value={fc}>
                {fc}
              </option>
            ))}
          </select>
        </div>

        {/* Executive Name / ID */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
            <BadgeCheck className="w-3.5 h-3.5 text-[#024b9c]" />
            <span>Executive ID / Name</span>
          </label>
          <input
            id="executive-id-input"
            type="text"
            value={customerDetails.executiveName || ''}
            onChange={(e) => handleChange('executiveName', e.target.value)}
            placeholder="e.g. EMP-9041"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#024b9c] transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Optional FOIR Loan Eligibility Assessment Box */}
      {showEligibilityForm && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200 dark:border-blue-900/50 space-y-3 shadow-inner">
          <p className="text-xs font-black text-[#024b9c] dark:text-blue-300 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>FOIR Income Eligibility Assessment Meter</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Monthly Net Salary / Income (₹)
              </label>
              <input
                id="monthly-income-input"
                type="number"
                value={customerDetails.monthlyIncome || ''}
                onChange={(e) => handleChange('monthlyIncome', Number(e.target.value))}
                placeholder="e.g. 45000"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-black shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Existing Monthly Obligations (₹)
              </label>
              <input
                id="existing-emi-input"
                type="number"
                value={customerDetails.existingEmi || ''}
                onChange={(e) => handleChange('existingEmi', Number(e.target.value))}
                placeholder="e.g. 3000"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-black shadow-xs"
              />
            </div>
          </div>

          {eligibilityResult && (customerDetails.monthlyIncome || 0) > 0 && (
            <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-blue-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  Max Eligible Loan Limit: ₹{eligibilityResult.finalEligibleLoanAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Max Monthly EMI Capacity (55% FOIR Rule): ₹{eligibilityResult.maxMonthlyEmiCapacity.toLocaleString('en-IN')}/mo
                </p>
              </div>

              <div>
                {eligibilityResult.isEligibleForRequestedLoan ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black flex items-center space-x-1 shadow-xs">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    <span>Eligible</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-xs font-black flex items-center space-x-1 shadow-xs">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Higher Income Required</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
