import { NotImplementedException } from "./exceptions";

import { RequestListener } from 'http';
import { SettingsType } from "../conf/types";

/**
 * This is the adapter class for the core framework that we are using, at the current time
 * we will only be supporting express.
 */
export default class Adapter {
    _app: any

    /**
     * Loads the adapter. For express for example this will be something like:
     * const app = express()
     */
    async load(): Promise<RequestListener> {
      throw new NotImplementedException('load');
    }

    /**
     * Initialized the adapter. For express for example this will be something like:
     * app.listen(() => {
     * })
     */
    async init(settings: SettingsType, callback: () => Promise<void>): Promise<void> {
      throw new NotImplementedException('init');
    }


    /**
     * This resieves the root router path and then configures the routes for the adapter.
     */
    async configureRoutes(rootUrlconf: string, database?: any): Promise<void> {
        throw new NotImplementedException('configureRoutes');
    }

    /**
     * Frameworks like express have support for middleware, we resieve an array of them so we
     * can configure them in our app.
     */
    async configureMiddleware(middlewares?: string[]): Promise<void> {
        throw new NotImplementedException('configureMiddleware');
    }
}
