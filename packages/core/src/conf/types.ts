import { MessageCategories, MessagesCallbackType } from "../logging/types";
import Domain from "../domain";

export type InstalledDomainsType = Promise<{ default: typeof Domain }>[] | typeof Domain[]

export type SettingsType = {
  ENV?: string,
  ADAPTER: string;
  DEBUG: boolean,
  PORT: number,
  SECRET_KEY: string,
  APP_NAME?: string,
  USE_TS?: boolean,
  BASE_PATH: string,
  ROOT_URLCONF: string,
  INSTALLED_DOMAINS: InstalledDomainsType,
  MIDDLEWARE?: string[],
  LOGGING?: {
    [key: string]: {
      category: MessageCategories,
      callback: MessagesCallbackType
    }
  },
  SOCKETS?: {
    ROOT_URLCONF: string,
    ENGINE: string,
    LAYER?: {
      BACKEND: string,
    }
  }
}
