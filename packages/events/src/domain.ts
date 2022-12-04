import {
  DefaultCommandType,
  Domain,
  DomainHandlerFunctionArgs,
  SettingsType,
} from '@palmares/core';

import EventsAppServer from './app';
import type { EventsSettingsType } from './types';

export default class EventsDomain extends Domain {
  app?: EventsAppServer;

  commands: DefaultCommandType = {
    eventsServer: {
      description: 'Run the application in events server mode',
      example: 'asdasd',
      handler: async (options: DomainHandlerFunctionArgs) => {
        this.app = new EventsAppServer(options.settings as EventsSettingsType);
      },
    },
  };

  override async load<S extends SettingsType = EventsSettingsType>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    settings: S
  ) {
    if (this.app) await this.app.load();
    else {
      this.app = new EventsAppServer(settings as unknown as EventsSettingsType);
      await this.app.load();
    }
  }
}
