import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../../../core/config/dbClient';

// Mockeamos la capa de bajo nivel de db.raffleStats para pruebas unitarias sin indexedDB nativo
vi.mock('../../../core/config/dbClient', () => {
  let mockStore: Record<string, any> = {};
  return {
    CAMPAIGN_ID: 'main-campaign',
    db: {
      raffleStats: {
        get: vi.fn(async (id: string) => mockStore[id] || undefined),
        put: vi.fn(async (item: any) => {
          mockStore[item.id] = item;
          return item.id;
        }),
        clear: vi.fn(async () => {
          mockStore = {};
        }),
      },
    },
  };
});

import { LocalRaffleRepo, DEFAULT_RAFFLE_STATS, CAMPAIGN_ID } from '../LocalRaffleRepo';

describe('LocalRaffleRepo Auto-recovery and Default Fallbacks', () => {
  const repo = new LocalRaffleRepo();

  beforeEach(async () => {
    await db.raffleStats.clear();
  });

  it('debe auto-recuperar y retornar DEFAULT_RAFFLE_STATS si la base de datos está vacía sin lanzar error', async () => {
    // Al no haber registro previo, no debe lanzar excepción sino persistir y retornar defaults
    const stats = await repo.getStats();
    expect(stats).toBeDefined();
    expect(stats.id).toBe(CAMPAIGN_ID);
    expect(stats.totalTickets).toBe(DEFAULT_RAFFLE_STATS.totalTickets);
    expect(stats.campaignName).toBe(DEFAULT_RAFFLE_STATS.campaignName);

    // Debe haberse persistido
    const persisted = await db.raffleStats.get(CAMPAIGN_ID);
    expect(persisted).toBeDefined();
    expect(persisted?.totalTickets).toBe(DEFAULT_RAFFLE_STATS.totalTickets);
  });

  it('debe permitir actualizar estadísticas después de la auto-recuperación', async () => {
    const updated = await repo.updateStats({ campaignName: 'Nueva Campaña 2027', totalTickets: 2000 });
    expect(updated.campaignName).toBe('Nueva Campaña 2027');
    expect(updated.totalTickets).toBe(2000);

    const fetched = await repo.getStats();
    expect(fetched.campaignName).toBe('Nueva Campaña 2027');
    expect(fetched.totalTickets).toBe(2000);
  });

  it('debe retornar DEFAULT_RAFFLE_STATS si la consulta arroja una excepción', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (db.raffleStats.get as any).mockRejectedValueOnce(new Error('IndexedDB corrupta'));
    
    const stats = await repo.getStats();
    expect(stats).toEqual(DEFAULT_RAFFLE_STATS);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
