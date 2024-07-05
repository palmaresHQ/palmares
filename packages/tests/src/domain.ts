import { domain } from '@palmares/core';

import { test } from './commands';

import type { AllTestsSettingsType, TestsSettingsType } from './types';

export const testDomainModifier = domain<{
  // Should return the path location of the tests. Or an array containing the paths of the tests.
  getTests: () => string[] | string;
}>('@palmares/tests', __dirname, {});

export default domain('@palmares/tests', __dirname, {
  commands: {
    test: {
      description: 'Run the tests in your palmares application',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: async (args) => {
        test(args.domains, args.settings as AllTestsSettingsType);
      },
    },
  },
  load: async (_: TestsSettingsType) => undefined,
});
