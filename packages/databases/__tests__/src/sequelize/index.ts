import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { testDomainModifier } from '@palmares/tests';

import * as models from './models';
import * as migrations from './migrations';

export default domain('testingSequelize', __dirname, {
  modifiers: [testDomainModifier, databaseDomainModifier] as const,
  getMigrations: () => migrations,
  getModels: () => models,
  getTests: () => [__dirname + '/sequelize.test.ts'],
});
