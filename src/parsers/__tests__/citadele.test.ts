import { describe, it, expect } from 'vitest';
import { parseStmt } from '../citadele';

const testCsv = `Citadele,,,,,
2023-07-01,ET23182H54T58Q,"Taste map Vilnius LT SZA58234",-7.5
2023-07-01,ET23182YXKHKQ8,"Wolt Lithuania LT R0066053",-28.09
2023-07-01,ET2318247N2CLF,"EXPRESS MARKET PC24 VILNIUS LT 36847007",-9.12`;

describe('Citadele parser', () => {
  it('parses all transactions (skips header)', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.trx.length).toBe(3);
  });

  it('uses trx-id as ID', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.trx[0].id).toBe('ET23182H54T58Q');
  });

  it('extracts payee by dropping last 3 parts', () => {
    const stmt = parseStmt(testCsv);
    // "Taste map Vilnius LT SZA58234" split by space/dot:
    // ["Taste", "map", "Vilnius", "LT", "SZA58234"] -> drop last 3 -> ["Taste", "map"]
    expect(stmt.trx[0].payee).toBe('Taste map');
    // "Wolt Lithuania LT R0066053" -> ["Wolt", "Lithuania", "LT", "R0066053"] -> drop last 3 -> ["Wolt"]
    expect(stmt.trx[1].payee).toBe('Wolt');
  });

  it('parses amounts and types correctly', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.trx[0].amount).toBe('-7.5');
    expect(stmt.trx[0].type).toBe('debit');
  });

  it('sets from/to dates', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.from).toBe('2023-07-01');
    expect(stmt.to).toBe('2023-07-01');
  });

  it('stores payment ref as memo', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.trx[0].memo).toBe('Taste map Vilnius LT SZA58234');
  });
});
