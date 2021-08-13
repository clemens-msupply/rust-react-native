import {nanoid} from 'nanoid/non-secure';

export type TestData = {
  id: number;
  value: string;
};

export interface DBInterface {
  init(): Promise<void>;
  addValues(values: TestData[]): Promise<void>;
  getValues(): Promise<TestData[]>;
}

export class RemoteDBInterface implements DBInterface {
  constructor(private host: string, private dbPath: string) {}

  async init(): Promise<void> {
    await fetch(`${this.host}/initdb`, {
      method: 'post',
      body: JSON.stringify({dbPath: this.dbPath}),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async addValues(values: TestData[]): Promise<void> {
    const result = await fetch(`${this.host}/values`, {
      method: 'post',
      body: JSON.stringify(values),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!result.ok) {
      throw Error(result.statusText);
    }
  }

  async getValues(): Promise<TestData[]> {
    return (await fetch(`${this.host}/values`)).json();
  }
}

export interface BenchmarkResult {
  type: string;
  dataSize: number;
  numberOfEntries: number;
  writeTime: number;
  readTime: number;
}

let rowIdCounter = 10;
async function benchmark(
  dbInterface: DBInterface,
  type: string,
  dataSize: number,
  numberOfEntries: number,
): Promise<BenchmarkResult> {
  const data = new Array(numberOfEntries).fill(0).map(() => {
    return {
      id: rowIdCounter++,
      value: nanoid(dataSize),
    };
  });

  await dbInterface.init();

  const startWrite = Date.now();
  await dbInterface.addValues(data);
  const writeTime = Date.now() - startWrite;

  const startRead = Date.now();
  const results = await dbInterface.getValues();
  const readTime = Date.now() - startRead;

  console.log(results);
  return {
    type,
    dataSize,
    numberOfEntries,
    writeTime,
    readTime,
  };
}

export async function doBenchmarks(
  host: string,
  dbPath: string,
): Promise<BenchmarkResult[]> {
  const dbInterface = new RemoteDBInterface(host, dbPath);
  const type = 'remote';

  const process = async (
    jobs: (() => Promise<BenchmarkResult>)[],
  ): Promise<BenchmarkResult[]> => {
    const results: BenchmarkResult[] = [];
    for (const job of jobs) {
      const result = await job();
      results.push(result);
    }
    return results;
  };

  return process([
    () => benchmark(dbInterface, type, 1, 1),
    () => benchmark(dbInterface, type, 10, 10),
    () => benchmark(dbInterface, type, 10, 1000),
    () => benchmark(dbInterface, type, 1000, 10),
    () => benchmark(dbInterface, type, 1000, 1000),
    () => benchmark(dbInterface, type, 10000, 10),
    () => benchmark(dbInterface, type, 10000, 100),
    () => benchmark(dbInterface, type, 10000, 1000),
  ]);
}
