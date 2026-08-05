import React, { useState, useEffect } from 'react';
import { Scheme, CalculationInput, CustomerDetails, QuotationRecord } from './types/finance';
import { MasterDatabase, VehicleMaster } from './types/masterData';
import { DEFAULT_SCHEMES } from './data/defaultSchemes';
import { DEFAULT_MASTER_DATABASE } from './data/masterDefaults';
import {
  calculateAllTenures,
  getSchemeRoi,
  calculateLoanEligibility,
} from './utils/financeCalculator';
import { generateQuotationPDF } from './utils/pdfGenerator';

import { HeaderNavbar } from './components/HeaderNavbar';
import { WelcomeBanner } from './components/WelcomeBanner';
import { AnimatedBackground } from './components/AnimatedBackground';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import { FloatingActionButton } from './components/FloatingActionButton';
import { SchemeSelectorCard } from './components/SchemeSelectorCard';
import { PriceAndLoanInputs } from './components/PriceAndLoanInputs';
import { CustomerDetailsSection } from './components/CustomerDetailsSection';
import { EMICardGrid } from './components/EMICardGrid';
import { CalculationBreakdownPanel } from './components/CalculationBreakdownPanel';
import { LoanComparisonView } from './components/LoanComparisonView';
import { AmortizationScheduleView } from './components/AmortizationScheduleView';
import { SavedQuotationsView } from './components/SavedQuotationsView';
import { AdminPanel } from './components/AdminPanel';
import { QuotationPrintView } from './components/QuotationPrintView';
import { Footer } from './components/Footer';

export default function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('finance_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('finance_dark_mode', String(darkMode));
  }, [darkMode]);

  // Toast notifications manager
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Schemes master state
  const [schemes, setSchemes] = useState<Scheme[]>(() => {
    const local = localStorage.getItem('finance_schemes');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse saved schemes', e);
      }
    }
    return DEFAULT_SCHEMES;
  });

  useEffect(() => {
    localStorage.setItem('finance_schemes', JSON.stringify(schemes));
  }, [schemes]);

  // Master Database state (Dealers, Branches, Vehicles, DMAs)
  const [masterDb, setMasterDb] = useState<MasterDatabase>(() => {
    const local = localStorage.getItem('finance_master_db');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse saved master database', e);
      }
    }
    return DEFAULT_MASTER_DATABASE;
  });

  useEffect(() => {
    localStorage.setItem('finance_master_db', JSON.stringify(masterDb));
  }, [masterDb]);

  // Active Selected Scheme & Input State Persistence
  const savedCalcState = (() => {
    const local = localStorage.getItem('finance_calculator_state');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse saved calculator state', e);
      }
    }
    return null;
  })();

  const [selectedScheme, setSelectedScheme] = useState<Scheme>(() => {
    if (savedCalcState?.selectedSchemeCode) {
      const found = schemes.find((s) => s.schemeCode === savedCalcState.selectedSchemeCode);
      if (found) return found;
    }
    return schemes[0] || DEFAULT_SCHEMES[0];
  });

  // Inputs
  const [showroomOrp, setShowroomOrp] = useState<number>(savedCalcState?.showroomOrp ?? 152000);
  const [sfdcOrp, setSfdcOrp] = useState<number>(savedCalcState?.sfdcOrp ?? 122800);
  const [loanAmount, setLoanAmount] = useState<number>(savedCalcState?.loanAmount ?? 110000);
  const [customRoi, setCustomRoi] = useState<number | undefined>(savedCalcState?.customRoi);
  const [paRequired, setPaRequired] = useState<boolean>(savedCalcState?.paRequired ?? true);
  const [rsaRequired, setRsaRequired] = useState<boolean>(savedCalcState?.rsaRequired ?? true);

  // Customer & Dealership details
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(() => {
    if (savedCalcState?.customerDetails) {
      return {
        ...savedCalcState.customerDetails,
        financeCompany: 'BAJAJ AUTO CREDIT LIMITED',
      };
    }
    return {
      customerName: 'Rahul Sharma',
      mobileNumber: '9876543210',
      vehicleModel: 'Pulsar N160 Single ABS',
      vehicleSku: 'SKU001',
      dealerName: 'Wasan & Sons',
      dealerBranch: 'Girnare',
      financeCompany: 'BAJAJ AUTO CREDIT LIMITED',
      executiveName: 'EMP-9041',
      dmaName: 'Atul Patil',
      dmaCode: 'DMA001',
      dmaContact: '9876543210',
      monthlyIncome: 45000,
      existingEmi: 3000,
    };
  });

  const [selectedTenureMonths, setSelectedTenureMonths] = useState<number>(savedCalcState?.selectedTenureMonths ?? 36);
  const [activeTab, setActiveTab] = useState<'calculator' | 'comparison' | 'amortization' | 'quotations' | 'admin'>(
    savedCalcState?.activeTab ?? 'calculator'
  );

  // Persist calculator state automatically whenever fields change
  useEffect(() => {
    const stateToSave = {
      selectedSchemeCode: selectedScheme.schemeCode,
      showroomOrp,
      sfdcOrp,
      loanAmount,
      customRoi,
      paRequired,
      rsaRequired,
      customerDetails,
      selectedTenureMonths,
      activeTab,
    };
    localStorage.setItem('finance_calculator_state', JSON.stringify(stateToSave));
  }, [
    selectedScheme,
    showroomOrp,
    sfdcOrp,
    loanAmount,
    customRoi,
    paRequired,
    rsaRequired,
    customerDetails,
    selectedTenureMonths,
    activeTab,
  ]);

  // Handle vehicle SKU auto-selection
  const handleSelectVehicleMaster = (vehicle: VehicleMaster) => {
    setShowroomOrp(vehicle.onRoadPrice);
    setSfdcOrp(vehicle.exShowroomPrice);
    const calculatedMaxLoan = Math.round((vehicle.exShowroomPrice * selectedScheme.maxLtvPercent) / 100);
    setLoanAmount(calculatedMaxLoan);
    addToast('Vehicle Master Auto-Fill', `Loaded ${vehicle.vehicleModel} (${vehicle.skuCode}) On-Road ₹${vehicle.onRoadPrice.toLocaleString('en-IN')}`, 'info');
  };

  // Saved Quotations history
  const [savedQuotations, setSavedQuotations] = useState<QuotationRecord[]>(() => {
    const local = localStorage.getItem('finance_quotations');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse saved quotations', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('finance_quotations', JSON.stringify(savedQuotations));
  }, [savedQuotations]);

  // Max LTV calculations
  const maxLtvAmount = Math.round((sfdcOrp * selectedScheme.maxLtvPercent) / 100);
  const calculatedRoi = getSchemeRoi(selectedScheme, loanAmount, customRoi);

  // Input bundle
  const currentInput: CalculationInput = {
    selectedSchemeCode: selectedScheme.schemeCode,
    showroomOrp,
    sfdcOrp,
    loanAmount,
    customRoi,
    paRequired,
    rsaRequired,
    customerDetails,
  };

  // Calculations for all 6 tenures
  const tenureCalculations = calculateAllTenures(currentInput, selectedScheme);
  const selectedCalc = tenureCalculations[selectedTenureMonths];

  // Eligibility check
  const eligibilityResult = calculateLoanEligibility(
    customerDetails.monthlyIncome || 0,
    customerDetails.existingEmi || 0,
    loanAmount,
    sfdcOrp,
    selectedScheme.maxLtvPercent,
    calculatedRoi
  );

  // Active Quote Record
  const activeQuoteRecord: QuotationRecord = {
    id: `quote-${Date.now()}`,
    quoteNumber: `QT-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    input: currentInput,
    scheme: selectedScheme,
    tenureCalculations,
    selectedTenureMonths,
    eligibility: eligibilityResult,
  };

  // WhatsApp Share Handler
  const handleShareWhatsApp = (tenureOverride?: number) => {
    const tenure = tenureOverride || selectedTenureMonths;
    const calc = tenureCalculations[tenure];
    if (!calc) return;

    const cust = customerDetails;
    const cleanMobile = cust.mobileNumber ? cust.mobileNumber.replace(/\D/g, '') : '';

    const text = `*BAJAJ AUTO CREDIT VEHICLE FINANCE QUOTATION* 🏍️
-----------------------------------
*Customer:* ${cust.customerName || 'Valued Customer'}
*Mobile:* ${cust.mobileNumber || 'N/A'}
*Vehicle:* ${cust.vehicleModel || 'Vehicle'}
*Dealer:* ${cust.dealerName || 'Apex Bajaj'}
*Financier:* ${cust.financeCompany || 'Bajaj Auto Credit Ltd.'}
*Scheme Code:* ${selectedScheme.schemeCode}

*LOAN & EMI DETAILS (${tenure} MONTHS):*
• *Monthly EMI:* ₹${calc.emi.toLocaleString('en-IN')}/mo
• *Down Payment:* ₹${calc.downPayment.toLocaleString('en-IN')}
• *Loan Amount:* ₹${loanAmount.toLocaleString('en-IN')}
• *ROI Rate:* ${calculatedRoi}% p.a.
• *Total Upfront Charges:* ₹${calc.totalCharges.toLocaleString('en-IN')}
• *Total Interest:* ₹${calc.totalInterest.toLocaleString('en-IN')}
• *Total Payable:* ₹${calc.totalPayableAmount.toLocaleString('en-IN')}

*ALL TENURES SUMMARY:*
• 12M EMI: ₹${tenureCalculations[12]?.emi.toLocaleString('en-IN')}/mo
• 18M EMI: ₹${tenureCalculations[18]?.emi.toLocaleString('en-IN')}/mo
• 24M EMI: ₹${tenureCalculations[24]?.emi.toLocaleString('en-IN')}/mo
• 30M EMI: ₹${tenureCalculations[30]?.emi.toLocaleString('en-IN')}/mo
• 36M EMI: ₹${tenureCalculations[36]?.emi.toLocaleString('en-IN')}/mo
• 42M EMI: ₹${tenureCalculations[42]?.emi.toLocaleString('en-IN')}/mo

_Generated via Bajaj Auto Credit Calculator Pro_`;

    let url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (cleanMobile.length === 10) {
      url = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
    addToast('WhatsApp Share', `Quotation summary prepared for ${cust.customerName || 'Customer'}`);
  };

  // PDF Download Handler
  const handleDownloadPDF = (tenureOverride?: number) => {
    const tenure = tenureOverride || selectedTenureMonths;
    const rec: QuotationRecord = {
      ...activeQuoteRecord,
      selectedTenureMonths: tenure,
    };
    generateQuotationPDF(rec);
    addToast('PDF Downloaded', `Official PDF quote ${rec.quoteNumber} generated!`);
  };

  // Print Handler
  const handlePrintQuotation = () => {
    window.print();
  };

  // Save Quote Handler
  const handleSaveQuotation = () => {
    setSavedQuotations((prev) => [activeQuoteRecord, ...prev]);
    addToast('Quote Saved', `Quotation ${activeQuoteRecord.quoteNumber} saved to lead history!`);
  };

  const handleLoadQuotation = (record: QuotationRecord) => {
    if (record.scheme) {
      const foundScheme = schemes.find((s) => s.schemeCode === record.scheme.schemeCode) || record.scheme;
      setSelectedScheme(foundScheme);
    }
    if (record.input) {
      setShowroomOrp(record.input.showroomOrp);
      setSfdcOrp(record.input.sfdcOrp);
      setLoanAmount(record.input.loanAmount);
      setCustomRoi(record.input.customRoi);
      setPaRequired(record.input.paRequired);
      setRsaRequired(record.input.rsaRequired);
      if (record.input.customerDetails) {
        setCustomerDetails(record.input.customerDetails);
      }
    }
    if (record.selectedTenureMonths) {
      setSelectedTenureMonths(record.selectedTenureMonths);
    }
    setActiveTab('calculator');
    addToast('Quote Loaded', `Loaded quote ${record.quoteNumber} into calculator!`, 'info');
  };

  const handleDeleteQuotation = (id: string) => {
    setSavedQuotations((prev) => prev.filter((q) => q.id !== id));
    addToast('Quote Removed', 'Quotation record deleted from history.', 'warning');
  };

  const handleResetDefaultSchemes = () => {
    if (confirm('Reset all schemes to factory defaults?')) {
      setSchemes(DEFAULT_SCHEMES);
      setSelectedScheme(DEFAULT_SCHEMES[0]);
      addToast('Reset Complete', 'Scheme master restored to factory defaults.', 'info');
    }
  };

  const isCurrentQuoteSaved = savedQuotations.some((q) => q.quoteNumber === activeQuoteRecord.quoteNumber);

  return (
    <div className="relative min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans pb-24 md:pb-16 overflow-x-hidden">
      {/* Animated Floating Background Particles */}
      <AnimatedBackground />

      {/* Toast Notifications Overlay */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      {/* Header Navigation Bar */}
      <HeaderNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        savedQuotesCount={savedQuotations.length}
      />

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Welcome Hero Banner */}
        <WelcomeBanner />

        {/* Tab 1: Calculator Main Workspace */}
        {activeTab === 'calculator' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Grid: Scheme Selector, Price Inputs, Customer Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Scheme & Price Inputs */}
              <div className="lg:col-span-7 space-y-6">
                <SchemeSelectorCard
                  schemes={schemes}
                  selectedScheme={selectedScheme}
                  onSelectScheme={(s) => {
                    setSelectedScheme(s);
                    // Adjust loan amount if exceeds new scheme LTV
                    const maxLoan = Math.round((sfdcOrp * s.maxLtvPercent) / 100);
                    if (loanAmount > maxLoan) {
                      setLoanAmount(maxLoan);
                    }
                  }}
                />

                <PriceAndLoanInputs
                  scheme={selectedScheme}
                  showroomOrp={showroomOrp}
                  setShowroomOrp={setShowroomOrp}
                  sfdcOrp={sfdcOrp}
                  setSfdcOrp={setSfdcOrp}
                  loanAmount={loanAmount}
                  setLoanAmount={setLoanAmount}
                  customRoi={customRoi}
                  setCustomRoi={setCustomRoi}
                  paRequired={paRequired}
                  setPaRequired={setPaRequired}
                  rsaRequired={rsaRequired}
                  setRsaRequired={setRsaRequired}
                  calculatedRoi={calculatedRoi}
                  maxLtvAmount={maxLtvAmount}
                />
              </div>

              {/* Right Column: Customer Details */}
              <div className="lg:col-span-5 space-y-6">
                <CustomerDetailsSection
                  customerDetails={customerDetails}
                  onChangeDetails={setCustomerDetails}
                  eligibilityResult={eligibilityResult}
                  masterDb={masterDb}
                  onSelectVehicle={handleSelectVehicleMaster}
                />
              </div>
            </div>

            {/* Middle Section: EMI Tenure Cards Grid (12, 18, 24, 30, 36, 42 Months) */}
            <EMICardGrid
              tenureCalculations={tenureCalculations}
              selectedTenureMonths={selectedTenureMonths}
              onSelectTenure={setSelectedTenureMonths}
              onOpenDetails={setSelectedTenureMonths}
              onShareWhatsApp={handleShareWhatsApp}
              onDownloadPDF={handleDownloadPDF}
              onPrintQuotation={handlePrintQuotation}
            />

            {/* Bottom Section: Selected Tenure Detailed Summary Panel */}
            <CalculationBreakdownPanel
              input={currentInput}
              scheme={selectedScheme}
              selectedTenureMonths={selectedTenureMonths}
              selectedCalc={selectedCalc}
              allCalculations={tenureCalculations}
              onShareWhatsApp={() => handleShareWhatsApp()}
              onDownloadPDF={() => handleDownloadPDF()}
              onPrintQuotation={handlePrintQuotation}
              onSaveQuotation={handleSaveQuotation}
              isSaved={isCurrentQuoteSaved}
            />
          </div>
        )}

        {/* Tab 2: Loan Comparison View */}
        {activeTab === 'comparison' && (
          <div className="animate-fade-in">
            <LoanComparisonView
              schemes={schemes}
              currentScheme={selectedScheme}
              currentInput={currentInput}
              allCalculations={tenureCalculations}
              onSelectTenure={(t) => {
                setSelectedTenureMonths(t);
                setActiveTab('calculator');
              }}
            />
          </div>
        )}

        {/* Tab 3: Amortization Repayment Schedule */}
        {activeTab === 'amortization' && (
          <div className="animate-fade-in">
            <AmortizationScheduleView
              loanAmount={loanAmount}
              roi={calculatedRoi}
              tenureMonths={selectedTenureMonths}
              emi={selectedCalc.emi}
              scheme={selectedScheme}
            />
          </div>
        )}

        {/* Tab 4: Saved Quotations Lead History */}
        {activeTab === 'quotations' && (
          <div className="animate-fade-in">
            <SavedQuotationsView
              savedQuotations={savedQuotations}
              onLoadQuotation={handleLoadQuotation}
              onDeleteQuotation={handleDeleteQuotation}
              onShareWhatsApp={(q) => {
                const cust = q.input.customerDetails;
                const calc = q.tenureCalculations[q.selectedTenureMonths];
                const text = `*BAJAJ AUTO CREDIT VEHICLE FINANCE QUOTATION* (${q.quoteNumber})\nCustomer: ${cust.customerName}\nVehicle: ${cust.vehicleModel}\nEMI (${q.selectedTenureMonths}M): ₹${calc?.emi}/mo\nDown Payment: ₹${calc?.downPayment}\nFinancier: ${cust.financeCompany}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              onPrintQuotation={() => window.print()}
            />
          </div>
        )}

        {/* Tab 5: Admin Panel */}
        {activeTab === 'admin' && (
          <div className="animate-fade-in">
            <AdminPanel
              schemes={schemes}
              setSchemes={setSchemes}
              quotationRecords={savedQuotations}
              onResetDefaultSchemes={handleResetDefaultSchemes}
              masterDb={masterDb}
              setMasterDb={setMasterDb}
              onResetDefaultMasterDb={() => {
                setMasterDb(DEFAULT_MASTER_DATABASE);
                addToast('Master DB Reset', 'Restored default dealers, vehicles, and DMA managers', 'info');
              }}
            />
          </div>
        )}
      </main>

      {/* Floating 3D Action Menu Button */}
      <FloatingActionButton
        onShareWhatsApp={() => handleShareWhatsApp()}
        onDownloadPDF={() => handleDownloadPDF()}
        onSaveQuotation={handleSaveQuotation}
        isSaved={isCurrentQuoteSaved}
      />

      {/* Footer */}
      <Footer />

      {/* Hidden Print Quotation Sheet */}
      <QuotationPrintView record={activeQuoteRecord} />
    </div>
  );
}
