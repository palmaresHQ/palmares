// @ts-nocheck
import { domain } from '@palmares/core';
import { serverDomainModifier } from '@palmares/server';

import routes from './routes';

export default domain('core', import.meta.dirname, {
  /**
   * This doesn't do anything, it just adds type-safety of new methods you need to define on your domain.
   */
  modifiers: [serverDomainModifier],
  /**
   * You can write your own custom commands here. They will all be available when running `manage.ts help`.
   *
   * This is a per-domain configuration, every domain will contain its own set of commands and it's up to you how you want to setup them.
   */
  commands: {
    helloWorld: {
      description: 'Greets you with a hello world message',
      keywordArgs: {
        appName: {
          description: 'Your application name',
          default: null,
          hasFlag: true
        }
      },
      positionalArgs: {
        name: {
          description: 'The name of the person to greet',
          required: true
        }
      },
      handler: ({ commandLineArgs }) => {
        console.log(`Hello ${commandLineArgs.positionalArgs['name']}, welcome to ${commandLineArgs.keywordArgs['appName'] || 'Palmares'}!`);
      }
    },
  },
  getRoutes: () => routes
});
