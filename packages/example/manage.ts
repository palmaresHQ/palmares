import { Commands } from '@palmares/core';

import path from 'path';


Commands.handleCommands(
    path.join(__dirname, 'src', 'settings.ts'), 
    process.argv.slice(2)
);