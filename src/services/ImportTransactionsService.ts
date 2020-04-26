import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  fileName: string;
}

class ImportTransactionsService {
  async execute({ fileName }: Request): Promise<Transaction[]> {
    const createTransactionsService = new CreateTransactionService();

    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', fileName);

    const lines = await this.loadCSV(csvFilePath);

    fs.promises.unlink(csvFilePath);
    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const line of lines) {
      const [title, type, value, category] = line;

      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransactionsService.execute({
        title,
        type,
        value,
        category,
      });

      transactions.push(transaction);
    }

    return transactions;
  }

  async loadCSV(filePath: string): Promise<any> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({ from_line: 2, ltrim: true, rtrim: true });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }
}

export default ImportTransactionsService;
