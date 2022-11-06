import {
  DefaultCommandType,
  Domain,
  DomainHandlerFunctionArgs,
} from '@palmares/core';
import eventsServer from './server';

export default class EventsDomain extends Domain {
  commands: DefaultCommandType = {
    eventsServer: {
      description: 'Run the application in events server mode',
      example: 'asdasd',
      handler: async (options: DomainHandlerFunctionArgs) => {
        await eventsServer().listen(() => {
          console.log('Listening for events...');
        });
        //await dev(this.app, options);
      },
    },
  };
}
