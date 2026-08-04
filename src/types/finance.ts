export type RateType = 'reducing' | 'flat';

export interface RoiSlab {
  minAmount: number;
  maxAmount: number;
  roi: number;
}

export interface Scheme {
  id: string;
  schemeCode: string;
  schemeName: string;
  category: string; // e.g. 'Standard', 'Low EMI', 'Zero Down Payment', 'Festive Offer'
  financeCompany: string; // e.g. 'HDFC Finance', 'TVS Credit', 'Hero Fincorp', 'Bajaj Finance', 'Chola Finance'
  minLtvPercent: number;
  maxLtvPercent: number;
  baseRoi: number; // Annual Rate of Interest in % (Default)
  roi12M?: number; // 1 Year ROI % (12 Months)
  roi18M?: number; // 1.5 Year ROI % (18 Months)
  roi24M?: number; // 2 Year ROI % (24 Months)
  roi30M?: number; // 2.5 Year ROI % (30 Months)
  roi36M?: number; // 3 Year ROI % (36 Months)
  roi42M?: number; // 3.5 Year ROI % (42 Months)
  tenureRoiMap?: Partial<Record<number, number>>; // e.g. { 12: 8.99, 18: 9.25, 24: 9.50, 30: 9.75, 36: 9.99, 42: 10.25 }
  rateType: RateType; // 'reducing' or 'flat'
  roiSlabs?: RoiSlab[];
  serviceChargeType: 'percentage' | 'flat';
  serviceChargeValue: number; // % or flat ₹
  minServiceCharge: number;
  maxServiceCharge: number;
  stampDutyType: 'percentage' | 'flat';
  stampDutyValue: number; // % or flat ₹
  additionalUpfrontCharges: number; // Doc fees, PDD, login charges
  advanceEmiCount: number; // 0, 1, 2, etc.
  upfrontInterestPercent: number; // e.g. 0% or subvention %
  paCharge: number; // Personal Accident Insurance default ₹
  rsaCharge: number; // Roadside Assistance default ₹
  supportedTenures: number[]; // e.g. [12, 18, 24, 30, 36, 42]
  description?: string;
  isActive: boolean;
}

export interface CustomerDetails {
  customerName: string;
  mobileNumber: string;
  vehicleModel: string;
  vehicleSku?: string;
  dealerName: string;
  dealerBranch?: string;
  financeCompany: string; // Fixed 'BAJAJ AUTO CREDIT LIMITED'
  executiveName?: string;
  dmaName?: string;
  dmaCode?: string;
  dmaContact?: string;
  monthlyIncome?: number;
  existingEmi?: number;
}

export interface CalculationInput {
  selectedSchemeCode: string;
  showroomOrp: number; // Showroom On Road Price
  sfdcOrp: number; // SFDC On Road Price
  maxLtvPercentOverride?: number;
  loanAmount: number;
  customRoi?: number;
  paRequired: boolean;
  paChargeOverride?: number;
  rsaRequired: boolean;
  rsaChargeOverride?: number;
  customerDetails: CustomerDetails;
}

export interface TenureCalculation {
  tenureMonths: number;
  emi: number;
  loanAmount: number;
  totalInterest: number;
  serviceCharge: number;
  stampDuty: number;
  additionalUpfront: number;
  paCharge: number;
  rsaCharge: number;
  upfrontInterest: number;
  advanceEmiAmount: number;
  totalCharges: number; // serviceCharge + stampDuty + additionalUpfront + paCharge + rsaCharge + upfrontInterest
  downPayment: number; // (Showroom ORP - Loan Amount) + totalCharges + advanceEmiAmount
  totalPayableAmount: number; // downPayment + EMI * (tenureMonths - advanceEmiCount) = Showroom ORP + totalCharges + totalInterest
  ltvPercent: number; // (Loan Amount / SFDC ORP) * 100
  appliedRoi: number; // Annual ROI % applied for this tenure
  rawEmi: number; // Unrounded exact EMI
  priceMargin: number; // Showroom ORP - Loan Amount
  advanceEmiCount: number; // Number of advance EMIs
  debugFormula?: {
    pmtFormula: string;
    downPaymentFormula: string;
    totalPayableFormula: string;
    serviceChargeFormula: string;
    stampDutyFormula: string;
  };
}

export interface LoanEligibilityResult {
  monthlyIncome: number;
  existingEmi: number;
  maxMonthlyEmiCapacity: number;
  foirPercent: number;
  maxEligibleLoanByIncome: number;
  maxEligibleLoanByLtv: number;
  finalEligibleLoanAmount: number;
  isEligibleForRequestedLoan: boolean;
}

export interface AmortizationMonth {
  month: number;
  beginningBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
}

export interface QuotationRecord {
  id: string;
  quoteNumber: string;
  createdAt: string;
  input: CalculationInput;
  scheme: Scheme;
  tenureCalculations: Record<number, TenureCalculation>;
  selectedTenureMonths: number;
  eligibility?: LoanEligibilityResult;
}
