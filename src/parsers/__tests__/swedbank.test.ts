import { describe, it, expect } from 'vitest';
import { parseStmt } from '../swedbank';

const testCsv = `"Sąskaitos Nr.";"";Data";"Gavėjas";"Paaiškinimai";"Suma";"Valiuta";"D/K";"Įrašo Nr.";"Kodas";"Įmokos kodas";"Dok. Nr.";"Kliento kodas mokėtojo IS";"Kliento kodas";"Pradinis mokėtojas";"Galutinis gavėjas";
"LT467300010071256495";"10";"2016-08-22";"";"Likutis pradžiai";"1052.71";"EUR";"K";"";"AS";"";""
"LT467300010071256495";"20";"2016-08-22";"";"PIRKINYS 6763765006733663 2016.08.17 18.00 EUR (021607) RIMI VYDUNO G. 4 VILNIUS";"18.00";"EUR";"D";"2016082200138010";"K";"";"";"";
"LT467300010071256495";"20";"2016-08-22";"MARKS & SPENCER";"PIRKINYS 6763765006733663 2016.08.18 4.83 EUR (343080) MARKS & SPENCER           Vilnius            ";"4.83";"EUR";"D";"2016082200449916";"K";"";"";"";
"LT467300010071256495";"20";"2016-08-22";"MARKS & SPENCER";"PIRKINYS 6763765006733663 2016.08.18 1.68 EUR (328357) MARKS & SPENCER           Vilnius            ";"1.68";"EUR";"D";"2016082200450099";"K";"";"";"";
"LT697300010070459808";"20";"2017-01-15";"";"Sukauptos paskolos palūkanos: 05-046488-FA";"11.16";"EUR";"D";"2017011500512857";"TT";"";"R@";"";
"LT697300010070459808";"20";"2017-04-23";"H126/HB VYDUNO 4>VILNIUS LT";"GRYNIEJI 6763765010573030 23.04.17 11:16 150.00 EUR (884394) H126/HB VYDUNO 4>VILNIUS LT";"150.00";"EUR";"D";"2017042300097336";"K";"";"";"";
"LT467300010071256495";"20";"2016-08-22";"";"PIRKINYS 6763765006733663 2016.08.18 5.64 EUR (400678) RIMI VYDUNO G. 4 VILNIUS";"5.64";"EUR";"D";"2016082200568103";"K";"";"";"";`;

describe('Swedbank parser', () => {
  it('parses transactions from CSV', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.trx.length).toBe(6);
  });

  it('filters out non-transaction rows (Likutis pradžiai has no ID)', () => {
    const stmt = parseStmt(testCsv);
    // The "Likutis pradžiai" row has empty ID, so it should be filtered
    expect(stmt.trx.every(t => t.id.length > 0)).toBe(true);
  });

  it('parses PIRKINYS memo correctly', () => {
    const stmt = parseStmt(testCsv);
    const first = stmt.trx[0];
    expect(first.payee).toBe('RIMI VYDUNO G. 4 VILNIUS');
    expect(first.date).toBe('2016-08-17');
    expect(first.amount).toBe('-18.00');
    expect(first.type).toBe('debit');
    expect(first.id).toBe('2016082200138010');
  });

  it('parses Sukauptos memo correctly', () => {
    const stmt = parseStmt(testCsv);
    const sukauptos = stmt.trx.find(t => t.id === '2017011500512857')!;
    expect(sukauptos.payee).toBe('Paskola');
    expect(sukauptos.amount).toBe('-11.16');
    expect(sukauptos.type).toBe('debit');
  });

  it('parses GRYNIEJI memo correctly', () => {
    const stmt = parseStmt(testCsv);
    const cash = stmt.trx.find(t => t.id === '2017042300097336')!;
    expect(cash.payee).toBe('GRYNIEJI');
    expect(cash.amount).toBe('-150.00');
  });

  it('sets from/to dates', () => {
    const stmt = parseStmt(testCsv);
    expect(stmt.from).toBe('2016-08-22');
    expect(stmt.to).toBe('2016-08-22');
  });
});
