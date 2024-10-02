import { domain } from '@palmares/core';

import { test } from './commands';
import { setTestAdapter } from './utils';

import type { AllTestsSettingsType, TestsSettingsType } from './types';

export const testDomainModifier = domain<{
  // Should return the path location of the tests. Or an array containing the paths of the tests.
  getTests: () => string[] | string;
}>('@palmares/tests', '', {});

export const testDomain = domain('@palmares/tests', '', {
  commands: {
    test: {
      description: 'Run the tests in your palmares application',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: (args: any) => {
        test(args.domains, args.settings as AllTestsSettingsType);
      }
    }
  },
  // eslint-disable-next-line ts/require-await
  load: async (settings: TestsSettingsType) => {
    if ((settings as any).$$test) {
      const adapterInstance = new settings.testAdapter();
      await setTestAdapter(adapterInstance, true);
    }
  }
});
