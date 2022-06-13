import BaseAdapter from '../adapters';
import { SettingsType } from '../conf/types';
import logging from '../logging';
import { 
    ERR_MODULE_NOT_FOUND, LOGGING_APP_START_SERVER, 
    LOGGING_APP_STOP_SERVER, LOGGING_ADAPTER_NOT_FOUND
} from '../utils';

import http from 'http';
import { AdapterNotFoundException } from './exceptions';

/**
 * This is the main class of the framework, it is used to initialize the application and 
 * configure everything.
 */
export default class App {
    settings = <SettingsType>{}
    adapter: BaseAdapter | undefined;
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
    async #init(): Promise<http.Server> {
        try {
            this.adapter = (await import(this.settings.ADAPTER))?.default;

            const app = await this.adapter?.init()
            const server = http.createServer(app)

            await this.#initializeDatabase()
            await this.#initializeRouters()
            await this.#initializeMiddleware()
            
            return server
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
        const isMiddlewareDefined : boolean = Array.isArray(this.settings.MIDDLEWARE)
        if (isMiddlewareDefined) {
            this.adapter?.configureMiddleware(this.settings.MIDDLEWARE)
        }
    }
    
    async #initializeDatabase(): Promise<void> {
        const isDatabaseDefined : boolean = typeof this.settings.DATABASES === 'object' && 
            this.settings.DATABASES !== undefined
        if (isDatabaseDefined) {
            //await databases.init(this.settings.DATABASES)
        }
    }

    async #cleanup(): Promise<void> {
        logging.logMessage(LOGGING_APP_STOP_SERVER)
        //await databases.close()
    }

    /**
     * This is the method that is supposed to be called in order to start the application.
     * 
     * First we initialize the configurations, then we proceed to start the server and we also
     * initialize the a cleanup function when the server stops.
     */
    async run(): Promise<http.Server> {
        const server = await this.#init()

        server?.listen(this.settings.PORT, () => {
            logging.logMessage(LOGGING_APP_START_SERVER, { 
                appName: this.settings.APP_NAME, 
                port: this.settings.PORT 
            })
        })

        process.on('SIGINT', async () => {
            await this.#cleanup()
            process.exit(0)
        })

        return server
    }
}