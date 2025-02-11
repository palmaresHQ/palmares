import ConsoleLogging from '@palmares/console-logging';
import CoreDomain, { defineSettings } from '@palmares/core';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import TestsDomain, { TestAdapter } from '@palmares/tests';
import { dirname, resolve } from 'path';

export default defineSettings({
  basePath: dirname(resolve(import.meta.dirname)),
  settingsLocation: import.meta.filename,
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
        testAdapter: TestAdapter
      }
    ]
  ]
});
// export default defineSettings({
//   basePath: dirname(resolve(import.meta.dirname)),
//   settingsLocation: import.meta.filename,
//   std: NodeStd,
//   installedDomains: [
//     [
//       LoggingDomain,
//       {
//         logger: ConsoleLogging
//       }
//     ],
//     // Domain Core, required for palmares to worka
//     [
//       CoreDomain,
//       {
//         appName: 'example'
//       }
//     ],
//     [
//       TestsDomain,
//       {
//         testAdapter: TestAdapter
//       }
//     ]
//   ]
// });
