import BaseAdapter from './src/adapters';
import { SettingsType } from './conf/types';
import logging from './logging';
import { 
    LOGGING_APP_START_SERVER, LOGGING_APP_STOP_SERVER 
} from './utils';

import http from 'http';

/**
 * This is the main class of the framework, it is used to initialize the application and 
 * configure everything.
 */
export default class App {
    settings = <SettingsType>{}
    adapter : BaseAdapter
    //websocketsAdapter: BaseWebsocketsAdapter

    constructor(settings: SettingsType, adapter: BaseAdapter) {
        this.settings = settings
        this.adapter = adapter
    }

    async #init(): Promise<http.Server> {
        const app = await this.adapter.init()
        const server = http.createServer(app)

        await this.#initializeRouters()
        await this.#initializeMiddleware()
        await this.#initializeDatabase()
        return server
    }

    async #initializeRouters(): Promise<void> {
        const isRootRouterDefined : boolean = ![undefined, null, ''].includes(this.settings.ROOT_URLCONF)
        if (isRootRouterDefined) {
            this.adapter.configureRoutes(this.settings.ROOT_URLCONF)
        }
    }

    async #initializeMiddleware(): Promise<void> {
        const isMiddlewareDefined : boolean = Array.isArray(this.settings.MIDDLEWARE)
        if (isMiddlewareDefined) {
            this.adapter.configureMiddleware(this.settings.MIDDLEWARE)
        }
    }
    
    async #initializeDatabase(): Promise<void> {
        const isDatabaseDefined : boolean = typeof this.settings.DATABASES === 'object' && 
            this.settings.DATABASES !== undefined
        if (isDatabaseDefined) {
            await databases.init(this.settings.DATABASES)
        }
    }

    async #cleanup(): Promise<void> {
        logging.logMessage(LOGGING_APP_STOP_SERVER)
        await databases.close()

    }

    /**
     * This is the method that is supposed to be called in order to start the application.
     * 
     * First we initialize the configurations, then we proceed to start the server and we also
     * initialize the a cleanup function when the server stops.
     */
    async run(): Promise<http.Server> {
        const server = await this.#init()

        server.listen(this.settings.PORT, () => {
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