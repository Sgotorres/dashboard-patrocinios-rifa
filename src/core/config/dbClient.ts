import Dexie, { type Table } from 'dexie';
import type { Merchant } from '../../domain/models/Merchant';
import type { RaffleStats } from '../../domain/models/RaffleStats';

export class AppDatabase extends Dexie {
  merchants!: Table<Merchant, string>;
  raffleStats!: Table<RaffleStats, string>;

  constructor() {
    super('RaffleSponsorsDB_v2');
    this.version(1).stores({
      merchants: 'id, name, paymentStatus, createdAt, ticketsCount',
      raffleStats: 'id',
    });
  }
}

export const db = new AppDatabase();

const initialMerchants: Merchant[] = [
  {
    id: 'm1',
    name: 'Panadería La Esperanza',
    address: 'Av. Bolívar #142, Centro',
    phone: '+58 412 1234567',
    socialUrl: '@panaderiaesperanza',
    logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
    ticketsCount: 5,
    ticketPrice: 10,
    totalFee: 50,
    amountPaid: 50,
    paymentStatus: 'paid',
    paymentHistory: [
      { id: 'p1-1', amount: 25, date: new Date(Date.now() - 3600000 * 48).toISOString(), note: 'Abono inicial en efectivo' },
      { id: 'p1-2', amount: 25, date: new Date(Date.now() - 3600000 * 24).toISOString(), note: 'Cancelación total pago móvil' },
    ],
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'm2',
    name: 'Farmacia San Rafael',
    address: 'Calle Comercio #88',
    phone: '+58 424 9876543',
    socialUrl: 'instagram.com/farmaciasanrafael',
    logoUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=150&auto=format&fit=crop&q=80',
    ticketsCount: 6,
    ticketPrice: 10,
    totalFee: 60,
    amountPaid: 30,
    paymentStatus: 'pending',
    paymentHistory: [
      { id: 'p2-1', amount: 30, date: new Date(Date.now() - 3600000 * 18).toISOString(), note: 'Abono 50%' },
    ],
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'm3',
    name: 'Ferretería El Tornillo',
    address: 'Carrera 5 con esq. 10',
    phone: '+58 414 5551234',
    socialUrl: '@ferreteriaeltornillo',
    logoUrl: '',
    ticketsCount: 5,
    ticketPrice: 10,
    totalFee: 50,
    amountPaid: 0,
    paymentStatus: 'unpaid',
    paymentHistory: [],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'm4',
    name: 'Automotriz Los Andes',
    address: 'Zona Industrial Lote 14',
    phone: '+58 416 3338899',
    socialUrl: 'automotrizlosandes.com',
    logoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=150&auto=format&fit=crop&q=80',
    ticketsCount: 10,
    ticketPrice: 10,
    totalFee: 100,
    amountPaid: 40,
    paymentStatus: 'pending',
    paymentHistory: [
      { id: 'p4-1', amount: 40, date: new Date(Date.now() - 3600000 * 8).toISOString(), note: 'Primer abono transferencia' },
    ],
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'm5',
    name: 'Supermercado El Sol',
    address: 'Av. Las Delicias CC El Parque',
    phone: '+58 424 7772211',
    socialUrl: '@elsolsupermarket',
    logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
    ticketsCount: 15,
    ticketPrice: 10,
    totalFee: 150,
    amountPaid: 150,
    paymentStatus: 'paid',
    paymentHistory: [
      { id: 'p5-1', amount: 150, date: new Date(Date.now() - 3600000 * 4).toISOString(), note: 'Pago de contado patrocinador oro' },
    ],
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'm6',
    name: 'Restaurante Fogón Criollo',
    address: 'Calle Real #25',
    phone: '+58 412 8884433',
    socialUrl: '@elfogoncriollo',
    logoUrl: '',
    ticketsCount: 8,
    ticketPrice: 10,
    totalFee: 80,
    amountPaid: 0,
    paymentStatus: 'unpaid',
    paymentHistory: [],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export async function ensureSeedData(): Promise<void> {
  const existingStats = await db.raffleStats.get('main-campaign');
  if (!existingStats) {
    const totalSoldInitial = initialMerchants.reduce((sum, m) => sum + m.ticketsCount, 0);
    await db.raffleStats.put({
      id: 'main-campaign',
      campaignName: 'Gran Rifa Pro-Fondos & Patrocinios 2026',
      totalTickets: 500,
      ticketsSold: totalSoldInitial,
      ticketPrice: 10,
      targetRevenue: 5000,
    });
  }

  const merchantsCount = await db.merchants.count();
  if (merchantsCount === 0) {
    await db.merchants.bulkAdd(initialMerchants);
  }
}
