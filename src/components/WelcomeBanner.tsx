import React, { useState } from 'react';
import { ShieldCheck, Zap, Award, Percent, X, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { BajajLogo } from './BajajLogo';

export const WelcomeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#024b9c] via-[#003366] to-[#001f3f] text-white p-5 sm:p-6 shadow-2xl border-2 border-blue-400/30 dark:border-blue-500/20 mb-6 transition-all animate-fade-in">
      {/* Decorative Shimmer & Sparkle Background */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Dismiss Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3.5 right-3.5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-colors"
        title="Dismiss welcome banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Brand & Welcome Pitch */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>OFFICIAL DEALERSHIP PORTAL 2026</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-sky-200 text-[11px] font-bold border border-sky-300/20">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
              <span>Bajaj Auto Credit Ltd.</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-inner hidden sm:block">
              <BajajLogo size="lg" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                Bajaj Auto Credit <span className="text-amber-300">Vehicle Finance Portal</span>
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 font-medium mt-0.5">
                Generate instant quotes, check FOIR & LTV eligibility, compare year-wise ROI slabs, and disburse two-wheeler loans with zero hassle.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Key Advantage Badges */}
        <div className="grid grid-cols-2 gap-2.5 shrink-0">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-amber-300 font-extrabold uppercase block">LTV CAP</span>
              <span className="text-sm font-black text-white">UP TO 90% ORP</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-400 text-slate-950 font-black">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-sky-300 font-extrabold uppercase block">MIN INTEREST</span>
              <span className="text-sm font-black text-white">7.99% p.a.</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-400 text-slate-950 font-black">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-300 font-extrabold uppercase block">APPROVAL</span>
              <span className="text-sm font-black text-white">INSTANT LAN</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-400 text-slate-950 font-black">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-purple-300 font-extrabold uppercase block">TENURES</span>
              <span className="text-sm font-black text-white">12 - 42 MONTHS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
