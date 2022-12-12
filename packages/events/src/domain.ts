import {
  DefaultCommandType,
  Domain,
  DomainHandlerFunctionArgs,
  DomainReadyFunctionArgs,
  SettingsType,
} from '@palmares/core';

import EventsAppServer from './app';
import { eventsServer as eventsServerCommand } from './commands';
import { EventsDomainInterface } from './interfaces';
import buildLogging from './logging';
import type { EventsSettingsType } from './types';

/**
 * This domain is used for creating an events server. When it is added to the settings.{ts/js} what we do
 * is that we will be able to know if the app is running as an events server or not.
 *
 * If it's running as an events server, then it means the server will only listen to events and do nothing else.
 * what applies for other normal HTTP servers applies for the events servers as well (we use the same class as before)
 */
export default class EventsDomain extends Domain {
  app!: EventsAppServer;

  commands: DefaultCommandType = {
    eventsServer: {
      description: 'Run the application in events server mode',
      example: 'asdasd',
      handler: async (options: DomainHandlerFunctionArgs) => {
        // IMPORTANT: we only initialize the app because we are running an events server.
        await eventsServerCommand(this.app, options);
      },
    },
  };

  constructor() {
    super(EventsDomain.name, __dirname);
  }

  /**
   * This is used to start the EventsAppServer, we will always create it, but we don't start the actual app if we don't run with
   * `eventsServer` command.
   */
  override async load<S extends SettingsType = EventsSettingsType>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    settings: S
  ) {
    await buildLogging();
    this.app = new EventsAppServer(settings as unknown as EventsSettingsType);
    await this.app.load();
  }

  /**
   * We will just start the app server if the app is of instance `EventsAppServer` otherwise we will just skip it's initialization.
   *
   * Besides that this is where we load all of the events from the domains so we can start listening for them.
   */
  override async ready(
    options: DomainReadyFunctionArgs<SettingsType, object>
  ): Promise<void> {
    const eventsDomains = options.domains as EventsDomainInterface[];
    await this.app.loadEvents(
      eventsDomains.filter(
        (eventDomain) => typeof eventDomain.getEvents === 'function'
      )
    );
    if (options.app instanceof EventsAppServer) await options.app.start();
  }
}
