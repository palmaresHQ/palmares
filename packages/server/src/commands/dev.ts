import { DomainHandlerFunctionArgs, SettingsType } from "@palmares/core";
import Server from "../server";
import App from "../app";
import { ServerSettingsType } from "../types";

export default async function dev(app: App, options: DomainHandlerFunctionArgs) {
  await app.initialize(options.settings as ServerSettingsType, options.domains);
}
