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

  async ready(): Promise<void> {}
  async close(): Promise<void> {}
}
