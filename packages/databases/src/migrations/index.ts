import { ERR_MODULE_NOT_FOUND, logging } from "@palmares/core";

import { DatabaseDomain } from "../domain";
import { DatabaseSettingsType, InitializedEngineInstancesType, OptionalMakemigrationsArgsType } from "../types";
import { FoundMigrationsFileType, MigrationFileType } from './types';
import { LOGGING_MIGRATIONS_NOT_FOUND } from "../utils";
import MakeMigrations from "./makemigrations";

import { join } from "path";
import { Dirent, readdir } from "fs";

/**
 * Used for working with anything related to migrations inside of the project, from the automatic creation of migrations
 * to running the migrations and making the application and the database in sync.
 */
export default class Migrations {
  settings: DatabaseSettingsType;
  domains: DatabaseDomain[];

  constructor(settings: DatabaseSettingsType, domains: DatabaseDomain[]) {
    this.settings = settings;
    this.domains = domains;
  }

  async makeMigrations(
    initializedEngineInstances: InitializedEngineInstancesType,
    optionalArgs: OptionalMakemigrationsArgsType
  ) {
    const migrations = await this.#getMigrations();
    await MakeMigrations.buildAndRun(this.settings, migrations, initializedEngineInstances, optionalArgs);
  }

  async #reorderMigrations(migrations: FoundMigrationsFileType[]): Promise<FoundMigrationsFileType[]> {
    const reorderedMigrations = [];
    const reference: { [key: string]: number } = {};
    for (const migration of migrations) {
      const dependsOn = migration.migration.dependsOn;
      const migrationName = migration.migration.name;
      const indexToAddValue = reference[dependsOn] ? reference[dependsOn] + 1 : reorderedMigrations.length;

      if (reference[dependsOn]) {
        reorderedMigrations.splice(indexToAddValue, 0, migration);
      } else {
        reorderedMigrations.push(migration);
      }
      reference[migrationName] = indexToAddValue;
    }
    return reorderedMigrations;
  }

  async #getMigrations(): Promise<FoundMigrationsFileType[]> {
    const foundMigrations: FoundMigrationsFileType[] = [];
    const promises: Promise<void>[] = this.domains.map(async (domain) => {
      const hasGetMigrationsMethodDefined = typeof domain.getMigrations === 'function';
      if (hasGetMigrationsMethodDefined) {
        const domainMigrations = await Promise.resolve(domain.getMigrations());
        for (const domainMigration of domainMigrations) {
          foundMigrations.push({
            domainPath: domain.path,
            domainName: domain.name,
            migration: domainMigration,
          });
        }
      } else {
        const fullPath = join(domain.path, 'migrations');
        try {
          const directoryFiles = await (new Promise<string[] | Buffer[] | Dirent[]>((resolve, reject) => {
            readdir(fullPath, (error, data) => {
              if (error) reject (error);
              resolve(data);
            });
          }));
          const promises = directoryFiles.map(async (element) => {
            const file = element as string;
            const migrationFile = (await import(join(fullPath, file))).default as MigrationFileType;
            const isAValidMigrationFile = typeof migrationFile === 'object' && migrationFile !== undefined &&
              typeof migrationFile.database === 'string' && Array.isArray(migrationFile.operations) &&
              typeof migrationFile.name === 'string';
            if (isAValidMigrationFile) {
              foundMigrations.push({
                domainName: domain.name,
                domainPath: domain.path,
                migration: migrationFile
              });
            }
          });
          await Promise.all(promises)
        } catch (e) {
          const error: any = e;
          const couldNotFindFileOrDirectory = error.message.startsWith('ENOENT: no such file or directory, scandir');
          if (error.code === ERR_MODULE_NOT_FOUND || couldNotFindFileOrDirectory) {
            if (this.settings.DATABASES_DISMISS_NO_MIGRATIONS_LOG !== true)
              await logging.logMessage(LOGGING_MIGRATIONS_NOT_FOUND, { domainName: domain.name });
          } else {
            throw e;
          }
        }
      }
    });
    await Promise.all(promises);
    return this.#reorderMigrations(foundMigrations);
  }
}
