import { FoundMigrationsFileType, StateModelsType, OriginalOrStateModelsByNameType } from './types';
import model, { Model } from '../models/model';
import { InitializedModelsType } from '../types';
import Engine from '../engine';
import { TModel } from '../models/types';
import { defaultEngineDuplicate } from '../engine/utils';
import { DefaultDuplicateFunctionNotCalledOnEngine } from './exceptions';

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
export default class State {
  modelsByName: StateModelsType = {};
  initializedModelsByName: OriginalOrStateModelsByNameType = {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Gets the model instance by a given model name. If the model does not exist
   * we will create a new model.
   *
   * @param modelName - The name of the model to get the model instance for.
   *
   * @returns - Returns a model instance with all of the fields and options.
   */
  async get(modelName: string): Promise<TModel> {
    const model = this.modelsByName[modelName];
    const doesModelExist = model && model.instance instanceof Model;
    if (doesModelExist) return model.instance;
    else return await this.newModel(modelName);
  }

  /**
   * Sets a new model in the state. Probably this is not needed because we are changing the values in place.
   * But since problems might occur we will keep it.
   *
   * @param modelName - The name of the model to set.
   * @param modifiedModel - The modified model instance to set.
   */
  async set(modelName: string, modifiedModel: TModel) {
    this.modelsByName[modelName].instance = modifiedModel;
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
  async newModel(modelName: string): Promise<Model> {
    const ModelClass = class StateModel extends model() {};
    const newModel = new ModelClass();
    newModel.name = modelName;
    newModel._isState = true;
    this.modelsByName[modelName] = {
      class: ModelClass,
      instance: newModel,
    };
    return this.get(modelName);
  }

  /**
   * Removes a specific model from the state.
   *
   * @param modelName - The name of the model to remove.
   */
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
  async initializeStateModels(engineInstance: Engine): Promise<InitializedModelsType[]> {
    const modelsInState = Object.values(this.modelsByName);
    const initializedStateModels: InitializedModelsType[] = [];
    for (const model of modelsInState) {
      initializedStateModels.push({
        domainName: model.instance.domainName,
        domainPath: model.instance.domainPath,
        class: model.class,
        initialized: await model.instance._init(engineInstance, model.instance.domainName, model.instance.domainPath),
        original: model.instance,
      });
    }
    return initializedStateModels;
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
  async geInitializedModelsByName(engineInstance: Engine) {
    let duplicatedEngineInstance: undefined | Engine = undefined;

    const wasDefaultDuplicateCalled = { value: false };
    duplicatedEngineInstance = await engineInstance.duplicate(
      defaultEngineDuplicate(engineInstance, wasDefaultDuplicateCalled)
    );
    if (wasDefaultDuplicateCalled.value === false) throw new DefaultDuplicateFunctionNotCalledOnEngine();

    const closeEngineInstance = duplicatedEngineInstance.close?.bind(duplicatedEngineInstance);

    const wasInitialized = Object.keys(this.initializedModelsByName).length > 0;
    if (wasInitialized)
      return {
        initializedModels: this.initializedModelsByName,
        closeEngineInstance,
      };

    const initializedModels = await this.initializeStateModels(duplicatedEngineInstance);
    for (const initializedModel of initializedModels) {
      this.initializedModelsByName[initializedModel.original.originalName] = initializedModel;
    }
    return {
      initializedModels: this.initializedModelsByName,
      closeEngineInstance,
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
