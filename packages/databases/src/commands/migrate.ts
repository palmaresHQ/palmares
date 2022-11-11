import { DomainHandlerFunctionArgs } from '@palmares/core';

import Databases from '../databases';
import { DatabaseDomainInterface } from '../interfaces';
import defaultSettings from '../settings';
import { DatabaseSettingsType } from '../types';

export default async function migrate(
  databases: Databases,
  { settings, domains }: DomainHandlerFunctionArgs
) {
  const databaseSettings = defaultSettings(settings as DatabaseSettingsType);
  const databaseDomains = domains as DatabaseDomainInterface[];
  await databases.migrate(databaseSettings, databaseDomains);
  await databases.close();
  process.exit(0);
}
