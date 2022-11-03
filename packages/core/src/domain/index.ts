import {
  DomainObligatoryParamsUndefinedError,
  NotAValidDomainDefaultExportedError,
} from './exceptions';
import { SettingsType } from '../conf/types';
import { DefaultCommandType } from '../commands/types';
import { DomainReadyFunctionArgs } from './types';

/**
 * The domain defines one of the domains of your application
 */
export default class Domain {
  commands: DefaultCommandType = {} as DefaultCommandType;
  name: string;
  path: string;
  #isReady = false;
  #isClosed = false;

  constructor(name?: string, path?: string) {
    const isAppNameAndAppPathDefined =
      typeof name === 'string' && typeof path === 'string';
    if (isAppNameAndAppPathDefined) {
      this.name = name as string;
      this.path = path as string;
    } else {
      throw new DomainObligatoryParamsUndefinedError();
    }
  }

  get isReady() {
    return this.#isReady;
  }

  get isClosed() {
    return this.#isClosed;
  }

  static async retrieveDomains(
    settings: SettingsType
  ): Promise<typeof Domain[]> {
    const domainClasses: typeof Domain[] = [];
    for (const domain of settings.INSTALLED_DOMAINS) {
      let domainKls: Promise<{ default: typeof Domain }> | typeof Domain =
        domain;
      if (domainKls instanceof Promise) {
        domainKls = (await domainKls).default;
      }
      if (domainKls.prototype instanceof Domain) {
        domainClasses.push(domainKls);
      } else {
        throw new NotAValidDomainDefaultExportedError();
      }
    }
    return domainClasses;
  }

  /**
   * Runs when the domain is loaded.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async load<S extends SettingsType = SettingsType>(
    settings: S
  ): Promise<void> {}

  /**
   * Code to run when the app runs. This is sequentially executed one after another so you can
   * define the order of execution by defining the order of the INSTALLED_DOMAINS in the settings.ts/js
   * file.
   */
  async ready(options: DomainReadyFunctionArgs): Promise<void> {
    this.#isReady = true;
  }

  async close(): Promise<void> {
    this.#isClosed = true;
  }
}
