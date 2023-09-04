import { SettingsType2, StdLike } from './types';
export declare function getSettings(): SettingsType2 | undefined;
/**
 * Function supposed to be called after all of the domains were loaded. It will save the settings in memory and return it when it's needed / requested by calling the `getSettings` function.
 */
export declare function setSettings(settingsOrStd: Promise<{
    default: SettingsType2;
}> | SettingsType2 | StdLike | Promise<{
    default: StdLike;
}> | {
    settingsPathLocation: string;
    std: StdLike;
}): Promise<SettingsType2>;
//# sourceMappingURL=settings.d.ts.map