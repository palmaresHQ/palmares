import { MessageCategories, MessagesCallbackType } from "../logging/types";
import { DatabaseConfigurationType } from "../databases/types"; 

export type SettingsType = {
    ENV?: string,
    ADAPTER: string;
    DEBUG: boolean,
    PORT: number,
    SECRET_KEY: string,
    APP_NAME?: string,
    BASE_PATH: string,
    ROOT_URLCONF: string,
    INSTALLED_APPS: string[],
    MIDDLEWARE?: string[],
    LOGGING?: {
        [key: string]: {
            category: MessageCategories,
            callback: MessagesCallbackType
        }
    },
    DATABASES: {
        [key: string]: DatabaseConfigurationType<string, {}>
    }
    SOCKETS?: {
        ROOT_URLCONF: string,
        ENGINE: string,
        LAYER?: {
            BACKEND: string,
        }
    }
}