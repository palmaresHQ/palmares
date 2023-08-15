import {
  DomainObligatoryParamsUndefinedError,
  NotAValidDomainDefaultExportedError,
} from './exceptions';
import { SettingsType } from '../conf/types';
import { DefaultCommandType } from '../commands/types';
import { DomainReadyFunctionArgs } from './types';
import Configuration from '../conf';
import Commands from '../commands';

/**
 * The domain defines one of the domains of your application
 */
export default class Domain<TModifiers extends object = object> {
  commands = {} as DefaultCommandType;
  name!: string;
  path!: string;
  isLoaded = false;
  modifiers!: TModifiers;
  protected isReady = false;
  protected isClosed = false;
  static __instance: Domain;

  constructor(name?: string, path?: string) {
    if ((this.constructor as typeof Domain).__instance)
      return (this.constructor as typeof Domain).__instance;

    const isAppNameAndAppPathDefined =
      typeof name === 'string' && typeof path === 'string';
    if (isAppNameAndAppPathDefined) {
      this.name = name as string;
      this.path = path as string;
      (this.constructor as typeof Domain).__instance = this;
    } else {
      throw new DomainObligatoryParamsUndefinedError();
    }
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
   * Initialize all of the domains as well as all of the commands from it. We will append all of the commands to this
   * class so that we can cache it if we need to access it again for some reason.
   *
   * @param settings - The settings of the application.
   *
   * @returns - Returns the commands of the domains inside of the application as well as the domains themselves.
   */
  static async initializeDomains(settings: SettingsType) {
    if (Configuration.hasInitializedDomains)
      return {
        domains: Configuration.domains,
        commands: Commands.commands,
      };

    let commands = {} as DefaultCommandType;
    const initializedDomains: Domain[] = [];
    const domainClasses = await Domain.retrieveDomains(settings);
    for (const domainClass of domainClasses) {
      const initializedDomain = new domainClass();
      if (initializedDomain.isLoaded === false) {
        await initializedDomain.load(settings);
        initializedDomain.isLoaded = true;
      }
      commands = {
        ...commands,
        ...initializedDomain.commands,
      };
      initializedDomains.push(initializedDomain);
    }
    Configuration.hasInitializedDomains = true;
    Configuration.domains = initializedDomains;
    Commands.commands = commands;

    return {
      commands: commands,
      domains: initializedDomains,
    };
  }

  /**
   * Runs when the domain is loaded.
   */
  load?: <TSettings extends SettingsType = SettingsType>(
    settings: TSettings
  ) => void | Promise<void>;

  /**
   * Code to run when the app runs. This is sequentially executed one after another so you can
   * define the order of execution by defining the order of the INSTALLED_DOMAINS in the settings.ts/js
   * file.
   */
  ready?: <
    TSettings extends SettingsType = SettingsType,
    TCustomOptions extends object = object
  >(
    options: DomainReadyFunctionArgs<TSettings, TCustomOptions>
  ) => void | Promise<void>;

  /**
   * Code to run when the app is closed.
   */
  close?: () => Promise<void> | void;
}
