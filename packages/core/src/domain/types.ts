import Domain from ".";
import Adapter from "../adapters";
import { SettingsType } from "../conf/types";

export type DomainReadyFunctionArgs<A extends Adapter = Adapter, S = SettingsType> = {
  app: A["_app"];
  settings: S;
  domains: Domain[];
};
