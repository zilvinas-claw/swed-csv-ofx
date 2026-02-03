import Papa from 'papaparse';
import type { Statement, Transaction } from './types';

function rowToTransaction(row: string[]): Transaction {
  const [date, payee, , , paymentRef, , amount] = row;
  const type = amount.startsWith('-') ? 'debit' : 'credit';
  const id = `${date}${payee}${amount}`
    .replace(/,/g, '')
    .replace(/\./g, '')
    .replace(/-/g, '')
    .replace(/ /g, '');

  return {
    type,
    date,
    id,
    amount,
    payee,
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
  // Skip header row
  const transactions = rows.slice(1);
  const from = transactions[0]?.[0] ?? '';
  const to = transactions[transactions.length - 1]?.[0] ?? '';

  return {
    from,
    to,
    trx: transactions.map(rowToTransaction),
  };
}
