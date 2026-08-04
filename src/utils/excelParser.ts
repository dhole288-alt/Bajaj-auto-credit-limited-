import * as XLSX from 'xlsx';
import { Scheme } from '../types/finance';

/**
 * Parse an uploaded Excel file containing Scheme definitions
 */
export async function parseSchemeExcelFile(file: File): Promise<Scheme[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const parsedSchemes: Scheme[] = [];

        jsonRows.forEach((row, index) => {
          // Flexible key lookup
          const getVal = (keys: string[]): any => {
            for (const key of keys) {
              const foundKey = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
              if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
                return row[foundKey];
              }
            }
            return null;
          };

          const schemeCode = getVal(['Scheme Code', 'SchemeCode', 'Code', 'SCHEME']) || `BAC-SCH-${index + 101}`;
          const schemeName = getVal(['Scheme Name', 'SchemeName', 'Name', 'Title']) || `Scheme ${schemeCode}`;
          const category = getVal(['Category', 'Type']) || 'Standard';
          const financeCompany = getVal(['Finance Company', 'Financier', 'Company', 'Bank']) || 'Bajaj Auto Credit Limited';
          
          const minLtv = Number(getVal(['Min LTV %', 'MinLTV', 'Min LTV'])) || 50;
          const maxLtv = Number(getVal(['Max LTV %', 'Max LTV', 'LTV %', 'LTV'])) || 90;
          const roi = Number(getVal(['Base ROI %', 'ROI %', 'ROI', 'Interest Rate', 'Rate'])) || 9.5;
          
          // Year / Tenure-specific ROI %
          const r12 = Number(getVal(['ROI 12M', 'ROI 12M %', '1 YR ROI', '12M ROI', '1 Year ROI'])) || roi;
          const r18 = Number(getVal(['ROI 18M', 'ROI 18M %', '1.5 YR ROI', '18M ROI', '1.5 Year ROI'])) || roi;
          const r24 = Number(getVal(['ROI 24M', 'ROI 24M %', '2 YR ROI', '24M ROI', '2 Year ROI'])) || roi;
          const r30 = Number(getVal(['ROI 30M', 'ROI 30M %', '2.5 YR ROI', '30M ROI', '2.5 Year ROI'])) || roi;
          const r36 = Number(getVal(['ROI 36M', 'ROI 36M %', '3 YR ROI', '36M ROI', '3 Year ROI'])) || roi;
          const r42 = Number(getVal(['ROI 42M', 'ROI 42M %', '3.5 YR ROI', '42M ROI', '3.5 Year ROI'])) || roi;

          const rateType = (String(getVal(['Rate Type', 'Type']) || 'reducing').toLowerCase().includes('flat')) ? 'flat' : 'reducing';

          const serviceType = (String(getVal(['Service Charge Type', 'Service Type']) || 'percentage').toLowerCase().includes('flat')) ? 'flat' : 'percentage';
          const serviceVal = Number(getVal(['Service Charge Value', 'Service Charge', 'Processing Fee'])) || 1.5;
          const minService = Number(getVal(['Min Service Charge', 'Min Fee'])) || 1200;
          const maxService = Number(getVal(['Max Service Charge', 'Max Fee'])) || 3500;

          const stampDutyType = (String(getVal(['Stamp Duty Type']) || 'percentage').toLowerCase().includes('flat')) ? 'flat' : 'percentage';
          const stampDutyVal = Number(getVal(['Stamp Duty %', 'Stamp Duty', 'Stamp Duty Value'])) || 0.25;

          const additionalUpfront = Number(getVal(['Additional Upfront', 'Doc Fee', 'Login Fee'])) || 400;
          const advanceEmi = Number(getVal(['Advance EMI Count', 'Advance EMI', 'Adv EMI'])) || 0;
          const paCharge = Number(getVal(['PA Charge', 'PA Insurance', 'PA'])) || 350;
          const rsaCharge = Number(getVal(['RSA Charge', 'RSA'])) || 500;

          parsedSchemes.push({
            id: `excel-${Date.now()}-${index}`,
            schemeCode: String(schemeCode).trim().toUpperCase(),
            schemeName: String(schemeName).trim(),
            category: String(category).trim(),
            financeCompany: String(financeCompany).trim(),
            minLtvPercent: minLtv,
            maxLtvPercent: maxLtv,
            baseRoi: roi,
            roi12M: r12,
            roi18M: r18,
            roi24M: r24,
            roi30M: r30,
            roi36M: r36,
            roi42M: r42,
            tenureRoiMap: {
              12: r12,
              18: r18,
              24: r24,
              30: r30,
              36: r36,
              42: r42,
            },
            rateType,
            serviceChargeType: serviceType,
            serviceChargeValue: serviceVal,
            minServiceCharge: minService,
            maxServiceCharge: maxService,
            stampDutyType,
            stampDutyValue: stampDutyVal,
            additionalUpfrontCharges: additionalUpfront,
            advanceEmiCount: advanceEmi,
            upfrontInterestPercent: 0,
            paCharge,
            rsaCharge,
            supportedTenures: [12, 18, 24, 30, 36, 42],
            description: `Uploaded via Excel on ${new Date().toLocaleDateString()}`,
            isActive: true,
          });
        });

        resolve(parsedSchemes);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export Schemes database to Excel (.xlsx)
 */
export function exportSchemesToExcel(schemes: Scheme[], fileName: string = 'Bajaj_Auto_Credit_Schemes_Master.xlsx') {
  const exportData = schemes.map((s) => ({
    'Scheme Code': s.schemeCode,
    'Scheme Name': s.schemeName,
    'Category': s.category,
    'Finance Company': s.financeCompany,
    'Min LTV %': s.minLtvPercent,
    'Max LTV %': s.maxLtvPercent,
    'Base ROI %': s.baseRoi,
    'ROI 12M (1 YR %)': s.roi12M || s.baseRoi,
    'ROI 18M (1.5 YR %)': s.roi18M || s.baseRoi,
    'ROI 24M (2 YR %)': s.roi24M || s.baseRoi,
    'ROI 30M (2.5 YR %)': s.roi30M || s.baseRoi,
    'ROI 36M (3 YR %)': s.roi36M || s.baseRoi,
    'ROI 42M (3.5 YR %)': s.roi42M || s.baseRoi,
    'Rate Type': s.rateType,
    'Service Charge Type': s.serviceChargeType,
    'Service Charge Value': s.serviceChargeValue,
    'Min Service Fee': s.minServiceCharge,
    'Max Service Fee': s.maxServiceCharge,
    'Stamp Duty % / Flat': s.stampDutyValue,
    'Additional Upfront Charges': s.additionalUpfrontCharges,
    'Advance EMI Count': s.advanceEmiCount,
    'PA Charges (₹)': s.paCharge,
    'RSA Charges (₹)': s.rsaCharge,
    'Status': s.isActive ? 'Active' : 'Inactive',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Schemes');
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export Quotations history to Excel (.xlsx)
 */
export function exportQuotationsToExcel(quotationRecords: any[], fileName: string = 'Bajaj_Auto_Credit_Quotations.xlsx') {
  const exportData = quotationRecords.map((q) => {
    const calc = q.tenureCalculations[q.selectedTenureMonths];
    return {
      'Quote ID': q.quoteNumber,
      'Date': new Date(q.createdAt).toLocaleString(),
      'Customer Name': q.input.customerDetails.customerName,
      'Mobile': q.input.customerDetails.mobileNumber,
      'Vehicle Model': q.input.customerDetails.vehicleModel,
      'Dealer': q.input.customerDetails.dealerName,
      'Financier': q.input.customerDetails.financeCompany,
      'Scheme Code': q.scheme.schemeCode,
      'Showroom ORP (₹)': q.input.showroomOrp,
      'SFDC ORP (₹)': q.input.sfdcOrp,
      'Loan Amount (₹)': q.input.loanAmount,
      'Tenure (Months)': q.selectedTenureMonths,
      'Applied ROI (%)': calc?.roi || q.scheme.baseRoi,
      'Monthly EMI (₹)': calc?.emi || 0,
      'Down Payment (₹)': calc?.downPayment || 0,
      'Total Charges (₹)': calc?.totalCharges || 0,
      'Total Interest (₹)': calc?.totalInterest || 0,
      'Total Payable (₹)': calc?.totalPayableAmount || 0,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Quotations');
  XLSX.writeFile(workbook, fileName);
}
