import Adapter from '../adapters';
import { SettingsType } from '../conf/types';
import logging from '../logging';
import {
    ERR_MODULE_NOT_FOUND, LOGGING_APP_START_SERVER,
    LOGGING_APP_STOP_SERVER
} from '../utils';
import { AdapterNotFoundException } from './exceptions';
import Domain from '../domain';

/**
 * This is the main class of the framework, it is used to initialize the application and
 * configure everything.
 */
export default class App {
  settings: SettingsType;
  adapter: Adapter | undefined;
  #initializedDomains: Domain[] = [];
  //websocketsAdapter: BaseWebsocketsAdapter

  constructor(settings: SettingsType) {
    this.settings = settings
  }

  /**
   * This method initializes the adapter application. What this means is for example, for express we will do
   * something like:
   *
   * ```
   * const app = express()
   * return app
   * ```
   *
   * After initializing we automatically assign the app to an http.createServer() instance.
   */
  async #init(domains: Domain[]): Promise<Adapter["_app"]> {
    try {
      this.adapter = (await import(this.settings.ADAPTER))?.default;

      const app = await this.adapter?.load()

      await this.#initializeDomains(domains, app);
      await this.#initializeRouters()
      await this.#initializeMiddleware()

      return app;
    } catch(e) {
      const error: any = e;
      if (error.code === ERR_MODULE_NOT_FOUND) {
        throw new AdapterNotFoundException(this.settings.ADAPTER);
      } else {
        throw e;
      }
    }
  }

  async #initializeRouters(): Promise<void> {
    const isRootRouterDefined : boolean = ![undefined, null, ''].includes(this.settings.ROOT_URLCONF)
    if (isRootRouterDefined) {
      this.adapter?.configureRoutes(this.settings.ROOT_URLCONF)
    }
  }

  async #initializeMiddleware(): Promise<void> {
    const isMiddlewareDefined : boolean = Array.isArray(this.settings.MIDDLEWARE);
    if (isMiddlewareDefined) {
      this.adapter?.configureMiddleware(this.settings.MIDDLEWARE);
    }
  }

  async #initializeDomains(domains: Domain[], app: any): Promise<void> {
    for (const domain of domains) {
      await domain.ready({
        app,
        settings: this.settings,
        domains
      });
      this.#initializedDomains.push(domain);
    }
  }

  async #cleanup(): Promise<void> {
    await logging.logMessage(LOGGING_APP_STOP_SERVER, {appName: this.settings.APP_NAME});
    await Promise.all(this.#initializedDomains.map(async (domain) => {
      await domain.close()
    }));
  }

  /**
   * This is the method that is supposed to be called in order to start the application.
   *
   * First we initialize the configurations, then we proceed to start the server and we also
   * initialize the a cleanup function when the server stops.
   */
  async run(domains: Domain[]): Promise<void> {
    const app = await this.#init(domains)

    process.on('SIGINT', async () => {
        await this.#cleanup()
        process.exit(0)
    })

    await this.adapter?.init(this.settings, async () => {
      await logging.logMessage(LOGGING_APP_START_SERVER, {
        appName: this.settings.APP_NAME,
        port: this.settings.PORT
      })
    })
  }
}
