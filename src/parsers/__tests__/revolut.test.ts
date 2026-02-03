import { describe, it, expect } from 'vitest';
import { parseStmt } from '../revolut';

const testCsv = `Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
CARD_PAYMENT,Current,2021-06-30 17:35:04,2021-07-01 08:06:47,Wolt,-15.88,0.00,EUR,COMPLETED,227.77
TRANSFER,Current,2021-07-02 11:33:03,2021-07-02 11:33:03,To Gabriele Kybartaite,-10.00,0.00,EUR,COMPLETED,171.67
TRANSFER,Current,2021-07-02 11:38:10,2021-07-02 11:38:10,From Gabriele Kybartaite,10.00,0.00,EUR,COMPLETED,181.67
TOPUP,Current,2021-07-04 11:46:00,2021-07-04 11:46:00,Payment from Žilvinas Kybartas,500.00,0.00,EUR,COMPLETED,681.67
CARD_REFUND,Current,2021-07-05 00:00:00,2021-07-06 10:15:19,Refund from Pagrindinis.barbora.lt,0.34,0.00,EUR,COMPLETED,320.53
CARD_PAYMENT,Current,2022-08-22 07:59:28,,Uscustoms Esta Appl Pm,-21.01,0.00,EUR,PENDING,
CARD_PAYMENT,Current,2022-08-21 08:22:16,2022-08-22 09:54:55,www.aboutyou.lt,-387.20,0.00,EUR,COMPLETED,534.91
CARD_PAYMENT,Current,2022-08-21 16:38:38,2022-08-22 12:15:47,Rimi Zirmunu,-2.77,0.00,EUR,COMPLETED,532.14`;

describe('Revolut parser', () => {
  it('filters only COMPLETED transactions', () => {
    const stmt = parseStmt(testCsv);
    // PENDING row should be excluded
    expect(stmt.trx.length).toBe(7);
    expect(stmt.trx.every(t => t.payee !== 'Uscustoms Esta Appl Pm')).toBe(true);
  });

  it('parses dates correctly', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.trx[0].date).toBe('2021-06-30');
  });

  it('detects debit/credit correctly', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.trx[0].type).toBe('debit'); // -15.88
    expect(stmt.trx[2].type).toBe('credit'); // 10.00
  });

  it('generates correct IDs', () => {
    const stmt = parseStmt(testCsv);
    // First: date=20210630, amount=-15.88, balance=227.77
    // "20210630-15.88227.77" -> remove , and . -> "20210630-158822777"
    expect(stmt.trx[0].id).toBe('20210630-158822777');
  });

  it('sets from/to dates', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.from).toBe('2021-06-30');
    expect(stmt.to).toBe('2022-08-21');
  });

  it('uses description as payee and memo', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.trx[0].payee).toBe('Wolt');
    expect(stmt.trx[0].memo).toBe('Wolt');
  });
});
