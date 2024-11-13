#!/usr/bin/env node

import { ConsoleLogging } from '@palmares/console-logging';
import { Commands, CoreDomain, defineSettings } from '@palmares/core';
import { databasesBinDomainBuilder } from '@palmares/databases';
import { loggingDomain } from '@palmares/logging';
import { NodeStd } from '@palmares/node-std';

import { recursivelyCopyFilesFromTemplate } from './utils';

Commands.handleCommands(
  defineSettings({
    basePath: '',
    settingsLocation: '',
    std: NodeStd,
    installedDomains: [
      [CoreDomain, {}],
      [
        loggingDomain,
        {
          logger: ConsoleLogging
        }
      ],
      databasesBinDomainBuilder(recursivelyCopyFilesFromTemplate)
    ]
  }),
  process.argv.slice(2)
);
