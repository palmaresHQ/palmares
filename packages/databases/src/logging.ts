import { logging, MessageCategories } from "@palmares/core"

import {
  LOGGING_DATABASE_MODELS_NOT_FOUND,
  LOGGING_DATABASE_CLOSING,
  LOGGING_DATABASE_IS_NOT_CONNECTED,
  LOGGING_MIGRATIONS_NOT_FOUND,
  LOGGING_MIGRATIONS_RUNNING_FILE_NAME,
  LOGGING_MIGRATIONS_ACTION_DESCRIPTION,
  LOGGING_MIGRATIONS_FILE_DESCRIPTION,
  LOGGING_MIGRATIONS_FILE_TITLE,
  LOGGING_NO_CHANGES_MADE_FOR_MIGRATIONS,
  LOGGING_MIGRATIONS_NO_NEW_MIGRATIONS
} from './utils';

export default async function buildLogging() {
  const defaultLoggingForDatabases = (message: string) => `\x1b[1m[databases]\x1b[0m ${message}`;
  logging.appendMessage(
    LOGGING_DATABASE_MODELS_NOT_FOUND,
    MessageCategories.Warn,
    async ({domainName}) =>  defaultLoggingForDatabases(`Looks like the domain ${domainName} did not define any models.`+
    `\nIf that's not intended behavior, you should create the 'models.ts'/'models.js' file in the ${domainName} domain or ` +
    `add the 'getModels' to the domain class.`)
  );
  logging.appendMessage(
    LOGGING_DATABASE_CLOSING,
    MessageCategories.Info,
    async ({databaseName}) => defaultLoggingForDatabases(`Closing the '${databaseName}' database connection.`)
  );
  logging.appendMessage(
    LOGGING_DATABASE_IS_NOT_CONNECTED,
    MessageCategories.Info,
    async ({databaseName}) => defaultLoggingForDatabases(`Couldn't connect to the '${databaseName}' database.`)
  );
  logging.appendMessage(
    LOGGING_MIGRATIONS_NOT_FOUND,
    MessageCategories.Warn,
    async ({domainName}) => defaultLoggingForDatabases(`No migrations were found for the '${domainName}', if this is ` +
    `your first time running this command, you can safely ignore this message.\n\nYou can fully dismiss this message ` +
    `by setting 'DATABASES_DISMISS_NO_MIGRATIONS_LOG = true;' in 'settings.(ts/js)'`)
  );
  logging.appendMessage(
    LOGGING_MIGRATIONS_FILE_TITLE,
    MessageCategories.Info,
    async ({title}) => defaultLoggingForDatabases(`- \x1b[36m${title}`)
  );
  logging.appendMessage(
    LOGGING_MIGRATIONS_FILE_DESCRIPTION,
    MessageCategories.Info,
    async ({database, lastMigrationName, lastDomainPath}) => defaultLoggingForDatabases(
      `Generating migration on the \x1b[1m'${database}'\x1b[0m database` +
      (lastMigrationName !== '' && lastDomainPath !== '' ?
      ` that depends on the migration \x1b[1m'${lastMigrationName}'\x1b[0m that exists ` +
      `on \x1b[1m'${lastDomainPath}'\x1b[0m` : '')
    )
  );
  logging.appendMessage(
    LOGGING_MIGRATIONS_NO_NEW_MIGRATIONS,
    MessageCategories.Info,
    async ({ databaseName }) => defaultLoggingForDatabases(`There are no migrations to run for '${databaseName}'. If `+
    'you made changes to your models, please run\x1b[1m makemigrations\x1b[0m command first.')
  );
  logging.appendMessage(
    LOGGING_MIGRATIONS_RUNNING_FILE_NAME,
    MessageCategories.Info,
    async ({title}) => defaultLoggingForDatabases(`Running migration: \[36m${title}`)
  );
  logging.appendMessage(
    LOGGING_MIGRATIONS_ACTION_DESCRIPTION,
    MessageCategories.Info,
    async ({ description }) => defaultLoggingForDatabases(`  • ${description}`)
  );
  logging.appendMessage(
    LOGGING_NO_CHANGES_MADE_FOR_MIGRATIONS,
    MessageCategories.Info,
    async () => defaultLoggingForDatabases(`No changes were found in your models.`)
  )
}
