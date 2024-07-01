import { SettingsType2, initializeDomains } from "@palmares/core";

import { initializeRouters } from "./app/utils";
import ServerlessAdapter from "./adapters/serverless";
import { ServerDomain } from "./domain/types";
import { AllServerSettingsType } from "./types";

/**
 * This class is responsible for generating the serverless functions as well as executing them.
 */
export default class Serverless {
  /**
   * Generate the serverless functions. We still use initializeRouters to generate the routes.
   * Similarly to an actual server adapter.
   *
   * Generate the serverless functions is just creating files, for that we use the `@palmares/std` package.
   * The adapter is a little bit different than the others.
   *
   * @param args The arguments to generate the serverless functions.
   */
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
    await newServerInstance.load(serverName, args.domains, serverSettings);
  }

  /**
   * Handle the serverless functions. This is the function that will be called when the serverless functions are
   * executed. Your serverless function should call this function directly.
   *
   * @param settings The settings to load.
   * @param args The arguments to handle the serverless functions.
   * @param args.requestAndResponseData The request and response data to handle the serverless functions.
   * The generated data should be left as is. The adapter defines that. But if it expects an object, you can add
   * custom data to that object. You can use that on your routes.
   * @param args.domainRoutes The domain routes to handle. This will filter the domains to certain routes only.
   * some serverless functions handle doing the routing.
   * @param args.serverName The server name to handle the serverless functions, should be left untouched.
   * @param args.getRoute The function to get the route, should be left untouched.
   * @param args.route Like i said, some serverless functions handle the routing, this is the route to handle.
   * @param args.method Like i said, some serverless functions handle the routing, and also the method to handle. If
   * defined, should be left untouched.
   * @param args.adapter The adapter to handle the serverless functions, should be left untouched.
   * @param args.getMethod The function to get the method, should be left untouched.
   *
   * @returns Returns the response data from the serverless function
   */
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
