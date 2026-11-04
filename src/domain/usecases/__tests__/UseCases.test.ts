import { describe, it, expect, vi } from 'vitest';
import { RegisterMerchantUseCase } from '../RegisterMerchantUseCase';
import { UpdateMerchantUseCase } from '../UpdateMerchantUseCase';
import { DeleteMerchantUseCase } from '../DeleteMerchantUseCase';
import { ClearAllMerchantsUseCase } from '../ClearAllMerchantsUseCase';
import { AddTicketsUseCase } from '../AddTicketsUseCase';
import type { IMerchantRepository } from '../../repositories/IMerchantRepository';
import type { IRaffleRepository } from '../../repositories/IRaffleRepository';
import type { Merchant } from '../../models/Merchant';

describe('Domain Use Cases - Ticket Synchronization', () => {
  const mockMerchant: Merchant = {
    id: 'm100',
    name: 'Panadería Central',
    address: 'Av. 1',
    phone: '3001234567',
    currency: 'COP',
    ticketsCount: 5,
    ticketPrice: 50000,
    totalFee: 250000,
    amountPaid: 0,
    paymentStatus: 'unpaid',
    paymentHistory: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const createMockMerchantRepo = (): IMerchantRepository => ({
    getAll: vi.fn(),
    getById: vi.fn().mockResolvedValue(mockMerchant),
    create: vi.fn().mockResolvedValue(mockMerchant),
    update: vi.fn(),
    markAsPaid: vi.fn(),
    addPayment: vi.fn(),
    addTickets: vi.fn(),
    delete: vi.fn(),
    deleteAll: vi.fn(),
  });

  const createMockRaffleRepo = (): IRaffleRepository => ({
    getStats: vi.fn(),
    updateStats: vi.fn(),
    adjustTicketsSold: vi.fn(),
    recalculateSoldFromMerchants: vi.fn(),
  });

  it('RegisterMerchantUseCase debe registrar el comercio y sumar los boletos al sorteo', async () => {
    const merchantRepo = createMockMerchantRepo();
    const raffleRepo = createMockRaffleRepo();
    const useCase = new RegisterMerchantUseCase(merchantRepo, raffleRepo);

    const result = await useCase.execute({
      name: 'Panadería Central',
      address: 'Av. 1',
      phone: '3001234567',
      currency: 'COP',
      ticketsCount: 5,
      ticketPrice: 50000,
      amountPaid: 0,
    });

    expect(merchantRepo.create).toHaveBeenCalledOnce();
    expect(raffleRepo.adjustTicketsSold).toHaveBeenCalledWith(5);
    expect(result.id).toBe('m100');
  });

  it('UpdateMerchantUseCase debe sincronizar la diferencia de boletos con la rifa', async () => {
    const merchantRepo = createMockMerchantRepo();
    const raffleRepo = createMockRaffleRepo();
    const updatedMerchant = { ...mockMerchant, ticketsCount: 8 };
    (merchantRepo.update as any).mockResolvedValue(updatedMerchant);

    const useCase = new UpdateMerchantUseCase(merchantRepo, raffleRepo);
    await useCase.execute('m100', { ticketsCount: 8 });

    // La diferencia es 8 - 5 = +3
    expect(raffleRepo.adjustTicketsSold).toHaveBeenCalledWith(3);
  });

  it('DeleteMerchantUseCase debe eliminar el comercio y restar sus boletos de la rifa', async () => {
    const merchantRepo = createMockMerchantRepo();
    const raffleRepo = createMockRaffleRepo();

    const useCase = new DeleteMerchantUseCase(merchantRepo, raffleRepo);
    await useCase.execute('m100');

    expect(merchantRepo.delete).toHaveBeenCalledWith('m100');
    expect(raffleRepo.adjustTicketsSold).toHaveBeenCalledWith(-5);
  });

  it('AddTicketsUseCase debe llamar a addTickets y sumar el delta a la rifa', async () => {
    const merchantRepo = createMockMerchantRepo();
    const raffleRepo = createMockRaffleRepo();
    (merchantRepo.addTickets as any).mockResolvedValue({ ...mockMerchant, ticketsCount: 7 });

    const useCase = new AddTicketsUseCase(merchantRepo, raffleRepo);
    await useCase.execute('m100', 2);

    expect(merchantRepo.addTickets).toHaveBeenCalledWith('m100', 2);
    expect(raffleRepo.adjustTicketsSold).toHaveBeenCalledWith(2);
  });

  it('ClearAllMerchantsUseCase debe vaciar los comercios y reiniciar boletos vendidos a 0', async () => {
    const merchantRepo = createMockMerchantRepo();
    const raffleRepo = createMockRaffleRepo();
    (raffleRepo.getStats as any).mockResolvedValue({ totalTickets: 1000, ticketsSold: 50 });

    const useCase = new ClearAllMerchantsUseCase(merchantRepo, raffleRepo);
    await useCase.execute();

    expect(merchantRepo.deleteAll).toHaveBeenCalled();
    expect(raffleRepo.updateStats).toHaveBeenCalledWith({ ticketsSold: 0 });
  });
});
