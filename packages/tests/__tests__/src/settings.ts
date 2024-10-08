import ConsoleLogging from '@palmares/console-logging';
import CoreDomain, { defineSettings } from '@palmares/core';
import JestTestAdapter from '@palmares/jest-tests';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import TestsDomain from '@palmares/tests';
import { dirname, resolve } from 'path';

import TestDomain from './test';

const watch = process.env.WATCH === 'true';

export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  settingsLocation: __filename,
  std: NodeStd,
  installedDomains: [
    [
      LoggingDomain,
      {
        logger: ConsoleLogging
      }
    ],
    // Domain Core, required for palmares to worka
    [
      CoreDomain,
      {
        appName: 'example'
      }
    ],
    [
      TestsDomain,
      {
        testAdapter: JestTestAdapter.new({
          cliOptions: watch ? ['--watchAll'] : [],
          config: {}
        })
      }
    ],
    // We have just created this custom domain, and it defines our routes.
    TestDomain
  ]
});
