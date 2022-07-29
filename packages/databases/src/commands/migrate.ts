import { DomainHandlerFunctionArgs } from "@palmares/core";
import Databases from "../databases";
import databases from "../databases";
import { DatabaseDomain } from "../domain";
import defaultSettings from "../settings";
import { DatabaseSettingsType } from "../types";

export default async function migrate(databases: Databases, { settings, domains, args }: DomainHandlerFunctionArgs) {
  const databaseSettings = defaultSettings(settings as DatabaseSettingsType);
  const databaseDomains = domains as DatabaseDomain[];
  await databases.migrate(
    databaseSettings,
    databaseDomains
  );
  await databases.close();
  process.exit(0);
}
