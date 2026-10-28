import { LocalMerchantRepo } from '../../data/repositories/LocalMerchantRepo';
import { LocalRaffleRepo } from '../../data/repositories/LocalRaffleRepo';
import type { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import type { IRaffleRepository } from '../../domain/repositories/IRaffleRepository';

export const merchantRepository: IMerchantRepository = new LocalMerchantRepo();
export const raffleRepository: IRaffleRepository = new LocalRaffleRepo();
