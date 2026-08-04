import { Scheme, CalculationInput, TenureCalculation, LoanEligibilityResult, AmortizationMonth } from '../types/finance';

/**
 * Excel PMT Formula Replica (Reducing Balance)
 * PMT(rate, nper, pv)
 */
export function calculatePMT(ratePerMonth: number, nper: number, pv: number): number {
  if (ratePerMonth === 0) return pv / nper;
  const pvif = Math.pow(1 + ratePerMonth, nper);
  const pmt = (pv * ratePerMonth * pvif) / (pvif - 1);
  return pmt;
}

/**
 * Get ROI based on Scheme Year/Tenure Specific ROI, VLOOKUP Slabs or base rate
 */
export function getSchemeRoi(
  scheme: Scheme,
  loanAmount: number,
  tenureMonths?: number,
  customRoi?: number
): number {
  if (customRoi !== undefined && customRoi > 0) {
    return customRoi;
  }
  // Check year/tenure specific ROI if tenureMonths is provided
  if (tenureMonths) {
    if (scheme.tenureRoiMap && scheme.tenureRoiMap[tenureMonths] !== undefined && scheme.tenureRoiMap[tenureMonths]! > 0) {
      return scheme.tenureRoiMap[tenureMonths]!;
    }
    const propKey = `roi${tenureMonths}M` as keyof Scheme;
    if (scheme[propKey] !== undefined && typeof scheme[propKey] === 'number' && (scheme[propKey] as number) > 0) {
      return scheme[propKey] as number;
    }
  }
  if (scheme.roiSlabs && scheme.roiSlabs.length > 0) {
    for (const slab of scheme.roiSlabs) {
      if (loanAmount >= slab.minAmount && loanAmount <= slab.maxAmount) {
        return slab.roi;
      }
    }
  }
  return scheme.baseRoi;
}

/**
 * Calculate Service Charge / Processing Fee based on Scheme rules
 */
export function calculateServiceCharge(scheme: Scheme, loanAmount: number): number {
  let val = 0;
  if (scheme.serviceChargeType === 'percentage') {
    val = (loanAmount * scheme.serviceChargeValue) / 100;
  } else {
    val = scheme.serviceChargeValue;
  }
  val = Math.max(scheme.minServiceCharge, Math.min(scheme.maxServiceCharge, val));
  return Math.round(val);
}

/**
 * Calculate Stamp Duty based on Scheme rules
 */
export function calculateStampDuty(scheme: Scheme, loanAmount: number): number {
  if (scheme.stampDutyType === 'percentage') {
    return Math.round((loanAmount * scheme.stampDutyValue) / 100);
  }
  return Math.round(scheme.stampDutyValue);
}

/**
 * Calculate complete Tenure Details for a given tenure in months
 */
export function calculateTenureDetails(
  input: CalculationInput,
  scheme: Scheme,
  tenureMonths: number
): TenureCalculation {
  const { showroomOrp, sfdcOrp, loanAmount, customRoi, paRequired, paChargeOverride, rsaRequired, rsaChargeOverride } = input;

  const roi = getSchemeRoi(scheme, loanAmount, tenureMonths, customRoi);
  const ltvPercent = sfdcOrp > 0 ? (loanAmount / sfdcOrp) * 100 : 0;

  // EMI Calculation
  let emi = 0;
  let totalInterest = 0;

  if (scheme.rateType === 'flat') {
    totalInterest = loanAmount * (roi / 100) * (tenureMonths / 12);
    emi = Math.round((loanAmount + totalInterest) / tenureMonths);
  } else {
    const monthlyRate = roi / 12 / 100;
    const rawEmi = calculatePMT(monthlyRate, tenureMonths, loanAmount);
    emi = Math.round(rawEmi);
    totalInterest = Math.round(emi * tenureMonths - loanAmount);
  }

  // Charges Breakdown
  const serviceCharge = calculateServiceCharge(scheme, loanAmount);
  const stampDuty = calculateStampDuty(scheme, loanAmount);
  const additionalUpfront = scheme.additionalUpfrontCharges || 0;
  
  const paCharge = paRequired ? (paChargeOverride ?? scheme.paCharge) : 0;
  const rsaCharge = rsaRequired ? (rsaChargeOverride ?? scheme.rsaCharge) : 0;
  
  const upfrontInterest = Math.round((loanAmount * (scheme.upfrontInterestPercent || 0)) / 100);
  
  const advanceEmiAmount = Math.round(emi * (scheme.advanceEmiCount || 0));

  const totalCharges = serviceCharge + stampDuty + additionalUpfront + paCharge + rsaCharge + upfrontInterest;

  // Down Payment formula:
  // Down Payment = (Showroom On-Road Price - Loan Amount) + Upfront Total Charges + Advance EMIs
  const priceMargin = Math.max(0, showroomOrp - loanAmount);
  const downPayment = Math.round(priceMargin + totalCharges + advanceEmiAmount);

  // Total Payable Amount = (EMI * Tenure) + Down Payment
  const totalPayableAmount = Math.round(emi * tenureMonths + downPayment);

  return {
    tenureMonths,
    emi,
    loanAmount,
    totalInterest,
    serviceCharge,
    stampDuty,
    additionalUpfront,
    paCharge,
    rsaCharge,
    upfrontInterest,
    advanceEmiAmount,
    totalCharges,
    downPayment,
    totalPayableAmount,
    ltvPercent: Math.round(ltvPercent * 100) / 100,
  };
}

/**
 * Calculate all supported tenures (12, 18, 24, 30, 36, 42)
 */
export function calculateAllTenures(
  input: CalculationInput,
  scheme: Scheme
): Record<number, TenureCalculation> {
  const tenures = [12, 18, 24, 30, 36, 42];
  const results: Record<number, TenureCalculation> = {};

  for (const t of tenures) {
    results[t] = calculateTenureDetails(input, scheme, t);
  }

  return results;
}

/**
 * Loan Eligibility Calculator (FOIR based)
 */
export function calculateLoanEligibility(
  monthlyIncome: number,
  existingEmi: number,
  requestedLoan: number,
  sfdcOrp: number,
  maxLtvPercent: number,
  annualRoi: number = 9.5,
  foirPercent: number = 55
): LoanEligibilityResult {
  const income = Math.max(0, monthlyIncome);
  const existing = Math.max(0, existingEmi);

  const maxCapacity = Math.max(0, income * (foirPercent / 100) - existing);

  // Estimate maximum loan capacity over 36 months
  const monthlyRate = annualRoi / 12 / 100;
  let maxEligibleByIncome = 0;
  if (monthlyRate > 0) {
    const pvif = Math.pow(1 + monthlyRate, 36);
    maxEligibleByIncome = Math.round((maxCapacity * (pvif - 1)) / (monthlyRate * pvif));
  } else {
    maxEligibleByIncome = maxCapacity * 36;
  }

  const maxEligibleByLtv = Math.round((sfdcOrp * maxLtvPercent) / 100);
  const finalEligible = Math.min(maxEligibleByIncome, maxEligibleByLtv);

  return {
    monthlyIncome: income,
    existingEmi: existing,
    maxMonthlyEmiCapacity: Math.round(maxCapacity),
    foirPercent,
    maxEligibleLoanByIncome: maxEligibleByIncome,
    maxEligibleLoanByLtv: maxEligibleByLtv,
    finalEligibleLoanAmount: finalEligible,
    isEligibleForRequestedLoan: finalEligible >= requestedLoan,
  };
}

/**
 * Generate Month-by-Month Amortization Schedule
 */
export function generateAmortizationSchedule(
  loanAmount: number,
  annualRoi: number,
  tenureMonths: number,
  emi: number,
  rateType: 'reducing' | 'flat' = 'reducing'
): AmortizationMonth[] {
  const schedule: AmortizationMonth[] = [];
  let balance = loanAmount;
  const monthlyRate = annualRoi / 12 / 100;

  if (rateType === 'flat') {
    const monthlyPrincipal = loanAmount / tenureMonths;
    const monthlyInterest = (loanAmount * (annualRoi / 100)) / 12;

    for (let m = 1; m <= tenureMonths; m++) {
      const startBal = balance;
      const endBal = Math.max(0, startBal - monthlyPrincipal);
      schedule.push({
        month: m,
        beginningBalance: Math.round(startBal),
        emi: Math.round(emi),
        principalPaid: Math.round(monthlyPrincipal),
        interestPaid: Math.round(monthlyInterest),
        endingBalance: Math.round(endBal),
      });
      balance = endBal;
    }
    return schedule;
  }

  for (let m = 1; m <= tenureMonths; m++) {
    const startBal = balance;
    const interestPaid = startBal * monthlyRate;
    let principalPaid = emi - interestPaid;

    if (m === tenureMonths || startBal < principalPaid) {
      principalPaid = startBal;
    }

    const endBal = Math.max(0, startBal - principalPaid);

    schedule.push({
      month: m,
      beginningBalance: Math.round(startBal),
      emi: Math.round(emi),
      principalPaid: Math.round(principalPaid),
      interestPaid: Math.round(interestPaid),
      endingBalance: Math.round(endBal),
    });

    balance = endBal;
  }

  return schedule;
}
