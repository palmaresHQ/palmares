import { getSettings } from '@palmares/core';

import { loadServer } from './app/utils';

export async function loadServerWhenTesting(args: { port?: number }) {
  const settings = getSettings();
  const domains = globalThis.$PCachedInitializedDomains;

  if (settings && domains) {
    return await loadServer({
      settings: settings as any,
      domains,
      commandLineArgs: {
        keywordArgs: {
          port: args.port
        },
        positionalArgs: {}
      }
    });
  }
}
