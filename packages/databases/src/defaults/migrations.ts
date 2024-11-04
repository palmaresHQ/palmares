import { CreateModel } from '../migrations/actions';
import { BigAutoField, CharField } from '../models/fields';

import type { MigrationFileType } from '../migrations/types';

/**
 * Here we just create the `palmares_migrations` table in the database.
 */
export const defaultMigrations: MigrationFileType[] = [
  {
    name: 'create_palmares_migration_table',
    database: '*',
    dependsOn: '',
    operations: [
      new CreateModel(
        'PalmaresMigrations',
        {
          id: BigAutoField.new().databaseName('id').underscored(),
          migrationName: CharField.new({ maxLen: 150 }).databaseName('migration_name').underscored(),
          engineName: CharField.new({ maxLen: 150 }).databaseName('engine_name').underscored()
        },
        {
          abstract: false,
          underscored: true,
          tableName: 'palmares_migrations',
          managed: true,
          ordering: ['-id'],
          indexes: [],
          databases: ['default'],
          customOptions: {}
        }
      )
    ]
  }
];
