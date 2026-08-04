import React from 'react';
import { LayoutDashboard, Calculator, BarChart3, CalendarDays, FileSpreadsheet, Settings, Sun, Moon, ShieldCheck, Sparkles } from 'lucide-react';
import { BajajLogo } from './BajajLogo';

interface HeaderNavbarProps {
  activeTab: 'calculator' | 'comparison' | 'amortization' | 'quotations' | 'admin';
  setActiveTab: (tab: 'calculator' | 'comparison' | 'amortization' | 'quotations' | 'admin') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  savedQuotesCount: number;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  savedQuotesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-blue-100 dark:border-slate-800 transition-colors shadow-3d">
      {/* Top Thin Royal Blue Gradient Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#024b9c] via-blue-500 to-amber-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Official Bajaj Auto Credit Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('calculator')}>
            <BajajLogo size="md" />
            <div className="hidden xl:block border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#024b9c] dark:text-blue-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enterprise Portal</span>
              </span>
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Vehicle Finance Calculator
              </p>
            </div>
          </div>

          {/* Nav Tabs - 3D Glass Pill Navigation */}
          <nav className="flex items-center space-x-1 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                activeTab === 'calculator'
                  ? 'bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-md scale-105'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#024b9c] dark:hover:text-white hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              id="nav-tab-calculator"
              onClick={() => setActiveTab('calculator')}
              className={`hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                activeTab === 'calculator'
                  ? 'bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#024b9c] dark:hover:text-white hover:bg-white/50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>EMI Calculator</span>
            </button>

            <button
              id="nav-tab-comparison"
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                activeTab === 'comparison'
                  ? 'bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-md scale-105'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#024b9c] dark:hover:text-white hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
            </button>

            <button
              id="nav-tab-schedule"
              onClick={() => setActiveTab('amortization')}
              className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                activeTab === 'amortization'
                  ? 'bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-md scale-105'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#024b9c] dark:hover:text-white hover:bg-white/50'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule</span>
            </button>

            <button
              id="nav-tab-quotations"
              onClick={() => setActiveTab('quotations')}
              className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 relative ${
                activeTab === 'quotations'
                  ? 'bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-md scale-105'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#024b9c] dark:hover:text-white hover:bg-white/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Quotes</span>
              {savedQuotesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black shadow-xs">
                  {savedQuotesCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-md scale-105'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#024b9c] dark:hover:text-white hover:bg-white/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </nav>

          {/* Right Actions: Dark Mode & Admin Button */}
          <div className="flex items-center space-x-2">
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-xs"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#024b9c]" />}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className="hidden lg:flex items-center space-x-1.5 px-3.5 py-2 text-xs font-extrabold rounded-2xl bg-gradient-to-r from-[#024b9c] to-[#003366] hover:from-blue-700 hover:to-blue-900 text-white shadow-md transition-all border border-blue-400/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ROI Master</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
