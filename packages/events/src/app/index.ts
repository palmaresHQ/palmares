import { appServer } from '@palmares/core';

import { loadEvents } from './utils';
import { eventsLogger } from '../logging';
import { default as eventsServer, getEventsServer, setEventsServer } from '../server';

import type { EventsDomainInterface } from '../interfaces';
import type { EventsSettingsType } from '../types';

let cachedSettings: EventsSettingsType | undefined = undefined;

/**
 * This is the event server for the Palmares framework. If the server doesn't already exist
 * it will create a new one (a server is just a recursive setInterval that will be called every 12 days)
 * so the program keeps running. If a Server was created, then it will not initialize anything, it'll be
 * just a simple EventEmitter instance.
 */
export default appServer({
  load: async ({ settings, domains }) => {
    const settingsAsEventsSettingsType = settings as unknown as EventsSettingsType;
    cachedSettings = settingsAsEventsSettingsType;
    const server = await eventsServer(
      settingsAsEventsSettingsType.EVENTS_EMITTER,
      settingsAsEventsSettingsType.EVENTS_OPTIONS
    );
    await loadEvents(server, domains as EventsDomainInterface[]);
    setEventsServer(server);
  },
  // eslint-disable-next-line ts/require-await
  close: async () => {
    const server = getEventsServer();
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (server) server.close();
  },
  start: async (configureCleanup) => {
    const server = getEventsServer();
    await Promise.all([
      configureCleanup(),
      server.listen(() => {
        if (cachedSettings)
          eventsLogger.logMessage('APP_START_EVENTS_SERVER', {
            appName: cachedSettings.APP_NAME || '@palmares/events_server'
          });
      })
    ]);
  }
});
