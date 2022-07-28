import { MigrationFileType } from "../migrations/types"
import * as actions from "../migrations/actions";
import * as models from "../models";

const migrations: MigrationFileType[] = [
  {
    name: "create_palmares_migration_table",
    database: "*",
    dependsOn: "",
    operations: [
      new actions.CreateModel('PalmaresMigrations', {
        id: new models.fields.BigAutoField(),
        migrationName: new models.fields.CharField({ maxLength: 150 }),
      }, {
        tableName: 'palmares_migrations'
      })
    ]
  }
];

export default migrations;
