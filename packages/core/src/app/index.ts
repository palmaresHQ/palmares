import { getLogger } from '../logging';

import type { DomainHandlerFunctionArgs } from '../commands/types';
import type { SettingsType2 } from '../conf/types';
import type { Domain } from '../domain/domain';

declare global {
  // eslint-disable-next-line no-var
  var $PBaseAppServerInstance: BaseAppServer | undefined;
  // eslint-disable-next-line no-var
  var $PAppServerInstance: InstanceType<ReturnType<typeof appServer>> | AppServer | undefined;
}

function getBaseAppServerInstance() {
  return globalThis.$PBaseAppServerInstance;
}

function getAppServerInstance() {
  return globalThis.$PAppServerInstance;
}

function setAppServerInstance(instance: InstanceType<ReturnType<typeof appServer>> | AppServer) {
  globalThis.$PAppServerInstance = instance;
}

function setBaseAppServerInstance(instance: BaseAppServer) {
  globalThis.$PBaseAppServerInstance = instance;
}

/**
 * Functional approach for creating an app server instead of using the class approach, it's pretty much the same as the
 * class one.
 */
export function appServer<
  TLoadFunction extends AppServer['load'],
  TStartFunction extends AppServer['start'],
  TCloseFunction extends AppServer['close']
>(args: { start: TStartFunction; load: TLoadFunction; close: TCloseFunction }) {
  return class extends AppServer {
    start = args.start;
    load = args.load;
    close = args.close;
  };
}

/**
 * The base app server is not supposed to be extended and used externally, it's used internally by the app server and
 * it configures automatically the cleanup phase of the server.
 * It also handles the start of the server.
 */
export class BaseAppServer {
  domains!: Domain[];
  settings!: SettingsType2;
  isClosingServer = false;

  constructor(domains: Domain[], settings: SettingsType2) {
    const baseAppServerInstance = getBaseAppServerInstance();
    if (baseAppServerInstance) return baseAppServerInstance;
    else {
      this.domains = domains;
      this.settings = settings;
      setBaseAppServerInstance(this);
      return this;
    }
  }

  /**
   * Configure the cleanup of the server, this will run when the user press Ctrl+C and the server stops running.
   * This will stop the server gracefully instead of hard kill the process so we are able to do some cleanup.
   *
   * @params args - The arguments of the server, this way you can send anything you want to the `close` method of the
   * app server.
   */
  configureCleanup(appServer: AppServer, args: any) {
    process.on('SIGINT', async () => {
      await this.#cleanup();
      await appServer.close(args);
      process.exit(0);
    });
  }

  /**
   * This is the cleanup phase, we will call `close` method on all of the domains so
   * they shut down gracefully.
   *
   * By default what this does is simply calling all of the `close` methods of the domains.
   */
  async #cleanup() {
    if (this.isClosingServer === false) {
      this.isClosingServer = true;

      const logger = getLogger();
      logger.info('Closing the app server');

      const promises = this.domains.map(async (domain) => {
        if (domain.__isClosed === false && domain.close) await domain.close();
      });
      await Promise.all(promises);
    }
  }

  /**
   * Initialize the app, this will load the settings, initialize the server and call `ready` function
   * inside of the domains. This ready function is called when the application starts.
   *
   * @param settings - The settings of the application. Those are the server settings with the data needed
   * for this application.
   * @param domains - All of the domains of the application, including the domain of the server.
   */
  async initialize(settings: any, domains: Domain[]): Promise<void> {
    this.settings = settings;
    this.domains = domains;

    const customOptions = {};

    for (const domain of domains) {
      if (domain.__isReady === false && domain.ready) {
        await domain.ready({
          settings: settings,
          domains,
          app: this as unknown as AppServer | InstanceType<ReturnType<typeof appServer>>,
          customOptions
        });
      }
    }
  }
}

/**
 * This is the app, the app instance is responsible for loading the server, think about the server as anything.
 * A server is just a program that keeps running until you close it. It can be an HTTP server, an Events Server,
 * a TCP server, etc.
 *
 * By default this overrides many of the things defined on the core, like the `domains`.
 * It's on here that we call the `ready` and `close` methods of each domain so we are able to
 * start the server.
 *
 * The life cycle of the app is:
 * - `load`: Loads the constructor.
 * - `start`: Starts the appServer.
 * - `close`: Stops the appServer.
 */
export class AppServer {
  static $$type = '$PAppServer';
  baseAppServer!: BaseAppServer;

  constructor(domains: Domain[], settings: SettingsType2) {
    const appServerInstance = getAppServerInstance();
    if (appServerInstance) return appServerInstance;
    else {
      this.baseAppServer = new BaseAppServer(domains, settings);
      setAppServerInstance(this);
      return this;
    }
  }

  /**
   * Method for loading the server instance, this will create a new instance of the server. For express it would
   * be calling:
   *
   * ```ts
   * const app = express();
   * ```
   */
  // eslint-disable-next-line ts/require-await
  async load(_: {
    domains: Domain[];
    commandLineArgs: DomainHandlerFunctionArgs['commandLineArgs'];
    settings: SettingsType2;
  }): Promise<void> {
    return undefined;
  }

  /**
   * To start the server we must first load the routes, then load the 404 handler and just
   * after that we initialize the application.
   *
   * JUST AS AN EXAMPLE simple way this would be like:
   * @example
   * ```ts
   * // Load the routes - generally speaking this is the what `this.#startRoutes()` does.
   * app.get('/test', (req, res) => { res.send('Hello World') });
   * app.post('/test', (req, res) => { res.send('Hello World') });
   *
   * // Load the 404 handler - generally speaking this is the what `this.#load404()` does.
   * app.use( (req, res) => { res.send('404') });
   *
   * // Initialize the application - generally speaking this is the what `this.server.init()` does.
   * app.listen(3000, () => { console.log('Server started') });
   *
   * // Cleanup function - generally speaking this is the what `this.#configureCleanup()` does.
   * process.on('SIGINT', async () => {
   *  process.exit(0);
   * })
   * ```
   */
  // eslint-disable-next-line ts/require-await
  async start(_configureCleanup: (args?: any) => Promise<void> | void): Promise<void> {
    return undefined;
  }

  /**
   * Runs the clean up function of the server when the application stops, most frameworks might not need this
   * but if some framework relies on stopping gracefully it might be needed.
   */
  // eslint-disable-next-line ts/require-await
  async close(args: any): Promise<void> {
    return undefined;
  }
}
