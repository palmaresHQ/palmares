import type { AppServer } from '.';
import type { DomainHandlerFunctionArgs } from '../commands/types';
import type { SettingsType2 } from '../conf/types';
import type { Domain } from '../domain';

/**
 * This will initialize the app respecting it's lifecycle.
 *
 * The lifecycle of the app is:
 * - `load`: Loads the constructor.
 * - `start`: Starts the appServer.
 * - `close`: Stops the appServer. The close method is called when SIGINT is received. It's really
 * important that the library author correctly implement this method, otherwise the app might not
 * close correctly.
 *
 * @param domains - The domains to be loaded.
 * @param settings - All of the settings of the application.
 * @param commandLineArgs - The command line arguments.
 * @param appServer - The app server to be initialized.
 */
export async function initializeApp(
  domains: Domain[],
  settings: SettingsType2,
  commandLineArgs: DomainHandlerFunctionArgs['commandLineArgs'],
  appServer: typeof AppServer
) {
  const instanceOfAppServer = new appServer(domains, settings);
  await instanceOfAppServer.load({ domains, settings, commandLineArgs });
  await instanceOfAppServer.baseAppServer.initialize(settings, domains);
  await instanceOfAppServer.start(async (args) => {
    await instanceOfAppServer.baseAppServer.configureCleanup.bind(instanceOfAppServer.baseAppServer)(
      instanceOfAppServer,
      args
    );
  });
}
