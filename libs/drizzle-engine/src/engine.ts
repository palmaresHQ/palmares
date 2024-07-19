import { DatabaseAdapter, databaseAdapter, AdapterMigrations, AdapterQuery, AdapterModels, AdapterFields } from '@palmares/databases';
import DrizzleModels from './model';
import DrizzleFields from './fields';
import DrizzleQuery from './query';
import { ParametersByType, ReturnTypeByType } from './types';

type allDrizzleTypes =
  typeof import('drizzle-orm/postgres-js')['drizzle'] |
  typeof import('drizzle-orm/node-postgres')['drizzle'] |
  typeof import('drizzle-orm/neon-http')['drizzle'] |
  typeof import('drizzle-orm/xata-http')['drizzle'] |
  typeof import('drizzle-orm/pglite')['drizzle'] |
  typeof import('drizzle-orm/vercel-postgres')['drizzle'] |
  typeof import('drizzle-orm/aws-data-api/pg')['drizzle'] |
  typeof import('drizzle-orm/pg-proxy')['drizzle']

const instancesByConnectionNames = new Map<
  string,
  {
    type: 'postgres-js' | 'node-postgres' | 'neon-http' | 'xata-http' | 'pglite' | 'vercel-postgres' | 'aws-data-api/pg' | 'pg-proxy',
    mainType: 'postgres' | 'mysql' | 'sqlite',
    closeCallback?: () => void | Promise<void>;
    instance:
      ReturnType<
        typeof import('drizzle-orm/postgres-js')['drizzle'] |
        typeof import('drizzle-orm/node-postgres')['drizzle'] |
        typeof import('drizzle-orm/neon-http')['drizzle'] |
        typeof import('drizzle-orm/xata-http')['drizzle'] |
        typeof import('drizzle-orm/pglite')['drizzle'] |
        typeof import('drizzle-orm/vercel-postgres')['drizzle'] |
        typeof import('drizzle-orm/aws-data-api/pg')['drizzle'] |
        typeof import('drizzle-orm/pg-proxy')['drizzle']
      >;
    isConnected: boolean | undefined;
  }
>();

const checkIfInstanceSavedOrSave = (
  connectionName: string,
  type: 'postgres-js' | 'node-postgres' | 'neon-http' | 'xata-http' | 'pglite' | 'vercel-postgres' | 'aws-data-api/pg' | 'pg-proxy',
  mainType: 'postgres' | 'mysql' | 'sqlite',
  drizzleInstance: ReturnType<
    typeof import('drizzle-orm/postgres-js')['drizzle'] |
    typeof import('drizzle-orm/node-postgres')['drizzle'] |
    typeof import('drizzle-orm/neon-http')['drizzle'] |
    typeof import('drizzle-orm/xata-http')['drizzle'] |
    typeof import('drizzle-orm/pglite')['drizzle'] |
    typeof import('drizzle-orm/vercel-postgres')['drizzle'] |
    typeof import('drizzle-orm/aws-data-api/pg')['drizzle'] |
    typeof import('drizzle-orm/pg-proxy')['drizzle']
  >,
  closeCallback?: () => void | Promise<void>,
) => {
  const instance = instancesByConnectionNames.get(connectionName);
  if (instance !== undefined) return instance;

  const toSave = {
    instance: drizzleInstance,
    type,
    mainType,
    closeCallback,
    isConnected: undefined,
  };
  instancesByConnectionNames.set(connectionName, toSave);
  return toSave;
};

const drizzleDatabaseAdapter = databaseAdapter({
  fields: new DrizzleFields(),
  models: new DrizzleModels(),
  query: new DrizzleQuery(),
  new: <
  TType extends
    'postgres-js' |
    'node-postgres' |
    'neon-http' |
    'xata-http' |
    'pglite' |
    'vercel-postgres' |
    'aws-data-api/pg' |
    'pg-proxy' |
    'libsql' |
    'd1' |
    'bun-sqlite' |
    'expo-sqlite' |
    'op-sqlite' |
    'better-sqlite3',
  TDrizzleInstance extends ReturnTypeByType<TType>,
  >(args: {
    output: string;
    type: TType;
    drizzle: TDrizzleInstance;
    closeCallback?: () => void | Promise<void>;
  }): [{
    output: string;
    type: TType;
    drizzle: TDrizzleInstance;
    closeCallback?: () => void | Promise<void>;
  }, Omit<InstanceType<ReturnType<typeof databaseAdapter>>, 'instance'> & {
    instance: {
      instance: ReturnTypeByType<TType, TDrizzleInstance extends ReturnTypeByType<TType, infer TSchema> ? TSchema : never>,
      mainType: 'postgres' | 'mysql' | 'sqlite',
      type: 'postgres-js' | 'node-postgres' | 'neon-http' | 'xata-http' | 'pglite' | 'vercel-postgres' | 'aws-data-api/pg' | 'pg-proxy',
      output: string,
      closeCallback?: () => void | Promise<void>,
    }
  }] => {

    const engineInstance = new drizzleDatabaseAdapter();
    engineInstance.instance = {
      output: args.output,
      type: args.type,
      mainType: args.type.includes('sqlite') ? 'sqlite' : 'postgres',
      instance: args.drizzle as any,
      closeCallback: args.closeCallback,
    } as {
      instance: any,
      mainType: 'postgres' | 'mysql' | 'sqlite',
      type: 'postgres-js' | 'node-postgres' | 'neon-http' | 'xata-http' | 'pglite' | 'vercel-postgres' | 'aws-data-api/pg' | 'pg-proxy',
      output: string,
      closeCallback?: () => void | Promise<void>,
    };

    return [args, engineInstance as unknown as Omit<InstanceType<ReturnType<typeof databaseAdapter>>, 'instance'> & {
      instance: {
        instance: ReturnTypeByType<TType, TDrizzleInstance extends ReturnTypeByType<TType, infer TSchema> ? TSchema : never>,
        mainType: 'postgres' | 'mysql' | 'sqlite',
        type: 'postgres-js' | 'node-postgres' | 'neon-http' | 'xata-http' | 'pglite' | 'vercel-postgres' | 'aws-data-api/pg' | 'pg-proxy',
        output: string,
        closeCallback?: () => void | Promise<void>,
      }
    }];
  },
  isConnected: async (): Promise<boolean> => {
    return true;
  },
  transaction: async <TParameters extends Array<any>, TResult>(
    databaseAdapter: DatabaseAdapter,
    callback: (transaction: Parameters<ReturnType<allDrizzleTypes>['transaction']>[0], ...args: TParameters) => TResult | Promise<TResult>,
    ...args: TParameters
  ): Promise<TResult> => {
    const instanceData = checkIfInstanceSavedOrSave(databaseAdapter.connectionName, 'node-postgres', 'postgres', databaseAdapter.instance);

    return new Promise((resolve, reject) => {
      try {
        instanceData.instance?.transaction(async (transaction) => {
          try {
            resolve(await callback(transaction as any, ...args));
          } catch (e) {
            reject(e);
          }
        }).catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  },
  duplicate: async (getNewEngine: () => Promise<DatabaseAdapter>): Promise<DatabaseAdapter> => {
    return getNewEngine();
  },
  close: async (databaseAdapter): Promise<void> => {
    const instanceData = checkIfInstanceSavedOrSave(databaseAdapter.connectionName,  'node-postgres', 'postgres', databaseAdapter.instance);
    try {
      await Promise.resolve(instanceData?.closeCallback?.());
    } catch (_) {}
  },
});

export default drizzleDatabaseAdapter;
