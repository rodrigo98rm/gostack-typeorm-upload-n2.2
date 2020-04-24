// import AppError from '../errors/AppError';
import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

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
    const transactionRepository = getRepository(Transaction);

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
