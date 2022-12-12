import {
  DefaultCommandType,
  Domain,
  DomainHandlerFunctionArgs,
  DomainReadyFunctionArgs,
  SettingsType,
} from '@palmares/core';

import { dev as devCommand } from './commands';
import buildLogging from './logging';
import {
  OnlyServerSettingsType,
  MultipleServerSettings,
  ServerSettingsType,
} from './types';
import HttpAppServer from './app';
import Server from './server';

export default class ServerDomain extends Domain {
  serverName!: string;
  serverSettings!: OnlyServerSettingsType;
  server!: Server;
  app!: HttpAppServer;

  commands: DefaultCommandType = {
    dev: {
      description: 'runs the application in development mode',
      example: 'asdasd',
      handler: async (options: DomainHandlerFunctionArgs) => {
        await devCommand(this.app, options);
      },
    },
  };

  constructor(customDomainName?: string) {
    super(customDomainName ? customDomainName : ServerDomain.name, __dirname);
  }

  /**
   * This runs when the application loads, by default when the application loads we load the server constructor.
   * Most frameworks, like express usually runs in a constructor like fashion.
   *
   * For example express:
   * ```
   * import express from 'express';
   *
   * const app = express(); // --> Here, by default it's not running the server right now, this is what we save.
   * const port = 3000;
   *
   * app.get('/', (req, res) => {
   *    res.send('Hello World!')
   * });
   *
   * app.listen(port, () => {
   *    console.log(`Example app listening on port ${port}`)
   * })
   * ```
   *
   * Important: We can't use the this.app here because here domains will not be initialized yet.
   *
   * @param settings - The settings of the application defined by the user in `settings.(js/ts)`.
   */
  override async load<S extends SettingsType = ServerSettingsType>(
    settings: S
  ): Promise<void> {
    await buildLogging();

    let appSettings = settings as unknown as ServerSettingsType; // ew, need to make this better
    if (this.serverSettings) {
      appSettings = {
        ...settings,
        ...this.serverSettings,
      } as unknown as ServerSettingsType; // ew, and this
    }

    const server = new appSettings.SERVER(appSettings);
    this.app = new HttpAppServer(server);

    await this.app.load();
  }

  override async ready(options: DomainReadyFunctionArgs<ServerSettingsType>) {
    if (options.app instanceof HttpAppServer) await this.app.start();
  }

  override async close(): Promise<void> {
    await this.app.close();
  }

  // Just to suppress the warning on `@palmares/database` package if it exists in the application.
  async getModels() {
    return [];
  }
}

/**
 * Adds support to add multiple servers on the same domain. You just need to make sure that you setup different ports
 * for each server.
 */
export function multiple(config: MultipleServerSettings) {
  const serversEntries = Object.entries(config);
  return serversEntries.map(([serverName, serverSettings], index) => {
    return class MultipleServerDomain extends ServerDomain {
      constructor() {
        super(`${MultipleServerDomain.name}${index}`);
        this.serverName = serverName;
        this.serverSettings = serverSettings;
      }
    };
  });
}
