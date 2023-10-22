import { Domain } from '@palmares/core';

import { model } from './models';
import type { MigrationFileType } from './migrations/types';

export type DatabaseDomainInterface = {
  getModels: () => Promise<ReturnType<typeof model>[] | { [modelName: string]: ReturnType<typeof model> }>;
  getMigrations?: () => Promise<MigrationFileType[] | { [migrationName: string]: MigrationFileType }>;
} & Domain;
