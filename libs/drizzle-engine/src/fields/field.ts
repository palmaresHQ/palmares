import {
  CharField,
  TextField,
  UuidField,
  Model,
  adapterFieldParser,
  AdapterFieldParserTranslateArgs,
} from '@palmares/databases';
import { primaryKey } from 'drizzle-orm/mysql-core';


export default adapterFieldParser({
  translate: async ({
    engine,
    field,
    modelName,
  }: AdapterFieldParserTranslateArgs<
    any,
    any,
    any,
    any
  >) => {
    const fieldData = {
      fieldName: field.fieldName,
      primaryKey: field.primaryKey,
      unique: field.unique,
      nullable: field.allowNull,
      dbIndex: field.dbIndex,
      default: field.defaultValue,
      autoincrement: field.isAuto,
      databaseName: field.databaseName,
    }
    return fieldData
  },
});
