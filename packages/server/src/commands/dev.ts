import { DomainHandlerFunctionArgs } from "@palmares/core";
import App from "../app";
import { ServerSettingsType } from "../types";

/**
 * Initializes the server application.
 *
 * @param app - The app instance that is defined here.
 */
export default async function dev(app: App, options: DomainHandlerFunctionArgs) {
  await app.initialize(options.settings as ServerSettingsType, options.domains);
}
