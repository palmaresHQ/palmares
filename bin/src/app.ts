#!/usr/bin/env node

import { Commands, CoreDomain, defineSettings, domain } from '@palmares/core';
import { NodeStd } from '@palmares/node-std';

Commands.handleCommands(
  defineSettings({
    basePath: '',
    settingsLocation: '',
    std: NodeStd,
    installedDomains: [
      [CoreDomain, {}],
      domain('create-palmares-app', '', {
        commands: {
          create: {
            description: 'Create a new Palmares app',
            positionalArgs: {
              name: {
                description: 'The name of the app',
                type: 'string',
                required: true
              }
            },
            keywordArgs: {},
            async handler({ name }) {
              console.log('Creating Palmares app', name);
            }
          }
        }
      })
    ]
  }),
  process.argv.slice(2)
);
