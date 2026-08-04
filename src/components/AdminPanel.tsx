import React, { useState } from 'react';
import { Scheme } from '../types/finance';
import { parseSchemeExcelFile, exportSchemesToExcel } from '../utils/excelParser';
import { Settings, Upload, Download, Plus, Edit2, Trash2, CheckCircle, RefreshCw, AlertCircle, FileSpreadsheet, ShieldCheck, Percent } from 'lucide-react';
import { BajajLogo } from './BajajLogo';

interface AdminPanelProps {
  schemes: Scheme[];
  setSchemes: React.Dispatch<React.SetStateAction<Scheme[]>>;
  quotationRecords: any[];
  onResetDefaultSchemes: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  schemes,
  setSchemes,
  onResetDefaultSchemes,
}) => {
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Excel Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Parsing Excel file...');

    try {
      const parsedSchemes = await parseSchemeExcelFile(file);
      if (parsedSchemes.length === 0) {
        setUploadStatus('Error: No valid schemes found in uploaded Excel file.');
        setIsUploading(false);
        return;
      }

      setSchemes((prev) => {
        const existingCodes = new Set(prev.map((s) => s.schemeCode));
        const updated = [...prev];

        parsedSchemes.forEach((newScheme) => {
          if (existingCodes.has(newScheme.schemeCode)) {
            const idx = updated.findIndex((s) => s.schemeCode === newScheme.schemeCode);
            if (idx >= 0) updated[idx] = newScheme;
          } else {
            updated.unshift(newScheme);
          }
        });

        return updated;
      });

      setUploadStatus(`Success! Imported/updated ${parsedSchemes.length} schemes from Excel.`);
    } catch (err: any) {
      setUploadStatus(`Upload Error: ${err.message || 'Failed to parse file'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleActive = (id: string) => {
    setSchemes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleDeleteScheme = (id: string) => {
    if (confirm('Are you sure you want to delete this scheme?')) {
      setSchemes((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSaveSchemeModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheme) return;

    // Ensure tenureRoiMap is synced with individual tenure ROI values
    const syncedScheme: Scheme = {
      ...editingScheme,
      tenureRoiMap: {
        12: editingScheme.roi12M ?? editingScheme.baseRoi,
        18: editingScheme.roi18M ?? editingScheme.baseRoi,
        24: editingScheme.roi24M ?? editingScheme.baseRoi,
        30: editingScheme.roi30M ?? editingScheme.baseRoi,
        36: editingScheme.roi36M ?? editingScheme.baseRoi,
        42: editingScheme.roi42M ?? editingScheme.baseRoi,
      },
    };

    setSchemes((prev) => {
      const idx = prev.findIndex((s) => s.id === syncedScheme.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = syncedScheme;
        return updated;
      }
      return [syncedScheme, ...prev];
    });

    setIsModalOpen(false);
    setEditingScheme(null);
  };

  const createNewScheme = () => {
    const newSch: Scheme = {
      id: `bac-sch-${Date.now()}`,
      schemeCode: `BAC-NEW-${Math.floor(Math.random() * 900) + 100}`,
      schemeName: 'Bajaj Auto Credit Custom Scheme',
      category: 'Standard',
      financeCompany: 'Bajaj Auto Credit Limited',
      minLtvPercent: 50,
      maxLtvPercent: 90,
      baseRoi: 9.5,
      roi12M: 7.99,
      roi18M: 8.49,
      roi24M: 8.99,
      roi30M: 9.25,
      roi36M: 9.50,
      roi42M: 9.99,
      tenureRoiMap: {
        12: 7.99,
        18: 8.49,
        24: 8.99,
        30: 9.25,
        36: 9.50,
        42: 9.99,
      },
      rateType: 'reducing',
      serviceChargeType: 'percentage',
      serviceChargeValue: 1.5,
      minServiceCharge: 1200,
      maxServiceCharge: 3500,
      stampDutyType: 'percentage',
      stampDutyValue: 0.25,
      additionalUpfrontCharges: 400,
      advanceEmiCount: 0,
      upfrontInterestPercent: 0,
      paCharge: 350,
      rsaCharge: 500,
      supportedTenures: [12, 18, 24, 30, 36, 42],
      isActive: true,
    };
    setEditingScheme(newSch);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
      {/* Header Banner - Official Bajaj Auto Credit Portal Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <BajajLogo size="lg" />
          <div>
            <span className="text-xs font-bold text-[#024b9c] dark:text-blue-400 uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bajaj Auto Credit Limited • Admin Master Panel</span>
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2 mt-0.5">
              <Settings className="w-5 h-5 text-[#024b9c] dark:text-blue-400" />
              <span>Year-Wise Interest Rate & Scheme Master Manager</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure year-wise ROI (12M, 18M, 24M, 30M, 36M, 42M), LTV caps, processing fees, and upload master sheets.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={createNewScheme}
            className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Scheme</span>
          </button>

          <button
            type="button"
            onClick={() => exportSchemesToExcel(schemes)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 text-blue-800 dark:text-blue-300 font-bold text-xs transition-all flex items-center space-x-1.5 border border-blue-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={onResetDefaultSchemes}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            title="Reset to Factory Schemes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Excel Upload Area */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-blue-50/50 dark:from-blue-950/40 dark:via-slate-900 dark:to-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-800 flex flex-col items-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md">
          <Upload className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-blue-950 dark:text-blue-200">
            Upload Scheme Master Excel File (.xlsx / .xls)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mt-0.5">
            Auto-imports Scheme Codes, Year-wise Interest Rates (12M, 18M, 24M, 30M, 36M, 42M), LTV Caps, and Charges.
          </p>
        </div>

        <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all">
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isUploading ? 'Processing Excel Sheet...' : 'Choose Excel Master Sheet'}</span>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>

        {uploadStatus && (
          <p
            className={`text-xs font-semibold flex items-center space-x-1 ${
              uploadStatus.startsWith('Success') ? 'text-emerald-600' : 'text-blue-700'
            }`}
          >
            {uploadStatus.startsWith('Success') ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{uploadStatus}</span>
          </p>
        )}
      </div>

      {/* Master Schemes Table with Year-wise ROI Columns */}
      <div className="border border-blue-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3 bg-blue-700 text-white font-bold text-xs flex justify-between items-center">
          <span className="flex items-center space-x-1.5">
            <Percent className="w-4 h-4 text-blue-200" />
            <span>Bajaj Auto Credit Scheme Master Database ({schemes.length} Schemes)</span>
          </span>
          <span className="text-[11px] text-blue-100 font-normal">Click Edit to modify Year-wise Interest Rate Columns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-blue-50/80 dark:bg-slate-800/80 font-bold text-blue-950 dark:text-blue-200 border-b border-blue-100 dark:border-slate-800">
              <tr>
                <th className="p-3">Scheme Code</th>
                <th className="p-3">Scheme Name</th>
                <th className="p-3">Max LTV %</th>
                <th className="p-3 text-center bg-blue-100/60 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300">12M (1 YR)</th>
                <th className="p-3 text-center bg-blue-100/60 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300">18M (1.5 YR)</th>
                <th className="p-3 text-center bg-blue-100/60 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300">24M (2 YR)</th>
                <th className="p-3 text-center bg-blue-100/60 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300">30M (2.5 YR)</th>
                <th className="p-3 text-center bg-blue-100/60 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300">36M (3 YR)</th>
                <th className="p-3 text-center bg-blue-100/60 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300">42M (3.5 YR)</th>
                <th className="p-3">Service Fee</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {schemes.map((s) => {
                const r12 = s.roi12M ?? s.tenureRoiMap?.[12] ?? s.baseRoi;
                const r18 = s.roi18M ?? s.tenureRoiMap?.[18] ?? s.baseRoi;
                const r24 = s.roi24M ?? s.tenureRoiMap?.[24] ?? s.baseRoi;
                const r30 = s.roi30M ?? s.tenureRoiMap?.[30] ?? s.baseRoi;
                const r36 = s.roi36M ?? s.tenureRoiMap?.[36] ?? s.baseRoi;
                const r42 = s.roi42M ?? s.tenureRoiMap?.[42] ?? s.baseRoi;

                return (
                  <tr key={s.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-extrabold text-blue-700 dark:text-blue-400">{s.schemeCode}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      <div>{s.schemeName}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{s.category} • {s.financeCompany}</div>
                    </td>
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">{s.maxLtvPercent}%</td>
                    
                    {/* Year-wise ROI columns */}
                    <td className="p-3 text-center font-bold text-blue-800 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20">{r12}%</td>
                    <td className="p-3 text-center font-bold text-blue-800 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20">{r18}%</td>
                    <td className="p-3 text-center font-bold text-blue-800 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20">{r24}%</td>
                    <td className="p-3 text-center font-bold text-blue-800 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20">{r30}%</td>
                    <td className="p-3 text-center font-bold text-blue-800 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20">{r36}%</td>
                    <td className="p-3 text-center font-bold text-blue-800 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20">{r42}%</td>

                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                      {s.serviceChargeType === 'percentage' ? `${s.serviceChargeValue}%` : `₹${s.serviceChargeValue}`}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(s.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          s.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingScheme({
                              ...s,
                              roi12M: r12,
                              roi18M: r18,
                              roi24M: r24,
                              roi30M: r30,
                              roi36M: r36,
                              roi42M: r42,
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 hover:bg-blue-200"
                          title="Edit Scheme & Year ROI"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteScheme(s.id)}
                          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100"
                          title="Delete Scheme"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Scheme Modal with Year-wise ROI Inputs */}
      {isModalOpen && editingScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSchemeModal}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 border-2 border-blue-600 dark:border-blue-700 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">Bajaj Auto Credit Limited</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Edit Scheme & Year-Wise ROI Slabs: {editingScheme.schemeCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* SECTION 1: YEAR-WISE INTEREST RATE SLABS */}
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-blue-950 dark:text-blue-200 tracking-wider flex items-center space-x-1.5">
                  <Percent className="w-4 h-4 text-blue-700" />
                  <span>Year-Wise Interest Rate (ROI % p.a. per Tenure)</span>
                </h4>
                <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold">
                  Admin Year-Wise Rates
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                <div>
                  <label className="font-extrabold text-blue-900 dark:text-blue-300 block mb-1">12M (1 Year)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingScheme.roi12M ?? editingScheme.baseRoi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, roi12M: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-white font-black text-center text-sm"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-blue-900 dark:text-blue-300 block mb-1">18M (1.5 YR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingScheme.roi18M ?? editingScheme.baseRoi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, roi18M: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-white font-black text-center text-sm"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-blue-900 dark:text-blue-300 block mb-1">24M (2 Years)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingScheme.roi24M ?? editingScheme.baseRoi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, roi24M: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-white font-black text-center text-sm"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-blue-900 dark:text-blue-300 block mb-1">30M (2.5 YR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingScheme.roi30M ?? editingScheme.baseRoi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, roi30M: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-white font-black text-center text-sm"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-blue-900 dark:text-blue-300 block mb-1">36M (3 Years)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingScheme.roi36M ?? editingScheme.baseRoi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, roi36M: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-white font-black text-center text-sm"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-blue-900 dark:text-blue-300 block mb-1">42M (3.5 YR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingScheme.roi42M ?? editingScheme.baseRoi}
                    onChange={(e) => setEditingScheme({ ...editingScheme, roi42M: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-white font-black text-center text-sm"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: SCHEME IDENTIFICATION & CHARGES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Scheme Code</label>
                <input
                  type="text"
                  required
                  value={editingScheme.schemeCode}
                  onChange={(e) => setEditingScheme({ ...editingScheme, schemeCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Scheme Name</label>
                <input
                  type="text"
                  required
                  value={editingScheme.schemeName}
                  onChange={(e) => setEditingScheme({ ...editingScheme, schemeName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Financier Entity</label>
                <input
                  type="text"
                  required
                  value={editingScheme.financeCompany}
                  onChange={(e) => setEditingScheme({ ...editingScheme, financeCompany: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <input
                  type="text"
                  value={editingScheme.category}
                  onChange={(e) => setEditingScheme({ ...editingScheme, category: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Max LTV % Cap</label>
                <input
                  type="number"
                  required
                  value={editingScheme.maxLtvPercent}
                  onChange={(e) => setEditingScheme({ ...editingScheme, maxLtvPercent: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Base ROI % (Fallback Rate)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingScheme.baseRoi}
                  onChange={(e) => setEditingScheme({ ...editingScheme, baseRoi: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Rate Type</label>
                <select
                  value={editingScheme.rateType}
                  onChange={(e) => setEditingScheme({ ...editingScheme, rateType: e.target.value as any })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white font-medium"
                >
                  <option value="reducing">Reducing Balance Method</option>
                  <option value="flat">Flat Interest Rate Method</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Advance EMI Count</label>
                <input
                  type="number"
                  value={editingScheme.advanceEmiCount}
                  onChange={(e) => setEditingScheme({ ...editingScheme, advanceEmiCount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Service Fee Type & Val</label>
                <div className="flex space-x-1">
                  <select
                    value={editingScheme.serviceChargeType}
                    onChange={(e) => setEditingScheme({ ...editingScheme, serviceChargeType: e.target.value as any })}
                    className="w-24 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white"
                  >
                    <option value="percentage">% of Loan</option>
                    <option value="flat">Flat ₹</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={editingScheme.serviceChargeValue}
                    onChange={(e) => setEditingScheme({ ...editingScheme, serviceChargeValue: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Min / Max Service Fee Cap (₹)</label>
                <div className="flex space-x-1">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={editingScheme.minServiceCharge}
                    onChange={(e) => setEditingScheme({ ...editingScheme, minServiceCharge: Number(e.target.value) })}
                    className="w-1/2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={editingScheme.maxServiceCharge}
                    onChange={(e) => setEditingScheme({ ...editingScheme, maxServiceCharge: Number(e.target.value) })}
                    className="w-1/2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">PA Insurance Cover (₹)</label>
                <input
                  type="number"
                  value={editingScheme.paCharge}
                  onChange={(e) => setEditingScheme({ ...editingScheme, paCharge: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">RSA Charge (₹)</label>
                <input
                  type="number"
                  value={editingScheme.rsaCharge}
                  onChange={(e) => setEditingScheme({ ...editingScheme, rsaCharge: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md"
              >
                Save Scheme & Year Slabs
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
