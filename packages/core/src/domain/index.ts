import { DomainType } from "./types";
import {
  DomainObligatoryParamsUndefinedError,
  NotAValidDomainDefaultExportedError
} from "./exceptions";
import { SettingsType } from "../conf/types";

export async function retrieveDomains(settings: SettingsType): Promise<typeof Domain[]> {
  const domainClasses: typeof Domain[] = []
  for (const domain of settings.INSTALLED_DOMAINS) {
    let domainKls: Promise<{default: typeof Domain}> | typeof Domain = domain;
    if (domainKls instanceof Promise) {
      domainKls = (await domainKls).default;
    }
    if (domainKls.prototype instanceof Domain) {
      domainClasses.push(domainKls);
    } else {
      throw new NotAValidDomainDefaultExportedError();
    }
  }
  return domainClasses
}

/**
 * The domain defines one of the domains of your application
 */
export default class Domain implements DomainType {
  name: string;
  path: string;

  constructor(name?: string, path?: string) {
    const isAppNameAndAppPathDefined = typeof name === 'string' &&
      typeof path === 'string'
    if (isAppNameAndAppPathDefined) {
      this.name = name as string;
      this.path = path as string;
    } else {
      throw new DomainObligatoryParamsUndefinedError();
    }
  }

  /**
   * Code to run when the app runs. This is sequentially executed one after another so you can
   * define the order of execution by defining the order of the INSTALLED_DOMAINS in the settings.ts/js
   * file.
   */
  async ready(): Promise<void> {}
  async close(): Promise<void> {}
}
