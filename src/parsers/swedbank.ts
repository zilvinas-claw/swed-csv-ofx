import Papa from 'papaparse';
import type { Statement, Transaction } from './types';

function cardMemo(memo: string): string {
  return memo.split(/\s+/).slice(6).join(' ');
}

function cardDate(memo: string): string {
  const parts = memo.split(/\s+/);
  return parts[2].replace(/\./g, '-');
}

function cardTrn(memo: string): { memo: string; date: string; payee: string } {
  return { memo: cardMemo(memo), date: cardDate(memo), payee: cardMemo(memo) };
}

function cashTrn(memo: string): { memo: string; payee: string } {
  return { memo: cardMemo(memo), payee: cardMemo(memo) };
}

function parseMemo(memo: string): Partial<{ payee: string; memo: string; date: string }> {
  const firstWord = memo.split(/\s+/)[0];
  switch (firstWord) {
    case 'MP':
    case 'TMP':
    case 'Kortelės':
    case 'Saugumo':
      return { payee: 'Bank', memo };
    case 'Paskolos':
    case 'Sukauptos':
      return { payee: 'Paskola', memo };
    case 'VP':
      return { payee: 'Stocks', memo };
    case 'PIRKINYS':
    case 'GRĄŽINIMAS':
      return cardTrn(memo);
    case 'GRYNIEJI':
      return { ...cashTrn(memo), payee: 'GRYNIEJI' };
    default:
      return { memo };
  }
}

function isTransaction(row: string[]): boolean {
  const id = row[8];
  const kd = row[7];
  return !!id && id.length > 0 && (kd === 'K' || kd === 'D');
}

function rowToTransaction(row: string[]): Transaction {
  const [, , date, payee, memo, amount, , kd, id] = row;
  const type = kd === 'D' ? 'debit' : 'credit';
  const parsed = parseMemo(memo);

  return {
    type,
    date: parsed.date ?? date,
    id,
    amount: kd === 'D' ? `-${amount}` : amount,
    payee: parsed.payee ?? payee,
    memo: parsed.memo ?? memo,
    orig: memo,
  };
}

export function parseStmt(csv: string): Statement {
  const result = Papa.parse<string[]>(csv, {
    delimiter: ',',
    quoteChar: '"',
    header: false,
    skipEmptyLines: true,
  });

  const rows = result.data;
  const transactions = rows.filter(isTransaction);
  const from = transactions[0]?.[2] ?? '';
  const to = transactions[transactions.length - 1]?.[2] ?? '';

  return {
    from,
    to,
    trx: transactions.map(rowToTransaction),
  };
}
