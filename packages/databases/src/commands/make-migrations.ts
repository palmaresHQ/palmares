import { DomainHandlerFunctionArgs } from "@palmares/core";
import databases from "../databases";
import { DatabaseDomain } from "../domain";
import defaultSettings from "../settings";
import { DatabaseSettingsType, OptionalMakemigrationsArgsType } from "../types";

export default async function makeMigrations({ settings, domains, args }: DomainHandlerFunctionArgs) {
  const databaseSettings = defaultSettings(settings as DatabaseSettingsType);
  const databaseDomains = domains as DatabaseDomain[];
  await databases.makeMigrations(
    databaseSettings,
    databaseDomains,
    args.keywordArgs as OptionalMakemigrationsArgsType
  );
  process.exit(0);
}
