import { DomainObligatoryParamsUndefinedError } from './exceptions';

import type { DomainReadyFunctionArgs } from './types';
import type { DefaultCommandType } from '../commands/types';

/**
 * The domain defines one of the domains of your application. Think about domains as
 * small self-contained applications. Your app is a collection of multiple domains.
 * EVERYTHING is a domain, the server is a domain, the database is a domain. Domains are
 * the building blocks of your application. Everything inside Palmares starts with domains.
 */
export class Domain<TModifiers = any> {
  static $$type = '$PDomain';
  commands = {} as DefaultCommandType | undefined;
  /**
   * Because of how node_modules work, we might have multiple instances of the core package.
   * Your package requires core? So it might install it as well inside of the node_modules.
   *
   * Like that:
   *
   * The user's App
   *   |-> node_modules
   *      |-> @palmares/core
   *          |-> YOUR PACKAGE
   *              |-> node_modules
   *                  |-> @palmares/core
   *
   * This will mess things up since we will have multiple instances of the core package.
   * Since we rely a lot on global data. Shared data lets you
   */
  instances?: Domain<any>[];
  name!: string;
  path!: string;
  isLoaded = false;
  modifiers!: TModifiers;
  __isReady = false;
  __isClosed = false;
  static __instance: Domain<any>;

  constructor(name?: string, path?: string) {
    // eslint-disable-next-line ts/no-unnecessary-condition
    if ((this.constructor as typeof Domain).__instance) return (this.constructor as typeof Domain).__instance;

    const isAppNameAndAppPathDefined = typeof name === 'string' && typeof path === 'string';
    if (isAppNameAndAppPathDefined) {
      this.name = name;
      this.path = path;
      (this.constructor as typeof Domain).__instance = this;
    } else {
      throw new DomainObligatoryParamsUndefinedError();
    }
  }

  /**
   * Runs when the domain is loaded. The domain is loaded whenever you run the app. This is obligatory to run.
   *
   * By default if you define to return a callback function this callback function
   * will be called after all of the domains are loaded.
   */
  load?(
    settings: any
  ):
    | void
    | Promise<void>
    | ((args: DomainReadyFunctionArgs<any, any>) => void | Promise<void>)
    | Promise<(args: DomainReadyFunctionArgs<any, any>) => void | Promise<void>>;

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
