// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './.drizzle/schema.ts',
  out: './.drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    databaseId: 'default',
    url: 'sqlite.db'
  }
});
