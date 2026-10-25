import Dexie, { type Table } from 'dexie';
import type { Merchant } from '../../domain/models/Merchant';
import type { RaffleStats } from '../../domain/models/RaffleStats';

export class AppDatabase extends Dexie {
  merchants!: Table<Merchant, string>;
  raffleStats!: Table<RaffleStats, string>;

  constructor() {
    super('RaffleSponsorsDB');
    this.version(1).stores({
      merchants: 'id, name, paymentStatus, createdAt',
      raffleStats: 'id',
    });
  }
}

export const db = new AppDatabase();

const initialMerchants: Merchant[] = [
  {
    id: 'm1',
    name: 'Panadería La Esperanza',
    address: 'Av. Bolívar #142',
    phone: '+58 412 1234567',
    paymentStatus: 'paid',
    totalFee: 50,
    amountPaid: 50,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'm2',
    name: 'Farmacia San Rafael',
    address: 'Calle Comercio #88',
    phone: '+58 424 9876543',
    paymentStatus: 'pending',
    totalFee: 60,
    amountPaid: 25,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'm3',
    name: 'Ferretería El Tornillo',
    address: 'Carrera 5 con esq. 10',
    phone: '+58 414 5551234',
    paymentStatus: 'unpaid',
    totalFee: 50,
    amountPaid: 0,
    createdAt: new Date().toISOString(),
  },
];

export async function ensureSeedData(): Promise<void> {
  const existingStats = await db.raffleStats.get('main-campaign');
  if (!existingStats) {
    await db.raffleStats.put({
      id: 'main-campaign',
      campaignName: 'Gran Rifa y Patrocinios 2026',
      totalTickets: 500,
      ticketsSold: 55,
      defaultSponsorFee: 50,
    });
  }

  const merchantsCount = await db.merchants.count();
  if (merchantsCount === 0) {
    await db.merchants.bulkAdd(initialMerchants);
  }
}
