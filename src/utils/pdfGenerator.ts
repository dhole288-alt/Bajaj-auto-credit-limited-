import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuotationRecord } from '../types/finance';

/**
 * Format currency for PDF
 */
function formatINR(val: number): string {
  return '₹' + Math.round(val).toLocaleString('en-IN');
}

/**
 * Generate PDF Finance Quotation
 */
export function generateQuotationPDF(record: QuotationRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [15, 23, 42]; // #0F172A slate-900
  const accentColor: [number, number, number] = [30, 64, 175]; // #1E40AF blue-800
  const orangeColor: [number, number, number] = [249, 115, 22]; // #F97316 orange-500

  const { input, scheme, tenureCalculations, selectedTenureMonths, quoteNumber, createdAt } = record;
  const cust = input.customerDetails;
  const selectedCalc = tenureCalculations[selectedTenureMonths];

  // Top Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('VEHICLE FINANCE QUOTATION', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${cust.financeCompany || 'PREMIUM AUTO FINANCE'}`, 14, 22);

  doc.text(`Quote #: ${quoteNumber}`, 196, 14, { align: 'right' });
  doc.text(`Date: ${new Date(createdAt).toLocaleDateString('en-IN')}`, 196, 20, { align: 'right' });

  // Customer & Vehicle Details Table
  let currentY = 35;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 34, 2, 2, 'FD');

  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CUSTOMER & DEALER DETAILS', 18, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  // Left Column
  doc.text(`Customer Name: ${cust.customerName || 'N/A'}`, 18, currentY + 15);
  doc.text(`Mobile Number: ${cust.mobileNumber || 'N/A'}`, 18, currentY + 21);
  doc.text(`Vehicle Model: ${cust.vehicleModel || 'N/A'}`, 18, currentY + 27);

  // Right Column
  doc.text(`Dealer Name: ${cust.dealerName || 'N/A'}`, 110, currentY + 15);
  doc.text(`Finance Scheme: ${scheme.schemeName} (${scheme.schemeCode})`, 110, currentY + 21);
  doc.text(`Financier: ${cust.financeCompany || 'Partner Financier'}`, 110, currentY + 27);

  currentY += 40;

  // Selected Option Highlight Box
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(...accentColor);
  doc.roundedRect(14, currentY, 182, 32, 2, 2, 'FD');

  doc.setTextColor(...accentColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`SELECTED TENURE: ${selectedTenureMonths} MONTHS LOAN SUMMARY`, 18, currentY + 8);

  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);

  doc.text(`Monthly EMI:`, 18, currentY + 17);
  doc.setFontSize(12);
  doc.setTextColor(...orangeColor);
  doc.text(`${formatINR(selectedCalc.emi)} / mo`, 48, currentY + 17);

  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text(`Down Payment:`, 105, currentY + 17);
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(`${formatINR(selectedCalc.downPayment)}`, 142, currentY + 17);

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Loan Amount: ${formatINR(input.loanAmount)}`, 18, currentY + 25);
  doc.text(`ROI Rate: ${record.scheme.baseRoi}% (${record.scheme.rateType})`, 75, currentY + 25);
  doc.text(`LTV %: ${selectedCalc.ltvPercent}%`, 125, currentY + 25);
  doc.text(`Total Payable: ${formatINR(selectedCalc.totalPayableAmount)}`, 160, currentY + 25);

  currentY += 38;

  // Charges Breakdown Sub-Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('CHARGES & UPFRONT BREAKDOWN', 14, currentY);

  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [['Charge Component', 'Amount (₹)', 'Description / Business Rule']],
    body: [
      ['Service Charges / Processing Fee', formatINR(selectedCalc.serviceCharge), `${scheme.serviceChargeType === 'percentage' ? scheme.serviceChargeValue + '%' : 'Flat'} (Min ₹${scheme.minServiceCharge})`],
      ['Stamp Duty', formatINR(selectedCalc.stampDuty), `${scheme.stampDutyType === 'percentage' ? scheme.stampDutyValue + '%' : 'Flat'}`],
      ['Additional Upfront Fee (Doc/Login)', formatINR(selectedCalc.additionalUpfront), 'Documentation & System Processing'],
      ['Advance EMI', formatINR(selectedCalc.advanceEmiAmount), `${scheme.advanceEmiCount} Month(s) Advance EMI`],
      ['Personal Accident Cover (PA)', formatINR(selectedCalc.paCharge), input.paRequired ? 'Accidental Insurance Cover' : 'Opted Out'],
      ['Roadside Assistance (RSA)', formatINR(selectedCalc.rsaCharge), input.rsaRequired ? '24/7 Breakdown RSA Support' : 'Opted Out'],
      ['TOTAL UPFRONT CHARGES', formatINR(selectedCalc.totalCharges), 'Included in Down Payment'],
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: 51 },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Comparison Grid Across All 6 Tenures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('ALL TENURE OPTIONS COMPARISON', 14, currentY);

  currentY += 3;

  const allTenures = [12, 18, 24, 30, 36, 42];
  const tableBody = allTenures.map((t) => {
    const calc = tenureCalculations[t];
    const isSelected = t === selectedTenureMonths ? ' (Selected)' : '';
    return [
      `${t} Months${isSelected}`,
      formatINR(calc.emi),
      formatINR(calc.downPayment),
      formatINR(calc.totalInterest),
      formatINR(calc.totalCharges),
      formatINR(calc.totalPayableAmount),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Tenure', 'Monthly EMI', 'Down Payment', 'Total Interest', 'Upfront Charges', 'Total Payable']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: accentColor, textColor: 255, fontSize: 8.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: 51 },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Footer & Disclaimer
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Disclaimer: This quotation is an estimate generated based on selected scheme parameters. Final loan approval is subject to credit check, documentation verification, and financier approval.', 14, currentY, { maxWidth: 182 });

  currentY += 12;

  // Signature Blocks
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Customer Signature: _______________________', 14, currentY);
  doc.text('Authorized Dealer/Financier Stamp & Sign: _______________________', 110, currentY);

  doc.save(`Quotation_${cust.customerName || 'Customer'}_${quoteNumber}.pdf`);
}
