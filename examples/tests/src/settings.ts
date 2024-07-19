import CoreDomain, { defineSettings } from '@palmares/core';
import TestsDomain from '@palmares/tests';
import JestTestAdapter from '@palmares/jest-tests';

import StdDomain from '@palmares/std';
import NodeStd from '@palmares/node-std';
import LoggingDomain from '@palmares/logging';
import ConsoleLogging from '@palmares/console-logging';

import TestDomain from './test';
import AuthDomain from './auth';
import { dirname, resolve } from 'path';

export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  settingsLocation: __filename,
  std: NodeStd,
  installedDomains: [
    [
      LoggingDomain,
      {
        logger: ConsoleLogging,
      },
    ],
    // Domain Core, required for palmares to worka
    [
      CoreDomain,
      {
        appName: 'example',
      },
    ],
    [
      TestsDomain,
      {
        testAdapter: JestTestAdapter,
      }
    ],
    // We have just created this custom domain, and it defines our routes.
    TestDomain,
    AuthDomain,
  ],
});
