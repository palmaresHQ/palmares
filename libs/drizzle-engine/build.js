import fs from 'fs';
import path from 'path';


const dataToLoop =  {
  "./alias": {
    "import": {
      "types": "./alias.d.ts",
      "default": "./alias.js"
    },
    "require": {
      "types": "./alias.d.cts",
      "default": "./alias.cjs"
    },
    "types": "./alias.d.ts",
    "default": "./alias.js"
  },
  "./batch": {
    "import": {
      "types": "./batch.d.ts",
      "default": "./batch.js"
    },
    "require": {
      "types": "./batch.d.cts",
      "default": "./batch.cjs"
    },
    "types": "./batch.d.ts",
    "default": "./batch.js"
  },
  "./casing": {
    "import": {
      "types": "./casing.d.ts",
      "default": "./casing.js"
    },
    "require": {
      "types": "./casing.d.cts",
      "default": "./casing.cjs"
    },
    "types": "./casing.d.ts",
    "default": "./casing.js"
  },
  "./column-builder": {
    "import": {
      "types": "./column-builder.d.ts",
      "default": "./column-builder.js"
    },
    "require": {
      "types": "./column-builder.d.cts",
      "default": "./column-builder.cjs"
    },
    "types": "./column-builder.d.ts",
    "default": "./column-builder.js"
  },
  "./column": {
    "import": {
      "types": "./column.d.ts",
      "default": "./column.js"
    },
    "require": {
      "types": "./column.d.cts",
      "default": "./column.cjs"
    },
    "types": "./column.d.ts",
    "default": "./column.js"
  },
  "./entity": {
    "import": {
      "types": "./entity.d.ts",
      "default": "./entity.js"
    },
    "require": {
      "types": "./entity.d.cts",
      "default": "./entity.cjs"
    },
    "types": "./entity.d.ts",
    "default": "./entity.js"
  },
  "./errors": {
    "import": {
      "types": "./errors.d.ts",
      "default": "./errors.js"
    },
    "require": {
      "types": "./errors.d.cts",
      "default": "./errors.cjs"
    },
    "types": "./errors.d.ts",
    "default": "./errors.js"
  },
  "./expressions": {
    "import": {
      "types": "./expressions.d.ts",
      "default": "./expressions.js"
    },
    "require": {
      "types": "./expressions.d.cts",
      "default": "./expressions.cjs"
    },
    "types": "./expressions.d.ts",
    "default": "./expressions.js"
  },
  ".": {
    "import": {
      "types": "./index.d.ts",
      "default": "./index.js"
    },
    "require": {
      "types": "./index.d.cts",
      "default": "./index.cjs"
    },
    "types": "./index.d.ts",
    "default": "./index.js"
  },
  "./logger": {
    "import": {
      "types": "./logger.d.ts",
      "default": "./logger.js"
    },
    "require": {
      "types": "./logger.d.cts",
      "default": "./logger.cjs"
    },
    "types": "./logger.d.ts",
    "default": "./logger.js"
  },
  "./migrator": {
    "import": {
      "types": "./migrator.d.ts",
      "default": "./migrator.js"
    },
    "require": {
      "types": "./migrator.d.cts",
      "default": "./migrator.cjs"
    },
    "types": "./migrator.d.ts",
    "default": "./migrator.js"
  },
  "./operations": {
    "import": {
      "types": "./operations.d.ts",
      "default": "./operations.js"
    },
    "require": {
      "types": "./operations.d.cts",
      "default": "./operations.cjs"
    },
    "types": "./operations.d.ts",
    "default": "./operations.js"
  },
  "./primary-key": {
    "import": {
      "types": "./primary-key.d.ts",
      "default": "./primary-key.js"
    },
    "require": {
      "types": "./primary-key.d.cts",
      "default": "./primary-key.cjs"
    },
    "types": "./primary-key.d.ts",
    "default": "./primary-key.js"
  },
  "./query-promise": {
    "import": {
      "types": "./query-promise.d.ts",
      "default": "./query-promise.js"
    },
    "require": {
      "types": "./query-promise.d.cts",
      "default": "./query-promise.cjs"
    },
    "types": "./query-promise.d.ts",
    "default": "./query-promise.js"
  },
  "./relations": {
    "import": {
      "types": "./relations.d.ts",
      "default": "./relations.js"
    },
    "require": {
      "types": "./relations.d.cts",
      "default": "./relations.cjs"
    },
    "types": "./relations.d.ts",
    "default": "./relations.js"
  },
  "./runnable-query": {
    "import": {
      "types": "./runnable-query.d.ts",
      "default": "./runnable-query.js"
    },
    "require": {
      "types": "./runnable-query.d.cts",
      "default": "./runnable-query.cjs"
    },
    "types": "./runnable-query.d.ts",
    "default": "./runnable-query.js"
  },
  "./selection-proxy": {
    "import": {
      "types": "./selection-proxy.d.ts",
      "default": "./selection-proxy.js"
    },
    "require": {
      "types": "./selection-proxy.d.cts",
      "default": "./selection-proxy.cjs"
    },
    "types": "./selection-proxy.d.ts",
    "default": "./selection-proxy.js"
  },
  "./session": {
    "import": {
      "types": "./session.d.ts",
      "default": "./session.js"
    },
    "require": {
      "types": "./session.d.cts",
      "default": "./session.cjs"
    },
    "types": "./session.d.ts",
    "default": "./session.js"
  },
  "./subquery": {
    "import": {
      "types": "./subquery.d.ts",
      "default": "./subquery.js"
    },
    "require": {
      "types": "./subquery.d.cts",
      "default": "./subquery.cjs"
    },
    "types": "./subquery.d.ts",
    "default": "./subquery.js"
  },
  "./table": {
    "import": {
      "types": "./table.d.ts",
      "default": "./table.js"
    },
    "require": {
      "types": "./table.d.cts",
      "default": "./table.cjs"
    },
    "types": "./table.d.ts",
    "default": "./table.js"
  },
  "./table.utils": {
    "import": {
      "types": "./table.utils.d.ts",
      "default": "./table.utils.js"
    },
    "require": {
      "types": "./table.utils.d.cts",
      "default": "./table.utils.cjs"
    },
    "types": "./table.utils.d.ts",
    "default": "./table.utils.js"
  },
  "./tracing-utils": {
    "import": {
      "types": "./tracing-utils.d.ts",
      "default": "./tracing-utils.js"
    },
    "require": {
      "types": "./tracing-utils.d.cts",
      "default": "./tracing-utils.cjs"
    },
    "types": "./tracing-utils.d.ts",
    "default": "./tracing-utils.js"
  },
  "./tracing": {
    "import": {
      "types": "./tracing.d.ts",
      "default": "./tracing.js"
    },
    "require": {
      "types": "./tracing.d.cts",
      "default": "./tracing.cjs"
    },
    "types": "./tracing.d.ts",
    "default": "./tracing.js"
  },
  "./utils": {
    "import": {
      "types": "./utils.d.ts",
      "default": "./utils.js"
    },
    "require": {
      "types": "./utils.d.cts",
      "default": "./utils.cjs"
    },
    "types": "./utils.d.ts",
    "default": "./utils.js"
  },
  "./version": {
    "import": {
      "types": "./version.d.ts",
      "default": "./version.js"
    },
    "require": {
      "types": "./version.d.cts",
      "default": "./version.cjs"
    },
    "types": "./version.d.ts",
    "default": "./version.js"
  },
  "./view-common": {
    "import": {
      "types": "./view-common.d.ts",
      "default": "./view-common.js"
    },
    "require": {
      "types": "./view-common.d.cts",
      "default": "./view-common.cjs"
    },
    "types": "./view-common.d.ts",
    "default": "./view-common.js"
  },
  "./bun-sqlite/driver": {
    "import": {
      "types": "./bun-sqlite/driver.d.ts",
      "default": "./bun-sqlite/driver.js"
    },
    "require": {
      "types": "./bun-sqlite/driver.d.cts",
      "default": "./bun-sqlite/driver.cjs"
    },
    "types": "./bun-sqlite/driver.d.ts",
    "default": "./bun-sqlite/driver.js"
  },
  "./bun-sqlite": {
    "import": {
      "types": "./bun-sqlite/index.d.ts",
      "default": "./bun-sqlite/index.js"
    },
    "require": {
      "types": "./bun-sqlite/index.d.cts",
      "default": "./bun-sqlite/index.cjs"
    },
    "types": "./bun-sqlite/index.d.ts",
    "default": "./bun-sqlite/index.js"
  },
  "./bun-sqlite/migrator": {
    "import": {
      "types": "./bun-sqlite/migrator.d.ts",
      "default": "./bun-sqlite/migrator.js"
    },
    "require": {
      "types": "./bun-sqlite/migrator.d.cts",
      "default": "./bun-sqlite/migrator.cjs"
    },
    "types": "./bun-sqlite/migrator.d.ts",
    "default": "./bun-sqlite/migrator.js"
  },
  "./bun-sqlite/session": {
    "import": {
      "types": "./bun-sqlite/session.d.ts",
      "default": "./bun-sqlite/session.js"
    },
    "require": {
      "types": "./bun-sqlite/session.d.cts",
      "default": "./bun-sqlite/session.cjs"
    },
    "types": "./bun-sqlite/session.d.ts",
    "default": "./bun-sqlite/session.js"
  },
  "./better-sqlite3/driver": {
    "import": {
      "types": "./better-sqlite3/driver.d.ts",
      "default": "./better-sqlite3/driver.js"
    },
    "require": {
      "types": "./better-sqlite3/driver.d.cts",
      "default": "./better-sqlite3/driver.cjs"
    },
    "types": "./better-sqlite3/driver.d.ts",
    "default": "./better-sqlite3/driver.js"
  },
  "./better-sqlite3": {
    "import": {
      "types": "./better-sqlite3/index.d.ts",
      "default": "./better-sqlite3/index.js"
    },
    "require": {
      "types": "./better-sqlite3/index.d.cts",
      "default": "./better-sqlite3/index.cjs"
    },
    "types": "./better-sqlite3/index.d.ts",
    "default": "./better-sqlite3/index.js"
  },
  "./better-sqlite3/migrator": {
    "import": {
      "types": "./better-sqlite3/migrator.d.ts",
      "default": "./better-sqlite3/migrator.js"
    },
    "require": {
      "types": "./better-sqlite3/migrator.d.cts",
      "default": "./better-sqlite3/migrator.cjs"
    },
    "types": "./better-sqlite3/migrator.d.ts",
    "default": "./better-sqlite3/migrator.js"
  },
  "./better-sqlite3/session": {
    "import": {
      "types": "./better-sqlite3/session.d.ts",
      "default": "./better-sqlite3/session.js"
    },
    "require": {
      "types": "./better-sqlite3/session.d.cts",
      "default": "./better-sqlite3/session.cjs"
    },
    "types": "./better-sqlite3/session.d.ts",
    "default": "./better-sqlite3/session.js"
  },
  "./d1/driver": {
    "import": {
      "types": "./d1/driver.d.ts",
      "default": "./d1/driver.js"
    },
    "require": {
      "types": "./d1/driver.d.cts",
      "default": "./d1/driver.cjs"
    },
    "types": "./d1/driver.d.ts",
    "default": "./d1/driver.js"
  },
  "./d1": {
    "import": {
      "types": "./d1/index.d.ts",
      "default": "./d1/index.js"
    },
    "require": {
      "types": "./d1/index.d.cts",
      "default": "./d1/index.cjs"
    },
    "types": "./d1/index.d.ts",
    "default": "./d1/index.js"
  },
  "./d1/migrator": {
    "import": {
      "types": "./d1/migrator.d.ts",
      "default": "./d1/migrator.js"
    },
    "require": {
      "types": "./d1/migrator.d.cts",
      "default": "./d1/migrator.cjs"
    },
    "types": "./d1/migrator.d.ts",
    "default": "./d1/migrator.js"
  },
  "./d1/session": {
    "import": {
      "types": "./d1/session.d.ts",
      "default": "./d1/session.js"
    },
    "require": {
      "types": "./d1/session.d.cts",
      "default": "./d1/session.cjs"
    },
    "types": "./d1/session.d.ts",
    "default": "./d1/session.js"
  },
  "./expo-sqlite/driver": {
    "import": {
      "types": "./expo-sqlite/driver.d.ts",
      "default": "./expo-sqlite/driver.js"
    },
    "require": {
      "types": "./expo-sqlite/driver.d.cts",
      "default": "./expo-sqlite/driver.cjs"
    },
    "types": "./expo-sqlite/driver.d.ts",
    "default": "./expo-sqlite/driver.js"
  },
  "./expo-sqlite": {
    "import": {
      "types": "./expo-sqlite/index.d.ts",
      "default": "./expo-sqlite/index.js"
    },
    "require": {
      "types": "./expo-sqlite/index.d.cts",
      "default": "./expo-sqlite/index.cjs"
    },
    "types": "./expo-sqlite/index.d.ts",
    "default": "./expo-sqlite/index.js"
  },
  "./expo-sqlite/migrator": {
    "import": {
      "types": "./expo-sqlite/migrator.d.ts",
      "default": "./expo-sqlite/migrator.js"
    },
    "require": {
      "types": "./expo-sqlite/migrator.d.cts",
      "default": "./expo-sqlite/migrator.cjs"
    },
    "types": "./expo-sqlite/migrator.d.ts",
    "default": "./expo-sqlite/migrator.js"
  },
  "./expo-sqlite/query": {
    "import": {
      "types": "./expo-sqlite/query.d.ts",
      "default": "./expo-sqlite/query.js"
    },
    "require": {
      "types": "./expo-sqlite/query.d.cts",
      "default": "./expo-sqlite/query.cjs"
    },
    "types": "./expo-sqlite/query.d.ts",
    "default": "./expo-sqlite/query.js"
  },
  "./expo-sqlite/session": {
    "import": {
      "types": "./expo-sqlite/session.d.ts",
      "default": "./expo-sqlite/session.js"
    },
    "require": {
      "types": "./expo-sqlite/session.d.cts",
      "default": "./expo-sqlite/session.cjs"
    },
    "types": "./expo-sqlite/session.d.ts",
    "default": "./expo-sqlite/session.js"
  },
  "./knex": {
    "import": {
      "types": "./knex/index.d.ts",
      "default": "./knex/index.js"
    },
    "require": {
      "types": "./knex/index.d.cts",
      "default": "./knex/index.cjs"
    },
    "types": "./knex/index.d.ts",
    "default": "./knex/index.js"
  },
  "./kysely": {
    "import": {
      "types": "./kysely/index.d.ts",
      "default": "./kysely/index.js"
    },
    "require": {
      "types": "./kysely/index.d.cts",
      "default": "./kysely/index.cjs"
    },
    "types": "./kysely/index.d.ts",
    "default": "./kysely/index.js"
  },
  "./libsql/driver-core": {
    "import": {
      "types": "./libsql/driver-core.d.ts",
      "default": "./libsql/driver-core.js"
    },
    "require": {
      "types": "./libsql/driver-core.d.cts",
      "default": "./libsql/driver-core.cjs"
    },
    "types": "./libsql/driver-core.d.ts",
    "default": "./libsql/driver-core.js"
  },
  "./libsql/driver": {
    "import": {
      "types": "./libsql/driver.d.ts",
      "default": "./libsql/driver.js"
    },
    "require": {
      "types": "./libsql/driver.d.cts",
      "default": "./libsql/driver.cjs"
    },
    "types": "./libsql/driver.d.ts",
    "default": "./libsql/driver.js"
  },
  "./libsql": {
    "import": {
      "types": "./libsql/index.d.ts",
      "default": "./libsql/index.js"
    },
    "require": {
      "types": "./libsql/index.d.cts",
      "default": "./libsql/index.cjs"
    },
    "types": "./libsql/index.d.ts",
    "default": "./libsql/index.js"
  },
  "./libsql/migrator": {
    "import": {
      "types": "./libsql/migrator.d.ts",
      "default": "./libsql/migrator.js"
    },
    "require": {
      "types": "./libsql/migrator.d.cts",
      "default": "./libsql/migrator.cjs"
    },
    "types": "./libsql/migrator.d.ts",
    "default": "./libsql/migrator.js"
  },
  "./libsql/session": {
    "import": {
      "types": "./libsql/session.d.ts",
      "default": "./libsql/session.js"
    },
    "require": {
      "types": "./libsql/session.d.cts",
      "default": "./libsql/session.cjs"
    },
    "types": "./libsql/session.d.ts",
    "default": "./libsql/session.js"
  },
  "./mysql-core/alias": {
    "import": {
      "types": "./mysql-core/alias.d.ts",
      "default": "./mysql-core/alias.js"
    },
    "require": {
      "types": "./mysql-core/alias.d.cts",
      "default": "./mysql-core/alias.cjs"
    },
    "types": "./mysql-core/alias.d.ts",
    "default": "./mysql-core/alias.js"
  },
  "./mysql-core/checks": {
    "import": {
      "types": "./mysql-core/checks.d.ts",
      "default": "./mysql-core/checks.js"
    },
    "require": {
      "types": "./mysql-core/checks.d.cts",
      "default": "./mysql-core/checks.cjs"
    },
    "types": "./mysql-core/checks.d.ts",
    "default": "./mysql-core/checks.js"
  },
  "./mysql-core/db": {
    "import": {
      "types": "./mysql-core/db.d.ts",
      "default": "./mysql-core/db.js"
    },
    "require": {
      "types": "./mysql-core/db.d.cts",
      "default": "./mysql-core/db.cjs"
    },
    "types": "./mysql-core/db.d.ts",
    "default": "./mysql-core/db.js"
  },
  "./mysql-core/dialect": {
    "import": {
      "types": "./mysql-core/dialect.d.ts",
      "default": "./mysql-core/dialect.js"
    },
    "require": {
      "types": "./mysql-core/dialect.d.cts",
      "default": "./mysql-core/dialect.cjs"
    },
    "types": "./mysql-core/dialect.d.ts",
    "default": "./mysql-core/dialect.js"
  },
  "./mysql-core/expressions": {
    "import": {
      "types": "./mysql-core/expressions.d.ts",
      "default": "./mysql-core/expressions.js"
    },
    "require": {
      "types": "./mysql-core/expressions.d.cts",
      "default": "./mysql-core/expressions.cjs"
    },
    "types": "./mysql-core/expressions.d.ts",
    "default": "./mysql-core/expressions.js"
  },
  "./mysql-core/foreign-keys": {
    "import": {
      "types": "./mysql-core/foreign-keys.d.ts",
      "default": "./mysql-core/foreign-keys.js"
    },
    "require": {
      "types": "./mysql-core/foreign-keys.d.cts",
      "default": "./mysql-core/foreign-keys.cjs"
    },
    "types": "./mysql-core/foreign-keys.d.ts",
    "default": "./mysql-core/foreign-keys.js"
  },
  "./mysql-core": {
    "import": {
      "types": "./mysql-core/index.d.ts",
      "default": "./mysql-core/index.js"
    },
    "require": {
      "types": "./mysql-core/index.d.cts",
      "default": "./mysql-core/index.cjs"
    },
    "types": "./mysql-core/index.d.ts",
    "default": "./mysql-core/index.js"
  },
  "./mysql-core/indexes": {
    "import": {
      "types": "./mysql-core/indexes.d.ts",
      "default": "./mysql-core/indexes.js"
    },
    "require": {
      "types": "./mysql-core/indexes.d.cts",
      "default": "./mysql-core/indexes.cjs"
    },
    "types": "./mysql-core/indexes.d.ts",
    "default": "./mysql-core/indexes.js"
  },
  "./mysql-core/primary-keys": {
    "import": {
      "types": "./mysql-core/primary-keys.d.ts",
      "default": "./mysql-core/primary-keys.js"
    },
    "require": {
      "types": "./mysql-core/primary-keys.d.cts",
      "default": "./mysql-core/primary-keys.cjs"
    },
    "types": "./mysql-core/primary-keys.d.ts",
    "default": "./mysql-core/primary-keys.js"
  },
  "./mysql-core/schema": {
    "import": {
      "types": "./mysql-core/schema.d.ts",
      "default": "./mysql-core/schema.js"
    },
    "require": {
      "types": "./mysql-core/schema.d.cts",
      "default": "./mysql-core/schema.cjs"
    },
    "types": "./mysql-core/schema.d.ts",
    "default": "./mysql-core/schema.js"
  },
  "./mysql-core/session": {
    "import": {
      "types": "./mysql-core/session.d.ts",
      "default": "./mysql-core/session.js"
    },
    "require": {
      "types": "./mysql-core/session.d.cts",
      "default": "./mysql-core/session.cjs"
    },
    "types": "./mysql-core/session.d.ts",
    "default": "./mysql-core/session.js"
  },
  "./mysql-core/subquery": {
    "import": {
      "types": "./mysql-core/subquery.d.ts",
      "default": "./mysql-core/subquery.js"
    },
    "require": {
      "types": "./mysql-core/subquery.d.cts",
      "default": "./mysql-core/subquery.cjs"
    },
    "types": "./mysql-core/subquery.d.ts",
    "default": "./mysql-core/subquery.js"
  },
  "./mysql-core/table": {
    "import": {
      "types": "./mysql-core/table.d.ts",
      "default": "./mysql-core/table.js"
    },
    "require": {
      "types": "./mysql-core/table.d.cts",
      "default": "./mysql-core/table.cjs"
    },
    "types": "./mysql-core/table.d.ts",
    "default": "./mysql-core/table.js"
  },
  "./mysql-core/unique-constraint": {
    "import": {
      "types": "./mysql-core/unique-constraint.d.ts",
      "default": "./mysql-core/unique-constraint.js"
    },
    "require": {
      "types": "./mysql-core/unique-constraint.d.cts",
      "default": "./mysql-core/unique-constraint.cjs"
    },
    "types": "./mysql-core/unique-constraint.d.ts",
    "default": "./mysql-core/unique-constraint.js"
  },
  "./mysql-core/utils": {
    "import": {
      "types": "./mysql-core/utils.d.ts",
      "default": "./mysql-core/utils.js"
    },
    "require": {
      "types": "./mysql-core/utils.d.cts",
      "default": "./mysql-core/utils.cjs"
    },
    "types": "./mysql-core/utils.d.ts",
    "default": "./mysql-core/utils.js"
  },
  "./mysql-core/view-base": {
    "import": {
      "types": "./mysql-core/view-base.d.ts",
      "default": "./mysql-core/view-base.js"
    },
    "require": {
      "types": "./mysql-core/view-base.d.cts",
      "default": "./mysql-core/view-base.cjs"
    },
    "types": "./mysql-core/view-base.d.ts",
    "default": "./mysql-core/view-base.js"
  },
  "./mysql-core/view-common": {
    "import": {
      "types": "./mysql-core/view-common.d.ts",
      "default": "./mysql-core/view-common.js"
    },
    "require": {
      "types": "./mysql-core/view-common.d.cts",
      "default": "./mysql-core/view-common.cjs"
    },
    "types": "./mysql-core/view-common.d.ts",
    "default": "./mysql-core/view-common.js"
  },
  "./mysql-core/view": {
    "import": {
      "types": "./mysql-core/view.d.ts",
      "default": "./mysql-core/view.js"
    },
    "require": {
      "types": "./mysql-core/view.d.cts",
      "default": "./mysql-core/view.cjs"
    },
    "types": "./mysql-core/view.d.ts",
    "default": "./mysql-core/view.js"
  },
  "./mysql-proxy/driver": {
    "import": {
      "types": "./mysql-proxy/driver.d.ts",
      "default": "./mysql-proxy/driver.js"
    },
    "require": {
      "types": "./mysql-proxy/driver.d.cts",
      "default": "./mysql-proxy/driver.cjs"
    },
    "types": "./mysql-proxy/driver.d.ts",
    "default": "./mysql-proxy/driver.js"
  },
  "./mysql-proxy": {
    "import": {
      "types": "./mysql-proxy/index.d.ts",
      "default": "./mysql-proxy/index.js"
    },
    "require": {
      "types": "./mysql-proxy/index.d.cts",
      "default": "./mysql-proxy/index.cjs"
    },
    "types": "./mysql-proxy/index.d.ts",
    "default": "./mysql-proxy/index.js"
  },
  "./mysql-proxy/migrator": {
    "import": {
      "types": "./mysql-proxy/migrator.d.ts",
      "default": "./mysql-proxy/migrator.js"
    },
    "require": {
      "types": "./mysql-proxy/migrator.d.cts",
      "default": "./mysql-proxy/migrator.cjs"
    },
    "types": "./mysql-proxy/migrator.d.ts",
    "default": "./mysql-proxy/migrator.js"
  },
  "./mysql-proxy/session": {
    "import": {
      "types": "./mysql-proxy/session.d.ts",
      "default": "./mysql-proxy/session.js"
    },
    "require": {
      "types": "./mysql-proxy/session.d.cts",
      "default": "./mysql-proxy/session.cjs"
    },
    "types": "./mysql-proxy/session.d.ts",
    "default": "./mysql-proxy/session.js"
  },
  "./mysql2/driver": {
    "import": {
      "types": "./mysql2/driver.d.ts",
      "default": "./mysql2/driver.js"
    },
    "require": {
      "types": "./mysql2/driver.d.cts",
      "default": "./mysql2/driver.cjs"
    },
    "types": "./mysql2/driver.d.ts",
    "default": "./mysql2/driver.js"
  },
  "./mysql2": {
    "import": {
      "types": "./mysql2/index.d.ts",
      "default": "./mysql2/index.js"
    },
    "require": {
      "types": "./mysql2/index.d.cts",
      "default": "./mysql2/index.cjs"
    },
    "types": "./mysql2/index.d.ts",
    "default": "./mysql2/index.js"
  },
  "./mysql2/migrator": {
    "import": {
      "types": "./mysql2/migrator.d.ts",
      "default": "./mysql2/migrator.js"
    },
    "require": {
      "types": "./mysql2/migrator.d.cts",
      "default": "./mysql2/migrator.cjs"
    },
    "types": "./mysql2/migrator.d.ts",
    "default": "./mysql2/migrator.js"
  },
  "./mysql2/session": {
    "import": {
      "types": "./mysql2/session.d.ts",
      "default": "./mysql2/session.js"
    },
    "require": {
      "types": "./mysql2/session.d.cts",
      "default": "./mysql2/session.cjs"
    },
    "types": "./mysql2/session.d.ts",
    "default": "./mysql2/session.js"
  },
  "./neon": {
    "import": {
      "types": "./neon/index.d.ts",
      "default": "./neon/index.js"
    },
    "require": {
      "types": "./neon/index.d.cts",
      "default": "./neon/index.cjs"
    },
    "types": "./neon/index.d.ts",
    "default": "./neon/index.js"
  },
  "./neon/rls": {
    "import": {
      "types": "./neon/rls.d.ts",
      "default": "./neon/rls.js"
    },
    "require": {
      "types": "./neon/rls.d.cts",
      "default": "./neon/rls.cjs"
    },
    "types": "./neon/rls.d.ts",
    "default": "./neon/rls.js"
  },
  "./neon-http/driver": {
    "import": {
      "types": "./neon-http/driver.d.ts",
      "default": "./neon-http/driver.js"
    },
    "require": {
      "types": "./neon-http/driver.d.cts",
      "default": "./neon-http/driver.cjs"
    },
    "types": "./neon-http/driver.d.ts",
    "default": "./neon-http/driver.js"
  },
  "./neon-http": {
    "import": {
      "types": "./neon-http/index.d.ts",
      "default": "./neon-http/index.js"
    },
    "require": {
      "types": "./neon-http/index.d.cts",
      "default": "./neon-http/index.cjs"
    },
    "types": "./neon-http/index.d.ts",
    "default": "./neon-http/index.js"
  },
  "./neon-http/migrator": {
    "import": {
      "types": "./neon-http/migrator.d.ts",
      "default": "./neon-http/migrator.js"
    },
    "require": {
      "types": "./neon-http/migrator.d.cts",
      "default": "./neon-http/migrator.cjs"
    },
    "types": "./neon-http/migrator.d.ts",
    "default": "./neon-http/migrator.js"
  },
  "./neon-http/session": {
    "import": {
      "types": "./neon-http/session.d.ts",
      "default": "./neon-http/session.js"
    },
    "require": {
      "types": "./neon-http/session.d.cts",
      "default": "./neon-http/session.cjs"
    },
    "types": "./neon-http/session.d.ts",
    "default": "./neon-http/session.js"
  },
  "./neon-serverless/driver": {
    "import": {
      "types": "./neon-serverless/driver.d.ts",
      "default": "./neon-serverless/driver.js"
    },
    "require": {
      "types": "./neon-serverless/driver.d.cts",
      "default": "./neon-serverless/driver.cjs"
    },
    "types": "./neon-serverless/driver.d.ts",
    "default": "./neon-serverless/driver.js"
  },
  "./neon-serverless": {
    "import": {
      "types": "./neon-serverless/index.d.ts",
      "default": "./neon-serverless/index.js"
    },
    "require": {
      "types": "./neon-serverless/index.d.cts",
      "default": "./neon-serverless/index.cjs"
    },
    "types": "./neon-serverless/index.d.ts",
    "default": "./neon-serverless/index.js"
  },
  "./neon-serverless/migrator": {
    "import": {
      "types": "./neon-serverless/migrator.d.ts",
      "default": "./neon-serverless/migrator.js"
    },
    "require": {
      "types": "./neon-serverless/migrator.d.cts",
      "default": "./neon-serverless/migrator.cjs"
    },
    "types": "./neon-serverless/migrator.d.ts",
    "default": "./neon-serverless/migrator.js"
  },
  "./neon-serverless/session": {
    "import": {
      "types": "./neon-serverless/session.d.ts",
      "default": "./neon-serverless/session.js"
    },
    "require": {
      "types": "./neon-serverless/session.d.cts",
      "default": "./neon-serverless/session.cjs"
    },
    "types": "./neon-serverless/session.d.ts",
    "default": "./neon-serverless/session.js"
  },
  "./node-postgres/driver": {
    "import": {
      "types": "./node-postgres/driver.d.ts",
      "default": "./node-postgres/driver.js"
    },
    "require": {
      "types": "./node-postgres/driver.d.cts",
      "default": "./node-postgres/driver.cjs"
    },
    "types": "./node-postgres/driver.d.ts",
    "default": "./node-postgres/driver.js"
  },
  "./node-postgres": {
    "import": {
      "types": "./node-postgres/index.d.ts",
      "default": "./node-postgres/index.js"
    },
    "require": {
      "types": "./node-postgres/index.d.cts",
      "default": "./node-postgres/index.cjs"
    },
    "types": "./node-postgres/index.d.ts",
    "default": "./node-postgres/index.js"
  },
  "./node-postgres/migrator": {
    "import": {
      "types": "./node-postgres/migrator.d.ts",
      "default": "./node-postgres/migrator.js"
    },
    "require": {
      "types": "./node-postgres/migrator.d.cts",
      "default": "./node-postgres/migrator.cjs"
    },
    "types": "./node-postgres/migrator.d.ts",
    "default": "./node-postgres/migrator.js"
  },
  "./node-postgres/session": {
    "import": {
      "types": "./node-postgres/session.d.ts",
      "default": "./node-postgres/session.js"
    },
    "require": {
      "types": "./node-postgres/session.d.cts",
      "default": "./node-postgres/session.cjs"
    },
    "types": "./node-postgres/session.d.ts",
    "default": "./node-postgres/session.js"
  },
  "./op-sqlite/driver": {
    "import": {
      "types": "./op-sqlite/driver.d.ts",
      "default": "./op-sqlite/driver.js"
    },
    "require": {
      "types": "./op-sqlite/driver.d.cts",
      "default": "./op-sqlite/driver.cjs"
    },
    "types": "./op-sqlite/driver.d.ts",
    "default": "./op-sqlite/driver.js"
  },
  "./op-sqlite": {
    "import": {
      "types": "./op-sqlite/index.d.ts",
      "default": "./op-sqlite/index.js"
    },
    "require": {
      "types": "./op-sqlite/index.d.cts",
      "default": "./op-sqlite/index.cjs"
    },
    "types": "./op-sqlite/index.d.ts",
    "default": "./op-sqlite/index.js"
  },
  "./op-sqlite/migrator": {
    "import": {
      "types": "./op-sqlite/migrator.d.ts",
      "default": "./op-sqlite/migrator.js"
    },
    "require": {
      "types": "./op-sqlite/migrator.d.cts",
      "default": "./op-sqlite/migrator.cjs"
    },
    "types": "./op-sqlite/migrator.d.ts",
    "default": "./op-sqlite/migrator.js"
  },
  "./op-sqlite/session": {
    "import": {
      "types": "./op-sqlite/session.d.ts",
      "default": "./op-sqlite/session.js"
    },
    "require": {
      "types": "./op-sqlite/session.d.cts",
      "default": "./op-sqlite/session.cjs"
    },
    "types": "./op-sqlite/session.d.ts",
    "default": "./op-sqlite/session.js"
  },
  "./pg-core/alias": {
    "import": {
      "types": "./pg-core/alias.d.ts",
      "default": "./pg-core/alias.js"
    },
    "require": {
      "types": "./pg-core/alias.d.cts",
      "default": "./pg-core/alias.cjs"
    },
    "types": "./pg-core/alias.d.ts",
    "default": "./pg-core/alias.js"
  },
  "./pg-core/checks": {
    "import": {
      "types": "./pg-core/checks.d.ts",
      "default": "./pg-core/checks.js"
    },
    "require": {
      "types": "./pg-core/checks.d.cts",
      "default": "./pg-core/checks.cjs"
    },
    "types": "./pg-core/checks.d.ts",
    "default": "./pg-core/checks.js"
  },
  "./pg-core/db": {
    "import": {
      "types": "./pg-core/db.d.ts",
      "default": "./pg-core/db.js"
    },
    "require": {
      "types": "./pg-core/db.d.cts",
      "default": "./pg-core/db.cjs"
    },
    "types": "./pg-core/db.d.ts",
    "default": "./pg-core/db.js"
  },
  "./pg-core/dialect": {
    "import": {
      "types": "./pg-core/dialect.d.ts",
      "default": "./pg-core/dialect.js"
    },
    "require": {
      "types": "./pg-core/dialect.d.cts",
      "default": "./pg-core/dialect.cjs"
    },
    "types": "./pg-core/dialect.d.ts",
    "default": "./pg-core/dialect.js"
  },
  "./pg-core/expressions": {
    "import": {
      "types": "./pg-core/expressions.d.ts",
      "default": "./pg-core/expressions.js"
    },
    "require": {
      "types": "./pg-core/expressions.d.cts",
      "default": "./pg-core/expressions.cjs"
    },
    "types": "./pg-core/expressions.d.ts",
    "default": "./pg-core/expressions.js"
  },
  "./pg-core/foreign-keys": {
    "import": {
      "types": "./pg-core/foreign-keys.d.ts",
      "default": "./pg-core/foreign-keys.js"
    },
    "require": {
      "types": "./pg-core/foreign-keys.d.cts",
      "default": "./pg-core/foreign-keys.cjs"
    },
    "types": "./pg-core/foreign-keys.d.ts",
    "default": "./pg-core/foreign-keys.js"
  },
  "./pg-core": {
    "import": {
      "types": "./pg-core/index.d.ts",
      "default": "./pg-core/index.js"
    },
    "require": {
      "types": "./pg-core/index.d.cts",
      "default": "./pg-core/index.cjs"
    },
    "types": "./pg-core/index.d.ts",
    "default": "./pg-core/index.js"
  },
  "./pg-core/indexes": {
    "import": {
      "types": "./pg-core/indexes.d.ts",
      "default": "./pg-core/indexes.js"
    },
    "require": {
      "types": "./pg-core/indexes.d.cts",
      "default": "./pg-core/indexes.cjs"
    },
    "types": "./pg-core/indexes.d.ts",
    "default": "./pg-core/indexes.js"
  },
  "./pg-core/policies": {
    "import": {
      "types": "./pg-core/policies.d.ts",
      "default": "./pg-core/policies.js"
    },
    "require": {
      "types": "./pg-core/policies.d.cts",
      "default": "./pg-core/policies.cjs"
    },
    "types": "./pg-core/policies.d.ts",
    "default": "./pg-core/policies.js"
  },
  "./pg-core/primary-keys": {
    "import": {
      "types": "./pg-core/primary-keys.d.ts",
      "default": "./pg-core/primary-keys.js"
    },
    "require": {
      "types": "./pg-core/primary-keys.d.cts",
      "default": "./pg-core/primary-keys.cjs"
    },
    "types": "./pg-core/primary-keys.d.ts",
    "default": "./pg-core/primary-keys.js"
  },
  "./pg-core/roles": {
    "import": {
      "types": "./pg-core/roles.d.ts",
      "default": "./pg-core/roles.js"
    },
    "require": {
      "types": "./pg-core/roles.d.cts",
      "default": "./pg-core/roles.cjs"
    },
    "types": "./pg-core/roles.d.ts",
    "default": "./pg-core/roles.js"
  },
  "./pg-core/schema": {
    "import": {
      "types": "./pg-core/schema.d.ts",
      "default": "./pg-core/schema.js"
    },
    "require": {
      "types": "./pg-core/schema.d.cts",
      "default": "./pg-core/schema.cjs"
    },
    "types": "./pg-core/schema.d.ts",
    "default": "./pg-core/schema.js"
  },
  "./pg-core/sequence": {
    "import": {
      "types": "./pg-core/sequence.d.ts",
      "default": "./pg-core/sequence.js"
    },
    "require": {
      "types": "./pg-core/sequence.d.cts",
      "default": "./pg-core/sequence.cjs"
    },
    "types": "./pg-core/sequence.d.ts",
    "default": "./pg-core/sequence.js"
  },
  "./pg-core/session": {
    "import": {
      "types": "./pg-core/session.d.ts",
      "default": "./pg-core/session.js"
    },
    "require": {
      "types": "./pg-core/session.d.cts",
      "default": "./pg-core/session.cjs"
    },
    "types": "./pg-core/session.d.ts",
    "default": "./pg-core/session.js"
  },
  "./pg-core/subquery": {
    "import": {
      "types": "./pg-core/subquery.d.ts",
      "default": "./pg-core/subquery.js"
    },
    "require": {
      "types": "./pg-core/subquery.d.cts",
      "default": "./pg-core/subquery.cjs"
    },
    "types": "./pg-core/subquery.d.ts",
    "default": "./pg-core/subquery.js"
  },
  "./pg-core/table": {
    "import": {
      "types": "./pg-core/table.d.ts",
      "default": "./pg-core/table.js"
    },
    "require": {
      "types": "./pg-core/table.d.cts",
      "default": "./pg-core/table.cjs"
    },
    "types": "./pg-core/table.d.ts",
    "default": "./pg-core/table.js"
  },
  "./pg-core/unique-constraint": {
    "import": {
      "types": "./pg-core/unique-constraint.d.ts",
      "default": "./pg-core/unique-constraint.js"
    },
    "require": {
      "types": "./pg-core/unique-constraint.d.cts",
      "default": "./pg-core/unique-constraint.cjs"
    },
    "types": "./pg-core/unique-constraint.d.ts",
    "default": "./pg-core/unique-constraint.js"
  },
  "./pg-core/utils": {
    "import": {
      "types": "./pg-core/utils/index.d.ts",
      "default": "./pg-core/utils/index.js"
    },
    "require": {
      "types": "./pg-core/utils/index.d.cts",
      "default": "./pg-core/utils/index.cjs"
    },
    "types": "./pg-core/utils/index.d.ts",
    "default": "./pg-core/utils/index.js"
  },
  "./pg-core/view-base": {
    "import": {
      "types": "./pg-core/view-base.d.ts",
      "default": "./pg-core/view-base.js"
    },
    "require": {
      "types": "./pg-core/view-base.d.cts",
      "default": "./pg-core/view-base.cjs"
    },
    "types": "./pg-core/view-base.d.ts",
    "default": "./pg-core/view-base.js"
  },
  "./pg-core/view-common": {
    "import": {
      "types": "./pg-core/view-common.d.ts",
      "default": "./pg-core/view-common.js"
    },
    "require": {
      "types": "./pg-core/view-common.d.cts",
      "default": "./pg-core/view-common.cjs"
    },
    "types": "./pg-core/view-common.d.ts",
    "default": "./pg-core/view-common.js"
  },
  "./pg-core/view": {
    "import": {
      "types": "./pg-core/view.d.ts",
      "default": "./pg-core/view.js"
    },
    "require": {
      "types": "./pg-core/view.d.cts",
      "default": "./pg-core/view.cjs"
    },
    "types": "./pg-core/view.d.ts",
    "default": "./pg-core/view.js"
  },
  "./pg-proxy/driver": {
    "import": {
      "types": "./pg-proxy/driver.d.ts",
      "default": "./pg-proxy/driver.js"
    },
    "require": {
      "types": "./pg-proxy/driver.d.cts",
      "default": "./pg-proxy/driver.cjs"
    },
    "types": "./pg-proxy/driver.d.ts",
    "default": "./pg-proxy/driver.js"
  },
  "./pg-proxy": {
    "import": {
      "types": "./pg-proxy/index.d.ts",
      "default": "./pg-proxy/index.js"
    },
    "require": {
      "types": "./pg-proxy/index.d.cts",
      "default": "./pg-proxy/index.cjs"
    },
    "types": "./pg-proxy/index.d.ts",
    "default": "./pg-proxy/index.js"
  },
  "./pg-proxy/migrator": {
    "import": {
      "types": "./pg-proxy/migrator.d.ts",
      "default": "./pg-proxy/migrator.js"
    },
    "require": {
      "types": "./pg-proxy/migrator.d.cts",
      "default": "./pg-proxy/migrator.cjs"
    },
    "types": "./pg-proxy/migrator.d.ts",
    "default": "./pg-proxy/migrator.js"
  },
  "./pg-proxy/session": {
    "import": {
      "types": "./pg-proxy/session.d.ts",
      "default": "./pg-proxy/session.js"
    },
    "require": {
      "types": "./pg-proxy/session.d.cts",
      "default": "./pg-proxy/session.cjs"
    },
    "types": "./pg-proxy/session.d.ts",
    "default": "./pg-proxy/session.js"
  },
  "./pglite/driver": {
    "import": {
      "types": "./pglite/driver.d.ts",
      "default": "./pglite/driver.js"
    },
    "require": {
      "types": "./pglite/driver.d.cts",
      "default": "./pglite/driver.cjs"
    },
    "types": "./pglite/driver.d.ts",
    "default": "./pglite/driver.js"
  },
  "./pglite": {
    "import": {
      "types": "./pglite/index.d.ts",
      "default": "./pglite/index.js"
    },
    "require": {
      "types": "./pglite/index.d.cts",
      "default": "./pglite/index.cjs"
    },
    "types": "./pglite/index.d.ts",
    "default": "./pglite/index.js"
  },
  "./pglite/migrator": {
    "import": {
      "types": "./pglite/migrator.d.ts",
      "default": "./pglite/migrator.js"
    },
    "require": {
      "types": "./pglite/migrator.d.cts",
      "default": "./pglite/migrator.cjs"
    },
    "types": "./pglite/migrator.d.ts",
    "default": "./pglite/migrator.js"
  },
  "./pglite/session": {
    "import": {
      "types": "./pglite/session.d.ts",
      "default": "./pglite/session.js"
    },
    "require": {
      "types": "./pglite/session.d.cts",
      "default": "./pglite/session.cjs"
    },
    "types": "./pglite/session.d.ts",
    "default": "./pglite/session.js"
  },
  "./planetscale-serverless/driver": {
    "import": {
      "types": "./planetscale-serverless/driver.d.ts",
      "default": "./planetscale-serverless/driver.js"
    },
    "require": {
      "types": "./planetscale-serverless/driver.d.cts",
      "default": "./planetscale-serverless/driver.cjs"
    },
    "types": "./planetscale-serverless/driver.d.ts",
    "default": "./planetscale-serverless/driver.js"
  },
  "./planetscale-serverless": {
    "import": {
      "types": "./planetscale-serverless/index.d.ts",
      "default": "./planetscale-serverless/index.js"
    },
    "require": {
      "types": "./planetscale-serverless/index.d.cts",
      "default": "./planetscale-serverless/index.cjs"
    },
    "types": "./planetscale-serverless/index.d.ts",
    "default": "./planetscale-serverless/index.js"
  },
  "./planetscale-serverless/migrator": {
    "import": {
      "types": "./planetscale-serverless/migrator.d.ts",
      "default": "./planetscale-serverless/migrator.js"
    },
    "require": {
      "types": "./planetscale-serverless/migrator.d.cts",
      "default": "./planetscale-serverless/migrator.cjs"
    },
    "types": "./planetscale-serverless/migrator.d.ts",
    "default": "./planetscale-serverless/migrator.js"
  },
  "./planetscale-serverless/session": {
    "import": {
      "types": "./planetscale-serverless/session.d.ts",
      "default": "./planetscale-serverless/session.js"
    },
    "require": {
      "types": "./planetscale-serverless/session.d.cts",
      "default": "./planetscale-serverless/session.cjs"
    },
    "types": "./planetscale-serverless/session.d.ts",
    "default": "./planetscale-serverless/session.js"
  },
  "./postgres-js/driver": {
    "import": {
      "types": "./postgres-js/driver.d.ts",
      "default": "./postgres-js/driver.js"
    },
    "require": {
      "types": "./postgres-js/driver.d.cts",
      "default": "./postgres-js/driver.cjs"
    },
    "types": "./postgres-js/driver.d.ts",
    "default": "./postgres-js/driver.js"
  },
  "./postgres-js": {
    "import": {
      "types": "./postgres-js/index.d.ts",
      "default": "./postgres-js/index.js"
    },
    "require": {
      "types": "./postgres-js/index.d.cts",
      "default": "./postgres-js/index.cjs"
    },
    "types": "./postgres-js/index.d.ts",
    "default": "./postgres-js/index.js"
  },
  "./postgres-js/migrator": {
    "import": {
      "types": "./postgres-js/migrator.d.ts",
      "default": "./postgres-js/migrator.js"
    },
    "require": {
      "types": "./postgres-js/migrator.d.cts",
      "default": "./postgres-js/migrator.cjs"
    },
    "types": "./postgres-js/migrator.d.ts",
    "default": "./postgres-js/migrator.js"
  },
  "./postgres-js/session": {
    "import": {
      "types": "./postgres-js/session.d.ts",
      "default": "./postgres-js/session.js"
    },
    "require": {
      "types": "./postgres-js/session.d.cts",
      "default": "./postgres-js/session.cjs"
    },
    "types": "./postgres-js/session.d.ts",
    "default": "./postgres-js/session.js"
  },
  "./query-builders/query-builder": {
    "import": {
      "types": "./query-builders/query-builder.d.ts",
      "default": "./query-builders/query-builder.js"
    },
    "require": {
      "types": "./query-builders/query-builder.d.cts",
      "default": "./query-builders/query-builder.cjs"
    },
    "types": "./query-builders/query-builder.d.ts",
    "default": "./query-builders/query-builder.js"
  },
  "./query-builders/select.types": {
    "import": {
      "types": "./query-builders/select.types.d.ts",
      "default": "./query-builders/select.types.js"
    },
    "require": {
      "types": "./query-builders/select.types.d.cts",
      "default": "./query-builders/select.types.cjs"
    },
    "types": "./query-builders/select.types.d.ts",
    "default": "./query-builders/select.types.js"
  },
  "./sql": {
    "import": {
      "types": "./sql/index.d.ts",
      "default": "./sql/index.js"
    },
    "require": {
      "types": "./sql/index.d.cts",
      "default": "./sql/index.cjs"
    },
    "types": "./sql/index.d.ts",
    "default": "./sql/index.js"
  },
  "./sql/sql": {
    "import": {
      "types": "./sql/sql.d.ts",
      "default": "./sql/sql.js"
    },
    "require": {
      "types": "./sql/sql.d.cts",
      "default": "./sql/sql.cjs"
    },
    "types": "./sql/sql.d.ts",
    "default": "./sql/sql.js"
  },
  "./sql-js/driver": {
    "import": {
      "types": "./sql-js/driver.d.ts",
      "default": "./sql-js/driver.js"
    },
    "require": {
      "types": "./sql-js/driver.d.cts",
      "default": "./sql-js/driver.cjs"
    },
    "types": "./sql-js/driver.d.ts",
    "default": "./sql-js/driver.js"
  },
  "./sql-js": {
    "import": {
      "types": "./sql-js/index.d.ts",
      "default": "./sql-js/index.js"
    },
    "require": {
      "types": "./sql-js/index.d.cts",
      "default": "./sql-js/index.cjs"
    },
    "types": "./sql-js/index.d.ts",
    "default": "./sql-js/index.js"
  },
  "./sql-js/migrator": {
    "import": {
      "types": "./sql-js/migrator.d.ts",
      "default": "./sql-js/migrator.js"
    },
    "require": {
      "types": "./sql-js/migrator.d.cts",
      "default": "./sql-js/migrator.cjs"
    },
    "types": "./sql-js/migrator.d.ts",
    "default": "./sql-js/migrator.js"
  },
  "./sql-js/session": {
    "import": {
      "types": "./sql-js/session.d.ts",
      "default": "./sql-js/session.js"
    },
    "require": {
      "types": "./sql-js/session.d.cts",
      "default": "./sql-js/session.cjs"
    },
    "types": "./sql-js/session.d.ts",
    "default": "./sql-js/session.js"
  },
  "./sqlite-core/alias": {
    "import": {
      "types": "./sqlite-core/alias.d.ts",
      "default": "./sqlite-core/alias.js"
    },
    "require": {
      "types": "./sqlite-core/alias.d.cts",
      "default": "./sqlite-core/alias.cjs"
    },
    "types": "./sqlite-core/alias.d.ts",
    "default": "./sqlite-core/alias.js"
  },
  "./sqlite-core/checks": {
    "import": {
      "types": "./sqlite-core/checks.d.ts",
      "default": "./sqlite-core/checks.js"
    },
    "require": {
      "types": "./sqlite-core/checks.d.cts",
      "default": "./sqlite-core/checks.cjs"
    },
    "types": "./sqlite-core/checks.d.ts",
    "default": "./sqlite-core/checks.js"
  },
  "./sqlite-core/db": {
    "import": {
      "types": "./sqlite-core/db.d.ts",
      "default": "./sqlite-core/db.js"
    },
    "require": {
      "types": "./sqlite-core/db.d.cts",
      "default": "./sqlite-core/db.cjs"
    },
    "types": "./sqlite-core/db.d.ts",
    "default": "./sqlite-core/db.js"
  },
  "./sqlite-core/dialect": {
    "import": {
      "types": "./sqlite-core/dialect.d.ts",
      "default": "./sqlite-core/dialect.js"
    },
    "require": {
      "types": "./sqlite-core/dialect.d.cts",
      "default": "./sqlite-core/dialect.cjs"
    },
    "types": "./sqlite-core/dialect.d.ts",
    "default": "./sqlite-core/dialect.js"
  },
  "./sqlite-core/expressions": {
    "import": {
      "types": "./sqlite-core/expressions.d.ts",
      "default": "./sqlite-core/expressions.js"
    },
    "require": {
      "types": "./sqlite-core/expressions.d.cts",
      "default": "./sqlite-core/expressions.cjs"
    },
    "types": "./sqlite-core/expressions.d.ts",
    "default": "./sqlite-core/expressions.js"
  },
  "./sqlite-core/foreign-keys": {
    "import": {
      "types": "./sqlite-core/foreign-keys.d.ts",
      "default": "./sqlite-core/foreign-keys.js"
    },
    "require": {
      "types": "./sqlite-core/foreign-keys.d.cts",
      "default": "./sqlite-core/foreign-keys.cjs"
    },
    "types": "./sqlite-core/foreign-keys.d.ts",
    "default": "./sqlite-core/foreign-keys.js"
  },
  "./sqlite-core": {
    "import": {
      "types": "./sqlite-core/index.d.ts",
      "default": "./sqlite-core/index.js"
    },
    "require": {
      "types": "./sqlite-core/index.d.cts",
      "default": "./sqlite-core/index.cjs"
    },
    "types": "./sqlite-core/index.d.ts",
    "default": "./sqlite-core/index.js"
  },
  "./sqlite-core/indexes": {
    "import": {
      "types": "./sqlite-core/indexes.d.ts",
      "default": "./sqlite-core/indexes.js"
    },
    "require": {
      "types": "./sqlite-core/indexes.d.cts",
      "default": "./sqlite-core/indexes.cjs"
    },
    "types": "./sqlite-core/indexes.d.ts",
    "default": "./sqlite-core/indexes.js"
  },
  "./sqlite-core/primary-keys": {
    "import": {
      "types": "./sqlite-core/primary-keys.d.ts",
      "default": "./sqlite-core/primary-keys.js"
    },
    "require": {
      "types": "./sqlite-core/primary-keys.d.cts",
      "default": "./sqlite-core/primary-keys.cjs"
    },
    "types": "./sqlite-core/primary-keys.d.ts",
    "default": "./sqlite-core/primary-keys.js"
  },
  "./sqlite-core/session": {
    "import": {
      "types": "./sqlite-core/session.d.ts",
      "default": "./sqlite-core/session.js"
    },
    "require": {
      "types": "./sqlite-core/session.d.cts",
      "default": "./sqlite-core/session.cjs"
    },
    "types": "./sqlite-core/session.d.ts",
    "default": "./sqlite-core/session.js"
  },
  "./sqlite-core/subquery": {
    "import": {
      "types": "./sqlite-core/subquery.d.ts",
      "default": "./sqlite-core/subquery.js"
    },
    "require": {
      "types": "./sqlite-core/subquery.d.cts",
      "default": "./sqlite-core/subquery.cjs"
    },
    "types": "./sqlite-core/subquery.d.ts",
    "default": "./sqlite-core/subquery.js"
  },
  "./sqlite-core/table": {
    "import": {
      "types": "./sqlite-core/table.d.ts",
      "default": "./sqlite-core/table.js"
    },
    "require": {
      "types": "./sqlite-core/table.d.cts",
      "default": "./sqlite-core/table.cjs"
    },
    "types": "./sqlite-core/table.d.ts",
    "default": "./sqlite-core/table.js"
  },
  "./sqlite-core/unique-constraint": {
    "import": {
      "types": "./sqlite-core/unique-constraint.d.ts",
      "default": "./sqlite-core/unique-constraint.js"
    },
    "require": {
      "types": "./sqlite-core/unique-constraint.d.cts",
      "default": "./sqlite-core/unique-constraint.cjs"
    },
    "types": "./sqlite-core/unique-constraint.d.ts",
    "default": "./sqlite-core/unique-constraint.js"
  },
  "./sqlite-core/utils": {
    "import": {
      "types": "./sqlite-core/utils.d.ts",
      "default": "./sqlite-core/utils.js"
    },
    "require": {
      "types": "./sqlite-core/utils.d.cts",
      "default": "./sqlite-core/utils.cjs"
    },
    "types": "./sqlite-core/utils.d.ts",
    "default": "./sqlite-core/utils.js"
  },
  "./sqlite-core/view-base": {
    "import": {
      "types": "./sqlite-core/view-base.d.ts",
      "default": "./sqlite-core/view-base.js"
    },
    "require": {
      "types": "./sqlite-core/view-base.d.cts",
      "default": "./sqlite-core/view-base.cjs"
    },
    "types": "./sqlite-core/view-base.d.ts",
    "default": "./sqlite-core/view-base.js"
  },
  "./sqlite-core/view-common": {
    "import": {
      "types": "./sqlite-core/view-common.d.ts",
      "default": "./sqlite-core/view-common.js"
    },
    "require": {
      "types": "./sqlite-core/view-common.d.cts",
      "default": "./sqlite-core/view-common.cjs"
    },
    "types": "./sqlite-core/view-common.d.ts",
    "default": "./sqlite-core/view-common.js"
  },
  "./sqlite-core/view": {
    "import": {
      "types": "./sqlite-core/view.d.ts",
      "default": "./sqlite-core/view.js"
    },
    "require": {
      "types": "./sqlite-core/view.d.cts",
      "default": "./sqlite-core/view.cjs"
    },
    "types": "./sqlite-core/view.d.ts",
    "default": "./sqlite-core/view.js"
  },
  "./sqlite-proxy/driver": {
    "import": {
      "types": "./sqlite-proxy/driver.d.ts",
      "default": "./sqlite-proxy/driver.js"
    },
    "require": {
      "types": "./sqlite-proxy/driver.d.cts",
      "default": "./sqlite-proxy/driver.cjs"
    },
    "types": "./sqlite-proxy/driver.d.ts",
    "default": "./sqlite-proxy/driver.js"
  },
  "./sqlite-proxy": {
    "import": {
      "types": "./sqlite-proxy/index.d.ts",
      "default": "./sqlite-proxy/index.js"
    },
    "require": {
      "types": "./sqlite-proxy/index.d.cts",
      "default": "./sqlite-proxy/index.cjs"
    },
    "types": "./sqlite-proxy/index.d.ts",
    "default": "./sqlite-proxy/index.js"
  },
  "./sqlite-proxy/migrator": {
    "import": {
      "types": "./sqlite-proxy/migrator.d.ts",
      "default": "./sqlite-proxy/migrator.js"
    },
    "require": {
      "types": "./sqlite-proxy/migrator.d.cts",
      "default": "./sqlite-proxy/migrator.cjs"
    },
    "types": "./sqlite-proxy/migrator.d.ts",
    "default": "./sqlite-proxy/migrator.js"
  },
  "./sqlite-proxy/session": {
    "import": {
      "types": "./sqlite-proxy/session.d.ts",
      "default": "./sqlite-proxy/session.js"
    },
    "require": {
      "types": "./sqlite-proxy/session.d.cts",
      "default": "./sqlite-proxy/session.cjs"
    },
    "types": "./sqlite-proxy/session.d.ts",
    "default": "./sqlite-proxy/session.js"
  },
  "./supabase": {
    "import": {
      "types": "./supabase/index.d.ts",
      "default": "./supabase/index.js"
    },
    "require": {
      "types": "./supabase/index.d.cts",
      "default": "./supabase/index.cjs"
    },
    "types": "./supabase/index.d.ts",
    "default": "./supabase/index.js"
  },
  "./supabase/rls": {
    "import": {
      "types": "./supabase/rls.d.ts",
      "default": "./supabase/rls.js"
    },
    "require": {
      "types": "./supabase/rls.d.cts",
      "default": "./supabase/rls.cjs"
    },
    "types": "./supabase/rls.d.ts",
    "default": "./supabase/rls.js"
  },
  "./tidb-serverless/driver": {
    "import": {
      "types": "./tidb-serverless/driver.d.ts",
      "default": "./tidb-serverless/driver.js"
    },
    "require": {
      "types": "./tidb-serverless/driver.d.cts",
      "default": "./tidb-serverless/driver.cjs"
    },
    "types": "./tidb-serverless/driver.d.ts",
    "default": "./tidb-serverless/driver.js"
  },
  "./tidb-serverless": {
    "import": {
      "types": "./tidb-serverless/index.d.ts",
      "default": "./tidb-serverless/index.js"
    },
    "require": {
      "types": "./tidb-serverless/index.d.cts",
      "default": "./tidb-serverless/index.cjs"
    },
    "types": "./tidb-serverless/index.d.ts",
    "default": "./tidb-serverless/index.js"
  },
  "./tidb-serverless/migrator": {
    "import": {
      "types": "./tidb-serverless/migrator.d.ts",
      "default": "./tidb-serverless/migrator.js"
    },
    "require": {
      "types": "./tidb-serverless/migrator.d.cts",
      "default": "./tidb-serverless/migrator.cjs"
    },
    "types": "./tidb-serverless/migrator.d.ts",
    "default": "./tidb-serverless/migrator.js"
  },
  "./tidb-serverless/session": {
    "import": {
      "types": "./tidb-serverless/session.d.ts",
      "default": "./tidb-serverless/session.js"
    },
    "require": {
      "types": "./tidb-serverless/session.d.cts",
      "default": "./tidb-serverless/session.cjs"
    },
    "types": "./tidb-serverless/session.d.ts",
    "default": "./tidb-serverless/session.js"
  },
  "./vercel-postgres/driver": {
    "import": {
      "types": "./vercel-postgres/driver.d.ts",
      "default": "./vercel-postgres/driver.js"
    },
    "require": {
      "types": "./vercel-postgres/driver.d.cts",
      "default": "./vercel-postgres/driver.cjs"
    },
    "types": "./vercel-postgres/driver.d.ts",
    "default": "./vercel-postgres/driver.js"
  },
  "./vercel-postgres": {
    "import": {
      "types": "./vercel-postgres/index.d.ts",
      "default": "./vercel-postgres/index.js"
    },
    "require": {
      "types": "./vercel-postgres/index.d.cts",
      "default": "./vercel-postgres/index.cjs"
    },
    "types": "./vercel-postgres/index.d.ts",
    "default": "./vercel-postgres/index.js"
  },
  "./vercel-postgres/migrator": {
    "import": {
      "types": "./vercel-postgres/migrator.d.ts",
      "default": "./vercel-postgres/migrator.js"
    },
    "require": {
      "types": "./vercel-postgres/migrator.d.cts",
      "default": "./vercel-postgres/migrator.cjs"
    },
    "types": "./vercel-postgres/migrator.d.ts",
    "default": "./vercel-postgres/migrator.js"
  },
  "./vercel-postgres/session": {
    "import": {
      "types": "./vercel-postgres/session.d.ts",
      "default": "./vercel-postgres/session.js"
    },
    "require": {
      "types": "./vercel-postgres/session.d.cts",
      "default": "./vercel-postgres/session.cjs"
    },
    "types": "./vercel-postgres/session.d.ts",
    "default": "./vercel-postgres/session.js"
  },
  "./xata-http/driver": {
    "import": {
      "types": "./xata-http/driver.d.ts",
      "default": "./xata-http/driver.js"
    },
    "require": {
      "types": "./xata-http/driver.d.cts",
      "default": "./xata-http/driver.cjs"
    },
    "types": "./xata-http/driver.d.ts",
    "default": "./xata-http/driver.js"
  },
  "./xata-http": {
    "import": {
      "types": "./xata-http/index.d.ts",
      "default": "./xata-http/index.js"
    },
    "require": {
      "types": "./xata-http/index.d.cts",
      "default": "./xata-http/index.cjs"
    },
    "types": "./xata-http/index.d.ts",
    "default": "./xata-http/index.js"
  },
  "./xata-http/migrator": {
    "import": {
      "types": "./xata-http/migrator.d.ts",
      "default": "./xata-http/migrator.js"
    },
    "require": {
      "types": "./xata-http/migrator.d.cts",
      "default": "./xata-http/migrator.cjs"
    },
    "types": "./xata-http/migrator.d.ts",
    "default": "./xata-http/migrator.js"
  },
  "./xata-http/session": {
    "import": {
      "types": "./xata-http/session.d.ts",
      "default": "./xata-http/session.js"
    },
    "require": {
      "types": "./xata-http/session.d.cts",
      "default": "./xata-http/session.cjs"
    },
    "types": "./xata-http/session.d.ts",
    "default": "./xata-http/session.js"
  },
  "./aws-data-api/common": {
    "import": {
      "types": "./aws-data-api/common/index.d.ts",
      "default": "./aws-data-api/common/index.js"
    },
    "require": {
      "types": "./aws-data-api/common/index.d.cts",
      "default": "./aws-data-api/common/index.cjs"
    },
    "types": "./aws-data-api/common/index.d.ts",
    "default": "./aws-data-api/common/index.js"
  },
  "./aws-data-api/pg/driver": {
    "import": {
      "types": "./aws-data-api/pg/driver.d.ts",
      "default": "./aws-data-api/pg/driver.js"
    },
    "require": {
      "types": "./aws-data-api/pg/driver.d.cts",
      "default": "./aws-data-api/pg/driver.cjs"
    },
    "types": "./aws-data-api/pg/driver.d.ts",
    "default": "./aws-data-api/pg/driver.js"
  },
  "./aws-data-api/pg": {
    "import": {
      "types": "./aws-data-api/pg/index.d.ts",
      "default": "./aws-data-api/pg/index.js"
    },
    "require": {
      "types": "./aws-data-api/pg/index.d.cts",
      "default": "./aws-data-api/pg/index.cjs"
    },
    "types": "./aws-data-api/pg/index.d.ts",
    "default": "./aws-data-api/pg/index.js"
  },
  "./aws-data-api/pg/migrator": {
    "import": {
      "types": "./aws-data-api/pg/migrator.d.ts",
      "default": "./aws-data-api/pg/migrator.js"
    },
    "require": {
      "types": "./aws-data-api/pg/migrator.d.cts",
      "default": "./aws-data-api/pg/migrator.cjs"
    },
    "types": "./aws-data-api/pg/migrator.d.ts",
    "default": "./aws-data-api/pg/migrator.js"
  },
  "./aws-data-api/pg/session": {
    "import": {
      "types": "./aws-data-api/pg/session.d.ts",
      "default": "./aws-data-api/pg/session.js"
    },
    "require": {
      "types": "./aws-data-api/pg/session.d.cts",
      "default": "./aws-data-api/pg/session.cjs"
    },
    "types": "./aws-data-api/pg/session.d.ts",
    "default": "./aws-data-api/pg/session.js"
  },
  "./libsql/http": {
    "import": {
      "types": "./libsql/http/index.d.ts",
      "default": "./libsql/http/index.js"
    },
    "require": {
      "types": "./libsql/http/index.d.cts",
      "default": "./libsql/http/index.cjs"
    },
    "types": "./libsql/http/index.d.ts",
    "default": "./libsql/http/index.js"
  },
  "./libsql/node": {
    "import": {
      "types": "./libsql/node/index.d.ts",
      "default": "./libsql/node/index.js"
    },
    "require": {
      "types": "./libsql/node/index.d.cts",
      "default": "./libsql/node/index.cjs"
    },
    "types": "./libsql/node/index.d.ts",
    "default": "./libsql/node/index.js"
  },
  "./libsql/sqlite3": {
    "import": {
      "types": "./libsql/sqlite3/index.d.ts",
      "default": "./libsql/sqlite3/index.js"
    },
    "require": {
      "types": "./libsql/sqlite3/index.d.cts",
      "default": "./libsql/sqlite3/index.cjs"
    },
    "types": "./libsql/sqlite3/index.d.ts",
    "default": "./libsql/sqlite3/index.js"
  },
  "./libsql/wasm": {
    "import": {
      "types": "./libsql/wasm/index.d.ts",
      "default": "./libsql/wasm/index.js"
    },
    "require": {
      "types": "./libsql/wasm/index.d.cts",
      "default": "./libsql/wasm/index.cjs"
    },
    "types": "./libsql/wasm/index.d.ts",
    "default": "./libsql/wasm/index.js"
  },
  "./libsql/web": {
    "import": {
      "types": "./libsql/web/index.d.ts",
      "default": "./libsql/web/index.js"
    },
    "require": {
      "types": "./libsql/web/index.d.cts",
      "default": "./libsql/web/index.cjs"
    },
    "types": "./libsql/web/index.d.ts",
    "default": "./libsql/web/index.js"
  },
  "./libsql/ws": {
    "import": {
      "types": "./libsql/ws/index.d.ts",
      "default": "./libsql/ws/index.js"
    },
    "require": {
      "types": "./libsql/ws/index.d.cts",
      "default": "./libsql/ws/index.cjs"
    },
    "types": "./libsql/ws/index.d.ts",
    "default": "./libsql/ws/index.js"
  },
  "./mysql-core/columns/all": {
    "import": {
      "types": "./mysql-core/columns/all.d.ts",
      "default": "./mysql-core/columns/all.js"
    },
    "require": {
      "types": "./mysql-core/columns/all.d.cts",
      "default": "./mysql-core/columns/all.cjs"
    },
    "types": "./mysql-core/columns/all.d.ts",
    "default": "./mysql-core/columns/all.js"
  },
  "./mysql-core/columns/bigint": {
    "import": {
      "types": "./mysql-core/columns/bigint.d.ts",
      "default": "./mysql-core/columns/bigint.js"
    },
    "require": {
      "types": "./mysql-core/columns/bigint.d.cts",
      "default": "./mysql-core/columns/bigint.cjs"
    },
    "types": "./mysql-core/columns/bigint.d.ts",
    "default": "./mysql-core/columns/bigint.js"
  },
  "./mysql-core/columns/binary": {
    "import": {
      "types": "./mysql-core/columns/binary.d.ts",
      "default": "./mysql-core/columns/binary.js"
    },
    "require": {
      "types": "./mysql-core/columns/binary.d.cts",
      "default": "./mysql-core/columns/binary.cjs"
    },
    "types": "./mysql-core/columns/binary.d.ts",
    "default": "./mysql-core/columns/binary.js"
  },
  "./mysql-core/columns/boolean": {
    "import": {
      "types": "./mysql-core/columns/boolean.d.ts",
      "default": "./mysql-core/columns/boolean.js"
    },
    "require": {
      "types": "./mysql-core/columns/boolean.d.cts",
      "default": "./mysql-core/columns/boolean.cjs"
    },
    "types": "./mysql-core/columns/boolean.d.ts",
    "default": "./mysql-core/columns/boolean.js"
  },
  "./mysql-core/columns/char": {
    "import": {
      "types": "./mysql-core/columns/char.d.ts",
      "default": "./mysql-core/columns/char.js"
    },
    "require": {
      "types": "./mysql-core/columns/char.d.cts",
      "default": "./mysql-core/columns/char.cjs"
    },
    "types": "./mysql-core/columns/char.d.ts",
    "default": "./mysql-core/columns/char.js"
  },
  "./mysql-core/columns/common": {
    "import": {
      "types": "./mysql-core/columns/common.d.ts",
      "default": "./mysql-core/columns/common.js"
    },
    "require": {
      "types": "./mysql-core/columns/common.d.cts",
      "default": "./mysql-core/columns/common.cjs"
    },
    "types": "./mysql-core/columns/common.d.ts",
    "default": "./mysql-core/columns/common.js"
  },
  "./mysql-core/columns/custom": {
    "import": {
      "types": "./mysql-core/columns/custom.d.ts",
      "default": "./mysql-core/columns/custom.js"
    },
    "require": {
      "types": "./mysql-core/columns/custom.d.cts",
      "default": "./mysql-core/columns/custom.cjs"
    },
    "types": "./mysql-core/columns/custom.d.ts",
    "default": "./mysql-core/columns/custom.js"
  },
  "./mysql-core/columns/date.common": {
    "import": {
      "types": "./mysql-core/columns/date.common.d.ts",
      "default": "./mysql-core/columns/date.common.js"
    },
    "require": {
      "types": "./mysql-core/columns/date.common.d.cts",
      "default": "./mysql-core/columns/date.common.cjs"
    },
    "types": "./mysql-core/columns/date.common.d.ts",
    "default": "./mysql-core/columns/date.common.js"
  },
  "./mysql-core/columns/date": {
    "import": {
      "types": "./mysql-core/columns/date.d.ts",
      "default": "./mysql-core/columns/date.js"
    },
    "require": {
      "types": "./mysql-core/columns/date.d.cts",
      "default": "./mysql-core/columns/date.cjs"
    },
    "types": "./mysql-core/columns/date.d.ts",
    "default": "./mysql-core/columns/date.js"
  },
  "./mysql-core/columns/datetime": {
    "import": {
      "types": "./mysql-core/columns/datetime.d.ts",
      "default": "./mysql-core/columns/datetime.js"
    },
    "require": {
      "types": "./mysql-core/columns/datetime.d.cts",
      "default": "./mysql-core/columns/datetime.cjs"
    },
    "types": "./mysql-core/columns/datetime.d.ts",
    "default": "./mysql-core/columns/datetime.js"
  },
  "./mysql-core/columns/decimal": {
    "import": {
      "types": "./mysql-core/columns/decimal.d.ts",
      "default": "./mysql-core/columns/decimal.js"
    },
    "require": {
      "types": "./mysql-core/columns/decimal.d.cts",
      "default": "./mysql-core/columns/decimal.cjs"
    },
    "types": "./mysql-core/columns/decimal.d.ts",
    "default": "./mysql-core/columns/decimal.js"
  },
  "./mysql-core/columns/double": {
    "import": {
      "types": "./mysql-core/columns/double.d.ts",
      "default": "./mysql-core/columns/double.js"
    },
    "require": {
      "types": "./mysql-core/columns/double.d.cts",
      "default": "./mysql-core/columns/double.cjs"
    },
    "types": "./mysql-core/columns/double.d.ts",
    "default": "./mysql-core/columns/double.js"
  },
  "./mysql-core/columns/enum": {
    "import": {
      "types": "./mysql-core/columns/enum.d.ts",
      "default": "./mysql-core/columns/enum.js"
    },
    "require": {
      "types": "./mysql-core/columns/enum.d.cts",
      "default": "./mysql-core/columns/enum.cjs"
    },
    "types": "./mysql-core/columns/enum.d.ts",
    "default": "./mysql-core/columns/enum.js"
  },
  "./mysql-core/columns/float": {
    "import": {
      "types": "./mysql-core/columns/float.d.ts",
      "default": "./mysql-core/columns/float.js"
    },
    "require": {
      "types": "./mysql-core/columns/float.d.cts",
      "default": "./mysql-core/columns/float.cjs"
    },
    "types": "./mysql-core/columns/float.d.ts",
    "default": "./mysql-core/columns/float.js"
  },
  "./mysql-core/columns": {
    "import": {
      "types": "./mysql-core/columns/index.d.ts",
      "default": "./mysql-core/columns/index.js"
    },
    "require": {
      "types": "./mysql-core/columns/index.d.cts",
      "default": "./mysql-core/columns/index.cjs"
    },
    "types": "./mysql-core/columns/index.d.ts",
    "default": "./mysql-core/columns/index.js"
  },
  "./mysql-core/columns/int": {
    "import": {
      "types": "./mysql-core/columns/int.d.ts",
      "default": "./mysql-core/columns/int.js"
    },
    "require": {
      "types": "./mysql-core/columns/int.d.cts",
      "default": "./mysql-core/columns/int.cjs"
    },
    "types": "./mysql-core/columns/int.d.ts",
    "default": "./mysql-core/columns/int.js"
  },
  "./mysql-core/columns/json": {
    "import": {
      "types": "./mysql-core/columns/json.d.ts",
      "default": "./mysql-core/columns/json.js"
    },
    "require": {
      "types": "./mysql-core/columns/json.d.cts",
      "default": "./mysql-core/columns/json.cjs"
    },
    "types": "./mysql-core/columns/json.d.ts",
    "default": "./mysql-core/columns/json.js"
  },
  "./mysql-core/columns/mediumint": {
    "import": {
      "types": "./mysql-core/columns/mediumint.d.ts",
      "default": "./mysql-core/columns/mediumint.js"
    },
    "require": {
      "types": "./mysql-core/columns/mediumint.d.cts",
      "default": "./mysql-core/columns/mediumint.cjs"
    },
    "types": "./mysql-core/columns/mediumint.d.ts",
    "default": "./mysql-core/columns/mediumint.js"
  },
  "./mysql-core/columns/real": {
    "import": {
      "types": "./mysql-core/columns/real.d.ts",
      "default": "./mysql-core/columns/real.js"
    },
    "require": {
      "types": "./mysql-core/columns/real.d.cts",
      "default": "./mysql-core/columns/real.cjs"
    },
    "types": "./mysql-core/columns/real.d.ts",
    "default": "./mysql-core/columns/real.js"
  },
  "./mysql-core/columns/serial": {
    "import": {
      "types": "./mysql-core/columns/serial.d.ts",
      "default": "./mysql-core/columns/serial.js"
    },
    "require": {
      "types": "./mysql-core/columns/serial.d.cts",
      "default": "./mysql-core/columns/serial.cjs"
    },
    "types": "./mysql-core/columns/serial.d.ts",
    "default": "./mysql-core/columns/serial.js"
  },
  "./mysql-core/columns/smallint": {
    "import": {
      "types": "./mysql-core/columns/smallint.d.ts",
      "default": "./mysql-core/columns/smallint.js"
    },
    "require": {
      "types": "./mysql-core/columns/smallint.d.cts",
      "default": "./mysql-core/columns/smallint.cjs"
    },
    "types": "./mysql-core/columns/smallint.d.ts",
    "default": "./mysql-core/columns/smallint.js"
  },
  "./mysql-core/columns/text": {
    "import": {
      "types": "./mysql-core/columns/text.d.ts",
      "default": "./mysql-core/columns/text.js"
    },
    "require": {
      "types": "./mysql-core/columns/text.d.cts",
      "default": "./mysql-core/columns/text.cjs"
    },
    "types": "./mysql-core/columns/text.d.ts",
    "default": "./mysql-core/columns/text.js"
  },
  "./mysql-core/columns/time": {
    "import": {
      "types": "./mysql-core/columns/time.d.ts",
      "default": "./mysql-core/columns/time.js"
    },
    "require": {
      "types": "./mysql-core/columns/time.d.cts",
      "default": "./mysql-core/columns/time.cjs"
    },
    "types": "./mysql-core/columns/time.d.ts",
    "default": "./mysql-core/columns/time.js"
  },
  "./mysql-core/columns/timestamp": {
    "import": {
      "types": "./mysql-core/columns/timestamp.d.ts",
      "default": "./mysql-core/columns/timestamp.js"
    },
    "require": {
      "types": "./mysql-core/columns/timestamp.d.cts",
      "default": "./mysql-core/columns/timestamp.cjs"
    },
    "types": "./mysql-core/columns/timestamp.d.ts",
    "default": "./mysql-core/columns/timestamp.js"
  },
  "./mysql-core/columns/tinyint": {
    "import": {
      "types": "./mysql-core/columns/tinyint.d.ts",
      "default": "./mysql-core/columns/tinyint.js"
    },
    "require": {
      "types": "./mysql-core/columns/tinyint.d.cts",
      "default": "./mysql-core/columns/tinyint.cjs"
    },
    "types": "./mysql-core/columns/tinyint.d.ts",
    "default": "./mysql-core/columns/tinyint.js"
  },
  "./mysql-core/columns/varbinary": {
    "import": {
      "types": "./mysql-core/columns/varbinary.d.ts",
      "default": "./mysql-core/columns/varbinary.js"
    },
    "require": {
      "types": "./mysql-core/columns/varbinary.d.cts",
      "default": "./mysql-core/columns/varbinary.cjs"
    },
    "types": "./mysql-core/columns/varbinary.d.ts",
    "default": "./mysql-core/columns/varbinary.js"
  },
  "./mysql-core/columns/varchar": {
    "import": {
      "types": "./mysql-core/columns/varchar.d.ts",
      "default": "./mysql-core/columns/varchar.js"
    },
    "require": {
      "types": "./mysql-core/columns/varchar.d.cts",
      "default": "./mysql-core/columns/varchar.cjs"
    },
    "types": "./mysql-core/columns/varchar.d.ts",
    "default": "./mysql-core/columns/varchar.js"
  },
  "./mysql-core/columns/year": {
    "import": {
      "types": "./mysql-core/columns/year.d.ts",
      "default": "./mysql-core/columns/year.js"
    },
    "require": {
      "types": "./mysql-core/columns/year.d.cts",
      "default": "./mysql-core/columns/year.cjs"
    },
    "types": "./mysql-core/columns/year.d.ts",
    "default": "./mysql-core/columns/year.js"
  },
  "./mysql-core/query-builders/count": {
    "import": {
      "types": "./mysql-core/query-builders/count.d.ts",
      "default": "./mysql-core/query-builders/count.js"
    },
    "require": {
      "types": "./mysql-core/query-builders/count.d.cts",
      "default": "./mysql-core/query-builders/count.cjs"
    },
    "types": "./mysql-core/query-builders/count.d.ts",
    "default": "./mysql-core/query-builders/count.js"
  },
  "./mysql-core/query-builders/delete": {
    "import": {
      "types": "./mysql-core/query-builders/delete.d.ts",
      "default": "./mysql-core/query-builders/delete.js"
    },
    "require": {
      "types": "./mysql-core/query-builders/delete.d.cts",
      "default": "./mysql-core/query-builders/delete.cjs"
    },
    "types": "./mysql-core/query-builders/delete.d.ts",
    "default": "./mysql-core/query-builders/delete.js"
  },
  "./mysql-core/query-builders": {
    "import": {
      "types": "./mysql-core/query-builders/index.d.ts",
      "default": "./mysql-core/query-builders/index.js"
    },
    "require": {
      "types": "./mysql-core/query-builders/index.d.cts",
      "default": "./mysql-core/query-builders/index.cjs"
    },
    "types": "./mysql-core/query-builders/index.d.ts",
    "default": "./mysql-core/query-builders/index.js"
  },
  "./mysql-core/query-builders/insert": {
    "import": {
      "types": "./mysql-core/query-builders/insert.d.ts",
      "default": "./mysql-core/query-builders/insert.js"
    },
    "require": {
      "types": "./mysql-core/query-builders/insert.d.cts",
      "default": "./mysql-core/query-builders/insert.cjs"
    },
    "types": "./mysql-core/query-builders/insert.d.ts",
    "default": "./mysql-core/query-builders/insert.js"
  },
  "./mysql-core/query-builders/query-builder": {
    "import": {
      "types": "./mysql-core/query-builders/query-builder.d.ts",
      "default": "./mysql-core/query-builders/query-builder.js"
    },
    "require": {
      "types": "./mysql-core/query-builders/query-builder.d.cts",
      "default": "./mysql-core/query-builders/query-builder.cjs"
    },
    "types": "./mysql-core/query-builders/query-builder.d.ts",
    "default": "./mysql-core/query-builders/query-builder.js"
  },
  "./mysql-core/query-builders/query": {
    "import": {
      "types": "./mysql-core/query-builders/query.d.ts",
      "default": "./mysql-core/query-builders/query.js"
    },
    "require": {
      "types": "./mysql-core/query-builders/query.d.cts",
      "default": "./mysql-core/query-builders/query.cjs"
    },
    "types": "./mysql-core/query-builders/query.d.ts",
    "default": "./mysql-core/query-builders/query.js"
  },
  "./mysql-core/query-builders/select": {
    "import": {
      "types": "./mysql-core/query-builders/select.d.ts",
      "default": "./mysql-core/query-builders/select.js"
    },
    "require": {
      "types": "./mysql-core/query-builders/select.d.cts",
      "default": "./mysql-core/query-builders/select.cjs"
    },
    "types": "./mysql-core/query-builders/select.d.ts",
    "default": "./mysql-core/query-builders/select.js"
  },
  "./mysql-core/query-builders/select.types": {
    "import": {
      "types": "./mysql-core/query-builders/select.types.d.ts",
      "default": "./mysql-core/query-builders/select.types.js"
    },
    "require": {
      "types": "./mysql-core/query-builders/select.types.d.cts",
      "default": "./mysql-core/query-builders/select.types.cjs"
    },
    "types": "./mysql-core/query-builders/select.types.d.ts",
    "default": "./mysql-core/query-builders/select.types.js"
  },
  "./mysql-core/query-builders/update": {
    "import": {
      "types": "./mysql-core/query-builders/update.d.ts",
      "default": "./mysql-core/query-builders/update.js"
    },
    "require": {
      "types": "./mysql-core/query-builders/update.d.cts",
      "default": "./mysql-core/query-builders/update.cjs"
    },
    "types": "./mysql-core/query-builders/update.d.ts",
    "default": "./mysql-core/query-builders/update.js"
  },
  "./pg-core/columns/all": {
    "import": {
      "types": "./pg-core/columns/all.d.ts",
      "default": "./pg-core/columns/all.js"
    },
    "require": {
      "types": "./pg-core/columns/all.d.cts",
      "default": "./pg-core/columns/all.cjs"
    },
    "types": "./pg-core/columns/all.d.ts",
    "default": "./pg-core/columns/all.js"
  },
  "./pg-core/columns/bigint": {
    "import": {
      "types": "./pg-core/columns/bigint.d.ts",
      "default": "./pg-core/columns/bigint.js"
    },
    "require": {
      "types": "./pg-core/columns/bigint.d.cts",
      "default": "./pg-core/columns/bigint.cjs"
    },
    "types": "./pg-core/columns/bigint.d.ts",
    "default": "./pg-core/columns/bigint.js"
  },
  "./pg-core/columns/bigserial": {
    "import": {
      "types": "./pg-core/columns/bigserial.d.ts",
      "default": "./pg-core/columns/bigserial.js"
    },
    "require": {
      "types": "./pg-core/columns/bigserial.d.cts",
      "default": "./pg-core/columns/bigserial.cjs"
    },
    "types": "./pg-core/columns/bigserial.d.ts",
    "default": "./pg-core/columns/bigserial.js"
  },
  "./pg-core/columns/boolean": {
    "import": {
      "types": "./pg-core/columns/boolean.d.ts",
      "default": "./pg-core/columns/boolean.js"
    },
    "require": {
      "types": "./pg-core/columns/boolean.d.cts",
      "default": "./pg-core/columns/boolean.cjs"
    },
    "types": "./pg-core/columns/boolean.d.ts",
    "default": "./pg-core/columns/boolean.js"
  },
  "./pg-core/columns/char": {
    "import": {
      "types": "./pg-core/columns/char.d.ts",
      "default": "./pg-core/columns/char.js"
    },
    "require": {
      "types": "./pg-core/columns/char.d.cts",
      "default": "./pg-core/columns/char.cjs"
    },
    "types": "./pg-core/columns/char.d.ts",
    "default": "./pg-core/columns/char.js"
  },
  "./pg-core/columns/cidr": {
    "import": {
      "types": "./pg-core/columns/cidr.d.ts",
      "default": "./pg-core/columns/cidr.js"
    },
    "require": {
      "types": "./pg-core/columns/cidr.d.cts",
      "default": "./pg-core/columns/cidr.cjs"
    },
    "types": "./pg-core/columns/cidr.d.ts",
    "default": "./pg-core/columns/cidr.js"
  },
  "./pg-core/columns/common": {
    "import": {
      "types": "./pg-core/columns/common.d.ts",
      "default": "./pg-core/columns/common.js"
    },
    "require": {
      "types": "./pg-core/columns/common.d.cts",
      "default": "./pg-core/columns/common.cjs"
    },
    "types": "./pg-core/columns/common.d.ts",
    "default": "./pg-core/columns/common.js"
  },
  "./pg-core/columns/custom": {
    "import": {
      "types": "./pg-core/columns/custom.d.ts",
      "default": "./pg-core/columns/custom.js"
    },
    "require": {
      "types": "./pg-core/columns/custom.d.cts",
      "default": "./pg-core/columns/custom.cjs"
    },
    "types": "./pg-core/columns/custom.d.ts",
    "default": "./pg-core/columns/custom.js"
  },
  "./pg-core/columns/date.common": {
    "import": {
      "types": "./pg-core/columns/date.common.d.ts",
      "default": "./pg-core/columns/date.common.js"
    },
    "require": {
      "types": "./pg-core/columns/date.common.d.cts",
      "default": "./pg-core/columns/date.common.cjs"
    },
    "types": "./pg-core/columns/date.common.d.ts",
    "default": "./pg-core/columns/date.common.js"
  },
  "./pg-core/columns/date": {
    "import": {
      "types": "./pg-core/columns/date.d.ts",
      "default": "./pg-core/columns/date.js"
    },
    "require": {
      "types": "./pg-core/columns/date.d.cts",
      "default": "./pg-core/columns/date.cjs"
    },
    "types": "./pg-core/columns/date.d.ts",
    "default": "./pg-core/columns/date.js"
  },
  "./pg-core/columns/double-precision": {
    "import": {
      "types": "./pg-core/columns/double-precision.d.ts",
      "default": "./pg-core/columns/double-precision.js"
    },
    "require": {
      "types": "./pg-core/columns/double-precision.d.cts",
      "default": "./pg-core/columns/double-precision.cjs"
    },
    "types": "./pg-core/columns/double-precision.d.ts",
    "default": "./pg-core/columns/double-precision.js"
  },
  "./pg-core/columns/enum": {
    "import": {
      "types": "./pg-core/columns/enum.d.ts",
      "default": "./pg-core/columns/enum.js"
    },
    "require": {
      "types": "./pg-core/columns/enum.d.cts",
      "default": "./pg-core/columns/enum.cjs"
    },
    "types": "./pg-core/columns/enum.d.ts",
    "default": "./pg-core/columns/enum.js"
  },
  "./pg-core/columns": {
    "import": {
      "types": "./pg-core/columns/index.d.ts",
      "default": "./pg-core/columns/index.js"
    },
    "require": {
      "types": "./pg-core/columns/index.d.cts",
      "default": "./pg-core/columns/index.cjs"
    },
    "types": "./pg-core/columns/index.d.ts",
    "default": "./pg-core/columns/index.js"
  },
  "./pg-core/columns/inet": {
    "import": {
      "types": "./pg-core/columns/inet.d.ts",
      "default": "./pg-core/columns/inet.js"
    },
    "require": {
      "types": "./pg-core/columns/inet.d.cts",
      "default": "./pg-core/columns/inet.cjs"
    },
    "types": "./pg-core/columns/inet.d.ts",
    "default": "./pg-core/columns/inet.js"
  },
  "./pg-core/columns/int.common": {
    "import": {
      "types": "./pg-core/columns/int.common.d.ts",
      "default": "./pg-core/columns/int.common.js"
    },
    "require": {
      "types": "./pg-core/columns/int.common.d.cts",
      "default": "./pg-core/columns/int.common.cjs"
    },
    "types": "./pg-core/columns/int.common.d.ts",
    "default": "./pg-core/columns/int.common.js"
  },
  "./pg-core/columns/integer": {
    "import": {
      "types": "./pg-core/columns/integer.d.ts",
      "default": "./pg-core/columns/integer.js"
    },
    "require": {
      "types": "./pg-core/columns/integer.d.cts",
      "default": "./pg-core/columns/integer.cjs"
    },
    "types": "./pg-core/columns/integer.d.ts",
    "default": "./pg-core/columns/integer.js"
  },
  "./pg-core/columns/interval": {
    "import": {
      "types": "./pg-core/columns/interval.d.ts",
      "default": "./pg-core/columns/interval.js"
    },
    "require": {
      "types": "./pg-core/columns/interval.d.cts",
      "default": "./pg-core/columns/interval.cjs"
    },
    "types": "./pg-core/columns/interval.d.ts",
    "default": "./pg-core/columns/interval.js"
  },
  "./pg-core/columns/json": {
    "import": {
      "types": "./pg-core/columns/json.d.ts",
      "default": "./pg-core/columns/json.js"
    },
    "require": {
      "types": "./pg-core/columns/json.d.cts",
      "default": "./pg-core/columns/json.cjs"
    },
    "types": "./pg-core/columns/json.d.ts",
    "default": "./pg-core/columns/json.js"
  },
  "./pg-core/columns/jsonb": {
    "import": {
      "types": "./pg-core/columns/jsonb.d.ts",
      "default": "./pg-core/columns/jsonb.js"
    },
    "require": {
      "types": "./pg-core/columns/jsonb.d.cts",
      "default": "./pg-core/columns/jsonb.cjs"
    },
    "types": "./pg-core/columns/jsonb.d.ts",
    "default": "./pg-core/columns/jsonb.js"
  },
  "./pg-core/columns/line": {
    "import": {
      "types": "./pg-core/columns/line.d.ts",
      "default": "./pg-core/columns/line.js"
    },
    "require": {
      "types": "./pg-core/columns/line.d.cts",
      "default": "./pg-core/columns/line.cjs"
    },
    "types": "./pg-core/columns/line.d.ts",
    "default": "./pg-core/columns/line.js"
  },
  "./pg-core/columns/macaddr": {
    "import": {
      "types": "./pg-core/columns/macaddr.d.ts",
      "default": "./pg-core/columns/macaddr.js"
    },
    "require": {
      "types": "./pg-core/columns/macaddr.d.cts",
      "default": "./pg-core/columns/macaddr.cjs"
    },
    "types": "./pg-core/columns/macaddr.d.ts",
    "default": "./pg-core/columns/macaddr.js"
  },
  "./pg-core/columns/macaddr8": {
    "import": {
      "types": "./pg-core/columns/macaddr8.d.ts",
      "default": "./pg-core/columns/macaddr8.js"
    },
    "require": {
      "types": "./pg-core/columns/macaddr8.d.cts",
      "default": "./pg-core/columns/macaddr8.cjs"
    },
    "types": "./pg-core/columns/macaddr8.d.ts",
    "default": "./pg-core/columns/macaddr8.js"
  },
  "./pg-core/columns/numeric": {
    "import": {
      "types": "./pg-core/columns/numeric.d.ts",
      "default": "./pg-core/columns/numeric.js"
    },
    "require": {
      "types": "./pg-core/columns/numeric.d.cts",
      "default": "./pg-core/columns/numeric.cjs"
    },
    "types": "./pg-core/columns/numeric.d.ts",
    "default": "./pg-core/columns/numeric.js"
  },
  "./pg-core/columns/point": {
    "import": {
      "types": "./pg-core/columns/point.d.ts",
      "default": "./pg-core/columns/point.js"
    },
    "require": {
      "types": "./pg-core/columns/point.d.cts",
      "default": "./pg-core/columns/point.cjs"
    },
    "types": "./pg-core/columns/point.d.ts",
    "default": "./pg-core/columns/point.js"
  },
  "./pg-core/columns/real": {
    "import": {
      "types": "./pg-core/columns/real.d.ts",
      "default": "./pg-core/columns/real.js"
    },
    "require": {
      "types": "./pg-core/columns/real.d.cts",
      "default": "./pg-core/columns/real.cjs"
    },
    "types": "./pg-core/columns/real.d.ts",
    "default": "./pg-core/columns/real.js"
  },
  "./pg-core/columns/serial": {
    "import": {
      "types": "./pg-core/columns/serial.d.ts",
      "default": "./pg-core/columns/serial.js"
    },
    "require": {
      "types": "./pg-core/columns/serial.d.cts",
      "default": "./pg-core/columns/serial.cjs"
    },
    "types": "./pg-core/columns/serial.d.ts",
    "default": "./pg-core/columns/serial.js"
  },
  "./pg-core/columns/smallint": {
    "import": {
      "types": "./pg-core/columns/smallint.d.ts",
      "default": "./pg-core/columns/smallint.js"
    },
    "require": {
      "types": "./pg-core/columns/smallint.d.cts",
      "default": "./pg-core/columns/smallint.cjs"
    },
    "types": "./pg-core/columns/smallint.d.ts",
    "default": "./pg-core/columns/smallint.js"
  },
  "./pg-core/columns/smallserial": {
    "import": {
      "types": "./pg-core/columns/smallserial.d.ts",
      "default": "./pg-core/columns/smallserial.js"
    },
    "require": {
      "types": "./pg-core/columns/smallserial.d.cts",
      "default": "./pg-core/columns/smallserial.cjs"
    },
    "types": "./pg-core/columns/smallserial.d.ts",
    "default": "./pg-core/columns/smallserial.js"
  },
  "./pg-core/columns/text": {
    "import": {
      "types": "./pg-core/columns/text.d.ts",
      "default": "./pg-core/columns/text.js"
    },
    "require": {
      "types": "./pg-core/columns/text.d.cts",
      "default": "./pg-core/columns/text.cjs"
    },
    "types": "./pg-core/columns/text.d.ts",
    "default": "./pg-core/columns/text.js"
  },
  "./pg-core/columns/time": {
    "import": {
      "types": "./pg-core/columns/time.d.ts",
      "default": "./pg-core/columns/time.js"
    },
    "require": {
      "types": "./pg-core/columns/time.d.cts",
      "default": "./pg-core/columns/time.cjs"
    },
    "types": "./pg-core/columns/time.d.ts",
    "default": "./pg-core/columns/time.js"
  },
  "./pg-core/columns/timestamp": {
    "import": {
      "types": "./pg-core/columns/timestamp.d.ts",
      "default": "./pg-core/columns/timestamp.js"
    },
    "require": {
      "types": "./pg-core/columns/timestamp.d.cts",
      "default": "./pg-core/columns/timestamp.cjs"
    },
    "types": "./pg-core/columns/timestamp.d.ts",
    "default": "./pg-core/columns/timestamp.js"
  },
  "./pg-core/columns/uuid": {
    "import": {
      "types": "./pg-core/columns/uuid.d.ts",
      "default": "./pg-core/columns/uuid.js"
    },
    "require": {
      "types": "./pg-core/columns/uuid.d.cts",
      "default": "./pg-core/columns/uuid.cjs"
    },
    "types": "./pg-core/columns/uuid.d.ts",
    "default": "./pg-core/columns/uuid.js"
  },
  "./pg-core/columns/varchar": {
    "import": {
      "types": "./pg-core/columns/varchar.d.ts",
      "default": "./pg-core/columns/varchar.js"
    },
    "require": {
      "types": "./pg-core/columns/varchar.d.cts",
      "default": "./pg-core/columns/varchar.cjs"
    },
    "types": "./pg-core/columns/varchar.d.ts",
    "default": "./pg-core/columns/varchar.js"
  },
  "./pg-core/query-builders/count": {
    "import": {
      "types": "./pg-core/query-builders/count.d.ts",
      "default": "./pg-core/query-builders/count.js"
    },
    "require": {
      "types": "./pg-core/query-builders/count.d.cts",
      "default": "./pg-core/query-builders/count.cjs"
    },
    "types": "./pg-core/query-builders/count.d.ts",
    "default": "./pg-core/query-builders/count.js"
  },
  "./pg-core/query-builders/delete": {
    "import": {
      "types": "./pg-core/query-builders/delete.d.ts",
      "default": "./pg-core/query-builders/delete.js"
    },
    "require": {
      "types": "./pg-core/query-builders/delete.d.cts",
      "default": "./pg-core/query-builders/delete.cjs"
    },
    "types": "./pg-core/query-builders/delete.d.ts",
    "default": "./pg-core/query-builders/delete.js"
  },
  "./pg-core/query-builders": {
    "import": {
      "types": "./pg-core/query-builders/index.d.ts",
      "default": "./pg-core/query-builders/index.js"
    },
    "require": {
      "types": "./pg-core/query-builders/index.d.cts",
      "default": "./pg-core/query-builders/index.cjs"
    },
    "types": "./pg-core/query-builders/index.d.ts",
    "default": "./pg-core/query-builders/index.js"
  },
  "./pg-core/query-builders/insert": {
    "import": {
      "types": "./pg-core/query-builders/insert.d.ts",
      "default": "./pg-core/query-builders/insert.js"
    },
    "require": {
      "types": "./pg-core/query-builders/insert.d.cts",
      "default": "./pg-core/query-builders/insert.cjs"
    },
    "types": "./pg-core/query-builders/insert.d.ts",
    "default": "./pg-core/query-builders/insert.js"
  },
  "./pg-core/query-builders/query-builder": {
    "import": {
      "types": "./pg-core/query-builders/query-builder.d.ts",
      "default": "./pg-core/query-builders/query-builder.js"
    },
    "require": {
      "types": "./pg-core/query-builders/query-builder.d.cts",
      "default": "./pg-core/query-builders/query-builder.cjs"
    },
    "types": "./pg-core/query-builders/query-builder.d.ts",
    "default": "./pg-core/query-builders/query-builder.js"
  },
  "./pg-core/query-builders/query": {
    "import": {
      "types": "./pg-core/query-builders/query.d.ts",
      "default": "./pg-core/query-builders/query.js"
    },
    "require": {
      "types": "./pg-core/query-builders/query.d.cts",
      "default": "./pg-core/query-builders/query.cjs"
    },
    "types": "./pg-core/query-builders/query.d.ts",
    "default": "./pg-core/query-builders/query.js"
  },
  "./pg-core/query-builders/raw": {
    "import": {
      "types": "./pg-core/query-builders/raw.d.ts",
      "default": "./pg-core/query-builders/raw.js"
    },
    "require": {
      "types": "./pg-core/query-builders/raw.d.cts",
      "default": "./pg-core/query-builders/raw.cjs"
    },
    "types": "./pg-core/query-builders/raw.d.ts",
    "default": "./pg-core/query-builders/raw.js"
  },
  "./pg-core/query-builders/refresh-materialized-view": {
    "import": {
      "types": "./pg-core/query-builders/refresh-materialized-view.d.ts",
      "default": "./pg-core/query-builders/refresh-materialized-view.js"
    },
    "require": {
      "types": "./pg-core/query-builders/refresh-materialized-view.d.cts",
      "default": "./pg-core/query-builders/refresh-materialized-view.cjs"
    },
    "types": "./pg-core/query-builders/refresh-materialized-view.d.ts",
    "default": "./pg-core/query-builders/refresh-materialized-view.js"
  },
  "./pg-core/query-builders/select": {
    "import": {
      "types": "./pg-core/query-builders/select.d.ts",
      "default": "./pg-core/query-builders/select.js"
    },
    "require": {
      "types": "./pg-core/query-builders/select.d.cts",
      "default": "./pg-core/query-builders/select.cjs"
    },
    "types": "./pg-core/query-builders/select.d.ts",
    "default": "./pg-core/query-builders/select.js"
  },
  "./pg-core/query-builders/select.types": {
    "import": {
      "types": "./pg-core/query-builders/select.types.d.ts",
      "default": "./pg-core/query-builders/select.types.js"
    },
    "require": {
      "types": "./pg-core/query-builders/select.types.d.cts",
      "default": "./pg-core/query-builders/select.types.cjs"
    },
    "types": "./pg-core/query-builders/select.types.d.ts",
    "default": "./pg-core/query-builders/select.types.js"
  },
  "./pg-core/query-builders/update": {
    "import": {
      "types": "./pg-core/query-builders/update.d.ts",
      "default": "./pg-core/query-builders/update.js"
    },
    "require": {
      "types": "./pg-core/query-builders/update.d.cts",
      "default": "./pg-core/query-builders/update.cjs"
    },
    "types": "./pg-core/query-builders/update.d.ts",
    "default": "./pg-core/query-builders/update.js"
  },
  "./pg-core/utils/array": {
    "import": {
      "types": "./pg-core/utils/array.d.ts",
      "default": "./pg-core/utils/array.js"
    },
    "require": {
      "types": "./pg-core/utils/array.d.cts",
      "default": "./pg-core/utils/array.cjs"
    },
    "types": "./pg-core/utils/array.d.ts",
    "default": "./pg-core/utils/array.js"
  },
  "./prisma/mysql/driver": {
    "import": {
      "types": "./prisma/mysql/driver.d.ts",
      "default": "./prisma/mysql/driver.js"
    },
    "require": {
      "types": "./prisma/mysql/driver.d.cts",
      "default": "./prisma/mysql/driver.cjs"
    },
    "types": "./prisma/mysql/driver.d.ts",
    "default": "./prisma/mysql/driver.js"
  },
  "./prisma/mysql": {
    "import": {
      "types": "./prisma/mysql/index.d.ts",
      "default": "./prisma/mysql/index.js"
    },
    "require": {
      "types": "./prisma/mysql/index.d.cts",
      "default": "./prisma/mysql/index.cjs"
    },
    "types": "./prisma/mysql/index.d.ts",
    "default": "./prisma/mysql/index.js"
  },
  "./prisma/mysql/session": {
    "import": {
      "types": "./prisma/mysql/session.d.ts",
      "default": "./prisma/mysql/session.js"
    },
    "require": {
      "types": "./prisma/mysql/session.d.cts",
      "default": "./prisma/mysql/session.cjs"
    },
    "types": "./prisma/mysql/session.d.ts",
    "default": "./prisma/mysql/session.js"
  },
  "./prisma/pg/driver": {
    "import": {
      "types": "./prisma/pg/driver.d.ts",
      "default": "./prisma/pg/driver.js"
    },
    "require": {
      "types": "./prisma/pg/driver.d.cts",
      "default": "./prisma/pg/driver.cjs"
    },
    "types": "./prisma/pg/driver.d.ts",
    "default": "./prisma/pg/driver.js"
  },
  "./prisma/pg": {
    "import": {
      "types": "./prisma/pg/index.d.ts",
      "default": "./prisma/pg/index.js"
    },
    "require": {
      "types": "./prisma/pg/index.d.cts",
      "default": "./prisma/pg/index.cjs"
    },
    "types": "./prisma/pg/index.d.ts",
    "default": "./prisma/pg/index.js"
  },
  "./prisma/pg/session": {
    "import": {
      "types": "./prisma/pg/session.d.ts",
      "default": "./prisma/pg/session.js"
    },
    "require": {
      "types": "./prisma/pg/session.d.cts",
      "default": "./prisma/pg/session.cjs"
    },
    "types": "./prisma/pg/session.d.ts",
    "default": "./prisma/pg/session.js"
  },
  "./prisma/sqlite/driver": {
    "import": {
      "types": "./prisma/sqlite/driver.d.ts",
      "default": "./prisma/sqlite/driver.js"
    },
    "require": {
      "types": "./prisma/sqlite/driver.d.cts",
      "default": "./prisma/sqlite/driver.cjs"
    },
    "types": "./prisma/sqlite/driver.d.ts",
    "default": "./prisma/sqlite/driver.js"
  },
  "./prisma/sqlite": {
    "import": {
      "types": "./prisma/sqlite/index.d.ts",
      "default": "./prisma/sqlite/index.js"
    },
    "require": {
      "types": "./prisma/sqlite/index.d.cts",
      "default": "./prisma/sqlite/index.cjs"
    },
    "types": "./prisma/sqlite/index.d.ts",
    "default": "./prisma/sqlite/index.js"
  },
  "./prisma/sqlite/session": {
    "import": {
      "types": "./prisma/sqlite/session.d.ts",
      "default": "./prisma/sqlite/session.js"
    },
    "require": {
      "types": "./prisma/sqlite/session.d.cts",
      "default": "./prisma/sqlite/session.cjs"
    },
    "types": "./prisma/sqlite/session.d.ts",
    "default": "./prisma/sqlite/session.js"
  },
  "./sql/expressions/conditions": {
    "import": {
      "types": "./sql/expressions/conditions.d.ts",
      "default": "./sql/expressions/conditions.js"
    },
    "require": {
      "types": "./sql/expressions/conditions.d.cts",
      "default": "./sql/expressions/conditions.cjs"
    },
    "types": "./sql/expressions/conditions.d.ts",
    "default": "./sql/expressions/conditions.js"
  },
  "./sql/expressions": {
    "import": {
      "types": "./sql/expressions/index.d.ts",
      "default": "./sql/expressions/index.js"
    },
    "require": {
      "types": "./sql/expressions/index.d.cts",
      "default": "./sql/expressions/index.cjs"
    },
    "types": "./sql/expressions/index.d.ts",
    "default": "./sql/expressions/index.js"
  },
  "./sql/expressions/select": {
    "import": {
      "types": "./sql/expressions/select.d.ts",
      "default": "./sql/expressions/select.js"
    },
    "require": {
      "types": "./sql/expressions/select.d.cts",
      "default": "./sql/expressions/select.cjs"
    },
    "types": "./sql/expressions/select.d.ts",
    "default": "./sql/expressions/select.js"
  },
  "./sql/functions/aggregate": {
    "import": {
      "types": "./sql/functions/aggregate.d.ts",
      "default": "./sql/functions/aggregate.js"
    },
    "require": {
      "types": "./sql/functions/aggregate.d.cts",
      "default": "./sql/functions/aggregate.cjs"
    },
    "types": "./sql/functions/aggregate.d.ts",
    "default": "./sql/functions/aggregate.js"
  },
  "./sql/functions": {
    "import": {
      "types": "./sql/functions/index.d.ts",
      "default": "./sql/functions/index.js"
    },
    "require": {
      "types": "./sql/functions/index.d.cts",
      "default": "./sql/functions/index.cjs"
    },
    "types": "./sql/functions/index.d.ts",
    "default": "./sql/functions/index.js"
  },
  "./sql/functions/vector": {
    "import": {
      "types": "./sql/functions/vector.d.ts",
      "default": "./sql/functions/vector.js"
    },
    "require": {
      "types": "./sql/functions/vector.d.cts",
      "default": "./sql/functions/vector.cjs"
    },
    "types": "./sql/functions/vector.d.ts",
    "default": "./sql/functions/vector.js"
  },
  "./sqlite-core/columns/all": {
    "import": {
      "types": "./sqlite-core/columns/all.d.ts",
      "default": "./sqlite-core/columns/all.js"
    },
    "require": {
      "types": "./sqlite-core/columns/all.d.cts",
      "default": "./sqlite-core/columns/all.cjs"
    },
    "types": "./sqlite-core/columns/all.d.ts",
    "default": "./sqlite-core/columns/all.js"
  },
  "./sqlite-core/columns/blob": {
    "import": {
      "types": "./sqlite-core/columns/blob.d.ts",
      "default": "./sqlite-core/columns/blob.js"
    },
    "require": {
      "types": "./sqlite-core/columns/blob.d.cts",
      "default": "./sqlite-core/columns/blob.cjs"
    },
    "types": "./sqlite-core/columns/blob.d.ts",
    "default": "./sqlite-core/columns/blob.js"
  },
  "./sqlite-core/columns/common": {
    "import": {
      "types": "./sqlite-core/columns/common.d.ts",
      "default": "./sqlite-core/columns/common.js"
    },
    "require": {
      "types": "./sqlite-core/columns/common.d.cts",
      "default": "./sqlite-core/columns/common.cjs"
    },
    "types": "./sqlite-core/columns/common.d.ts",
    "default": "./sqlite-core/columns/common.js"
  },
  "./sqlite-core/columns/custom": {
    "import": {
      "types": "./sqlite-core/columns/custom.d.ts",
      "default": "./sqlite-core/columns/custom.js"
    },
    "require": {
      "types": "./sqlite-core/columns/custom.d.cts",
      "default": "./sqlite-core/columns/custom.cjs"
    },
    "types": "./sqlite-core/columns/custom.d.ts",
    "default": "./sqlite-core/columns/custom.js"
  },
  "./sqlite-core/columns": {
    "import": {
      "types": "./sqlite-core/columns/index.d.ts",
      "default": "./sqlite-core/columns/index.js"
    },
    "require": {
      "types": "./sqlite-core/columns/index.d.cts",
      "default": "./sqlite-core/columns/index.cjs"
    },
    "types": "./sqlite-core/columns/index.d.ts",
    "default": "./sqlite-core/columns/index.js"
  },
  "./sqlite-core/columns/integer": {
    "import": {
      "types": "./sqlite-core/columns/integer.d.ts",
      "default": "./sqlite-core/columns/integer.js"
    },
    "require": {
      "types": "./sqlite-core/columns/integer.d.cts",
      "default": "./sqlite-core/columns/integer.cjs"
    },
    "types": "./sqlite-core/columns/integer.d.ts",
    "default": "./sqlite-core/columns/integer.js"
  },
  "./sqlite-core/columns/numeric": {
    "import": {
      "types": "./sqlite-core/columns/numeric.d.ts",
      "default": "./sqlite-core/columns/numeric.js"
    },
    "require": {
      "types": "./sqlite-core/columns/numeric.d.cts",
      "default": "./sqlite-core/columns/numeric.cjs"
    },
    "types": "./sqlite-core/columns/numeric.d.ts",
    "default": "./sqlite-core/columns/numeric.js"
  },
  "./sqlite-core/columns/real": {
    "import": {
      "types": "./sqlite-core/columns/real.d.ts",
      "default": "./sqlite-core/columns/real.js"
    },
    "require": {
      "types": "./sqlite-core/columns/real.d.cts",
      "default": "./sqlite-core/columns/real.cjs"
    },
    "types": "./sqlite-core/columns/real.d.ts",
    "default": "./sqlite-core/columns/real.js"
  },
  "./sqlite-core/columns/text": {
    "import": {
      "types": "./sqlite-core/columns/text.d.ts",
      "default": "./sqlite-core/columns/text.js"
    },
    "require": {
      "types": "./sqlite-core/columns/text.d.cts",
      "default": "./sqlite-core/columns/text.cjs"
    },
    "types": "./sqlite-core/columns/text.d.ts",
    "default": "./sqlite-core/columns/text.js"
  },
  "./sqlite-core/query-builders/count": {
    "import": {
      "types": "./sqlite-core/query-builders/count.d.ts",
      "default": "./sqlite-core/query-builders/count.js"
    },
    "require": {
      "types": "./sqlite-core/query-builders/count.d.cts",
      "default": "./sqlite-core/query-builders/count.cjs"
    },
    "types": "./sqlite-core/query-builders/count.d.ts",
    "default": "./sqlite-core/query-builders/count.js"
  },
  "./sqlite-core/query-builders/delete": {
    "import": {
      "types": "./sqlite-core/query-builders/delete.d.ts",
      "default": "./sqlite-core/query-builders/delete.js"
    },
    "require": {
      "types": "./sqlite-core/query-builders/delete.d.cts",
      "default": "./sqlite-core/query-builders/delete.cjs"
    },
    "types": "./sqlite-core/query-builders/delete.d.ts",
    "default": "./sqlite-core/query-builders/delete.js"
  },
  "./sqlite-core/query-builders": {
    "import": {
      "types": "./sqlite-core/query-builders/index.d.ts",
      "default": "./sqlite-core/query-builders/index.js"
    },
    "require": {
      "types": "./sqlite-core/query-builders/index.d.cts",
      "default": "./sqlite-core/query-builders/index.cjs"
    },
    "types": "./sqlite-core/query-builders/index.d.ts",
    "default": "./sqlite-core/query-builders/index.js"
  },
  "./sqlite-core/query-builders/insert": {
    "import": {
      "types": "./sqlite-core/query-builders/insert.d.ts",
      "default": "./sqlite-core/query-builders/insert.js"
    },
    "require": {
      "types": "./sqlite-core/query-builders/insert.d.cts",
      "default": "./sqlite-core/query-builders/insert.cjs"
    },
    "types": "./sqlite-core/query-builders/insert.d.ts",
    "default": "./sqlite-core/query-builders/insert.js"
  },
  "./sqlite-core/query-builders/query-builder": {
    "import": {
      "types": "./sqlite-core/query-builders/query-builder.d.ts",
      "default": "./sqlite-core/query-builders/query-builder.js"
    },
    "require": {
      "types": "./sqlite-core/query-builders/query-builder.d.cts",
      "default": "./sqlite-core/query-builders/query-builder.cjs"
    },
    "types": "./sqlite-core/query-builders/query-builder.d.ts",
    "default": "./sqlite-core/query-builders/query-builder.js"
  },
  "./sqlite-core/query-builders/query": {
    "import": {
      "types": "./sqlite-core/query-builders/query.d.ts",
      "default": "./sqlite-core/query-builders/query.js"
    },
    "require": {
      "types": "./sqlite-core/query-builders/query.d.cts",
      "default": "./sqlite-core/query-builders/query.cjs"
    },
    "types": "./sqlite-core/query-builders/query.d.ts",
    "default": "./sqlite-core/query-builders/query.js"
  },
  "./sqlite-core/query-builders/raw": {
    "import": {
      "types": "./sqlite-core/query-builders/raw.d.ts",
      "default": "./sqlite-core/query-builders/raw.js"
    },
    "require": {
      "types": "./sqlite-core/query-builders/raw.d.cts",
      "default": "./sqlite-core/query-builders/raw.cjs"
    },
    "types": "./sqlite-core/query-builders/raw.d.ts",
    "default": "./sqlite-core/query-builders/raw.js"
  },
  "./sqlite-core/query-builders/select": {
    "import": {
      "types": "./sqlite-core/query-builders/select.d.ts",
      "default": "./sqlite-core/query-builders/select.js"
    },
    "require": {
      "types": "./sqlite-core/query-builders/select.d.cts",
      "default": "./sqlite-core/query-builders/select.cjs"
    },
    "types": "./sqlite-core/query-builders/select.d.ts",
    "default": "./sqlite-core/query-builders/select.js"
  },
  "./sqlite-core/query-builders/select.types": {
    "import": {
      "types": "./sqlite-core/query-builders/select.types.d.ts",
      "default": "./sqlite-core/query-builders/select.types.js"
    },
    "require": {
      "types": "./sqlite-core/query-builders/select.types.d.cts",
      "default": "./sqlite-core/query-builders/select.types.cjs"
    },
    "types": "./sqlite-core/query-builders/select.types.d.ts",
    "default": "./sqlite-core/query-builders/select.types.js"
  },
  "./sqlite-core/query-builders/update": {
    "import": {
      "types": "./sqlite-core/query-builders/update.d.ts",
      "default": "./sqlite-core/query-builders/update.js"
    },
    "require": {
      "types": "./sqlite-core/query-builders/update.d.cts",
      "default": "./sqlite-core/query-builders/update.cjs"
    },
    "types": "./sqlite-core/query-builders/update.d.ts",
    "default": "./sqlite-core/query-builders/update.js"
  },
  "./pg-core/columns/postgis_extension/geometry": {
    "import": {
      "types": "./pg-core/columns/postgis_extension/geometry.d.ts",
      "default": "./pg-core/columns/postgis_extension/geometry.js"
    },
    "require": {
      "types": "./pg-core/columns/postgis_extension/geometry.d.cts",
      "default": "./pg-core/columns/postgis_extension/geometry.cjs"
    },
    "types": "./pg-core/columns/postgis_extension/geometry.d.ts",
    "default": "./pg-core/columns/postgis_extension/geometry.js"
  },
  "./pg-core/columns/postgis_extension/utils": {
    "import": {
      "types": "./pg-core/columns/postgis_extension/utils.d.ts",
      "default": "./pg-core/columns/postgis_extension/utils.js"
    },
    "require": {
      "types": "./pg-core/columns/postgis_extension/utils.d.cts",
      "default": "./pg-core/columns/postgis_extension/utils.cjs"
    },
    "types": "./pg-core/columns/postgis_extension/utils.d.ts",
    "default": "./pg-core/columns/postgis_extension/utils.js"
  },
  "./pg-core/columns/vector_extension/bit": {
    "import": {
      "types": "./pg-core/columns/vector_extension/bit.d.ts",
      "default": "./pg-core/columns/vector_extension/bit.js"
    },
    "require": {
      "types": "./pg-core/columns/vector_extension/bit.d.cts",
      "default": "./pg-core/columns/vector_extension/bit.cjs"
    },
    "types": "./pg-core/columns/vector_extension/bit.d.ts",
    "default": "./pg-core/columns/vector_extension/bit.js"
  },
  "./pg-core/columns/vector_extension/halfvec": {
    "import": {
      "types": "./pg-core/columns/vector_extension/halfvec.d.ts",
      "default": "./pg-core/columns/vector_extension/halfvec.js"
    },
    "require": {
      "types": "./pg-core/columns/vector_extension/halfvec.d.cts",
      "default": "./pg-core/columns/vector_extension/halfvec.cjs"
    },
    "types": "./pg-core/columns/vector_extension/halfvec.d.ts",
    "default": "./pg-core/columns/vector_extension/halfvec.js"
  },
  "./pg-core/columns/vector_extension/sparsevec": {
    "import": {
      "types": "./pg-core/columns/vector_extension/sparsevec.d.ts",
      "default": "./pg-core/columns/vector_extension/sparsevec.js"
    },
    "require": {
      "types": "./pg-core/columns/vector_extension/sparsevec.d.cts",
      "default": "./pg-core/columns/vector_extension/sparsevec.cjs"
    },
    "types": "./pg-core/columns/vector_extension/sparsevec.d.ts",
    "default": "./pg-core/columns/vector_extension/sparsevec.js"
  },
  "./pg-core/columns/vector_extension/vector": {
    "import": {
      "types": "./pg-core/columns/vector_extension/vector.d.ts",
      "default": "./pg-core/columns/vector_extension/vector.js"
    },
    "require": {
      "types": "./pg-core/columns/vector_extension/vector.d.cts",
      "default": "./pg-core/columns/vector_extension/vector.cjs"
    },
    "types": "./pg-core/columns/vector_extension/vector.d.ts",
    "default": "./pg-core/columns/vector_extension/vector.js"
  }
}


const dataToLoopTHrough = Object.entries(dataToLoop);

const exportsObj = {}

for (let i = 0; i < dataToLoopTHrough.length; i++) {
  let [key, value] = dataToLoopTHrough[i];
  const originalKey = key;
  if (key === '.') key = './drizzle';
  const keyWithoutDotSlash = key.replace(/^\.\//g, '');
  const foldersToCreate = keyWithoutDotSlash.split('/');
  const nameOfTheFile = foldersToCreate.pop();
  foldersToCreate.splice(0, 0, 'exports');

  let pathOfFoldersOrFile = path.join(process.cwd(), 'src');
  while (foldersToCreate.length > 0) {
    const folder = foldersToCreate.shift();
    pathOfFoldersOrFile = path.join(pathOfFoldersOrFile, folder);
    if (!fs.existsSync(pathOfFoldersOrFile)) fs.mkdirSync(pathOfFoldersOrFile);
    console.log('creating folder for', folder, pathOfFoldersOrFile)
  }

  const fullPathOfTheFile = path.join(pathOfFoldersOrFile, `${nameOfTheFile}.ts`);
  console.log('full file name', fullPathOfTheFile)
  fs.writeFileSync(fullPathOfTheFile, originalKey === '.' ?
    `export * from 'drizzle-orm';\n`:
    `export * from 'drizzle-orm/${keyWithoutDotSlash}';\n`
  );

  exportsObj[key] = {
    "types": `./dist/src/exports/${keyWithoutDotSlash}.d.ts`,
    "require": `./dist/src/exports/${keyWithoutDotSlash}.cjs`,
    "import": `./dist/src/exports/${keyWithoutDotSlash}.cjs`,
  };
}

fs.writeFileSync(`./exports.json`, JSON.stringify(exportsObj, null, 2));