import { domain } from '@palmares/core';
import { testDomainModifier } from '@palmares/tests';

export default domain('auth', __dirname, {
  modifiers: [testDomainModifier] as const,
  getTests: () => [__dirname + '/test.test.ts', __dirname + '/test.ts'],
});
