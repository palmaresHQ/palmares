import { getSettings, initializeApp } from '@palmares/core';

import { httpAppServer } from './app';
import { loadServer } from './app/utils';

export function loadServerWhenTesting(args: { port?: number }) {
  const settings = getSettings();
  const domains = globalThis.$PCachedInitializedDomains;

  if (settings && domains) {
    return loadServer({
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
