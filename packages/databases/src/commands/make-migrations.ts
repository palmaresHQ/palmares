import { DomainHandlerFunctionArgs } from '@palmares/core';

import Databases from '../databases';
import { DatabaseDomainInterface } from '../interfaces';
import defaultSettings from '../settings';
import { DatabaseSettingsType, OptionalMakemigrationsArgsType } from '../types';

export default async function makeMigrations(
  databases: Databases,
  { settings, domains, args }: DomainHandlerFunctionArgs
) {
  const databaseSettings = defaultSettings(settings as DatabaseSettingsType);
  const databaseDomains = domains as DatabaseDomainInterface[];
  await databases.makeMigrations(
    databaseSettings,
    databaseDomains,
    args.keywordArgs as OptionalMakemigrationsArgsType
  );
  await databases.close();
  process.exit(0);
}
