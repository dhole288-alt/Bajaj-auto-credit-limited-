import React from 'react';
import { ShieldCheck, PhoneCall, Lock, HelpCircle } from 'lucide-react';
import { BajajLogo } from './BajajLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <BajajLogo size="lg" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Bajaj Auto Credit Limited • Premier Two-Wheeler & Auto Finance Solutions. Real-time scheme rate matrix & LAN generation engine.
            </p>
            <div className="flex items-center space-x-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>256-bit Encrypted Banking Portal</span>
            </div>
          </div>

          {/* Col 2: Key Features */}
          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold uppercase text-[#024b9c] dark:text-blue-400 tracking-wider">PORTAL FEATURES</h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <li>• Year-Wise ROI Slabs (12M - 42M)</li>
              <li>• SFDC & Showroom ORP LTV Cap</li>
              <li>• FOIR Loan Eligibility Estimator</li>
              <li>• Instant WhatsApp Quote Sharing</li>
              <li>• Official PDF Quotation Generator</li>
            </ul>
          </div>

          {/* Col 3: Support & Contact */}
          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold uppercase text-[#024b9c] dark:text-blue-400 tracking-wider">DEALERSHIP SUPPORT</h4>
            <div className="space-y-2 text-slate-600 dark:text-slate-400 font-medium">
              <p className="flex items-center space-x-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                <span>Toll-Free Helpline: 1800-102-0000</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                <span>Executive Login & Authorization</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                <span>Scheme Rate Excel Upload Master</span>
              </p>
            </div>
          </div>

          {/* Col 4: Corporate Disclaimer */}
          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold uppercase text-[#024b9c] dark:text-blue-400 tracking-wider">LEGAL DISCLAIMER</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Calculations shown are indicative for Bajaj Auto Credit Limited dealership estimation. Final interest rates, LTV approval, and processing fees are subject to credit bureau verification and LAN sanction rules.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <p>© 2026 Bajaj Auto Credit Limited. All Rights Reserved. Professional Finance Calculator.</p>
          <p className="font-mono text-[11px] text-slate-400">Portal Build v4.8 • Enterprise Edition</p>
        </div>
      </div>
    </footer>
  );
};
