import { Domain } from './domain';
import { NotAValidDomainDefaultExportedError } from './exceptions';
import { getCommands } from '../commands';
import { getSettings, setSettings } from '../conf/settings';

import type { DomainReadyFunctionArgs } from './types';
import type { AppServer, appServer } from '../app';
import type { DefaultCommandType } from '../commands/types';
import type { CoreSettingsType, SettingsType2 } from '../conf/types';
import type { Std } from '../std-adapter';

let cachedDomains: (typeof Domain)[] | null = null;
let cachedInitializedDomains: Domain<any>[] | null = null;

/**
 * This is used to retrieve all of the domains from the settings. We will loop through all of the installed domains in
 * the application and cache it in memory.
 * If the domains were already initialized by other means we will return the cached domains.
 *
 * @param settings - The settings of the application used by `defineSettings` function.
 *
 * @returns - Returns all of the domains from the settings.
 */
export async function retrieveDomains(
  settings: CoreSettingsType & SettingsType2,
  options?: {
    ignoreCache?: boolean;
  }
): Promise<(typeof Domain)[]> {
  const isNotDynamicDomains = settings.isDynamicDomains !== true;
  if (cachedDomains && isNotDynamicDomains && options?.ignoreCache !== true) return cachedDomains;

  const mergedSettings: any = settings;
  const domainClasses: (typeof Domain)[] = [];
  for (const domain of mergedSettings?.installedDomains || []) {
    let domainKls = domain as
      | (typeof Domain | Promise<{ default: typeof Domain }>)
      | readonly [typeof Domain | Promise<{ default: typeof Domain }>, any];

    if (Array.isArray(domainKls)) {
      domainKls = domainKls[0];
      const entriesOfDomainSettings = Object.entries(domain[1]);

      for (const [domainSettingsKey, domainSettings] of entriesOfDomainSettings)
        mergedSettings[domainSettingsKey] = domainSettings;
    }

    if (domainKls instanceof Promise) domainKls = (await domainKls).default;

    if ((domainKls as typeof Domain).prototype instanceof Domain) {
      domainClasses.push(domainKls as typeof Domain);
    } else {
      throw new NotAValidDomainDefaultExportedError();
    }
  }

  if (isNotDynamicDomains) cachedDomains = domainClasses;

  setSettings(mergedSettings);
  return domainClasses;
}

/**
 * This will initialize all of the domains as well as all of the commands from all of them. Initializing all of the
 * commands means calling the `load` function of the domain if it exists. The `load` function is usually where you
 * will initialize everything needed for your domain.
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
 * Understand that when you call the `laod` function you can access all of the settings of the application from all of
 * the domains but you CAN'T access all of the domains initialized. One example of this is on the `@palmares/databases`
 * package. When we are running a `@palmares/databases` command like `makemigrations` or `migrate` the command already
 * receives all of the domains initialized.
 *
 *
 * We will append all of the commands to an object so at runtime we can access it
 * and know which commands are available to run.
 */
export async function initializeDomains(
  settingsOrSettingsPath:
    | Promise<{ default: SettingsType2 }>
    | SettingsType2
    | Std
    | Promise<{ default: Std }>
    | {
        settingsPathLocation: string;
        std: Std;
      },
  options?: { ignoreCache?: boolean; ignoreCommands?: boolean }
): Promise<{
  settings: SettingsType2;
  domains: Domain<any>[];
  commands: DefaultCommandType;
}> {
  const ignoreCache = options?.ignoreCache === true;
  if (cachedInitializedDomains && ignoreCache !== true)
    return {
      settings: getSettings() as SettingsType2,
      domains: cachedInitializedDomains,
      commands: getCommands()
    };

  const settings = await setSettings(settingsOrSettingsPath);
  let commands = {} as DefaultCommandType;
  const initializedDomains: Domain<any>[] = [];
  const domainClasses = await retrieveDomains(settings, {
    ignoreCache: options?.ignoreCache
  });
  const readyFunctionsToCallAfterAllDomainsAreLoaded = [] as ((
    args: DomainReadyFunctionArgs<any, any>
  ) => void | Promise<void>)[];

  for (const domainClass of domainClasses) {
    const initializedDomain = new domainClass();

    const domainIsNotLoadedAndHasLoadFunction =
      typeof initializedDomain.load === 'function' && !initializedDomain.isLoaded && ignoreCache !== true;

    if (domainIsNotLoadedAndHasLoadFunction) {
      if (initializedDomain.load) {
        const readyFunctionToCallOrNot = await initializedDomain.load(settings);
        if (typeof readyFunctionToCallOrNot === 'function')
          readyFunctionsToCallAfterAllDomainsAreLoaded.push(readyFunctionToCallOrNot);
      }
      initializedDomain.isLoaded = true;
    }
    if (options?.ignoreCommands !== true)
      commands = {
        ...commands,
        ...initializedDomain.commands
      };
    initializedDomains.push(initializedDomain);
  }

  if (readyFunctionsToCallAfterAllDomainsAreLoaded.length > 0) {
    for (const readyFunction of readyFunctionsToCallAfterAllDomainsAreLoaded)
      await Promise.resolve(
        readyFunction({
          settings,
          customOptions: {},
          app: {} as AppServer | InstanceType<ReturnType<typeof appServer>>,
          domains: initializedDomains
        })
      );
  }

  if (ignoreCache !== true) {
    cachedInitializedDomains = initializedDomains;

    return {
      commands: commands,
      settings: settings,
      domains: cachedInitializedDomains
    };
  } else {
    return {
      settings: settings,
      commands: {},
      domains: initializedDomains
    };
  }
}
