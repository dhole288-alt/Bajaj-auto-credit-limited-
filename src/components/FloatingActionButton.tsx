import React, { useState } from 'react';
import { Share2, Download, Save, ChevronUp, Sparkles, X, Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onShareWhatsApp: () => void;
  onDownloadPDF: () => void;
  onSaveQuotation: () => void;
  isSaved?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onShareWhatsApp,
  onDownloadPDF,
  onSaveQuotation,
  isSaved = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-5 z-40 flex flex-col items-end space-y-2">
      {/* Expanded Quick Actions */}
      {isOpen && (
        <div className="flex flex-col space-y-2 items-end mb-2 transition-all animate-bounce-short">
          <button
            onClick={() => {
              onShareWhatsApp();
              setIsOpen(false);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xl transition-transform hover:scale-105 border border-emerald-400/30"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Share</span>
          </button>

          <button
            onClick={() => {
              onDownloadPDF();
              setIsOpen(false);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xl transition-transform hover:scale-105 border border-blue-400/30"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Quote</span>
          </button>

          <button
            onClick={() => {
              if (!isSaved) onSaveQuotation();
              setIsOpen(false);
            }}
            disabled={isSaved}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-xl transition-transform hover:scale-105 border ${
              isSaved
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-300'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Quote Saved' : 'Save Quote'}</span>
          </button>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-slate-800 text-white font-bold text-xs shadow-xl hover:bg-slate-700"
          >
            <ChevronUp className="w-4 h-4" />
            <span>Top</span>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#024b9c] to-[#003366] text-white shadow-2xl flex items-center justify-center font-black transition-all hover:scale-110 active:scale-95 border-2 border-blue-400/40 glow-blue group"
        title="Quick Actions Menu"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Sparkles className="w-6 h-6 text-amber-300 group-hover:rotate-12 transition-transform" />
        )}
      </button>
    </div>
  );
};
