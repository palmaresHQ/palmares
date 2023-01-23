import { Domain } from '@palmares/core';

import { Model } from './models';
import type { MigrationFileType } from './migrations/types';

export type DatabaseDomainInterface = {
  getModels: () => Promise<
    | ReturnType<typeof Model>[]
    | { [modelName: string]: ReturnType<typeof Model> }
  >;
  getMigrations?: () => Promise<
    MigrationFileType[] | { [migrationName: string]: MigrationFileType }
  >;
} & Domain;
