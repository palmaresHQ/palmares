import { Logger } from '@palmares/logging';

export const databaseLogger = new Logger(
  { domainName: '@palmares/databases' },
  {
    MODELS_NOT_FOUND: {
      category: 'warn',
      handler: ({ domainName }: { domainName: string }) =>
        `Looks like the domain ${domainName} did not define any models.` +
        `\nIf that's not intended behavior, you should create the 'models.ts'/'models.js' file in the ${domainName} domain or ` +
        `add the 'getModels' to the domain class.`,
    },
    DATABASE_CLOSING: {
      category: 'info',
      handler: ({ databaseName }: { databaseName: string }) => `Closing the '${databaseName}' database connection.`,
    },
    DATABASE_IS_NOT_CONNECTED: {
      category: 'info',
      handler: ({ databaseName }: { databaseName: string }) => `Couldn't connect to the '${databaseName}' database.`,
    },
    MIGRATIONS_NOT_FOUND: {
      category: 'warn',
      handler: ({ domainName }: { domainName: string }) =>
        `No migrations were found for the '${domainName}', if this is ` +
        `your first time running this command, you can safely ignore this message.\n\nYou can fully dismiss this message ` +
        `by setting 'DATABASES_DISMISS_NO_MIGRATIONS_LOG = true;' in 'settings.(ts/js)'`,
    },
    MIGRATIONS_FILE_TITLE: {
      category: 'info',
      handler: ({ title }: { title: string }) => `- \x1b[36m${title}`,
    },
    MIGRATIONS_FILE_DESCRIPTION: {
      category: 'info',
      handler: ({
        database,
        lastMigrationName,
        lastDomainPath,
      }: {
        database: string;
        lastMigrationName: string;
        lastDomainPath: string;
      }) =>
        `Generating migration on the \x1b[1m'${database}'\x1b[0m database` +
        (lastMigrationName !== '' && lastDomainPath !== ''
          ? ` that depends on the migration \x1b[1m'${lastMigrationName}'\x1b[0m that exists ` +
            `on \x1b[1m'${lastDomainPath}'\x1b[0m`
          : ''),
    },
    MIGRATIONS_NO_NEW_MIGRATIONS: {
      category: 'info',
      handler: ({ databaseName }: { databaseName: string }) =>
        `There are no migrations to run for '${databaseName}'. If ` +
        'you made changes to your models, please run\x1b[1m makemigrations\x1b[0m command first.',
    },
    MIGRATIONS_RUNNING_FILE_NAME: {
      category: 'info',
      handler: ({ title }: { title: string }) => `Running migration: \x1b[36m${title}`,
    },
    MIGRATIONS_ACTION_DESCRIPTION: {
      category: 'info',
      handler: ({ description }: { description: string }) => `  • ${description}`,
    },
    NO_CHANGES_MADE_FOR_MIGRATIONS: {
      category: 'info',
      handler: () => `No changes were found in your models.`,
    },
  }
);
