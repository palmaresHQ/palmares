import type { ServerAdapter } from './adapters';
import type { ServerlessAdapter } from './adapters/serverless';
import type { ServerSettingsType } from './types';

declare global {
  // eslint-disable-next-line no-var
  var $PServerInstances:
    | Map<string, { server: ServerAdapter | ServerlessAdapter; settings: ServerSettingsType; loadedServer: any }>
    | undefined;

  // eslint-disable-next-line ts/no-namespace
  namespace Palmares {
    interface PServerAdapter {}
  }
}

export function getServerInstances() {
  if (!globalThis.$PServerInstances) globalThis.$PServerInstances = new Map();
  return globalThis.$PServerInstances;
}
