import Domain from ".";
import { SettingsType } from "../conf/types";

export type DomainReadyFunctionArgs<T = any, S = SettingsType> = {
  app: T;
  settings: S;
  domains: Domain[];
};
