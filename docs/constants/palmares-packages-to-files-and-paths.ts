import { join } from 'path';
import process from 'process';

export const PALMARES_PACKAGES_TO_FILES_AND_FOLDERS = {
  '@palmares/console-logging': join(process.cwd(), '..', 'libs', 'console-logging'),
  '@palmares/drizzle-engine': join(process.cwd(), '..', 'libs', 'drizzle-engine'),
  '@palmares/express-adapter': join(process.cwd(), '..', 'libs', 'express-adapter'),
  '@palmares/jest-tests': join(process.cwd(), '..', 'libs', 'jest-tests'),
  '@palmares/node-std': join(process.cwd(), '..', 'libs', 'node-std'),
  '@palmares/sequelize-engine': join(process.cwd(), '..', 'libs', 'sequelize-engine'),
  '@palmares/zod-schema': join(process.cwd(), '..', 'libs', 'zod-schema'),
  '@palmares/core': join(process.cwd(), '..', 'packages', 'core'),
  '@palmares/databases': join(process.cwd(), '..', 'packages', 'databases'),
  '@palmares/schemas': join(process.cwd(), '..', 'packages', 'schemas'),
  '@palmares/server': join(process.cwd(), '..', 'packages', 'server'),
  '@palmares/tests': join(process.cwd(), '..', 'packages', 'tests'),
  '@palmares/logging': join(process.cwd(), '..', 'packages', 'logging'),
  '@palmares/events': join(process.cwd(), '..', 'packages', 'events')
} as const;
