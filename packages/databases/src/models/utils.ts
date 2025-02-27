import { std } from '@palmares/core';

import {
  EngineDoesNotSupportFieldTypeException,
  FieldFromModelMissingException,
  ModelMissingException,
  RelatedModelFromForeignKeyIsNotFromEngineException,
  ShouldAssignAllInstancesException
} from './exceptions';
import {
  AutoField,
  BigAutoField,
  BigIntegerField,
  BooleanField,
  CharField,
  DateField,
  DecimalField,
  EnumField,
  ForeignKeyField,
  IntegerField,
  TextField
} from './fields';
import { UuidField } from './fields/uuid';

import type { Field } from './fields';
import type { BaseModel, Model, ModelType } from './model';
import type { ModelOptionsType } from './types';
import type { DatabaseAdapter } from '../engine';
import type { AdapterFields } from '../engine/fields';
import type { AdapterFieldParser as EngineFieldParser } from '../engine/fields/field';
import type { InitializedModelsType } from '../types';

/**
 * This is used to store the models that are related to each other. IT IS NOT direct relations.
 * A direct relation would be when a model defines a ForeignKeyField to another model.
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
 * See that Post is related to User? There is no way of User knowing that Post is related to it, but
 * Post knows that it is related to User. This is an indirect relation.
 */
export const indirectlyRelatedModels: {
  [modelName: string]: { [relatedModelName: string]: string[] };
} & {
  $set: {
    [modelName: string]: () => void;
  };
} = {
  $set: {}
};

/**
 * Those are the default model options. It will exist in every model and will be used to
 * define the default options of the model.
 */
export const getDefaultModelOptions = () => ({
  abstract: false,
  underscored: true,
  tableName: undefined,
  managed: true,
  ordering: [],
  indexes: [],
  databases: ['default'],
  customOptions: {}
});

/**
 * The idea here is used to parse foreign key lazily, let's say that we have a foreign key field, but it's related to
 * a model that IS NOT used by the engine.
 * What we do is that we convert the value of the foreign key field to the value of the field that is
 * going to be used by the engine. So instead of a foreign key field
 * we will be parsing, let's say, a normal integer field.
 */
async function foreignKeyFieldParser(engine: DatabaseAdapter, field: ForeignKeyField): Promise<any> {
  const [isRelatedModelFromEngine, fieldToChangeRelationTo] = await field.isRelatedModelFromEngineInstance(engine);
  if (isRelatedModelFromEngine === false) {
    if (fieldToChangeRelationTo) return fieldToChangeRelationTo;
    else {
      throw new RelatedModelFromForeignKeyIsNotFromEngineException(
        engine.connectionName,
        field['__relatedToAsString'] || '',
        field['__fieldName'],
        field['__model']?.['name'] || '',
        field['__toField']
      );
    }
  } else return field;
}

function fieldAdapterPerField(
  engine: DatabaseAdapter,
  field: Field<any, any, any>,
  model: typeof BaseModel & ModelType<any, any>,
  options?: {
    /**
     *  We ignore the ForeignKeyField parser and go directly to the field it relates to
     *
     * For example: you relate a ForeignKeyField to a IntegerField, but the IntegerField
     * has a custom InputParser, this would obligate the ForeignKeyField to implement all input and output parsers
     * as well. With this option you can bypass the ForeignKeyField and go directly to the field it relates to.
     */
    byPassForeignKey?: boolean;
    /**
     * Is retrieving the
     */
  }
) {
  switch (field['__typeName']) {
    case AutoField.name:
      if (engine.fields.autoFieldParser) return engine.fields.autoFieldParser;
      else return engine.fields.integerFieldParser;
    case BigAutoField.name:
      if (engine.fields.autoFieldParser) return engine.fields.autoFieldParser;
      else return engine.fields.bigIntegerFieldParser;
    case BigIntegerField.name:
      return engine.fields.bigIntegerFieldParser;
    case CharField.name:
      return engine.fields.charFieldParser;
    case DateField.name:
      return engine.fields.dateFieldParser;
    case DecimalField.name:
      return engine.fields.decimalFieldParser;
    case ForeignKeyField.name: {
      const fieldAsForeignKeyField = field as ForeignKeyField<any, any, any>;
      if (options?.byPassForeignKey) {
        let fieldItRelatesTo = undefined;
        const modelItRelatesTo = fieldAsForeignKeyField['__relatedTo'];
        if (typeof modelItRelatesTo === 'string')
          fieldItRelatesTo = (engine['__modelsOfEngine'] as any)?.[modelItRelatesTo]?.['_fields']()[
            fieldAsForeignKeyField['__toField']
          ];
        else if (modelItRelatesTo['$$type'] === '$PModel')
          fieldItRelatesTo = modelItRelatesTo?.['_fields']()[fieldAsForeignKeyField['__toField']];
        else fieldItRelatesTo = modelItRelatesTo()?.['_fields']()[fieldAsForeignKeyField['__toField']];

        return fieldAdapterPerField(engine, fieldItRelatesTo, model, options);
      }
      return engine.fields.foreignKeyFieldParser;
    }
    case IntegerField.name:
      return engine.fields.integerFieldParser;
    case TextField.name:
      return engine.fields.textFieldParser;
    case UuidField.name:
      return engine.fields.uuidFieldParser;
    case EnumField.name:
      return engine.fields.enumFieldParser;
    case BooleanField.name:
      return engine.fields.booleanFieldParser;
    default: {
      if (
        typeof engine.fields.customFieldsParser === 'object' &&
        field['__typeName'] in engine.fields.customFieldsParser
      )
        return engine.fields.customFieldsParser[field['__typeName']];
      return engine.fields.fieldsParser;
    }
  }
}

function callTranslateAndAppendInputAndOutputParsersToField(
  connectionName: string,
  field: Field<any, any, any>,
  model: ModelType<any, any> & typeof BaseModel,
  engine: DatabaseAdapter,
  engineFieldParser: EngineFieldParser,
  args: Parameters<EngineFieldParser['translate']>[0]
) {
  // eslint-disable-next-line ts/no-unnecessary-condition
  if (engineFieldParser && field) {
    retrieveInputAndOutputParsersFromFieldAndCache(engine, model, field['__fieldName'], field);
    return engineFieldParser.translate(args);
  } else throw new EngineDoesNotSupportFieldTypeException(connectionName, field['__typeName']);
}

/**
 * Used to retrieve the input and output parsers from the field and cache it on the field itself for faster access
 * next time.
 */
export function retrieveInputAndOutputParsersFromFieldAndCache(
  engine: DatabaseAdapter,
  model: ModelType<any, any> & typeof BaseModel,
  fieldName: string,
  field: Field<any, any, any>
) {
  // eslint-disable-next-line ts/no-unnecessary-condition
  if (!field) return { input: undefined, output: undefined };
  const existingOutputParser = field['__outputParsers'].get(engine.connectionName);
  const existingInputParser = field['__inputParsers'].get(engine.connectionName);
  if (existingOutputParser !== undefined || existingInputParser !== undefined) {
    return { input: existingInputParser, output: existingOutputParser };
  }

  const fieldParserAdapter = fieldAdapterPerField(engine, field, model, { byPassForeignKey: true });
  field['__inputParsers'].set(engine.connectionName, fieldParserAdapter.inputParser || null);
  field['__outputParsers'].set(engine.connectionName, fieldParserAdapter.outputParser || null);

  const existingFieldParsersByEngine = model['__fieldParsersByEngine'].get(engine.connectionName) || {
    input: new Set(),
    output: new Set(),
    toIgnore: new Set()
  };
  if (fieldParserAdapter.inputParser) existingFieldParsersByEngine.input.add(fieldName);
  if (fieldParserAdapter.outputParser) existingFieldParsersByEngine.output.add(fieldName);
  if (fieldParserAdapter.inputParser === undefined && fieldParserAdapter.outputParser === undefined)
    existingFieldParsersByEngine.toIgnore.add(fieldName);

  model['__fieldParsersByEngine'].set(engine.connectionName, existingFieldParsersByEngine);

  return { input: fieldParserAdapter.inputParser, output: fieldParserAdapter.outputParser };
}

/**
 * This is used for the engine to parse the fields that are going to be used in
 * the model in the database. For every field of a model we will call this function.
 *
 * The special use case is ForeignKeyFields, ForeignKeyFields can be attached to a
 * ForeignKeyField, so we need to retrieve the field that is going to be used.
 */
export async function parse(
  engine: DatabaseAdapter,
  engineFields: AdapterFields,
  model: Model,
  field: Field<any, any, any>,
  callbackForLazyEvaluation: (translatedField: any, shouldReturnData?: boolean, field?: Field<any, any, any>) => void
): Promise<any> {
  let shouldReturnData = true;
  /**
   * This will pretty much stack the callbacks for lazy evaluation. What this does is that for some
   * ORMs we might want to manage the foreign key fields after all the models
   * are created. That's pretty much the default behavior, since we can have lazy circular relations.
   * So what this does is that it'll save that data on a global variable
   * and then we can use it after all the models have been created.
   *
   * @param shouldReturnDataOnDefaultParse - Pretty much for foreign key fields you can
   * either return the data translated or not. If you choose to not return the data
   * translated, then it'll be undefined, with that you can do pretty much anything you want.
   */
  const callbackForLazyEvaluationInsideDefaultParse = (
    translatedField: any,
    shouldReturnDataOnDefaultParse?: boolean
  ) => {
    if (typeof shouldReturnDataOnDefaultParse === 'boolean') shouldReturnData = shouldReturnDataOnDefaultParse;
    callbackForLazyEvaluation(translatedField, shouldReturnData, field);
  };

  const modelName = field['__model']?.['__getName']() as string;
  const fieldData = field['__getArguments']();
  const customAttributes = fieldData['customAttributes'];
  delete fieldData['customAttributes'];
  const modelAsBaseModel = model as BaseModel & Model;

  const args = {
    engine: engine as any,
    field: fieldData,
    customAttributes: customAttributes || {},
    fieldParser: engineFields.fieldsParser,
    modelName,
    model: modelAsBaseModel,
    lazyEvaluate: callbackForLazyEvaluationInsideDefaultParse
  };

  switch (field['__typeName']) {
    case ForeignKeyField.name: {
      // eslint-disable-next-line ts/no-unnecessary-condition
      if (engineFields.foreignKeyFieldParser) {
        const fieldToParse = await foreignKeyFieldParser(engine, field as unknown as ForeignKeyField<any, any, any>);
        if (fieldToParse?.['$$type'] === '$PForeignKeyField') {
          return callTranslateAndAppendInputAndOutputParsersToField(
            engine.connectionName,
            fieldToParse as Field,
            modelAsBaseModel.constructor as ModelType<any, any> & typeof BaseModel,
            engine,
            engineFields.foreignKeyFieldParser as any,
            {
              ...args,
              field: fieldToParse['__getArguments']()
            }
          );
        } else return parse(engine, engineFields, model, fieldToParse as Field, callbackForLazyEvaluation);
      } else throw new EngineDoesNotSupportFieldTypeException(engine.connectionName, field['__typeName']);
    }
    default: {
      const fieldParser = fieldAdapterPerField(
        engine,
        field,
        model.constructor as ModelType<any, any> & typeof BaseModel & typeof Model
      );
      return callTranslateAndAppendInputAndOutputParsersToField(
        engine.connectionName,
        field,
        modelAsBaseModel.constructor as ModelType<any, any> & typeof BaseModel,
        engine,
        fieldParser,
        args
      );
    }
  }
}

/**
 * This is utils function and it takes both an engine and a list of models and we call
 * the _init method on those models to initialize and translate them to something that
 * the engine can understand. By default engines (like Sequelize, Prisma, etc) does
 * not understand the Palmares models, it understands their own model implementations.
 * That's exactly what this does is that it takes the Palmares models and, with the
 * engine, we translate them to something that the engine can understand.
 */
export async function initializeModels(
  engine: DatabaseAdapter,
  models: (ModelType<any, any> & typeof BaseModel & typeof Model)[]
) {
  engine['__totalModels'] = models.length;
  const recursiveOptionsToEvaluateModels: {
    forceTranslation?: boolean;
  }[] = [{}];

  const relationsToCallAfterModelsTranslation: Map<string, (engineInstance: DatabaseAdapter) => void> = new Map();
  // It is a loop so we can evaluate the models again if needed.
  // eslint-disable-next-line ts/no-unnecessary-condition
  while (recursiveOptionsToEvaluateModels) {
    const options = recursiveOptionsToEvaluateModels.shift();
    const initializedModels: (InitializedModelsType & { modifyItself: (newModel: any) => void })[] = [];
    let fieldsToEvaluateAfter: {
      model: BaseModel & Model;
      field: Field;
      translatedField: any;
      getInitialized: () => {
        instance: any;
        modifyItself: (newModel: any) => void;
      };
    }[] = [];

    // Initialize the models and add it to the initialized models array, we need to keep
    // track of the index of the model so that we can update it later
    // When we set to evaluate the fields later we will update the initialized model.
    const initializeModelPromises = models.map(async (modelClass, index) => {
      const modelInstance = new modelClass() as BaseModel & Model;
      const doesModelIncludesTheConnection =
        Array.isArray((modelInstance as any).options?.databases) && typeof engine.connectionName === 'string'
          ? (modelInstance as any).options?.databases.includes(engine.connectionName)
          : true;

      const domainName = modelClass['__domainName'];
      const domainPath = modelClass['__domainPath'];
      modelClass['__callAfterAllModelsAreLoadedToSetupRelations'] = relationsToCallAfterModelsTranslation;

      if (doesModelIncludesTheConnection) {
        const initializedModel = await modelClass['__init'](
          engine,
          domainName,
          domainPath,
          (field: Field<any, any>, translatedField: any) => {
            fieldsToEvaluateAfter.push({
              model: modelInstance as any,
              field,
              translatedField,
              getInitialized: () => initializedModel
            });
          },
          {
            forceTranslate: options?.forceTranslation === true
          }
        );
        const originalModifyItself = initializedModel.modifyItself;
        initializedModel.modifyItself = (newModel: any) => {
          initializedModels[index].initialized = newModel;
          originalModifyItself(newModel);
        };
        initializedModels.splice(index, 0, {
          domainName: domainPath,
          domainPath: domainPath,
          class: modelClass,
          initialized: initializedModel.instance,
          modifyItself: initializedModel.modifyItself,
          original: modelInstance as any
        });
      }
      modelClass['__callAfterAllModelsAreLoadedToSetupRelations'] = undefined as any;
    });
    await Promise.all(initializeModelPromises);

    const markedFieldsCallbacksToRemove: number[] = [];
    // When we evaluate the fields later we need to update the initialized model as well.
    const evaluateLaterFieldsPromises = fieldsToEvaluateAfter.map(
      async ({ model, field, translatedField, getInitialized }, index) => {
        const initialized = getInitialized();
        const modelConstructor = model.constructor as ModelType<any, any> & typeof BaseModel & typeof Model;

        const lazyEvaluatedFieldResult = await engine.fields.lazyEvaluateField(
          engine,
          modelConstructor['__getName'](),
          initialized.instance,
          field['__getArguments'](),
          translatedField,
          (args) => {
            let modelToUse = model;
            let fieldToUse = field;
            if (args) {
              const modelConstructor = engine['__modelsOfEngine'][args.modelName] as ModelType<any, any> &
                typeof BaseModel &
                typeof Model;

              // eslint-disable-next-line ts/no-unnecessary-condition
              if (modelConstructor === undefined) throw new ModelMissingException(args.modelName);

              const modelInstance = new modelConstructor() as BaseModel & Model;
              const fields = modelConstructor['_fields']();
              const field = fields[args.fieldName];
              // eslint-disable-next-line ts/no-unnecessary-condition
              if (field === undefined) throw new FieldFromModelMissingException(args.modelName, args.fieldName);

              fieldToUse = field['__clone'](field, {
                newInstanceOverrideCallback: args.newInstanceOverrideCallback,
                optionsOverrideCallback: args.optionsOverrideCallback
              });
              modelToUse = modelInstance;
            }
            return parse(engine, engine.fields, modelToUse, fieldToUse, () => {});
          }
        );
        if (lazyEvaluatedFieldResult !== undefined && lazyEvaluatedFieldResult !== null) {
          initialized.modifyItself(lazyEvaluatedFieldResult);
          markedFieldsCallbacksToRemove.push(index);
        }
      }
    );
    await Promise.all(evaluateLaterFieldsPromises);
    fieldsToEvaluateAfter = fieldsToEvaluateAfter.filter((_, index) => !markedFieldsCallbacksToRemove.includes(index));

    if (engine.models.afterModelsTranslation) {
      const { modelEntries, modelsByName } = initializedModels.reduce(
        (acc, model) => {
          const optionsOfModel = model.class['_options']();
          if (
            optionsOfModel?.instance &&
            (options || {}).forceTranslation !== true &&
            (engine as any)['$didAnyModelDoesNotHaveInstance'] === false
          )
            return acc;
          const modelName = model.class['__getName']();
          acc.modelsByName[modelName] = model;
          acc.modelEntries.push([modelName, model.initialized]);
          return acc;
        },
        {
          modelsByName: {} as Record<string, InitializedModelsType & { modifyItself: (newModel: any) => void }>,
          modelEntries: [] as [string, InitializedModelsType][]
        }
      );

      if (
        modelEntries.length > 0 &&
        modelEntries.length < initializeModels.length &&
        options?.forceTranslation !== true
      ) {
        const answer = await std.asker.ask(
          `\nYou have translated the model before. And you have assigned 'instance' to ` +
            `the model options. Should we refresh all of the model instances?` +
            `\n\nType either: 'y' and press Enter to accept or Ctrl+C to make` +
            ` changes before continuing\n\n` +
            `Note: If this engine generate files it will overwrite all the files ` +
            `it has previously generated. Also don't forget to assign the generated ` +
            `models to 'instance' on the model options \n`
        );

        if (answer !== 'y') throw new ShouldAssignAllInstancesException();

        recursiveOptionsToEvaluateModels.push({
          forceTranslation: true
        });
      }

      if (modelEntries.length > 0) {
        const returnedValueFromLastTranslation = await engine.models.afterModelsTranslation(engine, modelEntries);
        if (Array.isArray(returnedValueFromLastTranslation)) {
          for (const [modelName, returnedValue] of returnedValueFromLastTranslation)
            modelsByName[modelName].modifyItself(returnedValue);
        }
      }
    }

    for (const setRelationToCall of relationsToCallAfterModelsTranslation.values()) setRelationToCall(engine);

    if (recursiveOptionsToEvaluateModels.length <= 0) return initializedModels;
  }
  return [];
}

/**
 * This factory function is used to create a default model translate callback.
 * A library user can call this function at any time to run the default behavior
 * of the model translation.
 */
export function factoryFunctionForModelTranslate(
  engine: DatabaseAdapter,
  model: Model,
  callbackToParseAfterAllModelsAreTranslated: (field: Field, translatedField: any) => void,
  options: {
    forceTranslate?: boolean;
  }
) {
  const modelConstructor = model.constructor as ModelType<any, any> & typeof BaseModel & typeof Model;
  const modelOptions = modelConstructor['_options'](model) as ModelOptionsType;
  const fieldEntriesOfModel = Object.entries(modelConstructor['_fields'](model));

  const defaultParseFieldCallback = (field: Field) => {
    return parse(engine, engine.fields, model, field, (translatedField, _, originalField) => {
      if (originalField) callbackToParseAfterAllModelsAreTranslated(originalField, translatedField);
    });
  };

  const defaultTranslateFieldsCallback = async () => {
    const translatedFieldDataByFieldName: { [key: string]: any } = {};
    for (const [fieldName, field] of fieldEntriesOfModel) {
      const translatedAttributes =
        typeof engine.fields.translateField === 'function'
          ? await engine.fields.translateField(engine, field as any, defaultParseFieldCallback)
          : await defaultParseFieldCallback(field as any);

      const isTranslatedAttributeDefined = translatedAttributes !== undefined && translatedAttributes !== null;
      if (isTranslatedAttributeDefined) translatedFieldDataByFieldName[fieldName] = translatedAttributes;
    }

    return translatedFieldDataByFieldName;
  };

  return async () => {
    const modelName = modelConstructor['__getName']();
    const alreadyHasInitializedModel = engine.initializedModels[modelName] !== undefined;
    const alreadyHasAnInstance =
      options.forceTranslate !== true && (alreadyHasInitializedModel || model.options?.instance !== undefined);

    if ((engine as any)['$didAnyModelDoesNotHaveInstance'] === undefined)
      (engine as any)['$didAnyModelDoesNotHaveInstance'] = false;
    if (model.options?.instance === undefined) (engine as any)['$didAnyModelDoesNotHaveInstance'] = true;
    else engine['__totalModels']--;

    async function translateModel() {
      const translatedModel = await engine.models.translate(
        engine,
        modelName,
        model,
        fieldEntriesOfModel as any,
        modelOptions,
        modelOptions.customOptions,
        async () => {
          const options = await engine.models.translateOptions.bind(engine.models)(engine, modelName, modelOptions);
          const fields =
            typeof engine.models.translateFields === 'function'
              ? await engine.models.translateFields.bind(engine.models)(
                  engine,
                  modelName,
                  fieldEntriesOfModel as any,
                  model,
                  defaultParseFieldCallback,
                  defaultTranslateFieldsCallback
                )
              : await defaultTranslateFieldsCallback();

          return {
            options: options,
            fields: fields
          };
        },
        defaultParseFieldCallback,
        defaultTranslateFieldsCallback
      );

      return translatedModel;
    }

    // The idea is that we will NOT TRANSLATE the model ONLY IF all the other models also have an instance.
    // If just one of the models does not have an instance we will translate everything. This guarantees that it always
    // works.
    const modelInstance = alreadyHasAnInstance
      ? alreadyHasInitializedModel
        ? engine.initializedModels[modelName]
        : await new Promise((resolve, reject) => {
            function recursivelyCheckIfAnyModelDoesNotHaveInstance() {
              const hasTranslatedAllModels = Object.keys(engine.initializedModels).length >= engine['__totalModels'];
              if ((engine as any)['$didAnyModelDoesNotHaveInstance'] === true) {
                engine['__totalModels']++;
                translateModel()
                  .then((translatedModel) => {
                    resolve(translatedModel);
                  })
                  .catch((error) => {
                    reject(error);
                  });
                return;
              }
              if (hasTranslatedAllModels === true) {
                engine['__totalModels']++;
                resolve(model.options?.instance);
                return;
              }
              queueMicrotask(() => queueMicrotask(recursivelyCheckIfAnyModelDoesNotHaveInstance));
            }
            recursivelyCheckIfAnyModelDoesNotHaveInstance();
          })
      : await translateModel();

    engine.initializedModels[modelConstructor['__getName']()] = modelInstance;

    // This lets you apply custom hooks to your translated model directly.
    // Something like that: https://www.prisma.io/docs/concepts/components/prisma-client/middleware
    // Or: https://sequelize.org/docs/v6/other-topics/hooks/
    if (modelOptions.applyToTranslatedModel && alreadyHasAnInstance === false) {
      const translatedModelInstance =
        typeof engine.models.getModelInstanceForCustomHooks === 'function'
          ? await engine.models.getModelInstanceForCustomHooks(engine, modelName, modelInstance)
          : modelInstance;

      modelOptions.applyToTranslatedModel(translatedModelInstance);
    }

    return modelInstance;
  };
}
