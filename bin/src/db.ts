#!/usr/bin/env node

import { Commands, CoreDomain, defineSettings, domain } from '@palmares/core';
import { databasesBinDomain } from '@palmares/databases';
import { NodeStd } from '@palmares/node-std';

Commands.handleCommands(
  defineSettings({
    basePath: '',
    settingsLocation: '',
    std: NodeStd,
    installedDomains: [[CoreDomain, {}], databasesBinDomain]
  }),
  process.argv.slice(2)
);
