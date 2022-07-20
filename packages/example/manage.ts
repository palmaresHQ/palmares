import { Commands } from '@palmares/core';

import { join } from 'path';

Commands.handleCommands(
  join(__dirname, 'src', 'settings.ts'),
  process.argv.slice(2)
);
