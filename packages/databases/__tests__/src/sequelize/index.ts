import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { testDomainModifier } from '@palmares/tests';

//import * as migrations from './migrations';
import * as models from './models';

export default domain('testingSequelize', import.meta.dirname, {
  modifiers: [testDomainModifier, databaseDomainModifier] as const,
  getMigrations: () => [],
  getModels: () => models,
  getTests: () => [__dirname + '/sequelize.test.ts']
});
