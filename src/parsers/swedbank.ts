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

// Extract fund name from memo like "Fondų pirkimas 10611163 SWRAGLC SWEDBANK ROBUR ACCESS EDGE GLOBAL C"
function fundPayee(memo: string): string {
  // Skip "Fondų pirkimas <id> <ticker>" → extract the human-readable name after the ticker
  const parts = memo.split(/\s+/);
  // parts: ["Fondų", "pirkimas", "<id>", "<TICKER>", ...name parts]
  return parts.length > 4 ? parts.slice(4).join(' ') : parts.slice(3).join(' ');
}

// Match stock ticker patterns like "IGN1L -3000@20.65/SE:250709656 VSE"
const STOCK_TICKER_RE = /^[A-Z0-9]{3,6}\s+-?\d+@/;

function parseMemo(memo: string): Partial<{ payee: string; memo: string; date: string }> {
  const firstWord = memo.split(/\s+/)[0];
  switch (firstWord) {
    case 'MP':
    case 'TMP':
    case 'Kortelės':
    case 'Saugumo':
      return { payee: 'Bank', memo };
    case 'Bazinio':
      return { payee: 'Swedbank', memo };
    case 'Paskolos':
    case 'Sukauptos':
      return { payee: 'Paskola', memo };
    case 'VP':
      return { payee: 'Stocks', memo };
    case 'Fondų':
      return { payee: fundPayee(memo), memo };
    case 'PIRKINYS':
    case 'GRĄŽINIMAS':
      return cardTrn(memo);
    case 'GRYNIEJI':
      return { ...cashTrn(memo), payee: 'GRYNIEJI' };
    default:
      // Stock ticker: "IGN1L -3000@20.65/SE:250709656 VSE"
      if (STOCK_TICKER_RE.test(memo)) {
        return { payee: firstWord, memo };
      }
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
