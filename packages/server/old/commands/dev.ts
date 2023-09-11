import { DomainHandlerFunctionArgs } from '@palmares/core';

import type HttpAppServer from '../app';
import { ServerSettingsType } from '../types';

/**
 * Initializes the server application.
 */
export default async function dev(
  app: HttpAppServer,
  options: DomainHandlerFunctionArgs
) {
  await app.initialize(options.settings as ServerSettingsType, options.domains);
}
