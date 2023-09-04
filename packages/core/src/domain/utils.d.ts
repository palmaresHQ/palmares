import Domain from './domain';
import type { DefaultCommandType } from '../commands/types';
import type { CoreSettingsType, SettingsType2 } from '../conf/types';
/**
 * This is used to retrieve all of the domains from the settings. We will loop through all of the installed domains in the application and cache it in memory.
 * If the domains were already initialized by other means we will return the cached domains.
 *
 * @param settings - The settings of the application used by `defineSettings` function.
 *
 * @returns - Returns all of the domains from the settings.
 */
export declare function retrieveDomains(settings: CoreSettingsType & SettingsType2): Promise<typeof Domain[]>;
/**
 * This will initialize all of the domains as well as all of the commands from all of them. Initializing all of the commands means
 * calling the `load` function of the domain if it exists. The `load` function is usually where you will initialize everything needed for your domain.
 *
 * @example```ts
 * import { domain } from '@palmares/core';
 *
 * domain('MyCustomDatabaseConnection', __dirname, {
 *  load: async () => {
 *    // Initialize your database connection here
 *  }
 * })
 * ```
 *
 * Understand that when you call the `laod` function you can access all of the settings of the application from all of the domains but you
 * CAN'T access all of the domains initialized. One example of this is on the `@palmares/databases` package. When we are running a `@palmares/databases`
 * command like `makemigrations` or `migrate` the command already receives all of the domains initialized.
 *
 *
 *  We will append all of the commands to an object so at runtime we can access it
 * and know which commands are available to run.
 */
export declare function initializeDomains(settings: SettingsType2): Promise<{
    domains: Domain<any>[];
    commands: DefaultCommandType;
}>;
//# sourceMappingURL=utils.d.ts.map