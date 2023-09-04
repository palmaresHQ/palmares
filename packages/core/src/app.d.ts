import { SettingsType } from './conf/types';
import Domain from './domain/domain';
/**
 * This is the app, the app instance is responsible for loading the server, think about the server as anything. A server is just a program
 * that keeps running until you close it. It can be an HTTP server, an Events Server, a TCP server, etc.
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
    #private;
    domains: Domain[];
    settings: SettingsType;
    isClosingServer: boolean;
    static __instance: AppServer;
    constructor();
    /**
     * Initialize the app, this will load the settings, initialize the server and call `ready` function
     * inside of the domains. This ready function is called when the application starts.
     *
     * @param settings - The settings of the application. Those are the server settings with the data needed
     * for this application.
     * @param domains - All of the domains of the application, including the domain of the server.
     */
    initialize(settings: any, domains: Domain[]): Promise<void>;
    /**
     * Method for loading the server instance, this will create a new instance of the server. For express it would
     * be calling:
     *
     * ```ts
     * const app = express();
     * ```
     */
    load(): Promise<void>;
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
    start(): Promise<void>;
    /**
     * Runs the clean up function of the server when the application stops, most frameworks might not need this
     * but if some framework relies on stopping gracefully it might be needed.
     */
    close(): Promise<void>;
}
//# sourceMappingURL=app.d.ts.map