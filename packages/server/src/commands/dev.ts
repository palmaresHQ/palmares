import { DomainHandlerFunctionArgs } from '@palmares/core';
import App from '../app';
import { ServerSettingsType } from '../types';

/**
 * Initializes the server application.
 */
export default async function dev(
  app: App,
  options: DomainHandlerFunctionArgs
) {
  await app.initialize(options.settings as ServerSettingsType, options.domains);
}
