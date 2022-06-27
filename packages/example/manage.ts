import { Commands } from '@palmares/core';

import path from 'path';
import { spawn } from 'child_process';

process.on('SIGINT', () => {
  spawn('docker', ['compose', 'stop'], { 
    stdio: 'inherit',
    cwd: path.join(__dirname),
    env : process.env
  })
})

Commands.handleCommands(
  path.join(__dirname, 'src', 'settings.ts'), 
  process.argv.slice(2)
);