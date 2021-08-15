import {nanoid} from 'nanoid/non-secure';
import {RealmDBInterface} from './realmdb';

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
  await dbInterface.getValues();
  const readTime = Date.now() - startRead;

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
  const work = async (type: string, dbInterface: DBInterface) => {
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

    return await process([
      () => benchmark(dbInterface, type, 1, 1),
      () => benchmark(dbInterface, type, 10, 10),
      () => benchmark(dbInterface, type, 10, 1000),
      () => benchmark(dbInterface, type, 1000, 10),
      () => benchmark(dbInterface, type, 1000, 1000),
      () => benchmark(dbInterface, type, 10000, 10),
      () => benchmark(dbInterface, type, 10000, 100),
      () => benchmark(dbInterface, type, 10000, 1000),
    ]);
  };

  // realm is sync, give UI a chance to redraw
  await new Promise(res => setTimeout(res, 1));

  const realmInterface = new RealmDBInterface();
  const remoteInterface = new RemoteDBInterface(host, dbPath);

  const realmResults = await work('realm', realmInterface);
  const remoteResults = await work('remote', remoteInterface);
  const realmResults2 = await work('realm', realmInterface);
  const remoteResults2 = await work('remote', remoteInterface);
  const realmResults3 = await work('realm', realmInterface);
  const remoteResults3 = await work('remote', remoteInterface);

  const result = [
    ...realmResults,
    ...remoteResults,
    ...realmResults2,
    ...remoteResults2,
    ...realmResults3,
    ...remoteResults3,
  ];

  const results2 = result
    .map(it => ({
      key: `${it.type}-size${it.dataSize}-n${it.numberOfEntries}`,
      writeTime: it.writeTime,
      readTime: it.readTime,
    }))
    .reduce<Map<string, {writeTime: number; readTime: number}>>((prev, cur) => {
      const existing = prev.get(cur.key);
      if (existing) {
        existing.readTime = (existing.readTime + cur.readTime) / 2;
        existing.writeTime = (existing.writeTime + cur.writeTime) / 2;
      } else {
        prev.set(cur.key, {writeTime: cur.writeTime, readTime: cur.readTime});
      }
      return prev;
    }, new Map());

  /*
  console.log(
    result
      .map(
        it =>
          `${it.type}-size${it.dataSize}-n${it.numberOfEntries}, ${it.writeTime}, ${it.readTime}`,
      )
      .join('\n'),
  );
  */

  console.log(
    Array.from(results2.entries())
      .map(([key, value]) => `${key}, ${value.writeTime}, ${value.readTime}`)
      .join('\n'),
  );
  return result;
}
