/**
 * Utilidades de normalización de texto y búsqueda insensible a tildes y formato
 */

export function normalizeSearch(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

export function isPhoneDuplicate(phoneA: string, phoneB: string): boolean {
  const a = cleanPhoneNumber(phoneA);
  const b = cleanPhoneNumber(phoneB);
  if (!a || !b) return false;
  // Comparar los últimos 7-8 dígitos para evitar discrepancias de código de país (+58 vs 0412)
  const minLen = Math.min(a.length, b.length, 7);
  return a.slice(-minLen) === b.slice(-minLen);
}
