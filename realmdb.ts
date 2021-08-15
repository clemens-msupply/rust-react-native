import Realm from 'realm';
import {DBInterface, TestData} from './benchmark';

class RealmTestData extends Realm.Object {
  static schema = {
    name: 'TestData',
    properties: {
      id: 'int',
      value: 'string',
    },
    primaryKey: 'id',
  };
}

export const testDataRealm = new Realm({schema: [RealmTestData]});

export class RealmDBInterface implements DBInterface {
  async init(): Promise<void> {
    testDataRealm.write(() => {
      testDataRealm.deleteAll();
    });
  }

  async addValues(values: TestData[]): Promise<void> {
    testDataRealm.write(() => {
      values.forEach(it => {
        testDataRealm.create(RealmTestData, it);
      });
    });
  }

  async getValues(): Promise<TestData[]> {
    return testDataRealm
      .objects(RealmTestData)
      .slice() as unknown as TestData[];
  }
}
