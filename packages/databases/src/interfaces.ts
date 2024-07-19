import { Domain } from '@palmares/core';

import { model } from './models';
import type { MigrationFileType } from './migrations/types';
import { DatabaseAdapter } from '.';

export type DatabaseDomainInterface = {
  getModels: (engineInstance: DatabaseAdapter) => Promise<ReturnType<typeof model>[] | { [modelName: string]: ReturnType<typeof model> }>;
  getMigrations?: () => Promise<MigrationFileType[] | { [migrationName: string]: MigrationFileType }>;
} & Domain;
