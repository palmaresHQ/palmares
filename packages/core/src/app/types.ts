import type { BaseAppServer } from '.';

export interface AppServerInterface {
  /**
   * Method for loading the server instance, this will create a new instance of the server. For express it would
   * be calling:
   *
   * ```ts
   * const app = express();
   * ```
   */
  load: () => Promise<void>;

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
  start: (_configureCleanup: BaseAppServer['configureCleanup']) => Promise<void>;

  /**
   * Runs the clean up function of the server when the application stops, most frameworks might not need this
   * but if some framework relies on stopping gracefully it might be needed.
   */
  close: () => Promise<void>;
}
