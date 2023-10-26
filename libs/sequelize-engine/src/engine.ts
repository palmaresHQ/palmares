import { DatabaseAdapter, databaseAdapter } from '@palmares/databases';
import { Options, Sequelize, Transaction } from 'sequelize';

import SequelizeEngineFields from './fields';
import SequelizeMigrations from './migrations';
import SequelizeEngineModels from './model';
import SequelizeEngineQuery from './query';

const instancesByConnectionNames = new Map<
  string,
  {
    instance: Sequelize;
    isConnected: boolean | undefined;
  }
>();

const checkIfInstanceSavedOrSave = (
  connectionName: string,
  sequelizeInstance: Sequelize
): {
  instance: Sequelize;
  isConnected: boolean | undefined;
} => {
  const instance = instancesByConnectionNames.get(connectionName);
  if (instance !== undefined) return instance;

  const toSave = {
    instance: sequelizeInstance,
    isConnected: undefined,
  };
  instancesByConnectionNames.set(connectionName, toSave);
  return toSave;
};

const sequelizeDatabaseAdapter = databaseAdapter({
  fields: new SequelizeEngineFields(),
  migrations: new SequelizeMigrations(),
  models: new SequelizeEngineModels(),
  query: new SequelizeEngineQuery(),
  new: async <TArgs extends Options & { url?: string }>(args: TArgs): Promise<[TArgs, DatabaseAdapter]> => {
    const isUrlDefined: boolean = typeof args.url === 'string';
    if (isUrlDefined) {
      const databaseUrl: string = args.url || '';
      const sequelizeInstance = new Sequelize(databaseUrl, args);
      const engineInstance = new sequelizeDatabaseAdapter();
      engineInstance.instance = sequelizeInstance;
      return [args, engineInstance];
    }

    const sequelizeInstance = new Sequelize(args);
    const engineInstance = new sequelizeDatabaseAdapter();
    engineInstance.instance = sequelizeInstance;
    return [args, engineInstance];
  },
  isConnected: async (databaseAdapter): Promise<boolean> => {
    const instanceData = checkIfInstanceSavedOrSave(databaseAdapter.connectionName, databaseAdapter.instance);
    if (typeof instanceData.isConnected === 'boolean') return instanceData.isConnected ? true : false;

    const isSequelizeInstanceDefined = instanceData.instance instanceof Sequelize;

    if (isSequelizeInstanceDefined) {
      try {
        await instanceData.instance?.authenticate();
        instanceData.isConnected = true;
      } catch (error) {
        instanceData.isConnected = false;
      }

      if (instanceData.isConnected) return instanceData.isConnected;
    }
    return false;
  },
  transaction: async <TParameters extends Array<any>, TResult>(
    databaseAdapter: DatabaseAdapter,
    callback: (transaction: Transaction, ...args: TParameters) => TResult | Promise<TResult>,
    ...args: TParameters
  ): Promise<TResult> => {
    const instanceData = checkIfInstanceSavedOrSave(databaseAdapter.connectionName, databaseAdapter.instance);

    return new Promise((resolve, reject) => {
      try {
        instanceData.instance?.transaction(async (transaction) => {
          try {
            resolve(await callback(transaction, ...args));
          } catch (e) {
            reject(e);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  },
  duplicate: async (getNewEngine: () => Promise<DatabaseAdapter>): Promise<DatabaseAdapter> => {
    return getNewEngine();
  },
  close: async (databaseAdapter): Promise<void> => {
    const instanceData = checkIfInstanceSavedOrSave(databaseAdapter.connectionName, databaseAdapter.instance);
    await Promise.resolve(instanceData.instance?.close());
  },
});

export default sequelizeDatabaseAdapter;
