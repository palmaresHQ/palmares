import { MessageCategories, MessagesCallbackType } from '../logging/types';
import Domain from '../domain';

export type InstalledDomainsType =
  | Promise<{ default: typeof Domain }>[]
  | typeof Domain[];

export type SettingsType = {
  ENV?: string;
  DEBUG: boolean;
  APP_NAME?: string;
  USE_TS?: boolean;
  BASE_PATH: string;
  INSTALLED_DOMAINS: InstalledDomainsType;
  LOGGING?: {
    [key: string]: {
      category: MessageCategories;
      callback: MessagesCallbackType;
    };
  };
  SOCKETS?: {
    ROOT_URLCONF: string;
    ENGINE: string;
    LAYER?: {
      BACKEND: string;
    };
  };
};
