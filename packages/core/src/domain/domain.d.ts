import { DefaultCommandType } from '../commands/types';
import { DomainReadyFunctionArgs } from './types';
/**
 * The domain defines one of the domains of your application. Think about domains as small self-contained applications. Your app is a collection of multiple domains.
 * EVERYTHING is a domain, the server is a domain, the database is a domain. Domains are the building blocks of your application. Everything inside Palmares starts with domains.
 */
export default class Domain<TModifiers = any> {
    commands: DefaultCommandType | undefined;
    name: string;
    path: string;
    isLoaded: boolean;
    modifiers: TModifiers;
    __isReady: boolean;
    __isClosed: boolean;
    static __instance: Domain<any>;
    constructor(name?: string, path?: string);
    /**
     * Runs when the domain is loaded. The domain is loaded whenever you run the app. This is obligatory to run.
     *
     * By default if you define to return a callback function this callback function will be called after all of the domains are loaded.
     */
    load?(settings: any): void | Promise<void> | ((args: DomainReadyFunctionArgs<any, any>) => void | Promise<void>) | Promise<(args: DomainReadyFunctionArgs<any, any>) => void | Promise<void>>;
    /**
     * Code to run when the app runs. This is sequentially executed one after another so you can
     * define the order of execution by defining the order of the INSTALLED_DOMAINS in the settings.ts/js
     * file.
     */
    ready?(options: DomainReadyFunctionArgs<any, any>): void | Promise<void>;
    /**
     * Code to run when the app is closed.
     */
    close?(): Promise<void> | void;
}
//# sourceMappingURL=domain.d.ts.map