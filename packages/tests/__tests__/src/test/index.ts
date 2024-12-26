import { domain } from '@palmares/core';
import { testDomainModifier } from '@palmares/tests';

export default domain('testingTests', import.meta.dirname, {
  modifiers: [testDomainModifier] as const,
  getTests: () => [import.meta.dirname + '/test.test.ts']
});
