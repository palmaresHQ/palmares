import { Logger } from '@palmares/logging';

import type { parseSearchField } from './queries/search';

export const databaseLogger = new Logger(
  { domainName: '@palmares/databases' },
  {
    MODELS_NOT_FOUND: {
      category: 'warn',
      handler: ({ domainName }: { domainName: string }) =>
        `Looks like the domain ${domainName} did not define any models.` +
        `\nIf that's not intended behavior, you should create the 'models.ts'/'models.js' file in ` +
        `the ${domainName} domain or ` +
        `add the 'getModels' to the domain class.`
    },
    DATABASE_CLOSING: {
      category: 'info',
      handler: ({ databaseName }: { databaseName: string }) => `Closing the '${databaseName}' database connection.`
    },
    DATABASE_IS_NOT_CONNECTED: {
      category: 'info',
      handler: ({ databaseName }: { databaseName: string }) => `Couldn't connect to the '${databaseName}' database.`
    },
    FAILED_TO_GET_LAST_MIGRATION: {
      category: 'error',
      handler: ({ databaseName, reason, stack }: { databaseName: string; reason: string; stack: string }) =>
        `Failed to get the last migration for the '${databaseName}' database.` +
        `\n\n\x1b[1mReason:\x1b[0m ${reason}\n\n\x1b[1mStack:\x1b[0m ${stack}`
    },
    FAILED_TO_COMMIT_MIGRATION: {
      category: 'error',
      handler: ({
        migrationName,
        databaseName,
        reason,
        stack
      }: {
        migrationName: string;
        databaseName: string;
        reason: string;
        stack: string;
      }) =>
        `Failed to get insert ran migration '${migrationName}' for the '${databaseName}' database.` +
        `\n\n\x1b[1mReason:\x1b[0m ${reason}\n\n\x1b[1mStack:\x1b[0m ${stack}`
    },
    MIGRATIONS_NOT_FOUND: {
      category: 'warn',
      handler: ({ domainName }: { domainName: string }) =>
        `No migrations were found for the '${domainName}', if this is ` +
        `your first time running this command, you can safely ignore this message.\n\n` +
        `You can fully dismiss this message ` +
        `by setting 'DATABASES_DISMISS_NO_MIGRATIONS_LOG = true;' in 'settings.(ts/js)'`
    },
    MIGRATIONS_FILE_TITLE: {
      category: 'info',
      handler: ({ title }: { title: string }) => `- \x1b[36m${title}`
    },
    MIGRATIONS_FILE_DESCRIPTION: {
      category: 'info',
      handler: ({
        database,
        lastMigrationName,
        lastDomainPath
      }: {
        database: string;
        lastMigrationName: string;
        lastDomainPath: string;
      }) =>
        `Generating migration on the \x1b[1m'${database}'\x1b[0m database` +
        (lastMigrationName !== '' && lastDomainPath !== ''
          ? ` that depends on the migration \x1b[1m'${lastMigrationName}'\x1b[0m that exists ` +
            `on \x1b[1m'${lastDomainPath}'\x1b[0m`
          : '')
    },
    MIGRATIONS_NO_NEW_MIGRATIONS: {
      category: 'info',
      handler: ({ databaseName }: { databaseName: string }) =>
        `There are no migrations to run for '${databaseName}'. If ` +
        'you made changes to your models, please run\x1b[1m makemigrations\x1b[0m command first.'
    },
    MIGRATIONS_RUNNING_FILE_NAME: {
      category: 'info',
      handler: ({ title }: { title: string }) => `Running migration: \x1b[36m${title}\x1b[0m`
    },
    MIGRATION_RUNNING_IN_BATCH: {
      category: 'info',
      handler: ({ databaseName }: { databaseName: string }) =>
        `The engine that you are using for '${databaseName}' implements a batch migrations, ` +
        `this means that instead of running each migration file one by one, we will let the chosen ` +
        `engine handle the migration runner.`
    },
    MIGRATIONS_ACTION_DESCRIPTION: {
      category: 'info',
      handler: ({ description }: { description: string }) => `  • ${description}`
    },
    NO_CHANGES_MADE_FOR_MIGRATIONS: {
      category: 'info',
      handler: () => `No changes were found in your models.`
    },
    QUERY_NOT_PROPERLY_SET: {
      category: 'warn',
      handler: ({
        modelName,
        invalidFields
      }: {
        modelName: string;
        invalidFields: Map<string, NonNullable<Awaited<ReturnType<typeof parseSearchField>>>>;
      }) => {
        const errorsByField = Array.from(invalidFields)
          .map(([_, isValidObject]) => {
            return `- ${isValidObject.reason}`;
          })
          .join('\n');
        return (
          `The fields on the query to retrieve '${modelName}' data was not set properly` +
          ` and contain wrong or missing data\n\n${errorsByField}`
        );
      }
    },
    CREATE_PALMARES_DB_APP: {
      category: 'info',
      handler: ({ name, template }: { name: string; template: string }) =>
        `Creating Palmares database app '${name}' using the template '${template}'`
    },
    DONE_CREATING_PALMARES_DB_APP: {
      category: 'info',
      handler: ({ name, template }: { name: string; template: string }) =>
        `Done creating Palmares database app '${name}' using the template '${template}' \n\nNext steps:\n\n` +
        `1. cd ${name}\n\n` +
        `2. Install the dependencies with your favorite package manager:\n- $ pnpm i\n- $ yarn\n` +
        `- $ npm i\n- $ bun i\n\n` +
        `3. Create the migrations:\n- $ pnpm run makemigrations\n- $ yarn run makemigrations\n` +
        `- $ npm run makemigrations\n- $ bun run makemigrations\n\n` +
        `4. Apply the migrations:\n- $ pnpm run migrate\n- $ yarn run migrate\n` +
        `- $ npm run migrate\n- $ bun run migrate\n\n` +
        `5. Start the application:\n- $ pnpm run dev\n- $ yarn run dev\n- $ npm run dev\n- $ bun run dev`
    }
  }
);
