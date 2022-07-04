import { DomainType } from "./types";
import { DomainObligatoryParamsUndefinedError } from "./exceptions";
import { SettingsType } from "../conf/types";

export async function retrieveDomains(settings: SettingsType): Promise<typeof Domain[]> {
  const domainClasses: typeof Domain[] = []
  for (const domain of settings.INSTALLED_DOMAINS) {
    let domainKls: Promise<{default: typeof Domain}> | typeof Domain = domain;
    if (domainKls instanceof Promise) {
      domainKls = (await domainKls).default;
    }
    domainClasses.push(domainKls);
  }
  return domainClasses
}

export default class Domain implements DomainType {
  appName: string;
  appPath: string;

  constructor(appName?: string, appPath?: string) { 
    const isAppNameAndAppPathDefined = typeof appName === 'string' &&
      typeof appPath === 'string'
    if (isAppNameAndAppPathDefined) {
      this.appName = appName as string;
      this.appPath = appPath as string;
    } else {
      throw new DomainObligatoryParamsUndefinedError();
    }
  }

  async ready(): Promise<void> {}
  async close(): Promise<void> {}
}
