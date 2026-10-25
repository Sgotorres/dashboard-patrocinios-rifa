import React from 'react';
import type { Merchant } from '../../../domain/models/Merchant';
import { MerchantCard } from './MerchantCard';
import { Store } from 'lucide-react';

interface Props {
  merchants: Merchant[];
  loading: boolean;
  onEdit: (merchant: Merchant) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onOpenQuickAbono: (merchant: Merchant) => void;
  onOpenCreate: () => void;
}

export const MerchantGrid: React.FC<Props> = ({
  merchants,
  loading,
  onEdit,
  onDelete,
  onMarkAsPaid,
  onOpenQuickAbono,
  onOpenCreate,
}) => {
  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p className="text-sm font-medium animate-pulse">Cargando comercios...</p>
      </div>
    );
  }

  if (merchants.length === 0) {
    return (
      <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Store className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-white mb-1">No hay comercios registrados</h4>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          No se encontraron registros con los filtros actuales. Puedes registrar un nuevo patrocinador.
        </p>
        <button
          onClick={onOpenCreate}
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          Registrar Primer Comercio
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {merchants.map((merchant) => (
        <MerchantCard
          key={merchant.id}
          merchant={merchant}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkAsPaid={onMarkAsPaid}
          onOpenQuickAbono={onOpenQuickAbono}
        />
      ))}
    </div>
  );
};
