import Domain from '.';
import { SettingsType } from '../conf/types';

export type DomainReadyFunctionArgs<
  S = SettingsType,
  C extends object = object
> = {
  settings: S;
  domains: Domain[];
  customOptions: C;
};
