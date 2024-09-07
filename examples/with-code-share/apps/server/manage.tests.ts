import { Commands } from 'shared';
import { setDb } from './src/core/utils';

setDb('testDb.db');

Commands.handleCommands(import('./src/settings.tests'), process.argv.slice(2));
