import { defaultSettings } from '../settings';

import type { Databases } from '../databases';
import type { DatabaseDomainInterface } from '../interfaces';
import type { DatabaseSettingsType } from '../types';
import type { DomainHandlerFunctionArgs } from '@palmares/core';

export async function makeMigrations(
  databases: Databases,
  { settings, domains, commandLineArgs }: DomainHandlerFunctionArgs
) {
  const databaseSettings = defaultSettings(settings as unknown as DatabaseSettingsType);
  const databaseDomains = domains as DatabaseDomainInterface[];
  await databases.makeMigrations(databaseSettings, databaseDomains, commandLineArgs.keywordArgs);
  await databases.close();
  process.exit(0);
}
