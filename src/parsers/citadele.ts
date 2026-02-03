import Papa from 'papaparse';
import type { Statement, Transaction } from './types';

function extractPayee(paymentRef: string): string {
  const parts = paymentRef.split(/[\s.]+/);
  return parts.slice(0, Math.max(0, parts.length - 3)).join(' ');
}

function rowToTransaction(row: string[]): Transaction {
  const [date, trxId, paymentRef, amount] = row;
  const type = amount.startsWith('-') ? 'debit' : 'credit';

  return {
    type,
    date: String(date),
    id: trxId,
    amount,
    payee: extractPayee(paymentRef),
    memo: paymentRef,
    orig: paymentRef,
  };
}

export function parseStmt(csv: string): Statement {
  const result = Papa.parse<string[]>(csv, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = result.data;
  // Skip first row ("Citadele,,,,,")
  const transactions = rows.slice(1);
  const from = transactions[0]?.[0] ?? '';
  const to = transactions[transactions.length - 1]?.[0] ?? '';

  return {
    from,
    to,
    trx: transactions.map(rowToTransaction),
  };
}
