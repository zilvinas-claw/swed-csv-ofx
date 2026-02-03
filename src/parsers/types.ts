export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  type: TransactionType;
  date: string;
  id: string;
  amount: string;
  payee: string;
  memo: string;
  orig: string;
}

export interface Statement {
  from: string;
  to: string;
  trx: Transaction[];
}

export type BankFormat = 'swedbank' | 'revolut' | 'n26' | 'citadele';
