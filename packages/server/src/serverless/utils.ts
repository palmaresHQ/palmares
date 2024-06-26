import { SettingsType2, initializeDomains } from "@palmares/core";

import { initializeRouters } from "../app/utils";
import ServerlessAdapter from "../adapters/serverless";
import { AllServerSettingsType } from "../types";

export default async function handleServerless(settings: SettingsType2, args: {
  requestAndResponseData: any,
  domainRoutes: string[],
  serverName: string,
  getRoute: () => string,
  adapter: typeof ServerlessAdapter,
  getMethod: () => string
}) {
  const { domains, settings: formattedSettings } = await initializeDomains(settings);
  const settingsServers = (formattedSettings as any) as AllServerSettingsType;
  const initializedAdapter = new args.adapter(args.serverName, settingsServers, domains);
  const domainRoutes = domains.filter((domain) => args.domainRoutes.includes(domain.name));
  return await initializeRouters(domainRoutes, settingsServers.servers[args.serverName], settingsServers, initializedAdapter, {
    serverless: {
      generate: false,
      use: true,
      getMethod: args.getMethod,
      getRoute: args.getRoute,
      requestAndResponseData: args.requestAndResponseData
    }
  });
}
