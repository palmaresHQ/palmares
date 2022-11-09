import { DomainHandlerFunctionArgs } from '@palmares/core';
import Databases from '../databases';
import { DatabaseDomain } from '../domain';
import defaultSettings from '../settings';
import { DatabaseSettingsType, OptionalMakemigrationsArgsType } from '../types';

export default async function makeMigrations(
  databases: Databases,
  { settings, domains, args }: DomainHandlerFunctionArgs
) {
  const databaseSettings = defaultSettings(settings as DatabaseSettingsType);
  const databaseDomains = domains as DatabaseDomain[];
  await databases.makeMigrations(
    databaseSettings,
    databaseDomains,
    args.keywordArgs as OptionalMakemigrationsArgsType
  );
  await databases.close();
  process.exit(0);
}
