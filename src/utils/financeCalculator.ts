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

import { RsaPremiumMasterItem } from '../types/masterData';

/**
 * Calculate Road Side Assistance (RSA) Premium based on Vehicle Type/Category & Selected Tenure
 *
 * Checks RSAPremiumMaster table if available, or falls back to standard Bajaj Auto Credit RSA matrix.
 */
export function calculateRsaPremium(
  vehicleType?: string,
  tenureMonths: number = 36,
  rsaOverride?: number,
  rsaMaster?: RsaPremiumMasterItem[]
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

  // Look up in active RSA Master table if passed
  if (rsaMaster && Array.isArray(rsaMaster) && rsaMaster.length > 0) {
    const match = rsaMaster.find(
      (item) =>
        item.isActive &&
        item.categoryCode === category &&
        tenureMonths >= item.tenureMinMonths &&
        tenureMonths <= item.tenureMaxMonths
    );
    if (match && typeof match.premiumAmount === 'number') {
      return match.premiumAmount;
    }
  }

  // Fallback default matrix
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
  let serviceCharge = calculateServiceCharge(scheme, loanAmount);
  let stampDuty = calculateStampDuty(scheme, loanAmount);
  let additionalUpfront = Math.max(0, Math.round(scheme.additionalUpfrontCharges || 0));
  let paCharge = input.paRequired ? Math.max(0, Math.round(input.paChargeOverride ?? scheme.paCharge ?? 350)) : 0;
  
  const vehicleType = input.vehicleCategory || input.customerDetails?.vehicleModel || 'Pulsar';
  const calculatedRsa = calculateRsaPremium(vehicleType, tenure, input.rsaChargeOverride ?? scheme.rsaCharge, input.rsaMaster);
  let rsaCharge = input.rsaRequired ? calculatedRsa : 0;
  let advanceEmiCount = Math.max(0, Math.round(scheme.advanceEmiCount || 0));

  let customChargesTotal = 0;
  const upfrontBreakdownList: Array<{ id: string; name: string; amount: number; code: string; isOptional?: boolean }> = [];

  // Override / calculate with Upfront Charges Master if available
  if (input.upfrontChargesMaster && Array.isArray(input.upfrontChargesMaster) && input.upfrontChargesMaster.length > 0) {
    const activeCharges = input.upfrontChargesMaster.filter((u) => u.isActive);

    // 1. Processing Fee
    const pfItem = activeCharges.find((u) => u.code === 'PF' || u.code === 'PROCESSING_FEE' || u.name.toLowerCase().includes('processing'));
    if (pfItem) {
      if (pfItem.chargeType === 'percentage') {
        const pct = pfItem.percentage ?? pfItem.defaultValue ?? 0;
        let val = (loanAmount * pct) / 100;
        if (pfItem.minCap && pfItem.minCap > 0) val = Math.max(pfItem.minCap, val);
        if (pfItem.maxCap && pfItem.maxCap > 0) val = Math.min(pfItem.maxCap, val);
        serviceCharge = Math.round(val);
      } else if (pfItem.chargeType === 'fixed') {
        serviceCharge = Math.round(pfItem.fixedAmount ?? pfItem.defaultValue ?? serviceCharge);
      } else if (pfItem.chargeType === 'formula') {
        let val = pfItem.fixedAmount ?? ((loanAmount * (pfItem.percentage ?? pfItem.defaultValue ?? 0)) / 100);
        serviceCharge = Math.round(val);
      }
    }

    // 2. Stamp Duty
    const stampItem = activeCharges.find((u) => u.code === 'STAMP_DUTY' || u.code === 'STAMP' || u.name.toLowerCase().includes('stamp'));
    if (stampItem) {
      if (stampItem.chargeType === 'percentage') {
        const pct = stampItem.percentage ?? stampItem.defaultValue ?? 0;
        let val = (loanAmount * pct) / 100;
        if (stampItem.minCap && stampItem.minCap > 0) val = Math.max(stampItem.minCap, val);
        if (stampItem.maxCap && stampItem.maxCap > 0) val = Math.min(stampItem.maxCap, val);
        stampDuty = Math.round(val);
      } else if (stampItem.chargeType === 'fixed') {
        stampDuty = Math.round(stampItem.fixedAmount ?? stampItem.defaultValue ?? stampDuty);
      }
    }

    // 3. Documentation
    const docItem = activeCharges.find((u) => u.code === 'DOCUMENTATION' || u.code === 'DOC' || u.name.toLowerCase().includes('doc'));
    if (docItem) {
      if (docItem.chargeType === 'fixed') {
        additionalUpfront = Math.round(docItem.fixedAmount ?? docItem.defaultValue ?? additionalUpfront);
      } else if (docItem.chargeType === 'percentage') {
        additionalUpfront = Math.round((loanAmount * (docItem.percentage ?? docItem.defaultValue ?? 0)) / 100);
      }
    }

    // 4. PA Insurance
    const paItem = activeCharges.find((u) => u.code === 'PA' || u.code === 'PA_INSURANCE' || u.name.toLowerCase().includes('pa insurance'));
    if (paItem && input.paRequired) {
      paCharge = Math.round(paItem.fixedAmount ?? paItem.defaultValue ?? paCharge);
    }

    // 5. RSA Premium
    const rsaItem = activeCharges.find((u) => u.code === 'RSA' || u.code === 'RSA_PREMIUM' || u.name.toLowerCase().includes('road side'));
    if (rsaItem && input.rsaRequired) {
      if (rsaItem.chargeType === 'fixed' && rsaItem.fixedAmount && rsaItem.fixedAmount > 0) {
        rsaCharge = rsaItem.fixedAmount;
      }
    }

    // 6. Advance EMI Count
    const advEmiItem = activeCharges.find((u) => u.code === 'ADVANCE_EMI' || u.code === 'ADV_EMI' || u.name.toLowerCase().includes('advance emi'));
    if (advEmiItem) {
      advanceEmiCount = Math.max(0, Math.round(advEmiItem.fixedAmount ?? advEmiItem.defaultValue ?? advanceEmiCount));
    }

    // Custom Charges (any charge not matching standard codes)
    const stdCodes = ['PF', 'PROCESSING_FEE', 'STAMP_DUTY', 'STAMP', 'DOCUMENTATION', 'DOC', 'PA', 'PA_INSURANCE', 'RSA', 'RSA_PREMIUM', 'ADVANCE_EMI', 'ADV_EMI'];
    const customItems = activeCharges.filter((u) => !stdCodes.includes(u.code.toUpperCase()));

    for (const custom of customItems) {
      let val = 0;
      if (custom.chargeType === 'fixed') {
        val = custom.fixedAmount ?? custom.defaultValue ?? 0;
      } else if (custom.chargeType === 'percentage') {
        val = (loanAmount * (custom.percentage ?? custom.defaultValue ?? 0)) / 100;
      } else {
        val = custom.fixedAmount ?? custom.defaultValue ?? 0;
      }
      if (custom.minCap && custom.minCap > 0) val = Math.max(custom.minCap, val);
      if (custom.maxCap && custom.maxCap > 0) val = Math.min(custom.maxCap, val);
      const roundedVal = Math.round(val);
      if (roundedVal > 0) {
        customChargesTotal += roundedVal;
        upfrontBreakdownList.push({
          id: custom.id,
          name: custom.name,
          code: custom.code,
          amount: roundedVal,
          isOptional: custom.isOptional,
        });
      }
    }
  }

  const advanceEmiAmount = Math.round(emi * advanceEmiCount);
  const upfrontInterest = Math.max(0, Math.round((loanAmount * (scheme.upfrontInterestPercent || 0)) / 100));

  // Populate standard breakdown list
  upfrontBreakdownList.unshift(
    { id: 'uf-pf', name: 'Processing Fee (PF)', code: 'PF', amount: serviceCharge },
    { id: 'uf-stamp', name: 'Stamp Duty & Legal Charges', code: 'STAMP_DUTY', amount: stampDuty },
    { id: 'uf-doc', name: 'Documentation Charges', code: 'DOCUMENTATION', amount: additionalUpfront },
    { id: 'uf-pa', name: 'PA Insurance Cover', code: 'PA', amount: paCharge, isOptional: true },
    { id: 'uf-rsa', name: 'Road Side Assistance (RSA)', code: 'RSA', amount: rsaCharge, isOptional: true },
    { id: 'uf-adv', name: `Advance EMI (${advanceEmiCount}x EMI)`, code: 'ADVANCE_EMI', amount: advanceEmiAmount }
  );

  // Total Upfront Charges Formula:
  // Processing Fee + Stamp Duty + Documentation Charge + PA Insurance + RSA Premium + Advance EMI + Custom Charges
  const totalUpfrontCharges = serviceCharge + stampDuty + additionalUpfront + paCharge + rsaCharge + advanceEmiAmount + customChargesTotal;
  const totalCharges = serviceCharge + stampDuty + additionalUpfront + paCharge + rsaCharge + upfrontInterest + customChargesTotal;

  // Down Payment formula:
  // Down Payment = (Showroom On-Road Price - Loan Amount) + Total Upfront Charges
  const priceMargin = Math.max(0, showroomOrp - loanAmount);
  const downPayment = Math.max(0, Math.round(priceMargin + totalUpfrontCharges));

  // Total Payable Amount = Down Payment + Remaining EMIs (tenure - advanceEmiCount)
  const remainingTenure = Math.max(0, tenure - advanceEmiCount);
  const totalPayableAmount = Math.max(0, Math.round(downPayment + (emi * remainingTenure)));
  const totalOutflow = Math.max(0, Math.round((emi * tenure) + downPayment));

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
    totalOutflow,
    ltvPercent: Math.round(ltvPercent * 100) / 100,
    upfrontBreakdownList,
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

