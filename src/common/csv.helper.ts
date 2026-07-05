import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { format } from 'fast-csv';

export class CsvHelper {
  /**
   * Parse CSV buffer to array of objects
   */
  static async parseCSV<T>(buffer: Buffer): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Convert array of objects to CSV string
   */
  static async generateCSV<T extends Record<string, any>>(
    data: T[],
    headers?: string[],
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const rows: string[] = [];
      const csvStream = format({ headers: headers || true });

      csvStream.on('data', (row) => rows.push(row));
      csvStream.on('end', () => resolve(rows.join('')));
      csvStream.on('error', (error) => reject(error));

      data.forEach((item) => csvStream.write(item));
      csvStream.end();
    });
  }
}
