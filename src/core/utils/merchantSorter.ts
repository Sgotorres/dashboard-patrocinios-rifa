import type { Merchant } from '../../domain/models/Merchant';

export type SortOption = 'recent' | 'name' | 'debt-desc' | 'paid-desc' | 'tickets-desc';

/**
 * Ordena de manera inmutable una lista de comerciantes según la opción seleccionada.
 */
export function sortMerchants(list: Merchant[], sortBy: SortOption): Merchant[] {
  return [...list].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      case 'debt-desc': {
        const debtA = Math.max(0, a.totalFee - a.amountPaid);
        const debtB = Math.max(0, b.totalFee - b.amountPaid);
        return debtB - debtA;
      }
      case 'paid-desc':
        return b.amountPaid - a.amountPaid;
      case 'tickets-desc':
        return b.ticketsCount - a.ticketsCount;
      case 'recent':
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
}
