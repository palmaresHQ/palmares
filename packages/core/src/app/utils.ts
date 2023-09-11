import { AppServer } from '.';
import { DomainHandlerFunctionArgs } from '../commands/types';
import { SettingsType2 } from '../conf/types';
import { Domain } from '../domain';

export async function initializeApp(
  domains: Domain[],
  settings: SettingsType2,
  commandLineArgs: DomainHandlerFunctionArgs['commandLineArgs'],
  appServer: typeof AppServer
) {
  const instanceOfAppServer = new appServer(domains, settings);
  await instanceOfAppServer.load({ domains, settings, commandLineArgs });
  await instanceOfAppServer.start(
    instanceOfAppServer.baseAppServer.configureCleanup.bind(instanceOfAppServer.baseAppServer)
  );
}
