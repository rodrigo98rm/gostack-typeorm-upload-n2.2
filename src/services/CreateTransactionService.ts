import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    // Check balance if type is outcome
    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();

      if (value > balance.total) {
        throw new AppError('Insufficient amount', 400);
      }
    }

    const foundCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    let categoryId;
    // Check if category exists
    if (foundCategory) {
      // Category exists, get its id
      categoryId = foundCategory.id;
    } else {
      // Category does not exist, create one and get its id
      const newCategory = categoriesRepository.create({ title: category });
      await categoriesRepository.save(newCategory);

      categoryId = newCategory.id;
    }

    // Create the transaction and save is to db
    const newTransaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: categoryId,
    });

    await transactionRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
