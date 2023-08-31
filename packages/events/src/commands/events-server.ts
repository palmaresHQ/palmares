import { DomainHandlerFunctionArgs } from '@palmares/core';

import type EventsAppServer from '../app';
import type { EventsSettingsType } from '../types';

/**
 * Initializes the server application for the events, this will only listen for events and not for http requests.
 *
 * @param app - The EventsAppServer that should be initialized.
 * @param options - The options received from the domain.
 */
export default async function eventsServer(
  app: EventsAppServer,
  options: DomainHandlerFunctionArgs
) {
  /*await app.initialize(
    options.settings as unknown as EventsSettingsType,
    options.domains
  );*/
}
