import {
  AutoField,
  BigAutoField,
  BigIntegerField,
  CharField,
  DateField,
  Field,
  DecimalField,
  ForeignKeyField,
  IntegerField,
  TextField,
  UUIDField,
  TranslatableField,
} from './fields';
import {
  EngineDoesNotSupportFieldTypeException,
  RelatedModelFromForeignKeyIsNotFromEngineException,
} from './exceptions';
import type EngineFieldParser from '../engine/fields/field';
import type Engine from '../engine';
import { Model } from './model';

async function foreignKeyFieldParser(engine: Engine, field: ForeignKeyField): Promise<any> {
  const [isRelatedModelFromEngine, fieldToChangeRelationTo] = await field.isRelatedModelFromEngineInstance(engine);

  if (isRelatedModelFromEngine === false) {
    if (fieldToChangeRelationTo) return fieldToChangeRelationTo;
    else
      throw new RelatedModelFromForeignKeyIsNotFromEngineException(
        engine.connectionName,
        field.relatedTo,
        field.fieldName,
        field.model.name,
        field.toField
      );
  } else return field;
}

/**
 * This is used for the engine to parse the fields that are going to be used in the model in the database. For every field of a model we will call this function.
 *
 * The special use case is ForeignKeyFields, ForeignKeyFields can be attached to a ForeignKeyField, so we need to retrieve the field that is going to be used.
 */
export async function parse(engine: Engine, engineFieldsParser: EngineFieldParser, field: Field): Promise<any> {
  if (engineFieldsParser.translatable) return await engineFieldsParser.translate(engine, field);

  switch (field.typeName) {
    case AutoField.name:
      if (engineFieldsParser.auto) return await parse(engine, engineFieldsParser.auto, field);
      else return;
    case BigAutoField.name:
      if (engineFieldsParser.bigAuto) return await parse(engine, engineFieldsParser.bigAuto, field);
      else return;
    case BigIntegerField.name:
      if (engineFieldsParser.bigInt) return await parse(engine, engineFieldsParser.bigInt, field);
      else return;
    case CharField.name:
      if (engineFieldsParser.char) return await parse(engine, engineFieldsParser.char, field);
      else return;
    case DateField.name:
      if (engineFieldsParser.date) return await parse(engine, engineFieldsParser.date, field);
      else return;
    case DecimalField.name:
      if (engineFieldsParser.decimal) return await parse(engine, engineFieldsParser.decimal, field);
      else return;
    case ForeignKeyField.name: {
      if (engineFieldsParser.foreignKey) {
        const fieldToParse = await foreignKeyFieldParser(engine, field as ForeignKeyField);
        if (fieldToParse instanceof ForeignKeyField)
          return parse(engine, engineFieldsParser.foreignKey, fieldToParse as ForeignKeyField);
        else return await parse(engine, engineFieldsParser, fieldToParse as Field);
      } else return;
    }
    case IntegerField.name:
      if (engineFieldsParser.integer) return await parse(engine, engineFieldsParser.integer, field);
      else return;
    case TextField.name:
      if (engineFieldsParser.text) return await parse(engine, engineFieldsParser.text, field);
      else return;
    case UUIDField.name:
      if (engineFieldsParser.uuid) return await parse(engine, engineFieldsParser.uuid, field);
      else return;
    case TranslatableField.name:
      return await (field as TranslatableField).translate(engine);
    default:
      throw new EngineDoesNotSupportFieldTypeException(engine.connectionName, field.typeName);
  }
}

/**
 * This factory function is used to create a default model translate callback. A library user can call this function at any time to run the default behavior of the model translation.
 */
export function factoryFunctionForDefaultModelTranslateCallback(engine: Engine, model: Model) {
  const defaultParseFieldCallback = (field: Field) => {
    return parse(engine, engine.fields.fieldsParser, field);
  };

  return async () => {
    const modelInstance = await engine.models.translate(
      engine,
      model,
      async () => {
        const options = await engine.models.translateOptions.bind(engine.models)(engine, model);
        const fields = await engine.models.translateFields.bind(engine.models)(
          engine,
          Object.entries(model.fields),
          model,
          defaultParseFieldCallback
        );

        return {
          options,
          fields,
        };
      },
      defaultParseFieldCallback
    );
    engine.initializedModels[model.name] = modelInstance;
    return modelInstance;
  };
}
