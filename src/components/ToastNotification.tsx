import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-100',
    info: 'border-blue-500/40 bg-blue-50/95 dark:bg-blue-950/90 text-blue-950 dark:text-blue-100',
    warning: 'border-amber-500/40 bg-amber-50/95 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100',
  };

  const type = toast.type || 'success';

  return (
    <div
      className={`pointer-events-auto p-3.5 rounded-2xl border-2 shadow-xl backdrop-blur-md flex items-start justify-between space-x-3 transition-all animate-bounce-short ${borders[type]}`}
    >
      <div className="flex items-start space-x-2.5">
        {icons[type]}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wide">{toast.title}</h4>
          <p className="text-xs opacity-90 mt-0.5 font-medium">{toast.message}</p>
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
