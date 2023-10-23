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
  TranslatableField,
  EnumField,
  BooleanField,
} from './fields';
import {
  EngineDoesNotSupportFieldTypeException,
  RelatedModelFromForeignKeyIsNotFromEngineException,
} from './exceptions';
import type EngineFieldParser from '../engine/fields/field';
import type Engine from '../engine';
import model, { BaseModel, Model } from './model';
import { ModelType } from './types';
import { EngineFields, InitializedModelsType, ModelOptionsType } from '..';
import UuidField from './fields/uuid';

/**
 * This is used to store the models that are related to each other. IT IS NOT direct relations. A direct relation would be when a model defines a ForeignKeyField to another model.
 *
 * An INDIRECT relation would be when the model has was defined as a ForeignKeyField in another model. For example:
 *
 * @example
 * ```ts
 * class User extends Model {
 *   static fields = {
 *      id: AutoField.new();
 *   }
 * }
 *
 * class Post extends Model {
 *   static fields = {
 *      userId: ForeignKeyField.new({ relatedTo: User })
 *   }
 * };
 * ```
 *
 * See that Post is related to User? There is no way of User knowing that Post is related to it, but Post knows that it is related to User. This is an indirect relation.
 */
export const indirectlyRelatedModels: {
  [modelName: string]: { [relatedModelName: string]: string[] };
} = {};

/**
 * Those are the default model options. It will exist in every model and will be used to define the default options of the model.
 */
export const defaultModelOptions = {
  abstract: false,
  underscored: true,
  tableName: undefined,
  managed: true,
  ordering: [],
  indexes: [],
  databases: ['default'],
  customOptions: {},
};

/**
 * The idea here is used to parse foreign key lazily, let's say that we have a foreign key field, but it's related to a model that IS NOT used by the engine.
 * What we do is that we convert the value of the foreign key field to the value of the field that is going to be used by the engine. So instead of a foreign key field
 * we will be parsing, let's say, a normal integer field.
 */
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

function callTranslateAndAppendInputAndOutputParsersToField(
  connectionName: string,
  field: Field,
  engineFieldParser: EngineFieldParser,
  args: Parameters<EngineFieldParser['translate']>[0]
) {
  if (engineFieldParser) {
    if (engineFieldParser.inputParser) {
      field.inputParsers.set(connectionName, engineFieldParser.inputParser);
      const inputParserFieldsOfEngine = field.model.fieldParsersByEngine.get(connectionName)?.input || [];
      inputParserFieldsOfEngine.push(field.fieldName);
      field.model.fieldParsersByEngine.set(connectionName, {
        input: inputParserFieldsOfEngine,
        output: field.model.fieldParsersByEngine.get(connectionName)?.output || [],
      });
    }
    if (engineFieldParser.outputParser) {
      field.outputParsers.set(connectionName, engineFieldParser.outputParser);
      const inputParserFieldsOfEngine = field.model.fieldParsersByEngine.get(connectionName)?.input || [];
      inputParserFieldsOfEngine.push(field.fieldName);
      field.model.fieldParsersByEngine.set(connectionName, {
        input: inputParserFieldsOfEngine,
        output: field.model.fieldParsersByEngine.get(connectionName)?.output || [],
      });
    }
    return engineFieldParser.translate(args);
  } else throw new EngineDoesNotSupportFieldTypeException(connectionName, field.typeName);
}

/**
 * This is used for the engine to parse the fields that are going to be used in the model in the database. For every field of a model we will call this function.
 *
 * The special use case is ForeignKeyFields, ForeignKeyFields can be attached to a ForeignKeyField, so we need to retrieve the field that is going to be used.
 */
export async function parse(
  engine: Engine,
  engineFields: EngineFields,
  field: Field,
  callbackForLazyEvaluation: (translatedField: any, shouldReturnData?: boolean, field?: Field) => void
): Promise<any> {
  let shouldReturnData = true;
  /**
   * This will pretty much stack the callbacks for lazy evaluation. What this does is that for some ORMs we might want to manage the foreign key fields after all the models
   * are created. That's pretty much the default behavior, since we can have lazy circular relations. So what this does is that it'll save that data on a global variable
   * and then we can use it after all the models have been created.
   *
   * @param shouldReturnDataOnDefaultParse - Pretty much for foreign key fields you can either return the data translated or not. If you choose to not return the data
   * translated, then it'll be undefined, with that you can do pretty much anything you want.
   */
  const callbackForLazyEvaluationInsideDefaultParse = (
    translatedField: any,
    shouldReturnDataOnDefaultParse?: boolean
  ) => {
    if (typeof shouldReturnDataOnDefaultParse === 'boolean') shouldReturnData = shouldReturnDataOnDefaultParse;
    callbackForLazyEvaluation(translatedField, shouldReturnData, field);
  };
  const modelName = field.model.getName();
  const modelInstance = new field.model() as InstanceType<ReturnType<typeof model>> & BaseModel;
  const args = {
    engine,
    field,
    fieldParser: engineFields.fieldsParser,
    modelName,
    model: modelInstance,
    lazyEvaluate: callbackForLazyEvaluationInsideDefaultParse,
  };

  switch (field.typeName) {
    case AutoField.name:
      return callTranslateAndAppendInputAndOutputParsersToField(
        engine.connectionName,
        field,
        engineFields.autoFieldParser,
        args
      );
    case BigAutoField.name:
      return callTranslateAndAppendInputAndOutputParsersToField(
        engine.connectionName,
        field,
        engineFields.bigAutoFieldParser,
        args
      );
    case BigIntegerField.name:
      return callTranslateAndAppendInputAndOutputParsersToField(
        engine.connectionName,
        field,
        engineFields.bigIntegerFieldParser,
        args
      );
    case CharField.name:
      return callTranslateAndAppendInputAndOutputParsersToField(
        engine.connectionName,
        field,
        engineFields.charFieldParser,
        args
      );
    case DateField.name:
      return callTranslateAndAppendInputAndOutputParsersToField(
        engine.connectionName,
        field,
        engineFields.dateFieldParser,
        args
      );
    case DecimalField.name:
      return callTranslateAndAppendInputAndOutputParsersToField(
        engine.connectionName,
        field,
        engineFields.decimalFieldParser,
        args
      );
    case ForeignKeyField.name: {
      if (engineFields.foreignKeyFieldParser) {
        const fieldToParse = await foreignKeyFieldParser(engine, field as ForeignKeyField);
        if (fieldToParse instanceof ForeignKeyField) {
          return callTranslateAndAppendInputAndOutputParsersToField(
            engine.connectionName,
            fieldToParse as Field,
            engineFields.foreignKeyFieldParser,
            args
          );
        } else return parse(engine, engineFields, fieldToParse as Field, callbackForLazyEvaluation);
      } else throw new EngineDoesNotSupportFieldTypeException(engine.connectionName, field.typeName);
    }
    case IntegerField.name:
      return callTranslateAndAppendInputAndOutputParsersToField(
        engine.connectionName,
        field,
        engineFields.integerFieldParser,
        args
      );
    case TextField.name:
      return callTranslateAndAppendInputAndOutputParsersToField(
        engine.connectionName,
        field,
        engineFields.textFieldParser,
        args
      );
    case UuidField.name:
      return callTranslateAndAppendInputAndOutputParsersToField(
        engine.connectionName,
        field,
        engineFields.uuidFieldParser,
        args
      );
    case EnumField.name:
      return callTranslateAndAppendInputAndOutputParsersToField(
        engine.connectionName,
        field,
        engineFields.enumFieldParser,
        args
      );
    case BooleanField.name:
      return callTranslateAndAppendInputAndOutputParsersToField(
        engine.connectionName,
        field,
        engineFields.booleanFieldParser,
        args
      );
    case TranslatableField.name:
      return await (field as TranslatableField).translate(engine);
    default:
      throw new EngineDoesNotSupportFieldTypeException(engine.connectionName, field.typeName);
  }
}

/**
 * This is utils function and it takes both an engine and a list of models and we call the _init method on those models to initialize and translate them to something that
 * the engine can understand. By default engines (like Sequelize, Prisma, etc) does not understand the Palmares models, it understands their own model implementations. That's exactly
 * what this does is that it takes the Palmares models and, with the engine, we translate them to something that the engine can understand.
 */
export async function initializeModels(engine: Engine, models: (typeof BaseModel & ReturnType<typeof model>)[]) {
  const initializedModels: InitializedModelsType[] = [];
  const auxiliaryIndexByModelName: Record<string, number> = {};
  const fieldsToEvaluateAfter: {
    model: InstanceType<ReturnType<typeof model>> & BaseModel;
    field: Field;
    translatedField: any;
  }[] = [];

  // Initialize the models and add it to the initialized models array, we need to keep track of the index of the model so that we can update it later
  // When we set to evaluate the fields later we will update the initialized model.
  const initializeModelPromises = models.map(async (modelClass, index) => {
    const modelInstance = new modelClass() as InstanceType<ReturnType<typeof model>> & BaseModel;
    const doesModelIncludesTheConnection = Array.isArray(modelInstance?.options?.databases)
      ? modelInstance.options?.databases.includes(engine.connectionName)
      : true;

    const modelName = modelClass.getName();
    const domainName = modelClass.domainName;
    const domainPath = modelClass.domainPath;

    if (doesModelIncludesTheConnection) {
      const initializedModel = await modelClass._init(engine, domainName, domainPath, (field, translatedField) =>
        fieldsToEvaluateAfter.push({
          model: modelInstance,
          field,
          translatedField,
        })
      );
      initializedModels.splice(index, 0, {
        domainName: domainPath,
        domainPath: domainPath,
        class: modelClass,
        initialized: initializedModel,
        original: modelInstance,
      });
      auxiliaryIndexByModelName[modelName] = index;
    }
  });
  await Promise.all(initializeModelPromises);

  // When we evaluate the fields later we need to update the initialized model as well.
  const evaluateLaterFieldsPromises = fieldsToEvaluateAfter.map(async ({ model, field, translatedField }) => {
    const modelConstructor = model.constructor as ModelType;
    const indexToUpdate = auxiliaryIndexByModelName[modelConstructor.getName()];
    const existsInInitializedModels = initializedModels[indexToUpdate] !== undefined;
    if (typeof indexToUpdate === 'number' && existsInInitializedModels) {
      const translatedModel = initializedModels[indexToUpdate].initialized;
      initializedModels[indexToUpdate].initialized = await engine.fields.lazyEvaluateField(
        engine,
        modelConstructor.getName(),
        translatedModel,
        field,
        translatedField
      );
    }
  });
  await Promise.all(evaluateLaterFieldsPromises);

  if (engine.models.afterModelsTranslation) {
    const returnedValueFromLastTranslation = await engine.models.afterModelsTranslation(
      engine,
      initializedModels.map((model) => [model.class.getName(), model.initialized])
    );

    if (Array.isArray(returnedValueFromLastTranslation)) {
      for (let i = 0; i < returnedValueFromLastTranslation.length; i++) {
        const [modelName, returnedValue] = returnedValueFromLastTranslation[i];
        const indexToUpdate = auxiliaryIndexByModelName[modelName];
        if (typeof indexToUpdate === 'number') initializedModels[i].initialized = returnedValue;
      }
    }
  }

  return initializedModels;
}

/**
 * This factory function is used to create a default model translate callback. A library user can call this function at any time to run the default behavior of the model translation.
 */
export function factoryFunctionForModelTranslate(
  engine: Engine,
  model: Model,
  callbackToParseAfterAllModelsAreTranslated: (field: Field, translatedField: any) => void
) {
  const modelConstructor = model.constructor as ModelType;
  const fieldEntriesOfModel = Object.entries(modelConstructor._fields());

  const defaultParseFieldCallback = (field: Field) => {
    return parse(engine, engine.fields, field, (translatedField, _, field) => {
      if (field) callbackToParseAfterAllModelsAreTranslated(field, translatedField);
    });
  };

  const defaultTranslateFieldsCallback = async () => {
    const translatedFieldDataByFieldName: { [key: string]: any } = {};
    for (const [fieldName, field] of fieldEntriesOfModel) {
      const translatedAttributes =
        typeof engine.fields.translateField === 'function'
          ? await engine.fields.translateField(engine, field, defaultParseFieldCallback)
          : await defaultParseFieldCallback(field);

      const isTranslatedAttributeDefined =
        translatedAttributes !== undefined && translatedAttributes !== null && typeof translatedAttributes === 'object';

      if (isTranslatedAttributeDefined) translatedFieldDataByFieldName[fieldName] = translatedAttributes;
    }

    return translatedFieldDataByFieldName;
  };

  return async () => {
    const modelName = modelConstructor.getName();
    const modelOptions = modelConstructor._options() as ModelOptionsType;

    const modelInstance = await engine.models.translate(
      engine,
      modelName,
      model,
      fieldEntriesOfModel,
      modelOptions,
      async () => {
        const options = await engine.models.translateOptions.bind(engine.models)(
          engine,
          modelName,
          modelConstructor._options() as ModelOptionsType
        );
        const fields =
          typeof engine.models.translateFields === 'function'
            ? await engine.models.translateFields.bind(engine.models)(
                engine,
                modelName,
                fieldEntriesOfModel,
                model,
                defaultParseFieldCallback,
                defaultTranslateFieldsCallback
              )
            : await defaultTranslateFieldsCallback();

        return {
          options,
          fields,
        };
      },
      defaultParseFieldCallback,
      defaultTranslateFieldsCallback
    );
    engine.initializedModels[modelConstructor.getName()] = modelInstance;

    // This lets you apply custom hooks to your translated model directly.
    // Something like that: https://www.prisma.io/docs/concepts/components/prisma-client/middleware
    // Or: https://sequelize.org/docs/v6/other-topics/hooks/
    if (modelOptions.applyToTranslatedModel) {
      const translatedModelInstance =
        typeof engine.models.getModelInstanceForCustomHooks === 'function'
          ? await engine.models.getModelInstanceForCustomHooks(engine, modelName, modelInstance)
          : modelInstance;

      modelOptions.applyToTranslatedModel(translatedModelInstance);
    }
    return modelInstance;
  };
}
