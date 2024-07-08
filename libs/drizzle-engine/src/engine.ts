import { DatabaseAdapter, databaseAdapter, AdapterMigrations, AdapterQuery, AdapterModels, AdapterFields } from '@palmares/databases';

import DrizzleModels from './model';
import DrizzleFields from './fields';

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
  migrations: new AdapterMigrations(),
  models: new DrizzleModels(),
  query: new AdapterQuery(),
  new: async<
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
  >(args: {
    type: TType;
    options: (TType extends 'postgres-js' ?
      Parameters<typeof import('drizzle-orm/postgres-js')['drizzle']> :
      TType extends 'node-postgres' ?
      Parameters<typeof import('drizzle-orm/node-postgres')['drizzle']>
      : TType extends 'neon-http' ?
      Parameters<typeof import('drizzle-orm/neon-http')['drizzle']>
      : TType extends 'xata-http' ?
      Parameters<typeof import('drizzle-orm/xata-http')['drizzle']>
      : TType extends 'pglite' ?
      Parameters<typeof import('drizzle-orm/pglite')['drizzle']>
      : TType extends 'vercel-postgres' ?
      Parameters<typeof import('drizzle-orm/vercel-postgres')['drizzle']>
      : TType extends 'aws-data-api/pg' ?
      Parameters<typeof import('drizzle-orm/aws-data-api/pg')['drizzle']>
      : TType extends 'pg-proxy' ?
      Parameters<typeof import('drizzle-orm/pg-proxy')['drizzle']>
      : TType extends 'libsql' ?
      Parameters<typeof import('drizzle-orm/libsql')['drizzle']>
      : TType extends 'd1' ?
      Parameters<typeof import('drizzle-orm/d1')['drizzle']>
      : TType extends 'bun-sqlite' ?
      Parameters<typeof import('drizzle-orm/bun-sqlite')['drizzle']>
      : TType extends 'expo-sqlite' ?
      Parameters<typeof import('drizzle-orm/expo-sqlite')['drizzle']>
      : TType extends 'op-sqlite' ?
      Parameters<typeof import('drizzle-orm/op-sqlite')['drizzle']>
      : TType extends 'better-sqlite3' ?
      Parameters<typeof import('drizzle-orm/better-sqlite3')['drizzle']>
      : [])
    closeCallback?: () => void | Promise<void>;
  }): Promise<[{
    type: TType;
    options: TType extends 'postgres-js' ?
    Parameters<typeof import('drizzle-orm/postgres-js')['drizzle']> :
    TType extends 'node-postgres' ?
    Parameters<typeof import('drizzle-orm/node-postgres')['drizzle']>
    : TType extends 'neon-http' ?
    Parameters<typeof import('drizzle-orm/neon-http')['drizzle']>
    : TType extends 'xata-http' ?
    Parameters<typeof import('drizzle-orm/xata-http')['drizzle']>
    : TType extends 'pglite' ?
    Parameters<typeof import('drizzle-orm/pglite')['drizzle']>
    : TType extends 'vercel-postgres' ?
    Parameters<typeof import('drizzle-orm/vercel-postgres')['drizzle']>
    : TType extends 'aws-data-api/pg' ?
    Parameters<typeof import('drizzle-orm/aws-data-api/pg')['drizzle']>
    : TType extends 'pg-proxy' ?
    Parameters<typeof import('drizzle-orm/pg-proxy')['drizzle']>
    : TType extends 'libsql' ?
    Parameters<typeof import('drizzle-orm/libsql')['drizzle']>
    : TType extends 'd1' ?
    Parameters<typeof import('drizzle-orm/d1')['drizzle']>
    : TType extends 'bun-sqlite' ?
    Parameters<typeof import('drizzle-orm/bun-sqlite')['drizzle']>
    : TType extends 'expo-sqlite' ?
    Parameters<typeof import('drizzle-orm/expo-sqlite')['drizzle']>
    : TType extends 'op-sqlite' ?
    Parameters<typeof import('drizzle-orm/op-sqlite')['drizzle']>
    : TType extends 'better-sqlite3' ?
    Parameters<typeof import('drizzle-orm/better-sqlite3')['drizzle']>
    : [];
    closeCallback?: () => void | Promise<void>;
  }, any]> => {
    const importedModule = await (args.type ==='pglite' ?
      import('drizzle-orm/pglite')
      : args.type === 'postgres-js' ?
      import('drizzle-orm/postgres-js')
      : args.type === 'node-postgres' ?
      import('drizzle-orm/node-postgres')
      : args.type === 'neon-http' ?
      import('drizzle-orm/neon-http')
      : args.type === 'xata-http' ?
      import('drizzle-orm/xata-http')
      : args.type === 'vercel-postgres' ?
      import('drizzle-orm/vercel-postgres')
      : args.type === 'aws-data-api/pg' ?
      import('drizzle-orm/aws-data-api/pg')
      : args.type === 'pg-proxy' ?
      import('drizzle-orm/pg-proxy')
      : args.type === 'libsql' ?
      import('drizzle-orm/libsql')
      : args.type === 'd1' ?
      import('drizzle-orm/d1')
      : args.type === 'bun-sqlite' ?
      import('drizzle-orm/bun-sqlite')
      : args.type === 'expo-sqlite' ?
      import('drizzle-orm/expo-sqlite')
      : args.type === 'op-sqlite' ?
      import('drizzle-orm/op-sqlite')
      : args.type === 'better-sqlite3' ?
      import('drizzle-orm/better-sqlite3')
      : null);
    const argsOfDrizzle = args.options as any[]
    const drizzleInstance = (importedModule?.drizzle as (...args:any) => any)(...argsOfDrizzle);

    const engineInstance = new drizzleDatabaseAdapter();
    engineInstance.instance = {
      type: args.type,
      mainType: args.type.includes('sqlite') ? 'sqlite' : 'postgres',
      instance: drizzleInstance,
      closeCallback: args.closeCallback,
    };
    return [args, engineInstance];
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
