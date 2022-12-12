import { AppServer, logging } from '@palmares/core';

import Emitter from './emitter';
import { EventsDomainInterface } from './interfaces';
import {
  EventsServer,
  default as eventsServer,
  setEventsServer,
} from './server';
import { EventsSettingsType } from './types';
import { LOGGING_APP_START_SERVER } from './utils';

/**
 * This is the event server for the Palmares framework. If the server doesn't already exist
 * it will create a new one (a server is just a recursive setInterval that will be called every 12 days)
 * so the program keeps running. If a Server was created, then it will not initialize anything, it'll be
 * just a simple EventEmitter instance.
 */
export default class EventsAppServer extends AppServer {
  server!: EventsServer<Emitter>;
  settings: EventsSettingsType;

  constructor(settings: EventsSettingsType) {
    super();
    this.settings = settings;
  }

  /**
   * This is used for loading the events on the server.
   * The events will be loaded asynchronously. To append an event without worrying about the result you should send an object for each key of the event handler
   * like:
   *
   * ```
   * class MyDomain extends Domain implements EventsDomainInterface {
   *   async getEvents() {
   *      return {
   *         'hello': {
   *            handler: () => console.log('hello'),
   *            withResult: false,
   *          },
   *      };
   *   }
   * }
   * ```
   *
   * @param domains - The domains filtered out with only the domains that complies to EventDomainInterface interface.
   */
  async loadEvents(domains: EventsDomainInterface[]) {
    const promises = domains.map(async (eventsDomain) => {
      const events = await eventsDomain.getEvents();
      const eventsEntries = Object.entries(events);
      await Promise.all(
        eventsEntries.map(async ([eventName, eventHandlerOrObject]) => {
          let isWithResult = true;
          let eventHandler: (...args: any) => any;
          if (typeof eventHandlerOrObject !== 'function') {
            isWithResult = eventHandlerOrObject.withResult;
            eventHandler = eventHandlerOrObject.handler.bind(
              eventHandlerOrObject.handler
            );
          } else {
            eventHandler = eventHandlerOrObject.bind(eventHandlerOrObject);
          }
          if (isWithResult)
            await this.server.addEventListener(eventName, eventHandler);
          else
            await this.server.addEventListenerWithoutResult(
              eventName,
              eventHandler
            );
        })
      );
    });
    await Promise.all(promises);
  }

  /**
   * Loads the event server, loading the event server means that we will be creating a new instance of `EventEmitter`.
   * This new instance will not run in an setInterval. Its just the simple instance of the EventEmitter.
   */
  async load() {
    this.server = await eventsServer(
      this.settings.EVENTS_EMITTER,
      this.settings.EVENTS_OPTIONS
    );
    setEventsServer(this.server);
  }

  async close() {
    if (this.server) this.server.close();
  }

  /**
   * We just start the app server if the user is running the actual events server, otherwise just loading it guarantees that it works normally
   * as expected. Listening means that we will keep the server running. We don't want that if the user is already running an HTTP server.
   */
  async start() {
    await Promise.all([
      super.start(),
      this.server.listen(() => {
        logging.logMessage(LOGGING_APP_START_SERVER, {
          appName: this.settings.APP_NAME,
        });
      }),
    ]);
  }
}
