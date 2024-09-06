import type { DatabaseAdapter } from '.';
import type { MigrationFileType } from './migrations/types';
import type { model } from './models';
import type { Domain } from '@palmares/core';

export type DatabaseDomainInterface = {
  getModels: (
    engineInstance: DatabaseAdapter
  ) => Promise<ReturnType<typeof model>[] | { [modelName: string]: ReturnType<typeof model> }>;
  getMigrations?: () => Promise<MigrationFileType[] | { [migrationName: string]: MigrationFileType }>;
} & Domain;
