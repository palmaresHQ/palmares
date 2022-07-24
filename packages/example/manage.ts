import { Commands } from '@palmares/core';

Commands.handleCommands(
  import('./src/settings'),
  process.argv.slice(2)
);
