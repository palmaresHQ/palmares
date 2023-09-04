import { SettingsType2, StdLike } from '../conf/types';
import { DefaultCommandType } from './types';
export declare function getCommands(): DefaultCommandType;
/**
 * Main entrypoint for the hole application, the idea is simple: when we start the program we load all the domains, then we get all the commands it have.
 */
export declare function handleCommands(settingsOrSettingsPath: Promise<{
    default: SettingsType2;
}> | SettingsType2 | StdLike | Promise<{
    default: StdLike;
}> | {
    settingsPathLocation: string;
    std: StdLike;
}, args: string[]): Promise<void>;
//# sourceMappingURL=index.d.ts.map