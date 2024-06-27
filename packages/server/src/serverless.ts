import { SettingsType2, initializeDomains } from "@palmares/core";

import { initializeRouters } from "./app/utils";
import ServerlessAdapter from "./adapters/serverless";
import { ServerDomain } from "./domain/types";
import { AllServerSettingsType } from "./types";

export default class Serverless {
  async load(args: {
    settings: AllServerSettingsType;
    domains: ServerDomain[];
  }) {
    const serverEntries = Object.entries(args.settings.servers);
    const [serverName, serverSettings] = serverEntries[serverEntries.length - 1];
    const newServerInstance = new serverSettings.server(serverName, args.settings, args.settings.servers[serverName], args.domains);
    await newServerInstance.load(serverName, args.domains, serverSettings);
    await initializeRouters(args.domains, serverSettings, args.settings, newServerInstance, {
      serverless: {
        generate: true,
      }
    });
  }

  static async handleServerless(settings: SettingsType2, args: {
    requestAndResponseData: any,
    domainRoutes?: string[],
    serverName: string,
    getRoute: () => string,
    route?: string,
    method?: string,
    adapter: typeof ServerlessAdapter,
    getMethod: () => string
  }) {
    const { domains, settings: formattedSettings } = await initializeDomains(settings);
    const settingsServers = (formattedSettings as any) as AllServerSettingsType;
    const initializedAdapter = new args.adapter(args.serverName, settingsServers, settingsServers.servers[args.serverName], domains);
    const domainRoutes = Array.isArray(args.domainRoutes) && args.domainRoutes.length > 0 ?
      domains.filter((domain) => args.domainRoutes!.includes(domain.name)):
      domains;

    return await initializeRouters(
      domainRoutes,
      settingsServers.servers[args.serverName],
      settings as AllServerSettingsType,
      initializedAdapter,
      {
        serverless: {
          use: {
            getMethod: args.getMethod,
            getRoute: args.getRoute,
            requestAndResponseData: args.requestAndResponseData
          },
        }
      }
    );
  }
}
