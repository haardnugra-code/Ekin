import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const border = type === 'success' ? 'border-emerald-200 text-emerald-950 bg-emerald-50/90' : type === 'error' ? 'border-rose-200 text-rose-950 bg-rose-50/90' : 'border-blue-200 text-blue-950 bg-blue-50/90';
  const iconColor = type === 'success' ? 'text-emerald-600' : type === 'error' ? 'text-rose-600' : 'text-blue-600';
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertTriangle : Info;

  return (
    <div className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md transition-all duration-300 animate-slide-in ${border}`}>
      <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
      <span className="tracking-tight">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-1 text-gray-500">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
