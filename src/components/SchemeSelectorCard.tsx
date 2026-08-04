import React, { useState } from 'react';
import { Scheme } from '../types/finance';
import { Search, Percent, Zap, Info, ChevronDown, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface SchemeSelectorCardProps {
  schemes: Scheme[];
  selectedScheme: Scheme;
  onSelectScheme: (scheme: Scheme) => void;
}

export const SchemeSelectorCard: React.FC<SchemeSelectorCardProps> = ({
  schemes,
  selectedScheme,
  onSelectScheme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const categories = ['All', 'Standard', 'Low EMI', 'Zero Down Payment', 'Festive Offer', 'Flat Rate'];

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch =
      s.schemeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.financeCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory && s.isActive;
  });

  const r12 = selectedScheme.roi12M ?? selectedScheme.tenureRoiMap?.[12] ?? selectedScheme.baseRoi;
  const r18 = selectedScheme.roi18M ?? selectedScheme.tenureRoiMap?.[18] ?? selectedScheme.baseRoi;
  const r24 = selectedScheme.roi24M ?? selectedScheme.tenureRoiMap?.[24] ?? selectedScheme.baseRoi;
  const r30 = selectedScheme.roi30M ?? selectedScheme.tenureRoiMap?.[30] ?? selectedScheme.baseRoi;
  const r36 = selectedScheme.roi36M ?? selectedScheme.tenureRoiMap?.[36] ?? selectedScheme.baseRoi;
  const r42 = selectedScheme.roi42M ?? selectedScheme.tenureRoiMap?.[42] ?? selectedScheme.baseRoi;

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-3d shadow-3d-hover space-y-5 transition-all border border-[#024b9c]/20 dark:border-blue-500/20">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-2xl bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-md glow-blue">
              <Zap className="w-4 h-4 text-amber-300" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#024b9c] dark:text-blue-400">
              1. Finance Scheme Master
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Bajaj Auto Credit Limited • Year-Wise Rate Slabs & LTV Matrix
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowFormulaModal(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#024b9c] dark:text-blue-300 hover:bg-blue-100 text-xs font-extrabold border border-blue-200 dark:border-blue-800 transition-all shadow-2xs"
        >
          <Info className="w-3.5 h-3.5 text-[#024b9c] dark:text-blue-400" />
          <span>Matrix Rules</span>
        </button>
      </div>

      {/* Category Chips & Searchable Scheme Dropdown */}
      <div className="space-y-3">
        {/* Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shadow-2xs ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-md scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dropdown Trigger */}
        <div className="relative">
          <div
            id="scheme-select-trigger"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-sky-50/50 dark:from-slate-800/90 dark:to-slate-800/50 border-2 border-[#024b9c]/30 dark:border-blue-500/30 cursor-pointer hover:border-[#024b9c] dark:hover:border-blue-400 transition-all shadow-sm"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#024b9c] to-[#003366] text-white font-mono text-xs font-black tracking-wide shrink-0 shadow-xs border border-blue-400/30">
                {selectedScheme.schemeCode}
              </div>
              <div className="truncate">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {selectedScheme.schemeName}
                </p>
                <p className="text-xs text-[#024b9c] dark:text-blue-300 font-bold truncate">
                  {selectedScheme.financeCompany} • {selectedScheme.category} • Max LTV: {selectedScheme.maxLtvPercent}%
                </p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-[#024b9c] dark:text-blue-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Items */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-[#024b9c] dark:border-blue-700 rounded-2xl shadow-2xl max-h-72 overflow-y-auto p-2">
              <div className="relative mb-2">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search scheme code or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#024b9c]"
                />
              </div>

              {filteredSchemes.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-medium">No matching schemes found</div>
              ) : (
                filteredSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    onClick={() => {
                      onSelectScheme(scheme);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs cursor-pointer transition-all ${
                      selectedScheme.id === scheme.id
                        ? 'bg-blue-100/80 dark:bg-blue-950/80 text-[#024b9c] dark:text-blue-200 font-extrabold border border-blue-300/50'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-extrabold text-[#024b9c] dark:text-blue-400">{scheme.schemeCode}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{scheme.schemeName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {scheme.financeCompany} | Base ROI: {scheme.baseRoi}% | Max LTV: {scheme.maxLtvPercent}%
                      </p>
                    </div>
                    {selectedScheme.id === scheme.id && <Check className="w-4 h-4 text-[#024b9c] dark:text-blue-400 shrink-0" />}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* YEAR-WISE INTEREST RATE MATRIX PREVIEW CARDS */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-sky-50/50 to-blue-50/80 dark:from-blue-950/40 dark:to-slate-900/60 border border-blue-200/80 dark:border-blue-900/50 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-[#024b9c] dark:text-blue-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Percent className="w-4 h-4 text-[#024b9c]" />
              <span>Year-Wise Interest Rate Slabs (ROI % p.a.)</span>
            </span>
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Admin Master Slabs</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-blue-200 dark:border-slate-700 shadow-2xs hover:scale-105 transition-transform cursor-default">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">12M (1 YR)</span>
              <span className="text-sm font-black text-[#024b9c] dark:text-blue-300">{r12}%</span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-blue-200 dark:border-slate-700 shadow-2xs hover:scale-105 transition-transform cursor-default">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">18M (1.5 YR)</span>
              <span className="text-sm font-black text-[#024b9c] dark:text-blue-300">{r18}%</span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-blue-200 dark:border-slate-700 shadow-2xs hover:scale-105 transition-transform cursor-default">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">24M (2 YR)</span>
              <span className="text-sm font-black text-[#024b9c] dark:text-blue-300">{r24}%</span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-blue-200 dark:border-slate-700 shadow-2xs hover:scale-105 transition-transform cursor-default">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">30M (2.5 YR)</span>
              <span className="text-sm font-black text-[#024b9c] dark:text-blue-300">{r30}%</span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-blue-200 dark:border-slate-700 shadow-2xs hover:scale-105 transition-transform cursor-default">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">36M (3 YR)</span>
              <span className="text-sm font-black text-[#024b9c] dark:text-blue-300">{r36}%</span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-blue-200 dark:border-slate-700 shadow-2xs hover:scale-105 transition-transform cursor-default">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">42M (3.5 YR)</span>
              <span className="text-sm font-black text-[#024b9c] dark:text-blue-300">{r42}%</span>
            </div>
          </div>
        </div>

        {/* Selected Scheme Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#024b9c] dark:text-blue-400 tracking-wider">MAX LTV %</span>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {selectedScheme.maxLtvPercent}%
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#024b9c] dark:text-blue-400 tracking-wider">RATE METHOD</span>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5 capitalize">
              {selectedScheme.rateType}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#024b9c] dark:text-blue-400 tracking-wider">ADVANCE EMI</span>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {selectedScheme.advanceEmiCount} Month{selectedScheme.advanceEmiCount !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#024b9c] dark:text-blue-400 tracking-wider">SERVICE FEE</span>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {selectedScheme.serviceChargeType === 'percentage'
                ? `${selectedScheme.serviceChargeValue}%`
                : `₹${selectedScheme.serviceChargeValue}`}
            </p>
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border-2 border-[#024b9c] shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#024b9c]" />
                <span>Bajaj Auto Credit Matrix Rules</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-xl space-y-1">
                <p className="font-extrabold text-[#024b9c] dark:text-blue-300">{selectedScheme.schemeCode} - {selectedScheme.schemeName}</p>
                <p>Financier: <strong className="text-slate-900 dark:text-white">{selectedScheme.financeCompany}</strong></p>
                <p>Calculation Method: <strong className="text-slate-900 dark:text-white">{selectedScheme.rateType.toUpperCase()} BALANCE</strong></p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Year-Wise Interest Rate Slabs:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">1 Year (12M): <strong>{r12}% p.a.</strong></div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">1.5 Year (18M): <strong>{r18}% p.a.</strong></div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">2 Years (24M): <strong>{r24}% p.a.</strong></div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">2.5 Years (30M): <strong>{r30}% p.a.</strong></div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">3 Years (36M): <strong>{r36}% p.a.</strong></div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">3.5 Years (42M): <strong>{r42}% p.a.</strong></div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Other Scheme Rules:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>LTV Cap:</strong> Max {selectedScheme.maxLtvPercent}% of SFDC On-Road Price.</li>
                  <li><strong>Service Charge:</strong> {selectedScheme.serviceChargeType === 'percentage' ? `${selectedScheme.serviceChargeValue}% of Loan` : `Flat ₹${selectedScheme.serviceChargeValue}`} (Min: ₹{selectedScheme.minServiceCharge}, Max: ₹{selectedScheme.maxServiceCharge}).</li>
                  <li><strong>Stamp Duty:</strong> {selectedScheme.stampDutyType === 'percentage' ? `${selectedScheme.stampDutyValue}% of Loan` : `Flat ₹${selectedScheme.stampDutyValue}`}.</li>
                  <li><strong>Advance EMI:</strong> {selectedScheme.advanceEmiCount} Month(s) upfront EMI.</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFormulaModal(false)}
              className="w-full py-3 bg-gradient-to-r from-[#024b9c] to-[#003366] text-white rounded-2xl font-bold text-xs shadow-md"
            >
              Close Matrix Rules
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
