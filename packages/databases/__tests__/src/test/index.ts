import { domain } from '@palmares/core';
import { testDomainModifier } from '@palmares/tests';
import { databaseDomainModifier } from '@palmares/databases';
//import migrations from './migrations';
import * as models from './models';

export default domain('testingDatabases', __dirname, {
  modifiers: [testDomainModifier, databaseDomainModifier] as const,
  getMigrations: () => [],
  getModels: () => models,
  getTests: () => [__dirname + '/test.test.ts'],
});
