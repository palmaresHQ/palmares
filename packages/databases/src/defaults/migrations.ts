import { MigrationFileType } from "../migrations/types"
import { models, actions } from "..";

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
