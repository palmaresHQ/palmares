import {
  CharField,
  TextField,
  UuidField,
  Model,
  adapterFieldParser,
  AdapterFieldParserTranslateArgs,
} from '@palmares/databases';

export default adapterFieldParser({
  translate: async (args: AdapterFieldParserTranslateArgs<
    any,
    any,
    any,
    any
  >) => {
    if (args.field.dbIndex) {
      args.lazyEvaluate({
        type: 'index',
        indexAttributes: {
          modelName: args.modelName,
          fieldName: args.field.fieldName,
          databaseName: args.field.databaseName,
          unique: args.field.unique,
        },
      })
    }

    const fieldData = {
      fieldName: args.field.fieldName,
      primaryKey: args.field.primaryKey,
      unique: args.field.unique,
      nullable: args.field.allowNull as boolean,
      dbIndex: args.field.dbIndex,
      default: args.field.defaultValue,
      autoincrement: args.field.isAuto,
      databaseName: args.field.databaseName,
    }
    return fieldData
  },
});
