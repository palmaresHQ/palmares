import { MessageCategories, MessagesCallbackType } from "../logging/types"

export type SettingsType = {
    ENV?: string,
    DEBUG: boolean,
    PORT: number,
    SECRET_KEY: string,
    APP_NAME?: string,
    BASE_PATH: string,
    ROOT_URLCONF: string,
    INSTALLED_APPS?: string[],
    MIDDLEWARE?: string[],
    LOGGING?: {
        [key: string]: {
            category: MessageCategories,
            callback: MessagesCallbackType
        }
    },
    DATABASES?: {
        [key: string]: {
            engine: string,
            databaseName: string,
            username: string,
            password: string,
            host: string,
            port: number,
            extraOptions?: object
        }
    }
    SOCKETS?: {
        ROOT_URLCONF: string,
        ENGINE: string,
        LAYER?: {
            BACKEND: string,
        }
    }
}