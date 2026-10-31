import type { Merchant } from '../../domain/models/Merchant';
import type { RaffleStats } from '../../domain/models/RaffleStats';
import { formatMoney } from './currencyFormatter';

export type ExportFormat = 'styled-xls' | 'clean-csv';

export function exportMerchantsToExcel(
  merchants: Merchant[],
  stats: RaffleStats | null,
  fileNamePrefix: string = 'reporte-patrocinios-cine',
  format: ExportFormat = 'styled-xls'
): void {
  const timestamp = new Date().toISOString().slice(0, 10);
  const totalTickets = merchants.reduce((sum, m) => sum + m.ticketsCount, 0);

  const getStatusText = (status: string) => {
    if (status === 'paid') return 'PAGADO';
    if (status === 'pending') return 'ABONO';
    return 'DEUDOR';
  };

  if (format === 'clean-csv') {
    const escapeCSV = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;

    const headers = [
      'Establecimiento',
      'Moneda',
      'Teléfono',
      'Boletos Sorteo',
      'Total a Pagar',
      'Abonado',
      'Saldo Deudor',
      'Estado',
    ];

    const dataRows = merchants.map((m) => {
      const currency = m.currency || 'COP';
      const remaining = Math.max(0, m.totalFee - m.amountPaid);
      const phoneCell = `="${m.phone.trim()}"`;
      return [
        escapeCSV(m.name),
        escapeCSV(currency),
        phoneCell,
        m.ticketsCount,
        escapeCSV(formatMoney(m.totalFee, currency)),
        escapeCSV(formatMoney(m.amountPaid, currency)),
        escapeCSV(formatMoney(remaining, currency)),
        escapeCSV(getStatusText(m.paymentStatus)),
      ].join(';');
    });

    const csvContent = '\uFEFFsep=;\n' + [headers.join(';'), ...dataRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileNamePrefix}_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  // Formato HTML Excel (.xls)
  const rowsHtml = merchants.map((m) => {
    const currency = m.currency || 'COP';
    const remaining = Math.max(0, m.totalFee - m.amountPaid);
    const statusBg =
      m.paymentStatus === 'paid'
        ? '#d1fae5; color: #065f46; font-weight: bold;'
        : m.paymentStatus === 'pending'
        ? '#fef3c7; color: #78350f; font-weight: bold;'
        : '#fee2e2; color: #991b1b; font-weight: bold;';

    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">${m.name}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${currency}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${m.address}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; mso-number-format:'\\@';">${m.phone}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${m.ticketsCount}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">${formatMoney(m.totalFee, currency)}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #059669; font-weight: bold;">${formatMoney(m.amountPaid, currency)}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: ${remaining > 0 ? '#dc2626' : '#64748b'}; font-weight: bold;">${formatMoney(remaining, currency)}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; background-color: ${statusBg}">${getStatusText(m.paymentStatus)}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Patrocinios y Publicidad</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body style="font-family: Arial, sans-serif; font-size: 11px;">
        <h2 style="color: #1e293b; margin-bottom: 4px;">${stats?.campaignName || 'Publicidad de Cine & Sorteo a la Playa 2026'}</h2>
        <p style="color: #64748b; margin-top: 0;">Reporte de cobranza emitido el ${timestamp} | Boletos Colocados: ${totalTickets}</p>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background-color: #4f46e5; color: #ffffff; text-align: left; font-size: 11px;">
              <th style="padding: 10px 8px; border: 1px solid #4338ca;">Establecimiento</th>
              <th style="padding: 10px 8px; border: 1px solid #4338ca; text-align: center;">Moneda</th>
              <th style="padding: 10px 8px; border: 1px solid #4338ca;">Dirección</th>
              <th style="padding: 10px 8px; border: 1px solid #4338ca;">Teléfono</th>
              <th style="padding: 10px 8px; border: 1px solid #4338ca; text-align: center;">Boletos</th>
              <th style="padding: 10px 8px; border: 1px solid #4338ca; text-align: right;">Total Pactado</th>
              <th style="padding: 10px 8px; border: 1px solid #4338ca; text-align: right;">Abonado</th>
              <th style="padding: 10px 8px; border: 1px solid #4338ca; text-align: right;">Saldo Deuda</th>
              <th style="padding: 10px 8px; border: 1px solid #4338ca; text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileNamePrefix}_${timestamp}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
