import type { BankFormat } from './types';

export function detectFormat(content: string): BankFormat | null {
  const firstLine = content.split('\n')[0].trim();

  // Swedbank: first line starts with "Sąskaitos" or contains semicolons with account number pattern
  if (firstLine.startsWith('"Sąskaitos') || firstLine.startsWith('"LT')) {
    return 'swedbank';
  }

  // Revolut: header starts with "Type,Product,Started Date"
  if (firstLine.startsWith('Type,Product,Started Date')) {
    return 'revolut';
  }

  // N26: header starts with "Date","Payee" or "Date,Payee"
  if (firstLine.includes('"Date"') && firstLine.includes('"Payee"')) {
    return 'n26';
  }

  // Citadele: first line starts with "Citadele"
  if (firstLine.startsWith('Citadele')) {
    return 'citadele';
  }

  return null;
}
