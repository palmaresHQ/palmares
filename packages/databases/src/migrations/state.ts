import { DefaultDuplicateFunctionNotCalledOnEngine } from './exceptions';
import { defaultEngineDuplicate } from '../engine/utils';
import { model } from '../models/model';
import { initializeModels } from '../models/utils';

import type { FoundMigrationsFileType, OriginalOrStateModelsByNameType, StateModelsType } from './types';
import type { DatabaseAdapter } from '../engine';
import type { BaseModel, ModelType } from '../models/model';
import type { InitializedModelsType } from '../types';

/**
 * The state is used to keep track how the models were for every migration file. On the migration files
 * we know how the model was at a specific moment in time. The original models defined by the user in the
 * `models.ts` file will keep track of the state of the models at the current time, it's like a "picture"
 * of the models right now.
 *
 * When creating a new migration file automatically we need to know what the state were, and how it will be.
 * How it were we can get from the previous migrations, how it will be we can get from the "picture" of how it
 * is right now.
 *
 * This is what the state is for. States keeps track of the state of the models at a specific moment in time based
 * on the migration files.
 */
export class State {
  modelsByName: StateModelsType = {};
  initializedModelsByName: OriginalOrStateModelsByNameType = {};
  stateNumber = 0;
  private constructor() {}

  /**
   * Gets the model instance by a given model name. If the model does not exist
   * we will create a new model.
   *
   * @param modelName - The name of the model to get the model instance for.
   *
   * @returns - Returns a model instance with all of the fields and options.
   */
  async get(modelName: string): Promise<StateModelsType[string]> {
    const modelInstance = this.modelsByName[modelName];
    // eslint-disable-next-line ts/no-unnecessary-condition
    const doesModelExist = modelInstance !== undefined;
    if (doesModelExist) return modelInstance;
    else return await this.newModel(modelName);
  }

  /**
   * Sets a new model in the state. Probably this is not needed because we are changing the values in place.
   * But since problems might occur we will keep it.
   *
   * @param modelName - The name of the model to set.
   * @param modifiedModel - The modified model instance to set.
   */
  // eslint-disable-next-line ts/require-await
  async set(modelName: string, modifiedModel: StateModelsType[string]) {
    this.modelsByName[modelName] = modifiedModel;
  }

  /**
   * Creates a new model with a different name than the original one. Instead of it being `${nameOfTheModel}`
   * it becomes `State${nameOfTheModel}` so, like `Users` will be `StateUsers`, this because the state will
   * clash with the original ones when being initialized.
   *
   * After that we add this to the `modelsByModelName` object with the ORIGINAL model name. And then call `.get()`
   * to retrieve the model to the user.
   *
   * @param modelName - The name of the model that is being created.
   *
   * @return - Returns the newly created model. We use the .get method because if we have any side effects to the
   * model we will also run them.
   */
  async newModel(modelName: string): Promise<StateModelsType[string]> {
    const ModelClass = class StateModel extends model() {
      static isState = true;
      static __cachedOriginalName = modelName;
      static __cachedName = `State${modelName}`;

      fields = {};
      options = {};
    };
    const newModelInstance = new ModelClass() as InstanceType<ReturnType<typeof model>> & BaseModel;

    this.modelsByName[modelName] = newModelInstance;
    return this.get(modelName);
  }

  /**
   * Removes a specific model from the state.
   *
   * @param modelName - The name of the model to remove.
   */
  // eslint-disable-next-line ts/require-await
  async remove(modelName: string) {
    delete this.modelsByName[modelName];
  }

  /**
   * This method is used to initialized the models created inside the state, so what we do is that
   * first we recreate the state of the database using this model and after that we translate all of the
   * models to something that the engine instance is able to understand and interpret.
   *
   * @param engineInstance - The engine instance to use to initialize the models.
   */
  async initializeStateModels(engineInstance: DatabaseAdapter): Promise<InitializedModelsType[]> {
    const modelsInState = Object.values(this.modelsByName);
    const stateNumber = this.stateNumber;
    return initializeModels(
      engineInstance,
      modelsInState.map((stateModel) => {
        const ModelClass = class StateModel extends model() {
          static __isState = true;
          static __stateNumber = stateNumber;
          static _initialized = {};
          static __domainName = (stateModel.constructor as ModelType<any, any> & typeof BaseModel)['__domainName'];
          static __domainPath = (stateModel.constructor as ModelType<any, any> & typeof BaseModel)['__domainPath'];
          static __cachedOriginalName = (stateModel.constructor as any)['__cachedOriginalName'] as string;
          static __cachedName = (stateModel.constructor as any)['__cachedName'] as string;
          static __lazyFields = (stateModel.constructor as ModelType<any, any> & typeof BaseModel)['__lazyFields'];
          static __lazyOptions = (stateModel.constructor as ModelType<any, any> & typeof BaseModel)['__lazyOptions'];
          static __cachedOptions = undefined;
        };

        return ModelClass as any;
      })
    );
  }

  /**
   * Retrieves all of the models that were initialized in the state by it's original name.
   * By default we will duplicate the engine instance so we can initialize the models in the engine
   * instance without worrying if the names will crash with one another.
   *
   * For example: if we have a `StateUsers` model, we will return `Users` as the original name.
   *
   * Generally this should be used to send the models when running the migration files. We also send
   * a function called closeEngineInstance so we are able to close the connection to the database
   * after we are done with the migration.
   *
   * @param engineInstance - The engine instance that is being used, so we are able to duplicate it,
   * and close the connection afterwards.
   *
   * @return - Returns an object with the models that were initialized in the state and the engine
   * instance.
   */
  async getInitializedModelsByName(engineInstance: DatabaseAdapter) {
    let duplicatedEngineInstance: undefined | DatabaseAdapter = undefined;

    const wasDefaultDuplicateCalled = { value: false };
    if (engineInstance.duplicate === undefined)
      duplicatedEngineInstance = await defaultEngineDuplicate(engineInstance, wasDefaultDuplicateCalled)();
    else
      duplicatedEngineInstance = await engineInstance.duplicate(
        defaultEngineDuplicate(engineInstance, wasDefaultDuplicateCalled)
      );

    if (wasDefaultDuplicateCalled.value === false) throw new DefaultDuplicateFunctionNotCalledOnEngine();

    const closeEngineInstance = duplicatedEngineInstance.close?.bind(duplicatedEngineInstance);

    const wasInitialized = Object.keys(this.initializedModelsByName).length > 0;
    if (wasInitialized)
      return {
        initializedModels: this.initializedModelsByName,
        closeEngineInstance
      };

    const initializedModels = await this.initializeStateModels(duplicatedEngineInstance);

    for (const initializedModel of initializedModels) {
      this.initializedModelsByName[initializedModel.class['__originalName']()] = initializedModel;
    }
    return {
      initializedModels: this.initializedModelsByName,
      closeEngineInstance
    };
  }

  /**
   * The factory method that should be called to create a new instance of the state.
   * The state is used to keep track how the models were for every migration file. On the migration files
   * we know how the model was at a specific moment in time. The original models defined by the user in the
   * `models.ts` file will keep track of the state of the models at the current time, it's like a "picture"
   * of the models right now.
   *
   * When creating a new migration file automatically we need to know what the state were, and how it will be.
   * How it were we can get from the previous migrations, how it will be we can get from the "picture" of how it
   * is right now.
   *
   * @param foundMigrations - All of the migration files that were found for a specific engine instance.
   * @param untilMigration - Until what migration file we want to retrieve the state?
   * @param untilOperationIndex - Until what migration operation index we want to retrieve the state? For example
   * we can run the migration until the migration file `002_auto_create_users_table.ts` but on this migration we can
   * have multiple operations. This enables us to run the migration until the operation index `1` which is the
   * second operation in the migration file. This granularity is used for recreating the state when running the
   * migrations.
   *
   * @return - Returns the state instance that was created by traversing each migration file and operation in order.
   *
   */
  static async buildState(
    foundMigrations: FoundMigrationsFileType[],
    untilMigration?: string,
    untilOperationIndex?: number
  ) {
    const state = new this();
    for (const foundMigration of foundMigrations) {
      const isToBuildStateUntilThisMigration = foundMigration.migration.name === untilMigration;

      for (let i = 0; i < foundMigration.migration.operations.length; i++) {
        const isToBuildUntilOperationIndex = i === untilOperationIndex;
        if (isToBuildStateUntilThisMigration && isToBuildUntilOperationIndex) return state;

        const operation = foundMigration.migration.operations[i];
        await operation.stateForwards(state, foundMigration.domainName, foundMigration.domainPath);
      }

      if (isToBuildStateUntilThisMigration) return state;
    }
    return state;
  }
}
