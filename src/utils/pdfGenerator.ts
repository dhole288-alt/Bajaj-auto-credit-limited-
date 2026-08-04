import { QuotationRecord } from '../types/finance';
import { getBikeImageInfo } from '../data/bikeImages';

export async function generateQuotationPDF(record: QuotationRecord): Promise<void> {
  const cust = record.input.customerDetails;
  const selectedTenure = record.selectedTenureMonths;
  const currentCalc = record.tenureCalculations[selectedTenure];
  const bikeInfo = getBikeImageInfo(cust.vehicleModel || 'Pulsar 220F ABS');

  if (!currentCalc) return;

  const tenures = [12, 18, 24, 30, 36, 42];

  // Construct print container HTML
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups for printing/downloading PDF quotation.');
    return;
  }

  const tenureRowsHtml = tenures
    .map((t) => {
      const calc = record.tenureCalculations[t];
      if (!calc) return '';
      const isSelected = t === selectedTenure;
      return `
        <tr style="${isSelected ? 'background-color: #fef3c7; font-weight: 900; color: #005cb9;' : ''}">
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${t} Months ${isSelected ? '★' : ''}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">₹${calc.loanAmount.toLocaleString('en-IN')}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">₹${calc.downPayment.toLocaleString('en-IN')}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #005cb9;">₹${calc.emi.toLocaleString('en-IN')}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">₹${calc.totalPayableAmount.toLocaleString('en-IN')}</td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bajaj_Auto_Credit_Quotation_${record.quoteNumber}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            color: #0f172a;
            background-color: #ffffff;
            margin: 0;
            padding: 20px;
            -webkit-print-color-adjust: exact;
          }
          .container {
            border: 4px solid #005cb9;
            border-radius: 16px;
            padding: 24px;
            background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 50%, #e0f2fe 100%);
            position: relative;
            box-sizing: border-box;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #005cb9;
            padding-bottom: 16px;
            margin-bottom: 16px;
          }
          .logo-box {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .bajaj-square {
            width: 48px;
            height: 48px;
            background-color: #005cb9;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 900;
            font-size: 10px;
          }
          .title-area h1 {
            font-size: 22px;
            font-weight: 900;
            color: #005cb9;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .title-area p {
            margin: 2px 0 0 0;
            font-size: 11px;
            color: #475569;
          }
          .ref-box {
            text-align: right;
          }
          .ref-badge {
            background-color: #005cb9;
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            display: inline-block;
          }
          .hero-banner {
            border: 2px solid #005cb9;
            border-radius: 12px;
            background: linear-gradient(90deg, #1e3a8a 0%, #005cb9 50%, #1e3a8a 100%);
            color: white;
            padding: 16px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .hero-info h2 {
            margin: 4px 0;
            font-size: 22px;
            font-weight: 900;
            text-transform: uppercase;
          }
          .tagline {
            font-size: 11px;
            color: #bfdbfe;
            font-style: italic;
          }
          .bike-img {
            width: 180px;
            height: 100px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid white;
          }
          .section-box {
            border: 2px solid #cbd5e1;
            border-radius: 12px;
            padding: 16px;
            background-color: rgba(255, 255, 255, 0.9);
            margin-bottom: 16px;
          }
          .section-title {
            font-size: 13px;
            font-weight: 900;
            color: #005cb9;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 12px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 24px;
            font-size: 12px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 4px;
          }
          .detail-label {
            color: #64748b;
            font-weight: bold;
          }
          .detail-val {
            font-weight: 900;
            color: #0f172a;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            text-align: center;
          }
          .sum-card {
            background-color: white;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 10px;
          }
          .sum-card-highlight {
            background-color: #005cb9;
            color: white;
            border-radius: 8px;
            padding: 10px;
          }
          .sum-label {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            color: #64748b;
            display: block;
          }
          .sum-val {
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
            margin-top: 4px;
            display: block;
          }
          .table-box {
            border: 2px solid #cbd5e1;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th {
            background-color: #005cb9;
            color: white;
            padding: 8px;
            font-weight: bold;
          }
          .mkt-banner {
            border: 1px solid #93c5fd;
            border-radius: 8px;
            background: #0f172a;
            color: white;
            padding: 10px;
            margin-bottom: 16px;
            text-align: center;
          }
          .mkt-title {
            color: #fbbf24;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
          }
          .mkt-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 6px;
            font-size: 9px;
            font-weight: bold;
          }
          .mkt-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 6px;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .footer {
            font-size: 10px;
            color: #64748b;
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px solid #cbd5e1;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 30px;
          }
          .sig-box {
            width: 180px;
            text-align: center;
          }
          .sig-line {
            border-bottom: 1px solid #94a3b8;
            height: 30px;
            margin-bottom: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- 1. Header -->
          <div class="header">
            <div class="logo-box">
              <div class="bajaj-square">
                <span>BAJAJ</span>
                <span style="font-size:8px">CREDIT</span>
              </div>
              <div class="title-area">
                <h1>BAJAJ AUTO CREDIT LIMITED</h1>
                <p>Registered Office: Akurdi, Pune - 411035 | CIN: U65923PN2021PLC200000</p>
                <p style="color: #005cb9; font-weight: bold;">Official Dealership Vehicle Finance Quotation</p>
              </div>
            </div>
            <div class="ref-box">
              <div class="ref-badge">Ref: ${record.quoteNumber}</div>
              <p style="font-size: 11px; font-weight: bold; margin-top: 4px;">
                Date: ${new Date(record.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <!-- 2. Vehicle Hero Banner -->
          <div class="hero-banner">
            <div class="hero-info">
              <span style="background: rgba(255,255,255,0.15); font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: bold; color: #fbbf24;">
                ${bikeInfo.category}
              </span>
              <h2>${bikeInfo.name}</h2>
              <div class="tagline">"${bikeInfo.tagline}"</div>
            </div>
            <img src="${bikeInfo.imageUrl}" class="bike-img" alt="${bikeInfo.name}" />
          </div>

          <!-- 3. Details -->
          <div class="section-box">
            <div class="section-title">Customer & Dealership Particulars</div>
            <div class="grid-2">
              <div class="detail-row"><span class="detail-label">Customer Name:</span><span class="detail-val">${cust.customerName || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Dealership & Branch:</span><span class="detail-val">${cust.dealerName || 'Wasan & Sons'} ${cust.dealerBranch ? `(${cust.dealerBranch})` : ''}</span></div>
              <div class="detail-row"><span class="detail-label">Contact Number:</span><span class="detail-val">${cust.mobileNumber || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Financier:</span><span class="detail-val">BAJAJ AUTO CREDIT LIMITED</span></div>
              <div class="detail-row"><span class="detail-label">Vehicle SKU & Model:</span><span class="detail-val" style="color:#005cb9;">${cust.vehicleSku ? `[${cust.vehicleSku}] ` : ''}${cust.vehicleModel || bikeInfo.name}</span></div>
              <div class="detail-row"><span class="detail-label">DMA Manager & Code:</span><span class="detail-val">${cust.dmaName || 'N/A'} ${cust.dmaCode ? `(${cust.dmaCode})` : ''}</span></div>
              <div class="detail-row"><span class="detail-label">DMA Contact Number:</span><span class="detail-val">${cust.dmaContact || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Executive ID:</span><span class="detail-val">${cust.executiveName || 'EMP-9041'}</span></div>
            </div>
          </div>

          <!-- 4. Sanctioned Finance Summary -->
          <div class="section-box" style="border-color: #005cb9; background: #f0f7ff;">
            <div class="section-title" style="display:flex; justify-content:space-between;">
              <span>Sanctioned Finance Summary (${selectedTenure} Months Tenure)</span>
              <span style="font-size: 10px; background: #005cb9; color: white; padding: 2px 6px; border-radius: 4px;">Scheme: ${record.scheme.schemeCode}</span>
            </div>
            <div class="summary-grid">
              <div class="sum-card">
                <span class="sum-label">Vehicle On-Road Price</span>
                <span class="sum-val">₹${record.input.showroomOrp.toLocaleString('en-IN')}</span>
              </div>
              <div class="sum-card">
                <span class="sum-label">Sanctioned Loan Amount</span>
                <span class="sum-val" style="color: #005cb9;">₹${currentCalc.loanAmount.toLocaleString('en-IN')}</span>
              </div>
              <div class="sum-card">
                <span class="sum-label">Net Down Payment</span>
                <span class="sum-val" style="color: #b45309;">₹${currentCalc.downPayment.toLocaleString('en-IN')}</span>
              </div>
              <div class="sum-card-highlight">
                <span class="sum-label" style="color: #fef08a;">Monthly EMI</span>
                <span class="sum-val" style="color: white; font-size: 18px;">₹${currentCalc.emi.toLocaleString('en-IN')} / mo</span>
              </div>
            </div>
          </div>

          <!-- 5. Tenure Options Matrix -->
          <div class="table-box">
            <table>
              <thead>
                <tr>
                  <th>Tenure (Months)</th>
                  <th>Loan Amount</th>
                  <th>Down Payment</th>
                  <th>Monthly EMI</th>
                  <th>Total Payable Amount</th>
                </tr>
              </thead>
              <tbody>
                ${tenureRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- 6. Marketing Showcase Banner -->
          <div class="mkt-banner">
            <div class="mkt-title">Explore Bajaj Auto High Performance Lineup</div>
            <div class="mkt-grid">
              <div class="mkt-item">Pulsar NS400Z</div>
              <div class="mkt-item">Pulsar N250</div>
              <div class="mkt-item">Pulsar N160</div>
              <div class="mkt-item">Pulsar 220F</div>
              <div class="mkt-item">Pulsar RS200</div>
            </div>
          </div>

          <!-- 7. Footer -->
          <div class="footer">
            <p><i>* Terms & Conditions apply. Finance sanction subject to final document verification and credit approval by Bajaj Auto Credit Limited. Quotation valid for 7 days.</i></p>
            <div class="signatures">
              <div class="sig-box">
                <div class="sig-line"></div>
                <b>Customer Signature</b>
              </div>
              <div class="sig-box">
                <div class="sig-line"></div>
                <b style="color:#005cb9;">Authorized Signatory</b><br/>
                <span style="font-size: 9px;">Bajaj Auto Credit Limited</span>
              </div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
