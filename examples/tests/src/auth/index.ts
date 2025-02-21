import { domain } from '@palmares/core';
import { testDomainModifier } from '@palmares/tests';

export default domain('auth', import.meta.dirname, {
  modifiers: [testDomainModifier] as const,
  getTests: () => [import.meta.dirname + '/test.test.ts', import.meta.dirname + '/test.ts'],
});
