import { domain } from '@palmares/core';

import eventsAppServer from './app';

import type { EventHandlerType } from './interfaces';

export const eventsDomainModifier = domain<{
  getEvents: () => Promise<{
    [eventName: string]: EventHandlerType | { handler: EventHandlerType; withResult: boolean };
  }>;
}>('@palmares/events', '', {});

export default domain('@palmares/events', '', {
  commands: {
    eventsServer: {
      description: 'Run the application in events server mode',
      positionalArgs: undefined,
      keywordArgs: undefined,
      handler: () => {
        return eventsAppServer;
      }
    }
  }
});
