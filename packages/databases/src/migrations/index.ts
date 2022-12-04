import { DatabaseDomainInterface } from '../interfaces';
import {
  DatabaseSettingsType,
  InitializedEngineInstancesType,
  OptionalMakemigrationsArgsType,
} from '../types';
import { FoundMigrationsFileType, MigrationFileType } from './types';
import MakeMigrations from './makemigrations';
import Migrate from './migrate';

/**
 * Used for working with anything related to migrations inside of the project, from the automatic creation of migrations
 * to running the migrations and making the application and the database in sync.
 */
export default class Migrations {
  settings: DatabaseSettingsType;
  domains: DatabaseDomainInterface[];

  constructor(
    settings: DatabaseSettingsType,
    domains: DatabaseDomainInterface[]
  ) {
    this.settings = settings;
    this.domains = domains;
  }

  async makeMigrations(
    initializedEngineInstances: InitializedEngineInstancesType,
    optionalArgs: OptionalMakemigrationsArgsType
  ) {
    const migrations = await this.#getMigrations();
    await MakeMigrations.buildAndRun(
      this.settings,
      migrations,
      initializedEngineInstances,
      optionalArgs
    );
  }

  async migrate(initializedEngineInstances: InitializedEngineInstancesType) {
    const migrations = await this.#getMigrations();
    await Migrate.buildAndRun(
      this.settings,
      migrations,
      initializedEngineInstances
    );
  }

  async #reorderMigrations(
    migrations: FoundMigrationsFileType[]
  ): Promise<FoundMigrationsFileType[]> {
    const reorderedMigrations = [];
    const reference: { [key: string]: number } = {};
    for (const migration of migrations) {
      const dependsOn = migration.migration.dependsOn;
      const migrationName = migration.migration.name;
      const indexToAddValue = reference[dependsOn]
        ? reference[dependsOn] + 1
        : reorderedMigrations.length;

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
      const hasGetMigrationsMethodDefined =
        typeof domain.getMigrations === 'function';
      if (hasGetMigrationsMethodDefined && domain.getMigrations) {
        const domainMigrations = await Promise.resolve(domain.getMigrations());
        for (const domainMigration of domainMigrations) {
          foundMigrations.push({
            domainPath: domain.path,
            domainName: domain.name,
            migration: domainMigration as MigrationFileType,
          });
        }
      }
    });
    await Promise.all(promises);
    return this.#reorderMigrations(foundMigrations);
  }
}
