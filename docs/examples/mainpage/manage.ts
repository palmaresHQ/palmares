// @ts-nocheck
import { Commands } from '@palmares/core';

import settings from './src/settings';

Commands.handleCommands(settings, process.argv.slice(2));
