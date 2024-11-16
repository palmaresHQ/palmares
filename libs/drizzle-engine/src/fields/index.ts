import { adapterFields, auto } from '@palmares/databases';

import { bigIntegerFieldParser } from './big-integer';
import { booleanFieldParser } from './boolean';
import { charFieldParser } from './char';
import { dateFieldParser } from './date';
import { decimalFieldParser } from './decimal';
import { enumFieldParse } from './enum';
import { fieldParser } from './field';
import { foreignKeyFieldParser } from './foreign-key';
import { integerFieldParser } from './integer';
import { textFieldParser } from './text';
import { uuidFieldParser } from './uuid';

import type { Field } from '@palmares/databases';

/**
 * Creates a one relation since it's a repeating pattern in the code itself
 */
function createOneToOneRelation(
  modelName: string,
  modelFieldName: string,
  relatedModelName: string,
  relatedFieldName: string
) {
  return (
    `args.one(${relatedModelName}, {\n` +
    `    fields: [${modelName}.${modelFieldName}],\n` +
    `    references: [${relatedModelName}.${relatedFieldName}]\n` +
    `  })`
  );
}

async function formatForeignKeyField(
  engine: any,
  modelName: string,
  translatedModel: any,
  field: Parameters<Parameters<typeof adapterFields>[0]['lazyEvaluateField']>[3],
  fieldTranslated: any,
  parseAgain: Parameters<Parameters<typeof adapterFields>[0]['lazyEvaluateField']>[5]
) {
  const foreignData = fieldTranslated.fieldAttributes.foreignData;

  const data = await parseAgain({
    fieldName: foreignData.toField,
    modelName: foreignData.relatedToModelName,
    optionsOverrideCallback: {
      isAuto: () => foreignData.isAuto,
      primaryKey: () => foreignData.isPrimaryKey,
      unique: () => foreignData.isUnique,
      allowNull: () => foreignData.allowNull,
      defaultValue: () => foreignData.defaultValue,
      customAttributes: () => foreignData.customAttributes,
      databaseName: () => foreignData.databaseName,
      dbIndex: () => foreignData.dbIndex,
      fieldName: () => foreignData.fieldName,
      underscored: () => foreignData.underscored,
      autoNow: () => false,
      autoNowAdd: () => false,
      allowBlank: () => false,
      maxLength: () => false
    }
  });

  const columnType =
    engine.instance.mainType === 'postgres'
      ? 'd.AnyPgColumn'
      : engine.instance.mainType === 'sqlite'
        ? 'd.AnySQLiteColumn'
        : 'd.AnyMySqlColumn';

  translatedModel.fields[fieldTranslated.fieldAttributes.fieldName] =
    `${data}.references((): ${columnType} => ${foreignData.relatedToModelName}.${foreignData.toField})`;

  translatedModel.options.relationships ??= {};
  translatedModel.options.relationships[modelName] ??= {};
  translatedModel.options.relationships[modelName][foreignData.relationName] = createOneToOneRelation(
    modelName,
    fieldTranslated.fieldAttributes.fieldName,
    foreignData.relatedToModelName,
    foreignData.toField
  );

  const ifIndirectOneRelation = createOneToOneRelation(
    foreignData.relatedToModelName,
    foreignData.toField,
    modelName,
    fieldTranslated.fieldAttributes.fieldName
  );

  const ifIndirectManyRelation = `args.many(${modelName})`;

  translatedModel.options.relationships[foreignData.relatedToModelName] ??= {};
  translatedModel.options.relationships[foreignData.relatedToModelName][foreignData.relatedName] = fieldTranslated
    .fieldAttributes.unique
    ? ifIndirectOneRelation
    : ifIndirectManyRelation;
}

/**
 * This class is used to translate the fields of a model to the attributes of a Drizzle model.
 * This is closely tied to the engine itself because sometimes we might need the models after it was translated
 * or sometimes we need to translate stuff outside of the fields for example the indexes that are from the model
 * itself.
 */
export const fields = adapterFields({
  fieldsParser: new fieldParser(),
  bigIntegerFieldParser: new bigIntegerFieldParser(),
  charFieldParser: new charFieldParser(),
  dateFieldParser: new dateFieldParser(),
  decimalFieldParser: new decimalFieldParser(),
  foreignKeyFieldParser: new foreignKeyFieldParser(),
  integerFieldParser: new integerFieldParser(),
  textFieldParser: new textFieldParser(),
  uuidFieldParser: new uuidFieldParser(),
  enumFieldParser: new enumFieldParse(),
  booleanFieldParser: new booleanFieldParser(),
  lazyEvaluateField: async (
    engine: any,
    modelName: string,
    translatedModel: any,
    fieldAttributes: Parameters<Parameters<typeof adapterFields>[0]['lazyEvaluateField']>[3],
    fieldTranslated: any,
    parseAgain: Parameters<Parameters<typeof adapterFields>[0]['lazyEvaluateField']>[5]
  ) => {
    switch (fieldTranslated.type) {
      case 'enum': {
        translatedModel.options.enums ??= [];
        translatedModel.options.enums.push(fieldTranslated.data);
        return translatedModel;
      }
      case 'uuid': {
        translatedModel.options.imports ??= new Set();
        translatedModel.options.imports.add(`import * as pdb from '@palmares/databases';`);
        return translatedModel;
      }
      case 'foreign-key': {
        await formatForeignKeyField(engine, modelName, translatedModel, fieldAttributes, fieldTranslated, parseAgain);
        return translatedModel;
      }
      case 'index': {
        if (modelName === fieldTranslated.indexAttributes.modelName) {
          translatedModel.options.drizzleIndexes ??= [];
          translatedModel.options.drizzleIndexes.push(fieldTranslated.indexAttributes);
          return translatedModel;
        }
        break;
      }
    }
    return undefined;
  }
});
