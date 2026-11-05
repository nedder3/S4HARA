import React from 'react';
import { useSAP } from '../../context/SAPContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSAP();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        let borderClass = 'border-blue-500 bg-white text-slate-800';
        let icon = <Info className="w-5 h-5 text-blue-600 shrink-0" strokeWidth={1.8} />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-600 bg-emerald-50 text-emerald-950';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" strokeWidth={1.8} />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500 bg-amber-50 text-amber-950';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" strokeWidth={1.8} />;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-600 bg-rose-50 text-rose-950';
          icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" strokeWidth={1.8} />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all animate-in slide-in-from-bottom-2 duration-200 ${borderClass}`}
            role="alert"
          >
            {icon}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
                <span className="text-[11px] opacity-75 tabular-nums font-mono">{toast.timestamp}</span>
              </div>
              <p className="text-xs mt-0.5 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
