import { DomainHandlerFunctionArgs } from "@palmares/core";
import databases from "../databases";
import { DatabaseDomain } from "../domain";
import { DatabaseSettingsType } from "../types";

export default async function makeMigrations({settings, domains}: DomainHandlerFunctionArgs) {
  const databaseSettings = settings as DatabaseSettingsType;
  const databaseDomains = domains as DatabaseDomain[];
  await databases.makeMigrations(databaseSettings, databaseDomains);
}
