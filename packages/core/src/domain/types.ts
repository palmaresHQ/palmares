import Domain from '.';
import AppServer from '../app';
import { SettingsType } from '../conf/types';

export type DomainReadyFunctionArgs<
  S = SettingsType,
  C extends object = object
> = {
  settings: S;
  domains: Domain[];
  app?: AppServer;
  customOptions: C;
};
