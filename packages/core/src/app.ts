import { SettingsType } from './conf/types';
import Domain from './domain';
import logging from './logging';
import { NotImplementedException } from './exceptions';
import { LOGGING_APP_STOP_SERVER } from './utils';

/**
 * This is the app, the app instance is responsible for loading the server.
 * An server is responsible to keep the app running.
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
export default class AppServer {
  domains!: Domain[];
  settings!: SettingsType;
  isClosingServer = false;

  /**
   * @private
   * Configure the cleanup of the server, this will run when the user press Ctrl+C and the server stops running.
   * This will stop the server gracefully instead of hard kill the process so we are able to do some cleanup.
   */
  async #configureCleanup() {
    process.on('SIGINT', async () => {
      await this.#cleanup();
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
      await logging.logMessage(LOGGING_APP_STOP_SERVER, {
        appName: this.settings.APP_NAME,
      });
      const promises = this.domains.map(async (domain) => {
        if (domain.isClosed === false) await domain.close();
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
  async initialize(settings: SettingsType, domains: Domain[]): Promise<void> {
    this.settings = settings;
    this.domains = domains;

    const customOptions = {
      app: this,
    };

    for (const domain of domains) {
      if (domain.isReady === false) {
        await domain.ready({
          settings: settings,
          domains,
          customOptions,
        });
      }
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
  async load() {
    throw new NotImplementedException(this.constructor.name, 'load');
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
  async start() {
    await this.#configureCleanup();
  }

  /**
   * Runs the clean up function of the server when the application stops, most frameworks might not need this
   * but if some framework relies on stopping gracefully it might be needed.
   */
  async close() {
    throw new NotImplementedException(this.constructor.name, 'close');
  }
}
