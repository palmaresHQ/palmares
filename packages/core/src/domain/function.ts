import type { DomainReadyFunctionArgs, ExtractModifierArguments } from './types';
import Domain from './domain';
import type { DefaultCommandType } from '../commands/types';

/**
 * Functional approach to how one can create a domain. It's similar to the class approach, but can be more flexible then the class counter-part.
 *
 * @example ```ts
 * import { domain } from '@palmares/core';
 *
 * const testDomain = domain('test', __dirname, {
 *   commands: {
 *     test: {
 *       handler: async () => {
 *         console.log('Testing the application...')
 *         // Do something else
 *       }
 *     },
 *  },
 *  load: async () => {
 *    // Do something when the domain is loaded
 *  }
 * })
 * ```
 */
export default function domain<
  TModifierArguments = object,
  TModifiers extends readonly (abstract new (...args: any) => {
    modifiers: any;
  })[] = readonly (abstract new (...args: any) => {
    modifiers: any;
  })[],
  const TCommands extends DefaultCommandType = DefaultCommandType,
  TLoadFunction extends (
    settings: any
  ) =>
    | void
    | Promise<void>
    | ((args: DomainReadyFunctionArgs<any, any>) => void | Promise<void>)
    | Promise<(args: DomainReadyFunctionArgs<any, any>) => void | Promise<void>> = (
    settings: unknown
  ) =>
    | void
    | Promise<void>
    | ((args: DomainReadyFunctionArgs<unknown, any>) => void | Promise<void>)
    | Promise<(args: DomainReadyFunctionArgs<unknown, any>) => void | Promise<void>>,
  TReadyFunction extends (args: DomainReadyFunctionArgs<any, any>) => void | Promise<void> = (
    args: DomainReadyFunctionArgs<unknown, any>
  ) => void | Promise<void>,
>(
  /**
   * The name of the domain. It will be used to identify the domain and to load the settings for it.
   */
  name: string,
  /**
   * This is where the domain is located, this way we can write files directly to the domain folder. On Node.js just use `__dirname`.
   */
  path: string,
  args: {
    /**
     * Modifier classes are NOT used for anything else besides to guarantee that you actually pass all of the required arguments to the domain.
     */
    modifiers?: TModifiers;
    commands?: TCommands;
    /**
     * Function that will be called once the domain is loaded. It will receive the settings as the first argument.
     * Take note that the settings object appends the settings for each domain it reads in order, so the domain order is really important.
     */
    load?: TLoadFunction;
    /**
     * Function that will be called once the application is ready. Application ready means it's ready to run, all of the domains are loaded and the server is ready to start.
     * On here you can connect to the database,
     */
    ready?: TReadyFunction;
    close?: () => void | Promise<void>;
  } & ExtractModifierArguments<TModifiers>
) {
  const argsEntries = Object.entries(args);
  class ReturnedClass extends Domain<TModifierArguments> {
    constructor() {
      super(name, path);
    }

    load = args.load as TLoadFunction;
    ready = args.ready as TReadyFunction;
    close = args.close;
    commands = (args.commands || {}) as TCommands | undefined;
    static toJSON = () => ({ name, path });
  }

  for (const [key, value] of argsEntries) (ReturnedClass as any).prototype[key] = value;

  return ReturnedClass;
}
