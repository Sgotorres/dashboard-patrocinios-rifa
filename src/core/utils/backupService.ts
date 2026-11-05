import { db } from '../config/dbClient';

export interface BackupData {
  version: number;
  exportedAt: string;
  campaignStats: unknown[];
  merchants: unknown[];
}

export async function exportDatabaseBackup(): Promise<void> {
  const merchants = await db.merchants.toArray();
  const raffleStats = await db.raffleStats.toArray();

  const backup: BackupData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    campaignStats: raffleStats,
    merchants,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `backup-rifa-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importDatabaseBackup(file: File): Promise<{ count: number }> {
  const text = await file.text();
  const data = JSON.parse(text) as BackupData;

  if (!data || !Array.isArray(data.merchants)) {
    throw new Error('Archivo de respaldo inválido o corrupto.');
  }

  await db.transaction('rw', db.merchants, db.raffleStats, async () => {
    await db.merchants.clear();
    // @ts-expect-error bulkAdd accepts untyped data if verified
    await db.merchants.bulkAdd(data.merchants);

    if (Array.isArray(data.campaignStats) && data.campaignStats.length > 0) {
      await db.raffleStats.clear();
      // @ts-expect-error bulkAdd accepts untyped data
      await db.raffleStats.bulkAdd(data.campaignStats);
    }
  });

  return { count: data.merchants.length };
}
