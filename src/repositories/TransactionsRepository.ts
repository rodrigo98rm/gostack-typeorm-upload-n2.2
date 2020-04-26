import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find({
      relations: ['category'],
    });

    const incomes = transactions.filter(
      transaction => transaction.type === 'income',
    );
    const outcomes = transactions.filter(
      transaction => transaction.type === 'outcome',
    );

    const income = incomes.reduce(
      (accumulator, transaction) => accumulator + transaction.value,
      0,
    );
    const outcome = outcomes.reduce(
      (accumulator, transaction) => accumulator + transaction.value,
      0,
    );

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
