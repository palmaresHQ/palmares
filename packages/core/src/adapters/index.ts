import { NotImplementedException } from "./exceptions";

import http from 'http';

/**
 * This is the adapter class for the core framework that we are using, at the current time
 * we will only be supporting express.
 */
export default class BaseAdapter {
    /**
     * Initialize the adapter. For express for example this will be something like:
     * const app = express()
     */
    async init(): Promise<http.RequestListener> {
        throw new NotImplementedException('init');
    }

    /**
     * This resieves the root router path and then configures the routes for the adapter.
     */
    async configureRoutes(rootUrlconf: string): Promise<void> {
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