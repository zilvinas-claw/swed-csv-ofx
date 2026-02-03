import { describe, it, expect } from 'vitest';
import { parseStmt } from '../n26';

const testCsv = `"Date","Payee","Account number","Transaction type","Payment reference","Category","Amount (EUR)","Amount (Foreign Currency)","Type Foreign Currency","Exchange Rate"
"2017-03-03","MAXIMA LT, X-860","","MasterCard Payment","","Shopping","-5.97","-5.97","EUR","1.0"
"2017-03-04","PONAS DVIRATIS","","MasterCard Payment","","Leisure & Entertainment","-36.0","-36.0","EUR","1.0"
"2017-03-05","MANO KEPYKLELE","","MasterCard Payment","","Food & Groceries","-2.0","-2.0","EUR","1.0"
"2017-03-06","MAXIMA LT, X-477","","MasterCard Payment","","Shopping","-17.63","-17.63","EUR","1.0"
"2017-03-06","UAB CESTA","","MasterCard Payment","","Food & Groceries","-0.95","-0.95","EUR","1.0"
"2017-03-06","CRUSTUM MANO KEPYKLELE","","MasterCard Payment","","Food & Groceries","-2.7","-2.7","EUR","1.0"`;

describe('N26 parser', () => {
  it('parses all transactions', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.trx.length).toBe(6);
  });

  it('parses first transaction correctly', () => {
    const stmt = parseStmt(testCsv);
    const first = stmt.trx[0];
    expect(first.date).toBe('2017-03-03');
    expect(first.payee).toBe('MAXIMA LT, X-860');
    expect(first.amount).toBe('-5.97');
    expect(first.type).toBe('debit');
  });

  it('generates correct IDs (no commas, dots, dashes, spaces)', () => {
    const stmt = parseStmt(testCsv);
    // "2017-03-03" + "MAXIMA LT, X-860" + "-5.97"
    // remove , . - and spaces: "20170303MAXIMALTX860597"
    expect(stmt.trx[0].id).toBe('20170303MAXIMALTX860597');
  });

  it('sets from/to dates', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.from).toBe('2017-03-03');
    expect(stmt.to).toBe('2017-03-06');
  });

  it('all transactions are debits', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.trx.every(t => t.type === 'debit')).toBe(true);
  });
});
