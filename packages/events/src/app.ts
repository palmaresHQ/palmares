import { AppServer } from '@palmares/core';
import Emitter from './emitter';
import { EventsDomainInterface } from './interfaces';

import { EventsServer, default as eventsServer } from './server';
import { EventsSettingsType } from './types';

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

  async load() {
    this.server = await eventsServer(
      this.settings.EVENTS_EMITTER,
      this.settings.EVENTS_OPTIONS
    );
  }

  async start() {
    await Promise.all([
      super.start(),
      this.server.listen(() => {
        console.log('Events server started');
      }),
    ]);
  }
}
