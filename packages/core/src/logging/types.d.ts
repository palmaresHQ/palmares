export declare enum MessageCategories {
    Debug = "Debug",
    Info = "Info",
    Warn = "Warn",
    Error = "Error"
}
export type MessagesCallbackType = (customArgs?: any) => string | Promise<string>;
export type MessagesType = {
    [key: string]: {
        category: MessageCategories;
        callback: MessagesCallbackType;
    };
};
export type SettingsModuleNotFoundParameters = {
    pathOfModule: string;
};
//# sourceMappingURL=types.d.ts.map