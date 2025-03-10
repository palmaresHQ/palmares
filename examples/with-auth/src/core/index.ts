import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';
import { migrate } from '@palmares/drizzle-engine/node-postgres/migrator';
import * as p from '@palmares/schemas';
import { Response, path, serverDomainModifier } from '@palmares/server';
import { ZodSchemaAdapter } from '@palmares/zod-schema';

import { auth } from './auth';
import { db } from '../db';
import { getUserByEmail } from '../db/repositories/users';
import { users } from '../db/schemas';

p.setDefaultAdapter(new ZodSchemaAdapter());

export default domain('core', import.meta.dirname, {
  modifiers: [serverDomainModifier, databaseDomainModifier],

  commands: {
    drizzleMigrate: {
      description: 'Migrate the database using drizzle',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: () => {
        migrate(db, { migrationsFolder: './drizzle/migrations' });
      }
    }
  },

  getRoutes: () =>
    path('/login/password').post(async ({ body }) => {
      const { email, password } = body;

      const user = await getUserByEmail(email);

      if (!user[0]) return Response.json({ message: 'User not found', status: 404 });

      const isPasswordValid = await auth.password.validate(password, user[0].password);

      if (!isPasswordValid) return Response.json({ message: 'Invalid password', status: 401 });

      const token = `${user[0].id}-${user[0].email}`;
      // TODO: use JWT auth adapter

      return Response.json({ token });
    }),

  getModels: () => ({
    users
  }),

  getMigrations: () => []
});
