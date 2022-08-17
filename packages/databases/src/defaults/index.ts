import * as modelsAsObject from './models';

export { default as defaultMigrations } from './migrations';
export const defaultModels = Object.values(modelsAsObject);
