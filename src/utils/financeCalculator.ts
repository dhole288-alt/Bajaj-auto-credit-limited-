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
 * Calculate Road Side Assistance (RSA) Premium based on Vehicle Type/Category & Selected Tenure
 *
 * Rates Matrix (Standard Bajaj Auto Credit / Two-Wheeler RSA Slabs):
 * - Commuter / Scooter / Entry-level (<125cc):
 *     12 Months (1 Yr): ₹350
 *     18-24 Months (2 Yrs): ₹650
 *     30-36 Months (3 Yrs): ₹900
 *     42+ Months (4 Yrs): ₹1,150
 * - Sports / Executive (150cc - 250cc, Pulsar, Avenger, Dominar 250):
 *     12 Months (1 Yr): ₹450
 *     18-24 Months (2 Yrs): ₹800
 *     30-36 Months (3 Yrs): ₹1,100
 *     42+ Months (4 Yrs): ₹1,400
 * - Premium / Superbike (300cc+, KTM, Husqvarna, Dominar 400):
 *     12 Months (1 Yr): ₹600
 *     18-24 Months (2 Yrs): ₹1,100
 *     30-36 Months (3 Yrs): ₹1,500
 *     42+ Months (4 Yrs): ₹1,900
 * - Electric / EV (Chetak EV):
 *     12 Months (1 Yr): ₹500
 *     18-24 Months (2 Yrs): ₹900
 *     30-36 Months (3 Yrs): ₹1,250
 *     42+ Months (4 Yrs): ₹1,600
 * - Commercial / 3-Wheeler (RE, Maxima):
 *     12 Months (1 Yr): ₹700
 *     18-24 Months (2 Yrs): ₹1,300
 *     30-36 Months (3 Yrs): ₹1,800
 *     42+ Months (4 Yrs): ₹2,300
 */
export function calculateRsaPremium(
  vehicleType?: string,
  tenureMonths: number = 36,
  rsaOverride?: number
): number {
  if (rsaOverride !== undefined && isFinite(rsaOverride) && rsaOverride > 0) {
    return rsaOverride;
  }

  const vType = (vehicleType || '').toLowerCase();

  let category: 'commuter' | 'sports' | 'premium' | 'ev' | 'commercial' = 'sports';
  if (vType.includes('electric') || vType.includes('ev') || vType.includes('chetak')) {
    category = 'ev';
  } else if (vType.includes('superbike') || vType.includes('ktm') || vType.includes('400') || vType.includes('premium')) {
    category = 'premium';
  } else if (vType.includes('commercial') || vType.includes('3w') || vType.includes('3-wheeler') || vType.includes('re') || vType.includes('maxima')) {
    category = 'commercial';
  } else if (vType.includes('scooter') || vType.includes('100') || vType.includes('110') || vType.includes('125') || vType.includes('platina') || vType.includes('ct100')) {
    category = 'commuter';
  } else {
    category = 'sports'; // Default (Pulsar / Executive 150-250cc)
  }

  if (tenureMonths <= 12) {
    switch (category) {
      case 'commuter': return 350;
      case 'sports': return 450;
      case 'ev': return 500;
      case 'premium': return 600;
      case 'commercial': return 700;
    }
  } else if (tenureMonths <= 24) {
    switch (category) {
      case 'commuter': return 650;
      case 'sports': return 800;
      case 'ev': return 900;
      case 'premium': return 1100;
      case 'commercial': return 1300;
    }
  } else if (tenureMonths <= 36) {
    switch (category) {
      case 'commuter': return 900;
      case 'sports': return 1100;
      case 'ev': return 1250;
      case 'premium': return 1500;
      case 'commercial': return 1800;
    }
  } else {
    // 42+ Months
    switch (category) {
      case 'commuter': return 1150;
      case 'sports': return 1400;
      case 'ev': return 1600;
      case 'premium': return 1900;
      case 'commercial': return 2300;
    }
  }
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
  // 1. Processing Fee (PF) = Loan Amount * PF% (or flat)
  const serviceCharge = calculateServiceCharge(scheme, loanAmount);
  // 2. Stamp Duty = Loan Amount * Stamp Duty% (or flat)
  const stampDuty = calculateStampDuty(scheme, loanAmount);
  // 3. Documentation Charge = Fixed Amount
  const additionalUpfront = Math.max(0, Math.round(scheme.additionalUpfrontCharges || 0));
  // 4. PA Insurance = Fixed Amount
  const paCharge = input.paRequired ? Math.max(0, Math.round(input.paChargeOverride ?? scheme.paCharge ?? 350)) : 0;
  
  // 5. RSA Premium = Vehicle Type + Selected Tenure
  const vehicleType = input.vehicleCategory || input.customerDetails?.vehicleModel || 'Pulsar';
  const calculatedRsa = calculateRsaPremium(vehicleType, tenure, input.rsaChargeOverride ?? scheme.rsaCharge);
  const rsaCharge = input.rsaRequired ? calculatedRsa : 0;
  
  const upfrontInterest = Math.max(0, Math.round((loanAmount * (scheme.upfrontInterestPercent || 0)) / 100));
  
  // 6. Advance EMI = EMI * Advance EMI Count
  const advanceEmiCount = Math.max(0, Math.round(scheme.advanceEmiCount || 0));
  const advanceEmiAmount = Math.round(emi * advanceEmiCount);

  // Total Upfront Charges Formula:
  // Processing Fee + Stamp Duty + Documentation Charge + PA Insurance + RSA Premium + Advance EMI
  const totalUpfrontCharges = serviceCharge + stampDuty + additionalUpfront + paCharge + rsaCharge + advanceEmiAmount;
  const totalCharges = serviceCharge + stampDuty + additionalUpfront + paCharge + rsaCharge + upfrontInterest;

  // Down Payment formula:
  // Down Payment = (Showroom On-Road Price - Loan Amount) + Total Upfront Charges
  const priceMargin = Math.max(0, showroomOrp - loanAmount);
  const downPayment = Math.max(0, Math.round(priceMargin + totalUpfrontCharges));

  // Total Payable Amount = Down Payment + Remaining EMIs (tenure - advanceEmiCount)
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
    totalUpfrontCharges,
    priceMargin,
    downPayment,
    totalPayableAmount,
    ltvPercent: Math.round(ltvPercent * 100) / 100,
    debugFormula: {
      pmtFormula: `PMT(${roi}% p.a. / 12, ${tenure} months, ₹${loanAmount.toLocaleString('en-IN')}) = ₹${rawEmi.toFixed(2)} → Rounded: ₹${emi.toLocaleString('en-IN')}`,
      downPaymentFormula: `Margin (₹${priceMargin.toLocaleString('en-IN')}) + Total Upfront Charges (₹${totalUpfrontCharges.toLocaleString('en-IN')}) = ₹${downPayment.toLocaleString('en-IN')}`,
      totalUpfrontFormula: `PF (₹${serviceCharge}) + Stamp Duty (₹${stampDuty}) + Documentation (₹${additionalUpfront}) + PA (₹${paCharge}) + RSA (₹${rsaCharge} [Vehicle: ${vehicleType}, Tenure: ${tenure}M]) + Advance EMI (${advanceEmiCount}x ₹${emi} = ₹${advanceEmiAmount}) = ₹${totalUpfrontCharges.toLocaleString('en-IN')}`,
      totalPayableFormula: `Down Payment (₹${downPayment.toLocaleString('en-IN')}) + ${remainingTenure} Remaining EMIs x ₹${emi.toLocaleString('en-IN')} = ₹${totalPayableAmount.toLocaleString('en-IN')}`,
      serviceChargeFormula: scheme.serviceChargeType === 'percentage' 
        ? `${scheme.serviceChargeValue}% of ₹${loanAmount.toLocaleString('en-IN')} = ₹${((loanAmount * scheme.serviceChargeValue) / 100).toFixed(2)} (Cap: ₹${serviceCharge})`
        : `Flat PF: ₹${serviceCharge.toLocaleString('en-IN')}`,
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

