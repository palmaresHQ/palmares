import { domain } from '@palmares/core';
import { testDomainModifier } from '@palmares/tests';

export default domain('testingExpressServer', __dirname, {
  modifiers: [testDomainModifier] as const,
  getTests: () => [
    __dirname + '/test.test.ts',
  ]
});
