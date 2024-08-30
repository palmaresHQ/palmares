import defaultSettings from '../settings';

import type Databases from '../databases';
import type { DatabaseDomainInterface } from '../interfaces';
import type { DatabaseSettingsType } from '../types';
import type { DomainHandlerFunctionArgs } from '@palmares/core';

export default async function migrate(databases: Databases, { settings, domains }: DomainHandlerFunctionArgs) {
  const databaseSettings = defaultSettings(settings as unknown as DatabaseSettingsType);
  const databaseDomains = domains as DatabaseDomainInterface[];
  await databases.migrate(databaseSettings, databaseDomains);
  await databases.close();
  process.exit(0);
}
