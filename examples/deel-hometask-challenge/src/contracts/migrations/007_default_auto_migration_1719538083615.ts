/**
 * Automatically generated by palmares on 2024-06-28T01:28:03.615Z
 */

import { models, actions } from '@palmares/databases';


export default {
  name: '007_default_auto_migration_1719538083615',
  database: 'default',
  dependsOn: '006_default_auto_migration_1719538083614',
  operations: [
    new actions.ChangeField(
      "Contract",
      "terms",
      models.fields.TextField.new({
        allowBlank: true,
        primaryKey: false,
        defaultValue: undefined,
        allowNull: false,
        unique: false,
        dbIndex: false,
        databaseName: "terms",
        underscored: false,
        customAttributes: {}
      }),
      models.fields.TextField.new({
        allowBlank: true,
        primaryKey: false,
        defaultValue: "No terms",
        allowNull: true,
        unique: false,
        dbIndex: false,
        databaseName: "terms",
        underscored: false,
        customAttributes: {}
      })
    ),
    new actions.ChangeField(
      "Contract",
      "status",
      models.fields.EnumField.new({
        choices: ['new', 'in_progress', 'terminated'],
        primaryKey: false,
        defaultValue: undefined,
        allowNull: true,
        unique: false,
        dbIndex: false,
        databaseName: "status",
        underscored: false,
        customAttributes: {}
      }),
      models.fields.EnumField.new({
        choices: ['new', 'in_progress', 'terminated', 'test'],
        primaryKey: false,
        defaultValue: undefined,
        allowNull: true,
        unique: false,
        dbIndex: false,
        databaseName: "status",
        underscored: false,
        customAttributes: {}
      })
    )
  ]
};
