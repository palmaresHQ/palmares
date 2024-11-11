
import { migrate } from '@palmares/drizzle-engine/better-sqlite3/migrator';

import { db } from './database.config';

migrate(db, { migrationsFolder: './.drizzle/migrations' });
