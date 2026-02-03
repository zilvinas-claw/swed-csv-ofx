import Papa from 'papaparse';
import type { Statement, Transaction } from './types';

/** Extract yyyy-MM-dd from "yyyy-MM-dd HH:mm:ss" */
function stmtDate(d: string): string {
  return d.trim().slice(0, 10);
}

/** Extract yyyyMMdd from "yyyy-MM-dd HH:mm:ss" */
function stmtId(d: string): string {
  return d.trim().slice(0, 10).replace(/-/g, '');
}

function rowToTransaction(row: string[]): Transaction {
  const [, , date, , memo, amount, , , , balance] = row;
  const type = amount.startsWith('-') ? 'debit' : 'credit';
  const id = `${stmtId(date)}${amount}${balance ?? ''}`
    .replace(/,/g, '')
    .replace(/\./g, '');

  return {
    type,
    date: stmtDate(date),
    id,
    amount,
    payee: memo,
    memo,
    orig: memo,
  };
}

function isCompleted(row: string[]): boolean {
  return row[8] === 'COMPLETED';
}

export function parseStmt(csv: string): Statement {
  const result = Papa.parse<string[]>(csv, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = result.data;
  // Skip header row, filter only completed
  const transactions = rows.slice(1).filter(isCompleted);
  const from = transactions[0]?.[2] ? stmtDate(transactions[0][2]) : '';
  const to = transactions[transactions.length - 1]?.[2]
    ? stmtDate(transactions[transactions.length - 1][2])
    : '';

  return {
    from,
    to,
    trx: transactions.map(rowToTransaction),
  };
}
