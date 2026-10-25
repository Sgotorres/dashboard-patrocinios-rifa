import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface Props {
  onAdjust: (delta: number) => void;
  disabled?: boolean;
}

export const TicketQuickActions: React.FC<Props> = ({ onAdjust, disabled }) => {
  return (
    <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
      <button
        onClick={() => onAdjust(-5)}
        disabled={disabled}
        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-40"
        title="Restar 5 tickets"
      >
        -5
      </button>
      <button
        onClick={() => onAdjust(-1)}
        disabled={disabled}
        className="p-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-40"
        title="Restar 1 ticket"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="text-xs text-slate-400 font-medium px-1">Rápido</span>
      <button
        onClick={() => onAdjust(1)}
        disabled={disabled}
        className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 shadow-sm"
        title="Sumar 1 ticket"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onAdjust(5)}
        disabled={disabled}
        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 shadow-sm"
        title="Sumar 5 tickets"
      >
        +5
      </button>
    </div>
  );
};
