import { ERR_MODULE_NOT_FOUND, std } from '@palmares/core';

import { MakeMigrations } from './makemigrations';
import { Migrate } from './migrate';
import { databaseLogger } from '../logging';

import type { FoundMigrationsFileType, MigrationFileType } from './types';
import type { DatabaseDomainInterface } from '../interfaces';
import type { DatabaseSettingsType, InitializedEngineInstancesType, OptionalMakemigrationsArgsType } from '../types';

/**
 * Used for working with anything related to migrations inside of the project, from the automatic creation of migrations
 * to running the migrations and making the application and the database in sync.
 */
export class Migrations {
  settings: DatabaseSettingsType;
  domains: DatabaseDomainInterface[];

  constructor(settings: DatabaseSettingsType, domains: DatabaseDomainInterface[]) {
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

  async migrate(initializedEngineInstances: InitializedEngineInstancesType) {
    const migrations = await this.#getMigrations();
    await Migrate.buildAndRun(this.settings, migrations, initializedEngineInstances);
  }

  // eslint-disable-next-line ts/require-await
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
      if (domain.getMigrations) {
        let domainMigrations: Record<string, MigrationFileType> | MigrationFileType[] = await Promise.resolve(
          domain.getMigrations()
        );
        // eslint-disable-next-line ts/no-unnecessary-condition
        if (typeof domainMigrations === 'object' && domainMigrations !== null)
          domainMigrations = Object.values(domainMigrations);

        for (const domainMigration of domainMigrations) {
          // eslint-disable-next-line ts/no-unnecessary-condition
          if (domainMigration === undefined) continue;
          // eslint-disable-next-line ts/no-unnecessary-condition
          if (domainMigration === null) continue;
          foundMigrations.push({
            domainPath: domain.path,
            domainName: domain.name,
            migration: domainMigration
          });
        }
      } else {
        const fullPath = await std.files.join(domain.path, 'migrations');
        try {
          const directoryFiles = await std.files.readDirectory(fullPath);
          const promises = directoryFiles.map(async (element) => {
            const file = element;
            const pathOfMigration = await std.files.join(fullPath, file);
            const pathToGetMigration = std.files.getPathToFileURL(pathOfMigration);

            const migrationFile = (
              await import(
                (await std.os.platform()) === 'windows' && pathOfMigration.startsWith('file:') === false
                  ? `file:/${pathToGetMigration}`
                  : pathToGetMigration
              )
            ).default as MigrationFileType;
            const isAValidMigrationFile =
              typeof migrationFile === 'object' &&
              // eslint-disable-next-line ts/no-unnecessary-condition
              migrationFile !== undefined &&
              typeof migrationFile.database === 'string' &&
              Array.isArray(migrationFile.operations) &&
              typeof migrationFile.name === 'string';
            if (isAValidMigrationFile) {
              foundMigrations.push({
                domainName: domain.name,
                domainPath: domain.path,
                migration: migrationFile
              });
            }
          });
          await Promise.all(promises);
        } catch (e) {
          const error: any = e;
          const couldNotFindFileOrDirectory = error.message.startsWith('ENOENT: no such file or directory, scandir');
          if (error.code === ERR_MODULE_NOT_FOUND || couldNotFindFileOrDirectory) {
            if (this.settings.dismissNoMigrationsLog !== false)
              databaseLogger.logMessage('MIGRATIONS_NOT_FOUND', {
                domainName: domain.name
              });
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
