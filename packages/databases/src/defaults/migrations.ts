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
          id: BigAutoField.new({
            primaryKey: true,
            defaultValue: undefined,
            allowNull: false,
            unique: true,
            dbIndex: true,
            databaseName: 'id',
            underscored: false,
            customAttributes: {}
          }),
          migrationName: CharField.new({
            allowBlank: true,
            maxLength: 150,
            primaryKey: false,
            defaultValue: undefined,
            allowNull: false,
            unique: false,
            dbIndex: false,
            databaseName: 'migration_name',
            underscored: false,
            customAttributes: {}
          }),
          engineName: CharField.new({
            allowBlank: true,
            maxLength: 150,
            primaryKey: false,
            defaultValue: undefined,
            allowNull: false,
            unique: false,
            dbIndex: false,
            databaseName: 'engine_name',
            underscored: false,
            customAttributes: {}
          })
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
