import { DomainHandlerFunctionArgs } from '@palmares/core';

import Databases from '../databases';
import { DatabaseDomainInterface } from '../interfaces';
import defaultSettings from '../settings';
import { DatabaseSettingsType } from '../types';

export default async function makeMigrations(
  databases: Databases,
  { settings, domains, commandLineArgs }: DomainHandlerFunctionArgs
) {
  const databaseSettings = defaultSettings(settings as unknown as DatabaseSettingsType);
  const databaseDomains = domains as DatabaseDomainInterface[];
  await databases.makeMigrations(databaseSettings, databaseDomains, commandLineArgs.keywordArgs);
  await databases.close();
  process.exit(0);
}
