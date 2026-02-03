import type { Statement, Transaction } from './parsers/types';

function ofxDate(date: string): string {
  return date.replace(/-/g, '');
}

function now(): string {
  const d = new Date();
  return `${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`;
}

function trnToQfx(trn: Transaction): string {
  return (
    '<STMTTRN>\n' +
    `<TRNTYPE>${trn.type.toUpperCase()}\n` +
    `<DTPOSTED>${ofxDate(trn.date)}\n` +
    `<FITID>${trn.id}\n` +
    `<TRNAMT>${trn.amount}\n` +
    `<NAME>${trn.payee}\n` +
    `<MEMO>${trn.memo}\n` +
    '</STMTTRN>\n'
  );
}

function trnList(start: string, end: string, trns: string): string {
  return `<DTSTART>${ofxDate(start)}\n<DTEND>${ofxDate(end)}\n${trns}`;
}

function ofx(trnListContent: string): string {
  return (
    'OFXHEADER:100\n' +
    'DATA:OFXSGML\n' +
    'VERSION:102\n' +
    'SECURITY:NONE\n' +
    'ENCODING:UTF-8\n' +
    'CHARSET:CSUNICODE\n' +
    'COMPRESSION:NONE\n' +
    'OLDFILEUID:NONE\n' +
    'NEWFILEUID:NONE\n' +
    '\n' +
    '<OFX>\n' +
    '<SIGNONMSGSRSV1>\n' +
    '<SONRS>\n' +
    '<STATUS>\n' +
    '<CODE>0\n' +
    '<SEVERITY>INFO\n' +
    '<MESSAGE>OK\n' +
    '</STATUS>\n' +
    `<DTSERVER>${now()}\n` +
    '<LANGUAGE>ENG\n' +
    '<INTU.BID>3000\n' +
    '</SONRS>\n' +
    '</SIGNONMSGSRSV1>\n' +
    '<BANKMSGSRSV1>\n' +
    '<STMTTRNRS>\n' +
    '<TRNUID>0\n' +
    '<STATUS>\n' +
    '<CODE>0\n' +
    '<SEVERITY>INFO\n' +
    '<MESSAGE>OK\n' +
    '</STATUS>\n' +
    '<STMTRS>\n' +
    '<CURDEF>EUR\n' +
    '<BANKACCTFROM>\n' +
    '<BANKID>1\n' +
    '<ACCTID>10000001\n' +
    '<ACCTTYPE>CHECKING\n' +
    '</BANKACCTFROM>\n' +
    '<BANKTRANLIST>\n' +
    trnListContent +
    '</BANKTRANLIST>\n' +
    '<LEDGERBAL>\n' +
    '<BALAMT>0.00\n' +
    '<DTASOF>20160902\n' +
    '</LEDGERBAL>\n' +
    '</STMTRS>\n' +
    '</STMTTRNRS>\n' +
    '</BANKMSGSRSV1>\n' +
    '</OFX>\n'
  );
}

export function stmtToOfx(stmt: Statement): string {
  const { from, to, trx } = stmt;
  const trnsStr = trx.map(trnToQfx).join('');
  return ofx(trnList(from, to, trnsStr));
}
