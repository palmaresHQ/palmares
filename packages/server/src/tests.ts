import { getSettings, initializeApp } from '@palmares/core';

import httpAppServer from './app';

export default function runServerWhenTesting() {
  const settings = getSettings();
  if (settings)
    initializeApp(
      [],
      settings,
      {
        positionalArgs: {},
        keywordArgs: {}
      },
      httpAppServer
    );
}
