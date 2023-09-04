import Logging from '.';
export default class Logger {
    name: string;
    logging: typeof Logging;
    constructor(name: string, logging: typeof Logging);
    getMessage(message: string): string;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: string): void;
}
//# sourceMappingURL=logger.d.ts.map