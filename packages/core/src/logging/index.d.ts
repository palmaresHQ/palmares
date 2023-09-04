import { MessagesType, MessageCategories, MessagesCallbackType } from './types';
import Logger from './logger';
declare class Logging {
    messages: MessagesType;
    stringByMessageType: {
        Debug: string;
        Info: string;
        Warn: string;
        Error: string;
    };
    defaultLogInfo(): string;
    appendMessage(messageName: string, category: MessageCategories, callback: MessagesCallbackType): void;
    logMessage(messageName: string, customData?: {}, customCategory?: MessageCategories): Promise<void>;
    log(category: MessageCategories, message: string): Promise<void>;
    debug(message: string): Promise<void>;
    info(message: string): Promise<void>;
    warn(message: string): Promise<void>;
    error(message: string): Promise<void>;
    createLogger(name: string): Logger;
}
declare const _default: Logging;
export default _default;
//# sourceMappingURL=index.d.ts.map