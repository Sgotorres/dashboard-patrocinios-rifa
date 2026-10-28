import type { Merchant } from '../../domain/models/Merchant';
import type { RaffleStats } from '../../domain/models/RaffleStats';

export type ExportFormat = 'styled-xls' | 'clean-csv';

export function exportMerchantsToExcel(
  merchants: Merchant[],
  stats: RaffleStats | null,
  fileNamePrefix: string = 'reporte-cobranza',
  format: ExportFormat = 'styled-xls'
): void {
  const timestamp = new Date().toISOString().slice(0, 10);
  const totalTickets = merchants.reduce((sum, m) => sum + m.ticketsCount, 0);
  const totalFacturado = merchants.reduce((sum, m) => sum + m.totalFee, 0);
  const totalAbonado = merchants.reduce((sum, m) => sum + m.amountPaid, 0);
  const totalDeuda = merchants.reduce((sum, m) => sum + Math.max(0, m.totalFee - m.amountPaid), 0);

  const getStatusText = (status: string) => {
    if (status === 'paid') return 'PAGADO';
    if (status === 'pending') return 'ABONO';
    return 'DEUDOR';
  };

  if (format === 'clean-csv') {
    // Ultra-clean CSV with exact 7 columns per row and sep=; for Spanish Windows Excel
    const escapeCSV = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;

    const headers = [
      'Comercio',
      'Teléfono',
      'Tickets',
      'Total a Pagar ($)',
      'Abonado ($)',
      'Saldo Deudor ($)',
      'Estado',
    ];

    const dataRows = merchants.map((m) => {
      const remaining = Math.max(0, m.totalFee - m.amountPaid);
      // Phone wrapped as ="phone" so Excel preserves the + without scientific notation
      const phoneCell = `="${m.phone.trim()}"`;
      return [
        escapeCSV(m.name),
        phoneCell,
        m.ticketsCount,
        m.totalFee.toFixed(2),
        m.amountPaid.toFixed(2),
        remaining.toFixed(2),
        escapeCSV(getStatusText(m.paymentStatus)),
      ].join(';');
    });

    const totalRow = [
      escapeCSV('TOTAL GENERAL'),
      '""',
      totalTickets,
      totalFacturado.toFixed(2),
      totalAbonado.toFixed(2),
      totalDeuda.toFixed(2),
      escapeCSV(totalDeuda > 0 ? 'CON SALDO PENDIENTE' : 'SOLVENTE'),
    ].join(';');

    const csvContent =
      '\uFEFF' + // UTF-8 BOM
      'sep=;\r\n' +
      headers.join(';') +
      '\r\n' +
      dataRows.join('\r\n') +
      '\r\n' +
      totalRow;

    downloadBlob(csvContent, 'text/csv;charset=utf-8;', `${fileNamePrefix}-${timestamp}.csv`);
    return;
  }

  // Styled Excel Table (.xls) with custom colors for Verde, Amarillo y Rojo
  const rowsHtml = merchants
    .map((m) => {
      const remaining = Math.max(0, m.totalFee - m.amountPaid);
      const status = m.paymentStatus;
      const statusClass = status === 'paid' ? 'paid' : status === 'pending' ? 'pending' : 'unpaid';

      return `
      <tr>
        <td style="font-weight: bold; color: #1e293b;">${escapeHtml(m.name)}</td>
        <td style="mso-number-format:'\\@'; text-align: center;">${escapeHtml(m.phone)}</td>
        <td style="text-align: center; font-weight: bold;">${m.ticketsCount}</td>
        <td style="text-align: right;">$${m.totalFee.toFixed(2)}</td>
        <td style="text-align: right; color: #16a34a; font-weight: bold;">$${m.amountPaid.toFixed(2)}</td>
        <td style="text-align: right; color: ${remaining > 0 ? '#dc2626' : '#64748b'}; font-weight: bold;">$${remaining.toFixed(2)}</td>
        <td class="${statusClass}">${getStatusText(m.paymentStatus)}</td>
      </tr>`;
    })
    .join('');

  const xlsHtml = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <style>
      body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; }
      table { border-collapse: collapse; width: 100%; margin-top: 10px; }
      th { background-color: #4338ca; color: #ffffff; padding: 10px 14px; border: 1px solid #3730a3; font-size: 11pt; font-weight: bold; text-align: left; }
      td { padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 10pt; }
      .paid { background-color: #dcfce7; color: #15803d; font-weight: bold; text-align: center; border: 1px solid #86efac; }
      .pending { background-color: #fef3c7; color: #b45309; font-weight: bold; text-align: center; border: 1px solid #fcd34d; }
      .unpaid { background-color: #fee2e2; color: #b91c1c; font-weight: bold; text-align: center; border: 1px solid #fca5a5; }
      .total-row td { background-color: #f8fafc; font-weight: bold; border-top: 2px solid #4338ca; font-size: 11pt; }
    </style>
  </head>
  <body>
    <h2 style="color: #1e1b4b; margin: 0; font-family: 'Segoe UI', Arial;">Control de Cobranza & Patrocinios</h2>
    <p style="color: #64748b; font-size: 10pt; margin: 4px 0 12px 0;">Campaña: ${escapeHtml(stats?.campaignName || 'Gran Rifa')} | Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
    <table>
      <thead>
        <tr>
          <th>Comercio</th>
          <th style="text-align: center;">Teléfono</th>
          <th style="text-align: center;">Tickets</th>
          <th style="text-align: right;">Total a Pagar</th>
          <th style="text-align: right;">Abonado</th>
          <th style="text-align: right;">Saldo Deudor</th>
          <th style="text-align: center;">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr class="total-row">
          <td>TOTAL GENERAL (${merchants.length} Comercios)</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">${totalTickets} boletos</td>
          <td style="text-align: right;">$${totalFacturado.toFixed(2)}</td>
          <td style="text-align: right; color: #16a34a;">$${totalAbonado.toFixed(2)}</td>
          <td style="text-align: right; color: ${totalDeuda > 0 ? '#dc2626' : '#1e293b'};">$${totalDeuda.toFixed(2)}</td>
          <td style="text-align: center;">${totalDeuda > 0 ? 'PENDIENTE' : 'SOLVENTE'}</td>
        </tr>
      </tbody>
    </table>
  </body>
  </html>`;

  downloadBlob(xlsHtml, 'application/vnd.ms-excel;charset=utf-8;', `${fileNamePrefix}-${timestamp}.xls`);
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadBlob(content: string, mimeType: string, filename: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
