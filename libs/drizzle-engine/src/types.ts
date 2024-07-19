import type { drizzle as drizzlePostgresJs } from 'drizzle-orm/postgres-js';
import type { drizzle as drizzleNodePostgres } from 'drizzle-orm/node-postgres';
import type { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http';
import type { drizzle as drizzleXataHttp } from 'drizzle-orm/xata-http';
import type { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import type { drizzle as drizzleVercelPostgres } from 'drizzle-orm/vercel-postgres';
import type { drizzle as drizzleAwsDataApiPg } from 'drizzle-orm/aws-data-api/pg';
import type { drizzle as drizzlePgProxy } from 'drizzle-orm/pg-proxy';
import type { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import type { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import type { drizzle as drizzleBunSqlite } from 'drizzle-orm/bun-sqlite';
import type { drizzle as drizzleExpoSqlite } from 'drizzle-orm/expo-sqlite';
import type { drizzle as drizzleOpSqlite } from 'drizzle-orm/op-sqlite';
import type { drizzle as drizzleBetterSqlite3 } from 'drizzle-orm/better-sqlite3';

export type ParametersByType<TType> =
  TType extends 'postgres-js' ?
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
  [any, Parameters<typeof import('drizzle-orm/better-sqlite3')['drizzle']>[1]]
  : [];

export type ReturnTypeByType<TType, TSchema extends Record<string, unknown> = Record<string, unknown>> =
  TType extends 'postgres-js' ?
  ReturnType<typeof drizzlePostgresJs<TSchema>> :
  TType extends 'node-postgres' ?
  ReturnType<typeof drizzleNodePostgres<TSchema>>
  : TType extends 'neon-http' ?
  ReturnType<typeof drizzleNeonHttp<TSchema>>
  : TType extends 'xata-http' ?
  ReturnType<typeof drizzleXataHttp<TSchema>>
  : TType extends 'pglite' ?
  ReturnType<typeof drizzlePglite<TSchema>>
  : TType extends 'vercel-postgres' ?
  ReturnType<typeof drizzleVercelPostgres<TSchema>>
  : TType extends 'aws-data-api/pg' ?
  ReturnType<typeof drizzleAwsDataApiPg<TSchema>>
  : TType extends 'pg-proxy' ?
  ReturnType<typeof drizzlePgProxy<TSchema>>
  : TType extends 'libsql' ?
  ReturnType<typeof drizzleLibsql<TSchema>>
  : TType extends 'd1' ?
  ReturnType<typeof drizzleD1<TSchema>>
  : TType extends 'bun-sqlite' ?
  ReturnType<typeof drizzleBunSqlite<TSchema>>
  : TType extends 'expo-sqlite' ?
  ReturnType<typeof drizzleExpoSqlite<TSchema>>
  : TType extends 'op-sqlite' ?
  ReturnType<typeof drizzleOpSqlite<TSchema>>
  : TType extends 'better-sqlite3' ?
  ReturnType<typeof drizzleBetterSqlite3<TSchema>>
  : [];

  // aqui
