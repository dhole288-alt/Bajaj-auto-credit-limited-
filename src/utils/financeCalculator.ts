import { Scheme, CalculationInput, TenureCalculation, LoanEligibilityResult, AmortizationMonth } from '../types/finance';

/**
 * Excel PMT Formula Replica (Reducing Balance)
 * PMT(rate, nper, pv)
 * Formula: PMT = [PV * r * (1+r)^n] / [(1+r)^n - 1]
 */
export function calculatePMT(ratePerMonth: number, nper: number, pv: number): number {
  if (!isFinite(ratePerMonth) || !isFinite(nper) || !isFinite(pv) || pv <= 0 || nper <= 0) {
    return 0;
  }
  if (ratePerMonth <= 0) return pv / nper;
  const pvif = Math.pow(1 + ratePerMonth, nper);
  if (!isFinite(pvif) || pvif === 1) return pv / nper;
  const pmt = (pv * ratePerMonth * pvif) / (pvif - 1);
  return isFinite(pmt) ? pmt : 0;
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
  if (customRoi !== undefined && isFinite(customRoi) && customRoi > 0) {
    return customRoi;
  }
  const cleanLoan = Math.max(0, isFinite(loanAmount) ? loanAmount : 0);
  
  // Check year/tenure specific ROI if tenureMonths is provided
  if (tenureMonths && isFinite(tenureMonths)) {
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
      if (cleanLoan >= slab.minAmount && cleanLoan <= slab.maxAmount) {
        return slab.roi;
      }
    }
  }
  return scheme.baseRoi || 9.5;
}

/**
 * Calculate Service Charge / Processing Fee based on Scheme rules
 */
export function calculateServiceCharge(scheme: Scheme, loanAmount: number): number {
  const cleanLoan = Math.max(0, isFinite(loanAmount) ? loanAmount : 0);
  let val = 0;
  if (scheme.serviceChargeType === 'percentage') {
    val = (cleanLoan * (scheme.serviceChargeValue || 0)) / 100;
  } else {
    val = scheme.serviceChargeValue || 0;
  }
  
  const minCharge = scheme.minServiceCharge || 0;
  const maxCharge = scheme.maxServiceCharge || 0;

  if (minCharge > 0) {
    val = Math.max(minCharge, val);
  }
  if (maxCharge > 0) {
    val = Math.min(maxCharge, val);
  }

  return Math.round(isFinite(val) ? val : 0);
}

/**
 * Calculate Stamp Duty based on Scheme rules
 */
export function calculateStampDuty(scheme: Scheme, loanAmount: number): number {
  const cleanLoan = Math.max(0, isFinite(loanAmount) ? loanAmount : 0);
  let val = 0;
  if (scheme.stampDutyType === 'percentage') {
    val = (cleanLoan * (scheme.stampDutyValue || 0)) / 100;
  } else {
    val = scheme.stampDutyValue || 0;
  }
  return Math.round(isFinite(val) ? val : 0);
}

/**
 * Calculate complete Tenure Details for a given tenure in months
 */
export function calculateTenureDetails(
  input: CalculationInput,
  scheme: Scheme,
  tenureMonths: number
): TenureCalculation {
  const showroomOrp = Math.max(0, isFinite(input.showroomOrp) ? input.showroomOrp : 0);
  const sfdcOrp = Math.max(0, isFinite(input.sfdcOrp) ? input.sfdcOrp : 0);
  const loanAmount = Math.max(0, isFinite(input.loanAmount) ? input.loanAmount : 0);
  const tenure = Math.max(1, isFinite(tenureMonths) ? tenureMonths : 12);

  const roi = getSchemeRoi(scheme, loanAmount, tenure, input.customRoi);
  const ltvPercent = sfdcOrp > 0 ? (loanAmount / sfdcOrp) * 100 : 0;

  // EMI Calculation
  let emi = 0;
  let rawEmi = 0;
  let totalInterest = 0;

  if (scheme.rateType === 'flat') {
    totalInterest = Math.round(loanAmount * (roi / 100) * (tenure / 12));
    rawEmi = (loanAmount + totalInterest) / tenure;
    emi = Math.round(rawEmi);
  } else {
    const monthlyRate = roi / 12 / 100;
    rawEmi = calculatePMT(monthlyRate, tenure, loanAmount);
    emi = Math.round(rawEmi);
    totalInterest = Math.max(0, Math.round(emi * tenure - loanAmount));
  }

  // Charges Breakdown
  const serviceCharge = calculateServiceCharge(scheme, loanAmount);
  const stampDuty = calculateStampDuty(scheme, loanAmount);
  const additionalUpfront = Math.max(0, Math.round(scheme.additionalUpfrontCharges || 0));
  
  const paCharge = input.paRequired ? Math.max(0, Math.round(input.paChargeOverride ?? scheme.paCharge ?? 0)) : 0;
  const rsaCharge = input.rsaRequired ? Math.max(0, Math.round(input.rsaChargeOverride ?? scheme.rsaCharge ?? 0)) : 0;
  
  const upfrontInterest = Math.max(0, Math.round((loanAmount * (scheme.upfrontInterestPercent || 0)) / 100));
  
  const advanceEmiCount = Math.max(0, Math.round(scheme.advanceEmiCount || 0));
  const advanceEmiAmount = Math.round(emi * advanceEmiCount);

  const totalCharges = serviceCharge + stampDuty + additionalUpfront + paCharge + rsaCharge + upfrontInterest;

  // Down Payment formula:
  // Down Payment = (Showroom On-Road Price - Loan Amount) + Upfront Total Charges + Advance EMIs
  const priceMargin = Math.max(0, showroomOrp - loanAmount);
  const downPayment = Math.max(0, Math.round(priceMargin + totalCharges + advanceEmiAmount));

  // Total Payable Amount = Down Payment + Remaining EMIs (tenure - advanceEmiCount)
  // Mathematically identical to: Showroom ORP + Total Upfront Charges + Total Interest
  const remainingTenure = Math.max(0, tenure - advanceEmiCount);
  const totalPayableAmount = Math.max(0, Math.round(downPayment + (emi * remainingTenure)));

  return {
    tenureMonths: tenure,
    emi,
    rawEmi: Math.round(rawEmi * 100) / 100,
    loanAmount,
    appliedRoi: roi,
    totalInterest,
    serviceCharge,
    stampDuty,
    additionalUpfront,
    paCharge,
    rsaCharge,
    upfrontInterest,
    advanceEmiCount,
    advanceEmiAmount,
    totalCharges,
    priceMargin,
    downPayment,
    totalPayableAmount,
    ltvPercent: Math.round(ltvPercent * 100) / 100,
    debugFormula: {
      pmtFormula: `PMT(${roi}% p.a. / 12, ${tenure} months, ₹${loanAmount.toLocaleString('en-IN')}) = ₹${rawEmi.toFixed(2)} → Rounded: ₹${emi.toLocaleString('en-IN')}`,
      downPaymentFormula: `Margin (₹${priceMargin.toLocaleString('en-IN')}) + Upfront Fees (₹${totalCharges.toLocaleString('en-IN')}) + Advance EMI (${advanceEmiCount}x ₹${emi.toLocaleString('en-IN')} = ₹${advanceEmiAmount.toLocaleString('en-IN')}) = ₹${downPayment.toLocaleString('en-IN')}`,
      totalPayableFormula: `Down Payment (₹${downPayment.toLocaleString('en-IN')}) + ${remainingTenure} Remaining EMIs x ₹${emi.toLocaleString('en-IN')} = ₹${totalPayableAmount.toLocaleString('en-IN')}`,
      serviceChargeFormula: scheme.serviceChargeType === 'percentage' 
        ? `${scheme.serviceChargeValue}% of ₹${loanAmount.toLocaleString('en-IN')} = ₹${((loanAmount * scheme.serviceChargeValue) / 100).toFixed(2)} (Min Cap: ₹${scheme.minServiceCharge || 0}) → ₹${serviceCharge.toLocaleString('en-IN')}`
        : `Flat Fee: ₹${serviceCharge.toLocaleString('en-IN')}`,
      stampDutyFormula: scheme.stampDutyType === 'percentage'
        ? `${scheme.stampDutyValue}% of ₹${loanAmount.toLocaleString('en-IN')} = ₹${stampDuty.toLocaleString('en-IN')}`
        : `Flat Duty: ₹${stampDuty.toLocaleString('en-IN')}`,
    },
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
  const income = Math.max(0, isFinite(monthlyIncome) ? monthlyIncome : 0);
  const existing = Math.max(0, isFinite(existingEmi) ? existingEmi : 0);

  const maxCapacity = Math.max(0, income * (foirPercent / 100) - existing);

  // Estimate maximum loan capacity over 36 months
  const monthlyRate = annualRoi / 12 / 100;
  let maxEligibleByIncome = 0;
  if (monthlyRate > 0) {
    const pvif = Math.pow(1 + monthlyRate, 36);
    maxEligibleByIncome = isFinite(pvif) && pvif > 1 ? Math.round((maxCapacity * (pvif - 1)) / (monthlyRate * pvif)) : maxCapacity * 36;
  } else {
    maxEligibleByIncome = maxCapacity * 36;
  }

  const maxEligibleByLtv = Math.round((sfdcOrp * (maxLtvPercent || 90)) / 100);
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
  let balance = Math.max(0, isFinite(loanAmount) ? loanAmount : 0);
  const tenure = Math.max(1, isFinite(tenureMonths) ? tenureMonths : 12);
  const monthlyRate = (annualRoi || 9.5) / 12 / 100;

  if (rateType === 'flat') {
    const monthlyPrincipal = balance / tenure;
    const monthlyInterest = (balance * ((annualRoi || 9.5) / 100)) / 12;

    for (let m = 1; m <= tenure; m++) {
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

  for (let m = 1; m <= tenure; m++) {
    const startBal = balance;
    const interestPaid = startBal * monthlyRate;
    let principalPaid = emi - interestPaid;

    if (m === tenure || startBal < principalPaid) {
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

