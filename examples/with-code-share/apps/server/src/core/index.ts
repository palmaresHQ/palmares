import { domain } from '@palmares/core';
import { testDomainModifier } from '@palmares/tests';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mockInventory, mockUsers } from 'shared';

import { User } from '../auth/models';
import { InventoryItem } from '../inventory/models';
import { db } from '../settings';

export default domain('core', import.meta.dirname, {
  modifiers: [testDomainModifier] as const,
  commands: {
    drizzleMigrate: {
      description: 'Migrate the database using drizzle',
      keywordArgs: undefined,
      positionalArgs: undefined,
      handler: () => {
        migrate(db as any, { migrationsFolder: './drizzle/migrations' });
      }
    },
    seedDb: {
      description:
        'Seed the database with fake data. (Make sure to run `drizzleMigrate`, first.' +
        ' This will also clear the database)',
      keywordArgs: {
        count: {
          description: 'The number of items to seed the database with',
          type: 'number',
          default: 1000,
          canBeMultiple: false,
          hasFlag: false
        }
      },
      positionalArgs: undefined,
      handler: async (args) => {
        const keywordArgs = args.commandLineArgs.keywordArgs;
        const numberOfItemsToSeed = keywordArgs.count ? keywordArgs.count : 1000;
        console.log('Seeding database with', numberOfItemsToSeed, 'items');
        await InventoryItem.default.remove({});
        await User.default.remove({});

        const users = await Promise.all(
          mockUsers(numberOfItemsToSeed).rows.map(async (user) => (await User.default.set(user))[0])
        );
        await Promise.all(
          mockInventory(numberOfItemsToSeed, { users: users }).rows.map((item) =>
            InventoryItem.default.set({
              id: item.id,
              uuid: item.uuid,
              manufacturer: item.manufacturer,
              serial: item.serial,
              status: item.status,
              purchaseDate: item.purchaseDate,
              warrantyExpiryDate: item.warrantyExpiryDate,
              assignmentDate: item.assignmentDate,
              specifications: item.specifications,
              imageUrl: item.imageUrl,
              userId: item.userId
            })
          )
        );
        console.log('Database seeded');
      }
    }
  },
  getTests: () => [__dirname + '/core.test.ts']
});
