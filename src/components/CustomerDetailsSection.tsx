import React, { useState } from 'react';
import { CustomerDetails, LoanEligibilityResult } from '../types/finance';
import { MasterDatabase, VehicleMaster, DmaManager, Dealer } from '../types/masterData';
import { User, Phone, Car, Store, Building, BadgeCheck, AlertCircle, ChevronDown, ChevronUp, Sparkles, MapPin, Hash, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BajajLogo } from './BajajLogo';

interface CustomerDetailsSectionProps {
  customerDetails: CustomerDetails;
  onChangeDetails: (details: CustomerDetails) => void;
  eligibilityResult?: LoanEligibilityResult;
  masterDb: MasterDatabase;
  onSelectVehicle?: (vehicle: VehicleMaster) => void;
}

export const CustomerDetailsSection: React.FC<CustomerDetailsSectionProps> = ({
  customerDetails,
  onChangeDetails,
  eligibilityResult,
  masterDb,
  onSelectVehicle,
}) => {
  const [showEligibilityForm, setShowEligibilityForm] = useState(false);

  // Active dealers & branches
  const activeDealers = masterDb.dealers.filter((d) => d.isActive);
  const selectedDealer = activeDealers.find((d) => d.name === customerDetails.dealerName) || activeDealers[0];
  const activeBranches = selectedDealer?.branches.filter((b) => b.isActive) || [];

  // Active vehicles
  const activeVehicles = masterDb.vehicles.filter((v) => v.isActive);

  // Active DMAs
  const activeDmas = masterDb.dmaManagers.filter((d) => d.isActive);

  const handleChange = (field: keyof CustomerDetails, value: any) => {
    onChangeDetails({
      ...customerDetails,
      [field]: value,
    });
  };

  // Dealer change handler
  const handleDealerChange = (dealerName: string) => {
    const dlr = activeDealers.find((d) => d.name === dealerName);
    const firstBranch = dlr?.branches.find((b) => b.isActive)?.name || '';
    onChangeDetails({
      ...customerDetails,
      dealerName,
      dealerBranch: firstBranch,
    });
  };

  // Vehicle change handler
  const handleVehicleSelect = (skuCode: string) => {
    const veh = activeVehicles.find((v) => v.skuCode === skuCode);
    if (veh) {
      onChangeDetails({
        ...customerDetails,
        vehicleModel: veh.vehicleModel,
        vehicleSku: veh.skuCode,
      });
      if (onSelectVehicle) {
        onSelectVehicle(veh);
      }
    }
  };

  // DMA selection handler
  const handleDmaSelect = (dmaName: string) => {
    const dma = activeDmas.find((d) => d.name === dmaName);
    if (dma) {
      onChangeDetails({
        ...customerDetails,
        dmaName: dma.name,
        dmaCode: dma.code,
        dmaContact: dma.contactNumber,
      });
    } else {
      onChangeDetails({
        ...customerDetails,
        dmaName: dmaName,
        dmaCode: '',
        dmaContact: '',
      });
    }
  };

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-3d shadow-3d-hover space-y-5 border border-[#024b9c]/20 dark:border-blue-500/20">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <span className="p-2.5 rounded-2xl bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-md glow-blue">
            <User className="w-4 h-4 text-amber-300" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Customer & Dealership Master Details</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-[#024b9c] dark:text-blue-300 font-extrabold uppercase">
                Admin Managed
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Dealer branch selection, vehicle SKU, DMA manager, and lead info
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

      <div className="space-y-4">
        {/* 1. DEALER & BRANCH SECTION (REQUIRED: Dropdown 1 Dealer, Dropdown 2 Branch) */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#024b9c] dark:text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Store className="w-3.5 h-3.5" />
              <span>1. Dealership Master Location</span>
            </span>
            <span className="text-[10px] text-slate-500 font-bold">Wasan & Sons Master</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Dropdown 1: Dealer Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <span>Dealer Name</span>
              </label>
              <select
                id="dealer-name-select"
                value={customerDetails.dealerName}
                onChange={(e) => handleDealerChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#024b9c] transition-all shadow-2xs"
              >
                {activeDealers.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 2: Branch */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-[#024b9c]" />
                <span>Branch Location</span>
              </label>
              <select
                id="dealer-branch-select"
                value={customerDetails.dealerBranch || ''}
                onChange={(e) => handleChange('dealerBranch', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#024b9c] transition-all shadow-2xs"
              >
                {activeBranches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. VEHICLE MASTER SECTION */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#024b9c] dark:text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Car className="w-3.5 h-3.5" />
              <span>2. Vehicle Master & SKU Selection</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Auto-Fills Price & Model</span>
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Select Vehicle SKU / Model
            </label>
            <select
              id="vehicle-master-select"
              value={customerDetails.vehicleSku || ''}
              onChange={(e) => handleVehicleSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-[#024b9c]/30 dark:border-blue-500/30 text-slate-900 dark:text-white text-xs font-extrabold focus:outline-none focus:border-[#024b9c] transition-all shadow-2xs"
            >
              <option value="">-- Choose Vehicle SKU --</option>
              {activeVehicles.map((v) => (
                <option key={v.id} value={v.skuCode}>
                  {v.skuCode} | {v.vehicleModel} ({v.variant}) - ₹{v.onRoadPrice.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. FINANCE COMPANY (FIXED TEXT ONLY: BAJAJ AUTO CREDIT LIMITED) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-[#024b9c] to-blue-900 text-white shadow-md border border-blue-400/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
              <BajajLogo size="sm" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-amber-300 tracking-wider block">
                Official Financier (Non-Editable)
              </span>
              <h3 className="text-sm sm:text-base font-black tracking-wide text-white">
                BAJAJ AUTO CREDIT LIMITED
              </h3>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30 items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Verified Lender</span>
          </span>
        </div>

        {/* 4. DMA MANAGER SECTION */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#024b9c] dark:text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>4. DMA Manager Details</span>
            </span>
            <span className="text-[10px] text-slate-500 font-bold">Auto-Populated</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* DMA Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                DMA Manager Name
              </label>
              <select
                id="dma-manager-select"
                value={customerDetails.dmaName || ''}
                onChange={(e) => handleDmaSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#024b9c] transition-all shadow-2xs"
              >
                <option value="">-- Select DMA --</option>
                {activeDmas.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* DMA Code (Auto filled) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Hash className="w-3 h-3 text-[#024b9c]" />
                <span>DMA Code</span>
              </label>
              <input
                id="dma-code-input"
                type="text"
                readOnly
                value={customerDetails.dmaCode || '—'}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-blue-900 dark:text-blue-300 font-mono font-extrabold text-xs"
              />
            </div>

            {/* DMA Contact Number (Auto filled) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Phone className="w-3 h-3 text-[#024b9c]" />
                <span>DMA Contact Number</span>
              </label>
              <input
                id="dma-contact-input"
                type="text"
                readOnly
                value={customerDetails.dmaContact || '—'}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-xs"
              />
            </div>
          </div>
        </div>

        {/* 5. CUSTOMER & EXECUTIVE LEAD INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          {/* Executive ID / Name */}
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
