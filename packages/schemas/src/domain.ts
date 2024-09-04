import { domain } from '@palmares/core';

import { getDefaultAdapter, setDefaultAdapter } from './conf';

import type { SchemasSettingsType } from './types';

const schemasDomain = domain('@palmares/schemas', '', {
  commands: {},
  // eslint-disable-next-line ts/require-await
  load: async (settings: SchemasSettingsType) => {
    setDefaultAdapter(new settings.schemaAdapter());
    const schemaAdapter = getDefaultAdapter();
    return undefined;
  }
});

export default schemasDomain;
