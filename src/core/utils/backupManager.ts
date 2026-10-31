import { db } from '../config/dbClient';
import type { Merchant } from '../../domain/models/Merchant';
import type { RaffleStats } from '../../domain/models/RaffleStats';

export interface BackupData {
  version: number;
  exportedAt: string;
  merchants: Merchant[];
  raffleStats: RaffleStats[];
}

export async function exportDatabaseToJSON(): Promise<void> {
  const merchants = await db.merchants.toArray();
  const raffleStats = await db.raffleStats.toArray();

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    merchants,
    raffleStats,
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `respaldo_patrocinios_${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importDatabaseFromJSON(file: File): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const text = await file.text();
    const data: Partial<BackupData> = JSON.parse(text);

    if (!data.merchants || !Array.isArray(data.merchants)) {
      throw new Error('El archivo no contiene un formato de respaldo válido de patrocinios.');
    }

    // Usar transacción para asegurar atomicidad
    await db.transaction('rw', db.merchants, db.raffleStats, async () => {
      await db.merchants.clear();
      if (data.merchants && data.merchants.length > 0) {
        await db.merchants.bulkAdd(data.merchants);
      }

      if (data.raffleStats && Array.isArray(data.raffleStats) && data.raffleStats.length > 0) {
        await db.raffleStats.clear();
        await db.raffleStats.bulkAdd(data.raffleStats);
      }
    });

    return { success: true, count: data.merchants.length };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar el archivo de respaldo.';
    return { success: false, count: 0, error: message };
  }
}
