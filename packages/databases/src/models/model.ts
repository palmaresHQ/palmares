import { getSettings, initializeDomains } from 'packages/core/dist/src';

import { ModelCircularAbstractError, ModelNoUniqueFieldsError } from './exceptions';
import { DefaultManager, Manager } from './manager';
import { factoryFunctionForModelTranslate, getDefaultModelOptions, indirectlyRelatedModels } from './utils';
import { Databases } from '..';
import { getUniqueCustomImports, hashString } from '../utils';

import type { Field, ForeignKeyField } from './fields';
import type { CustomImportsForFieldType } from './fields/types';
import type {
  ManagersOfInstanceType,
  ModelFieldsType,
  ModelOptionsType,
  onRemoveFunction,
  onSetFunction
} from './types';
import type { DatabaseAdapter } from '../engine';
import type { ExtractFieldsFromAbstracts, ExtractManagersFromAbstracts } from '../types';

declare global {
  // eslint-disable-next-line no-var
  var $PManagers: Map<string, Manager<any, any>> | undefined;
}

export class BaseModel {
  protected static $$type = '$PModel';
  protected __className = this.constructor.name;
  protected __stringfiedArgumentsOfEvents = new Set<string>();
  protected __eventsUnsubscribers: (() => Promise<void>)[] = [];

  protected static __isState = false;

  // It would be kinda bad on performance if we always looped through all of the fields of a model to parse them.
  // So we store the fields that have parsers here and we will
  // loop through it here.
  protected static __fieldParsersByEngine = new Map<
    string,
    {
      input: string[];
      output: string[];
    }
  >();
  protected static __associations: {
    [modelName: string]: {
      byRelationName: Map<string, ForeignKeyField<any, any>>;
      byRelatedName: Map<string, ForeignKeyField<any, any>>;
    };
  } = {};
  // This model uses other models as ForeignKey
  protected static __directlyRelatedTo: { [modelName: string]: string[] } = {};
  // Other models use this model as ForeignKey
  protected static __indirectlyRelatedTo: { [modelName: string]: string[] } = {};
  protected static __indirectlyRelatedModels = indirectlyRelatedModels;
  protected static __primaryKeys: string[] = [];
  protected static __domainName: string;
  protected static __domainPath: string;
  protected static __callAfterAllModelsAreLoadedToSetupRelations: Map<
    string,
    (engineInstance: DatabaseAdapter) => void
  > = new Map();
  protected static __lazyFields?: ModelFieldsType = {};
  protected static __cachedHashedName?: string;
  protected static __cachedName: string;

  protected static __cachedOriginalName: string;
  protected static __cachedFields: ModelFieldsType | undefined = undefined;
  protected static __customOptions: any = undefined;
  protected static __cachedOptions: ModelOptionsType<any> | undefined = undefined;
  protected static __hasLoadedManagers = false;
  protected static __cachedManagers: ManagersOfInstanceType | undefined = undefined;
  protected static __hasLoadedAbstracts = false;
  protected static __instance: Model & BaseModel;
  protected static __initialized: { [engineName: string]: any } = {};

  constructor() {
    const baseModelConstructor = this.constructor as typeof BaseModel & typeof Model;
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (baseModelConstructor.__instance) return baseModelConstructor.__instance;

    const newInstance = this as unknown as Model & BaseModel;
    if (newInstance.options?.abstract) newInstance.options.managed = false;
    (this.constructor as any).__instance = newInstance;
    return newInstance;
  }

  // eslint-disable-next-line ts/require-await
  protected async __initializeManagers(
    engineInstance: DatabaseAdapter,
    modelInstance: Model & BaseModel,
    translatedModelInstance: {
      instance: any;
      modifyItself: (newTranslation: any) => void;
    }
  ) {
    const modelConstructor = this.constructor as unknown as typeof Model & typeof BaseModel;
    const managers: ManagersOfInstanceType = modelConstructor['__getManagers']();
    const managerEntries = Object.entries(managers);

    for (const [managerName, manager] of managerEntries) {
      manager['__setModel'](engineInstance.connectionName, modelInstance);
      manager['__setInstance'](engineInstance.connectionName, translatedModelInstance);
      manager['__setEngineInstance'](engineInstance.connectionName, engineInstance);
    }
  }

  /**
   * This will add event listeners to the model. So when an event like `.set` or `.remove` is triggered, we will call
   * the event handler that was defined in the model using the `onSet` or `onRemove` options.
   *
   * By default we will take care to prevent the same data being triggered twice.
   * So we stringify the data and compare it, so for example if a model is trying to save the same data it
   * received through an event it will not trigger the event again by default.
   *
   * @param engineInstance - The current engine instance we are initializing this model instance
   */
  protected async __initializeEvents(engineInstance: DatabaseAdapter) {
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (!engineInstance) return;
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (!engineInstance.databaseSettings?.events?.emitter) return;

    const existingEngineInstanceName = engineInstance.connectionName;
    const modelInstance = this as unknown as Model & BaseModel;
    const modelConstructor = this.constructor as typeof Model & typeof BaseModel;

    if (!modelInstance.options) return;

    for (const operationType of ['onSet', 'onRemove'] as const) {
      const eventHandler =
        typeof modelInstance.options[operationType] === 'function'
          ? modelInstance.options[operationType]
          : typeof modelInstance.options[operationType] === 'object'
            ? (modelInstance.options[operationType] as any).handler
            : undefined;
      if (!eventHandler) continue;

      const isToPreventCallerToBeTheHandled =
        typeof modelInstance.options[operationType] === 'function'
          ? true
          : typeof modelInstance.options[operationType] === 'object'
            ? (modelInstance.options[operationType] as any).preventCallerToBeTheHandled
            : undefined;

      const eventNameToUse = `${modelConstructor['__hashedName']()}.${operationType}`;
      const eventEmitter = await Promise.resolve(engineInstance.databaseSettings.events.emitter);
      this.__eventsUnsubscribers.push(
        await eventEmitter.addEventListenerWithoutResult(
          eventNameToUse,
          async (engineInstanceName: string, args: Parameters<onSetFunction | onRemoveFunction>) => {
            const isCallerDifferentThanHandler = engineInstanceName !== existingEngineInstanceName;
            const argsAsString = JSON.stringify(args);
            // This will prevent the event to be triggered twice for the same set of arguments.
            this.__stringfiedArgumentsOfEvents.add(argsAsString);

            if (isToPreventCallerToBeTheHandled && isCallerDifferentThanHandler)
              await Promise.resolve(eventHandler(args as any));
            else if (!isToPreventCallerToBeTheHandled) await Promise.resolve(eventHandler(args as any));

            this.__stringfiedArgumentsOfEvents.delete(argsAsString);
          }
        )
      );
    }
  }

  /**
   * Initializes the model and returns the model instance for the current engine instance that is being used.
   */
  protected static async __init(
    engineInstance: DatabaseAdapter,
    domainName: string,
    domainPath: string,
    lazyLoadFieldsCallback: (field: Field, translatedField: any) => void,
    options?: {
      forceTranslate?: boolean;
    }
  ) {
    console.log('Model init');
    if (this.__initialized[engineInstance.connectionName]) return this.__initialized[engineInstance.connectionName];

    const currentPalmaresModelInstance = new this() as Model & BaseModel;

    this.__domainName = domainName;
    this.__domainPath = domainPath;

    const functionToCallToTranslateModel = factoryFunctionForModelTranslate(
      engineInstance,
      currentPalmaresModelInstance,
      lazyLoadFieldsCallback,
      options || {}
    );
    const [initializedModelInstance, _] = await Promise.all([
      functionToCallToTranslateModel(),
      currentPalmaresModelInstance.__initializeEvents(engineInstance)
    ]);
    // Use the reference to modify itself.
    const translated = {
      instance: initializedModelInstance,
      modifyItself: (newTranslatedInstance: any) => {
        translated.instance = newTranslatedInstance;
      }
    };

    await currentPalmaresModelInstance.__initializeManagers(engineInstance, currentPalmaresModelInstance, translated);
    (this.constructor as typeof BaseModel).__initialized = {
      [engineInstance.connectionName]: translated
    };
    return translated;
  }

  /**
   * Compare this and another model to see if they are equal so we can create the migrations automatically for them.
   * You see that we do not compare the fields, for the fields we have a hole set of `CRUD` operations
   * if something changes there.
   * So it doesn't matter if two models don't have the same set of fields, if the options are equal,
   * then they are equal.
   *
   * @param model - The model to compare to the current model.
   *
   * @returns - Returns true if the models are equal and false otherwise.
   */
  // eslint-disable-next-line ts/require-await
  protected async __compareModels(model: Model & BaseModel): Promise<boolean> {
    const currentModel = this as unknown as Model & BaseModel;
    return (
      currentModel.options?.abstract === model.options?.abstract &&
      currentModel.options?.underscored === model.options?.underscored &&
      currentModel.options?.tableName === model.options?.tableName &&
      JSON.stringify(currentModel.options?.ordering) === JSON.stringify(model.options?.ordering) &&
      JSON.stringify(currentModel.options?.indexes) === JSON.stringify(model.options?.indexes) &&
      JSON.stringify(currentModel.options?.databases) === JSON.stringify(model.options?.databases) &&
      JSON.stringify(currentModel.options?.customOptions) === JSON.stringify(model.options?.customOptions)
    );
  }

  /**
   * Since most data is private, we use this to extract all the data that the model has that might be useful for engine
   * instances. This way we don't need to expose the model to the engine
   */
  protected __getModelAttributes() {
    const modelConstructor = this.constructor as unknown as typeof Model & typeof BaseModel;
    const fields = modelConstructor._fields();
    const options = modelConstructor._options();

    const fieldsWithAttributes = Object.entries(fields).reduce(
      (accumulator, [fieldName, field]) => {
        accumulator[fieldName] = field['__getArguments']();
        return accumulator;
      },
      {} as Record<string, ReturnType<(typeof Field<any, any>)['__getArgumentsCallback']>>
    );

    return {
      modelName: modelConstructor.__originalName(),
      fields: fieldsWithAttributes,
      options
    };
  }

  /**
   * Retrieves the managers from the model constructor.
   *
   * This is useful for getting the managers from an abstract model class.
   */
  protected static __getManagers() {
    if (this.__hasLoadedManagers !== true) {
      this.__hasLoadedManagers = true;
      const managers: ManagersOfInstanceType = {};
      let prototype = this;

      // eslint-disable-next-line ts/no-unnecessary-condition
      while (prototype) {
        if (!(prototype.prototype instanceof Model)) break;
        const propertyNamesOfModel = Object.getOwnPropertyNames(prototype);
        for (const propName of propertyNamesOfModel) {
          const value = (this as any)[propName];

          if (value && (value as Manager)['$$type'] === '$PManager') managers[propName] = value;
        }
        prototype = Object.getPrototypeOf(prototype);
      }
      this.__cachedManagers = {
        ...managers,
        // eslint-disable-next-line ts/no-unnecessary-condition
        ...(this.__cachedManagers || {})
      };
    }
    return this.__cachedManagers || {};
  }

  /**
   * This will load all of the abstract instances of the model. The abstracts will append 3 types of
   * data in the current model:
   * fields, options, managers and other abstracts
   *
   * So for fields we will just accept the ones not already defined in the field, if there
   * is any clash we will throw an error.
   * For options, we will only add them if the options are not already defined for the model.
   * Managers are similar to fields, we will not accept clashing managers with the same manager name.
   *
   * @param abstractInstance - The model class that we are instantiating.
   * @param composedAbstracts - We can have an abstract with an abstract and so on, for that a recursive approach
   * seems a good solution, this is an array with all of the abstracts that were already loaded for the current model.
   */
  protected static __loadAbstract(abstractConstructor: typeof Model & typeof BaseModel, composedAbstracts: string[]) {
    const abstractInstance = new abstractConstructor() as Model & BaseModel;
    const modelInstance = new this() as Model & BaseModel;
    const modelConstructor = this as typeof Model & typeof BaseModel;
    const abstractInstanceName = abstractConstructor.name;

    if (composedAbstracts.includes(abstractInstanceName))
      throw new ModelCircularAbstractError(this.name, abstractInstanceName);

    // Handle the abstracts and the managers from the abstract
    const abstractManagers: [string, Manager][] = Object.entries(abstractConstructor.__getManagers());
    const abstractFieldEntries = Object.entries(abstractConstructor._fields());

    for (const [fieldName, field] of abstractFieldEntries) {
      // Already has the same field on the model, so we will ignore it.
      // eslint-disable-next-line ts/no-unnecessary-condition
      if (modelInstance.fields[fieldName] || modelConstructor.__lazyFields?.[fieldName]) continue;
      modelConstructor.__lazyFields ??= {};
      modelConstructor.__lazyFields[fieldName] = field;
    }

    // Handle options of the abstract
    const areAbstractInstanceOptionsDefined = Object.keys(abstractInstance.options || {}).length > 1;
    if (areAbstractInstanceOptionsDefined) {
      const optionsFromAbstract = abstractConstructor._options();
      if (optionsFromAbstract) {
        const duplicatedOptions = structuredClone(optionsFromAbstract);
        delete duplicatedOptions.abstract;
        delete duplicatedOptions.managed;

        modelConstructor.__cachedOptions = {
          ...duplicatedOptions,
          ...(modelConstructor.__cachedOptions || {})
        };
      }
    }

    for (const [managerName, managerInstance] of abstractManagers) {
      // eslint-disable-next-line ts/no-unnecessary-condition
      if ((modelConstructor as any)[managerName]) continue;

      //throw new ModelInvalidAbstractManagerError(this.name, abstractInstanceName, managerName);
      (modelConstructor as any)[managerName] = managerInstance;
    }
  }

  /**
   * Initializes all of the abstract classes of the model and loads them to the current model.
   *
   * With this we will have the model with all of the fields, options and managers as the other abstracts.
   */
  protected static __initializeAbstracts() {
    if (this.__hasLoadedAbstracts) return;
    const modelInstance = new this() as Model & BaseModel;
    const alreadyComposedAbstracts = [this.name];

    for (const abstractModelConstructor of (modelInstance as any)['abstracts'] as (typeof Model & typeof BaseModel)[])
      this.__loadAbstract(abstractModelConstructor, alreadyComposedAbstracts);
    this.__hasLoadedAbstracts = true;
  }

  /**
   * This setups the indirect relations to the model. What we are doing is that we are setting the relatedTo
   * property of the model in the engineInstance._indirectlyRelatedModels. By doing this when we update
   * the value on this array it will update the `relatedTo` array inside of this model as well. With this we are
   * able to know which models relates to this model.
   */
  protected static __initializeRelatedToModels() {
    /*const originalModelName = this.__originalName();
    if (originalModelName in this.__indirectlyRelatedModels) {
      this.__indirectlyRelatedTo = this.__indirectlyRelatedModels[originalModelName];
    } else {
      this.__indirectlyRelatedModels.$set[originalModelName] = this.__initializeRelatedToModels.bind(this);
    }*/
  }

  /**
   * Get the options of the model. Use this to get the options of the model since here we will use the cached data
   * if it exists.
   */
  protected static _options(modelInstance?: any) {
    // this and typeof Model means pretty much the same thing here.
    if (!modelInstance) modelInstance = new this() as Model & BaseModel;

    const defaultOptions = getDefaultModelOptions();
    this.__initializeAbstracts();

    if (this.__cachedOptions === undefined) {
      const keysOfDefaultOptions = Object.keys(defaultOptions);
      for (const defaultModelOptionKey of keysOfDefaultOptions) {
        if (defaultModelOptionKey in (modelInstance.options || {}) === false) {
          if (typeof modelInstance.options !== 'object') modelInstance.options = {};
          modelInstance.options[defaultModelOptionKey] = (defaultOptions as any)[defaultModelOptionKey];
        }
      }
      this.__cachedOptions = {
        // eslint-disable-next-line ts/no-unnecessary-condition
        ...(this.__cachedOptions || {}),
        ...(modelInstance.options || {}),
        customOptions:
          this.__customOptions ||
          modelInstance.options?.customOptions ||
          ((this.__cachedOptions as any) || ({} as any)).customOptions
      };
    }
    return this.__cachedOptions;
  }

  protected static _fields(modelInstance?: any) {
    // 'this' and typeof Model means pretty much the same thing here.
    if (!modelInstance) modelInstance = new this() as Model & BaseModel;
    const modelInstanceAsModel = modelInstance as Model & BaseModel;
    this.__initializeAbstracts();

    if (this.__cachedFields === undefined) {
      let modelHasNoUniqueFields = true;
      let fieldsDefinedOnModel = modelInstanceAsModel.fields;
      if (this.__lazyFields) fieldsDefinedOnModel = { ...fieldsDefinedOnModel, ...this.__lazyFields };
      const allFields = Object.entries(fieldsDefinedOnModel);

      // We just need to initialize the fields if the model is not abstract
      if (this._options()?.abstract !== true) {
        for (const [fieldName, field] of allFields) {
          if (field['__unique']) modelHasNoUniqueFields = false;
          field['__init'](fieldName, this as ModelType<any, any> & typeof BaseModel & typeof Model);
        }

        if (modelHasNoUniqueFields) {
          throw new ModelNoUniqueFieldsError(this.__cachedName);
        }
      }

      modelInstance.fields = fieldsDefinedOnModel;
      this.__cachedFields = fieldsDefinedOnModel;
    }

    this.__initializeRelatedToModels();
    return this.__cachedFields;
  }

  protected static __originalName() {
    if (typeof this.__cachedOriginalName === 'string') return this.__cachedOriginalName;

    if (this.__isState) this.__cachedOriginalName = this.name;
    else
      this.__cachedOriginalName = (typeof this.__originalName === 'string' ? this.__originalName : this.name) as string;
    return this.__cachedOriginalName;
  }

  /**
   * We use this so the name of the models does not clash with the original ones during migration.
   * During migration we will have 2 instances of the same model running at the
   * same time:
   *
   * 1. The state model, built from the migration files.
   * 2. The original model.
   */
  protected static __getName() {
    if (typeof this.__cachedName === 'string') return this.__cachedName;

    if (this.__isState) this.__cachedName = `State${this.name}`;
    else this.__cachedName = this.name;
    return this.__cachedName;
  }

  /**
   * We use the original model name to create a hash name of the model, a hash name of the model is used so
   * we can send events back and forth for the model between
   * multiple palmares instances.
   *
   * @returns - The hashed name of the model.
   */
  protected static __hashedName() {
    const originalModelName = this.__originalName();
    if (this.__cachedHashedName === undefined) {
      this.__cachedHashedName = hashString(originalModelName);
    }
    return this.__cachedHashedName;
  }

  protected static async __fieldsToString(
    indentation = 0,
    fields: ModelFieldsType
  ): Promise<{ asString: string; customImports: CustomImportsForFieldType[] }> {
    const customImportsOfModel: CustomImportsForFieldType[] = [];
    const allFields = Object.entries(fields);
    const ident = '  '.repeat(indentation);
    const fieldsIdent = '  '.repeat(indentation + 1);

    const stringifiedFields = [];
    for (let i = 0; i < allFields.length; i++) {
      const fieldName = allFields[i][0];
      const field = allFields[i][1];
      const isLastField = i === allFields.length - 1;
      const customImportsOfField = await field['__customImports']();
      stringifiedFields.push(
        `${fieldsIdent}${fieldName}: ${(await field['__toString'](indentation + 1)).replace(
          new RegExp(`^${fieldsIdent}`),
          ''
        )},${isLastField ? '' : '\n'}`
      );
      getUniqueCustomImports(customImportsOfField, customImportsOfModel);
    }
    return {
      asString: `${ident}{\n` + `${stringifiedFields.join('')}` + `\n${ident}}`,
      customImports: customImportsOfModel
    };
  }

  // eslint-disable-next-line ts/require-await
  protected static async __optionsToString(indentation = 0, options: ModelOptionsType) {
    const ident = '  '.repeat(indentation);
    const optionsIndent = '  '.repeat(indentation + 1);

    const newOptions = {
      ...getDefaultModelOptions(),
      ...options
    };
    return (
      `${ident}{\n` +
      `${optionsIndent}abstract: ${newOptions.abstract},\n` +
      `${optionsIndent}underscored: ${newOptions.underscored},\n` +
      `${optionsIndent}tableName: ${
        typeof newOptions.tableName === 'string' ? `"${newOptions.tableName}"` : newOptions.tableName
      },\n` +
      `${optionsIndent}managed: ${newOptions.managed},\n` +
      `${optionsIndent}ordering: [${options.ordering ? newOptions.ordering.map((field) => `"${field}"`) : ''}],\n` +
      `${optionsIndent}indexes: [${
        options.indexes
          ? newOptions.indexes.map(
              (dbIndex, i) =>
                `{ unique: ${dbIndex.unique}, fields: ${dbIndex.fields.map((field) => `"${field}"`)} }` +
                `${i === (newOptions.indexes.length || 1) - 1 ? '' : ','}`
            )
          : ''
      }],\n` +
      `${optionsIndent}databases: [${
        options.databases ? newOptions.databases.map((database) => `"${database}"`) : ''
      }],\n` +
      `${optionsIndent}customOptions: ${JSON.stringify(newOptions.customOptions)}\n` +
      `${ident}}`
    );
  }
}

const BaseModelWithoutMethods = BaseModel as unknown as { new (): Pick<BaseModel, never> };

/**
 * This class is used for initializing a model. This will work similar to django except that instead of
 * `objects` we use `instance` to make queries. So in other words, if you want to make queries directly
 * you will need to use. Also the instance will hold the actual instance of the model.
 *
 * >>> (await ModelName.getInstance()).findOne()
 * or
 * >>> (await ModelName.getInstance()).create()
 *
 * and so on.
 *
 * For creating Models it is simple, you've got 4 objects: `attributes`, `objects`, `managers` and `abstracts`
 *
 * The first one is obligatory, the rest is optional.
 * For `attributes` it is simple, just define the attributes of your model there as you would in sequelize
 * normally:
 *
 * Example:
 * In sequelize we define like:
 * >>> sequelize.define('User', {
 *      firstName: {
 *          type: DataTypes.STRING,
 *          allowNull: false
 *      },
 *      lastName: {
 *          type: DataTypes.STRING
 *      }
 * }, {
 *      tableName: 'user'
 * })
 *
 * Notice that 'User' is the name of the model, the second argument of the `.define()` function is the attributes,
 * it is exactly this object we will put in the attributes parameter. The second argument of the function is the
 * sequelize `options` sequelize parameter where we can define indexes, tableName and many other configuration.
 * You might want to check sequelize documentation for this: https://sequelize.org/master/manual/model-basics.html
 *
 * Okay so how do we rewrite this to something more concise and readable?
 * class User extends Model {
 *      attributes = {
 *          firstName: new model.fields.CharField(),
 *          lastName: new model.fields.CharField()
 *      }
 *
 *      options = {
 *          tableName: 'user'
 *      }
 *
 *      getFullName() {
 *          return this.firstName + this.lastName
 *      }
 *
 *      custom = new CustomManager()
 * }
 *
 * Simple and elegant. You will notice the `attributes` is defined, the options is optional, so instead of defining an
 * empty object you can totally omit it if you want.
 *
 * The `.getFullName` function is an instance function it will be appended to the instance so you can make a query like
 * and then it will return an User model, this model will have the method.
 *
 * >>> const response = await User.instance.findOne()
 * >>> response.getFullName()
 *
 * We underline many stuff from sequelize so you, the programmer, don't need to worry about tooling, it will just work.
 *
 * Take a notice at manager. Manager is for building custom managers similar to django managers.
 * Instead of making queries through your code you can keep all of your queries inside of managers and just
 * define them in your model.
 *
 * For the CustomManager, this will be our definition of a custom manager
 * >>> class CustomManager extends Manager {
 *         createUser(firstName, lastName) {
 *              return this.instance.create({ firstName: firstName, lastName: lastName })
 *         }
 *     }
 *
 * Okay so now we don't need to create a new user calling `.create` directly, instead we can use
 *
 * User.custom.createUser('Jane', 'Doe')
 *
 * This way we can keep queries more concise and representative by just making functions. Also
 * you can have the hole power of linting VSCode and other IDEs give you.
 */
export class Model extends BaseModelWithoutMethods {
  protected static $$type = '$PModel';
  //static [managers: string]: Manager | ((...args: any) => any) | ModelFieldsType;
  fields: ModelFieldsType = {};
  options: ModelOptionsType<any> | undefined = undefined;
  abstracts: readonly (typeof Model & typeof BaseModel)[] = [] as const;
}

/**
 * Actual model returned
 */
export type ModelType<
  TModel,
  TDefinitions extends {
    engineInstance: DatabaseAdapter;
    customOptions: any;
  } = {
    engineInstance: DatabaseAdapter;
    customOptions: any;
  }
> = {
  default: DefaultManager<TModel>;

  appendFields: <TOtherFields extends ModelFieldsType>(
    fields: TOtherFields
  ) => ModelType<TModel & { fields: TOtherFields }, TDefinitions>;

  setCustomOptions: <
    TCustomOptions extends Parameters<TDefinitions['engineInstance']['models']['translate']>[5]['customOptions']
  >(
    customOptions: TCustomOptions
  ) => ModelType<TModel, { engineInstance: TDefinitions['engineInstance']; customOptions: TCustomOptions }>;

  setManagers: <TManagers extends Record<string, Manager<any>>>(
    managers: TManagers
  ) => ModelType<TModel, TDefinitions> & TManagers;

  new (): {
    fields: TModel extends { fields: infer TFields } ? TFields : any;
    options: ModelOptionsType<any>;
  };
};

/**
 * This function is needed so we can add the type to the DefaultManager. This will help keeping the API simple for the
 * end user without complicating too much stuff.
 */
export function model<
  TModel,
  TDefinitions extends {
    engineInstance: DatabaseAdapter;
    customOptions: any;
  } = {
    engineInstance: DatabaseAdapter;
    customOptions: any;
  }
>(): ModelType<TModel, TDefinitions> {
  class DefaultModel extends Model {
    protected static $$type = '$PModel';
    protected static __isState = false;
    // It would be kinda bad on performance if we always looped through all of the fields of a model to parse them.
    // So we store the fields that have parsers here and we will
    // loop through it here.
    protected static __fieldParsersByEngine = new Map<
      string,
      {
        input: string[];
        output: string[];
      }
    >();
    protected static __associations: {
      [modelName: string]: ForeignKeyField<any, any>[];
    } = {};
    // This model uses other models as ForeignKey
    protected static __directlyRelatedTo: { [modelName: string]: string[] } = {};
    // Other models use this model as ForeignKey
    protected static __indirectlyRelatedTo: { [modelName: string]: string[] } = {};
    protected static __primaryKeys: string[] = [];
    protected static __callAfterAllModelsAreLoadedToSetupRelations: ((engineInstance: DatabaseAdapter) => void)[] = [];

    protected static __lazyFields?: ModelFieldsType = {};
    protected static __hasLoadedManagers = false;
    protected static __hasLoadedAbstracts = false;
    protected static __initialized: { [engineName: string]: any } = {};

    static default = new DefaultManager<TModel extends DefaultModel ? TModel : any>();

    /**
     * This will append fields to the current model. It is useful for extending the models so you can
     * lazy load the fields. It
     */
    static appendFields<TOtherFields extends ModelFieldsType>(fields: TOtherFields) {
      const modelConstructor = this as unknown as typeof Model & typeof BaseModel;
      const allFieldEntries = Object.entries(fields);
      for (const [fieldName, field] of allFieldEntries) {
        if (modelConstructor['__lazyFields']?.[fieldName]) {
          modelConstructor['__lazyFields'][fieldName] = field;
        }
      }

      return this as unknown as any;
    }

    static setCustomOptions<
      TCustomOptions extends Parameters<TDefinitions['engineInstance']['models']['translate']>[5]['customOptions']
    >(
      customOptions: TCustomOptions
    ): ModelType<TModel, { engineInstance: TDefinitions['engineInstance']; customOptions: TCustomOptions }> {
      (this as unknown as typeof Model & typeof BaseModel)['__customOptions'] = customOptions;
      return this as any;
    }

    static setManagers<TManagers extends Record<string, Manager<any>>>(
      managers: TManagers
    ): ModelType<TModel, TDefinitions> & TManagers {
      for (const [managerName, managerInstance] of Object.entries(managers)) {
        (this as any)[managerName] = managerInstance;
      }
      return this as any;
    }
  }

  return new Proxy(DefaultModel, {
    get: (_, prop, receiver) => {
      const dataToGet = (DefaultModel as any)[prop] as unknown as any;
      if (dataToGet && dataToGet['$$type'] === '$PManager') {
        /*if (databases.managers.has(`${modelName}/${prop as string}`))
          return databases.managers.get(`${modelName}/${prop as string}`);
        databases.managers.set(`${modelName}/${prop as string}`, dataToGet);*/
        return dataToGet;
      }
      return (DefaultModel as any)[prop] as unknown as any;
    }
  }) as any;
}
/**
 * Used for creating a model from a function instead of needing to define a class.
 */
export function initialize<
  TTypeName extends string,
  TFields extends ModelFieldsType,
  const TAbstracts extends readonly {
    new (): {
      fields: any;
      options?: ModelOptionsType<any>;
    };
  }[],
  const TOptions extends ModelOptionsType<{ fields: TFields; abstracts: TAbstracts }>,
  TManagers extends {
    [managerName: string]:
      | Manager<any>
      | {
          [functionName: string]: (
            this: Manager<
              ReturnType<
                typeof model<{
                  fields: ExtractFieldsFromAbstracts<TFields, TAbstracts>;
                  options: ModelOptionsType<{ fields: TFields; abstracts: TAbstracts }>;
                }>
              > & {
                fields: ExtractFieldsFromAbstracts<TFields, TAbstracts>;
                options: ModelOptionsType<{ fields: TFields; abstracts: TAbstracts }>;
                // eslint-disable-next-line no-shadow
              }
            >,
            ...args: any
          ) => any;
        };
  }
>(
  modelName: TTypeName,
  args: {
    fields: TFields;
    options?: TOptions;
    abstracts?: TAbstracts;
    managers?: TManagers;
  }
): (TManagers extends undefined
  ? unknown
  : ExtractManagersFromAbstracts<TAbstracts> & {
      [TManagerName in keyof TManagers]: Manager<any> & {
        [TFunctionName in keyof TManagers[TManagerName]]: TManagers[TManagerName][TFunctionName];
      };
    }) &
  ModelType<{ fields: ExtractFieldsFromAbstracts<TFields, TAbstracts>; options: TOptions }> {
  type ModelFields = ExtractFieldsFromAbstracts<TFields, TAbstracts>;
  class ModelConstructor extends model<
    ModelConstructor & {
      fields: ModelFields;
      options: TOptions;
    }
  >() {
    protected static __isState = false;
    // It would be kinda bad on performance if we always looped through all of the fields of a model to parse them.
    // So we store the fields that have parsers here and we will
    // loop through it here.
    protected static __fieldParsersByEngine = new Map<
      string,
      {
        input: string[];
        output: string[];
      }
    >();
    protected static __associations: {
      [modelName: string]: ForeignKeyField<any, any>[];
    } = {};
    // This model uses other models as ForeignKey
    protected static __directlyRelatedTo: { [modelName: string]: string[] } = {};
    // Other models use this model as ForeignKey
    protected static __indirectlyRelatedTo: { [modelName: string]: string[] } = {};
    protected static __primaryKeys: string[] = [];
    protected static __callAfterAllModelsAreLoadedToSetupRelations: ((engineInstance: DatabaseAdapter) => void)[] = [];

    protected static __lazyFields?: ModelFieldsType = {};
    protected static __hasLoadedManagers = false;
    protected static __hasLoadedAbstracts = false;
    protected static __initialized: { [engineName: string]: any } = {};

    protected static __cachedName = modelName;
    protected static __cachedOriginalName = modelName;
    protected static __cachedManagers = {};

    protected static __originalName() {
      if (typeof this.__cachedOriginalName === 'string') return this.__cachedOriginalName;

      if (this.__isState) this.__cachedOriginalName = modelName;
      else
        (this as any).__cachedOriginalName = (typeof this.__originalName === 'string'
          ? this.__originalName
          : modelName) as unknown as string;
      return this.__cachedOriginalName;
    }

    /**
     * We use this so the name of the models does not clash with the original ones during migration.
     * During migration we will have 2 instances of the same model running at the
     * same time:
     *
     * 1. The state model, built from the migration files.
     * 2. The original model.
     */
    protected static __getName() {
      if (typeof this.__cachedName === 'string') return this.__cachedName;

      if (this.__isState) (this as any).__cachedName = `State${modelName}`;
      else this.__cachedName = modelName;
      return this.__cachedName;
    }

    fields = args.fields as ModelFields;
    options = args.options as TOptions;
    abstracts = args.abstracts || [];
  }

  for (const [managerName, managerFunctions] of Object.entries(args.managers || {})) {
    let managerInstance: Manager<any>;
    if ((managerFunctions as any)?.['$$type'] !== '$PManager') {
      class NewManagerInstance extends Manager<any> {
        static __lazyFields?: ModelFieldsType = {};
      }
      managerInstance = new NewManagerInstance();
      for (const [managerFunctionName, managerFunction] of Object.entries(managerFunctions)) {
        (managerInstance as any)[managerFunctionName] = managerFunction.bind(managerInstance);
      }
    } else managerInstance = managerFunctions as Manager<any>;

    (ModelConstructor as any)[managerName] = managerInstance;
    (ModelConstructor as any).__cachedManagers[managerName] = managerInstance;
  }

  return ModelConstructor as any;
}
