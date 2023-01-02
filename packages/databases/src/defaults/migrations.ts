import { MigrationFileType } from '../migrations/types';
import * as actions from '../migrations/actions';
import * as models from '../models';

/**
 * Here we just create the `palmares_migrations` table in the database.
 */
const migrations: MigrationFileType[] = [
  {
    name: 'create_palmares_migration_table',
    database: '*',
    dependsOn: '',
    operations: [
      new actions.CreateModel(
        'PalmaresMigrations',
        {
          id: models.fields.BigAutoField.new({
            primaryKey: true,
            defaultValue: undefined,
            allowNull: false,
            unique: true,
            dbIndex: true,
            databaseName: 'id',
            underscored: false,
            customAttributes: {},
          }),
          migrationName: models.fields.CharField.new({
            allowBlank: true,
            maxLength: 150,
            primaryKey: false,
            defaultValue: undefined,
            allowNull: false,
            unique: false,
            dbIndex: false,
            databaseName: 'migration_name',
            underscored: false,
            customAttributes: {},
          }),
          engineName: models.fields.CharField.new({
            allowBlank: true,
            maxLength: 150,
            primaryKey: false,
            defaultValue: undefined,
            allowNull: false,
            unique: false,
            dbIndex: false,
            databaseName: 'engine_name',
            underscored: false,
            customAttributes: {},
          }),
        },
        {
          abstract: false,
          underscored: true,
          tableName: 'palmares_migrations',
          managed: true,
          ordering: ['-id'],
          indexes: [],
          databases: ['default'],
          customOptions: {},
        }
      ),
    ],
  },
];

export default migrations;
