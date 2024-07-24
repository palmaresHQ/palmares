import { Commands } from '@palmares/core';

import settings from './src/settings.sequelize';

Commands.handleCommands(settings, process.argv.slice(2));
