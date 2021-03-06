import { FoundMigrationsFileType, StateModelsType, OriginalOrStateModelsByNameType } from "./types";
import model, { Model } from "../models/model";
import { InitializedModelsType } from "../types";
import Engine from "../engine";
import { TModel } from "../models/types";

export default class State {
  modelsByName: StateModelsType = {};
  initializedModelsByName: OriginalOrStateModelsByNameType = {};

  /**
   * Gets the model instance by a given model name. If the model does not exist
   * we will create a new model.
   *
   * @param modelName - The name of the model to get the model instance for.
   *
   * @returns - Returns a model instance with all of the fields and options.
   */
  async get(modelName: string): Promise<TModel> {
    const model = this.modelsByName[modelName]
    const doesModelExist = model && model.instance instanceof Model;
    if (doesModelExist) return model.instance;
    else return await this.newModel(modelName);
  }

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
   * @return - Returns the newly created model. We use the .get method because if we have any sideeffects to the
   * model we will also run them.
   */
  async newModel(modelName: string): Promise<Model> {
    const ModelClass = class StateModel extends model() {};
    const newModel = new ModelClass();
    newModel.name = modelName;
    newModel._isState = true;
    this.modelsByName[modelName] = {
      class: ModelClass,
      instance: newModel
    }
    return this.get(modelName);
  }

  async remove(modelName: string) {
    delete this.modelsByName[modelName];
  }

  async initializeModels(engineInstance: Engine): Promise<InitializedModelsType[]> {
    const modelsInState = Object.values(this.modelsByName);
    const initializedStateModels: InitializedModelsType[] = [];
    for (const model of modelsInState) {
      initializedStateModels.push({
        domainName: model.instance.domainName,
        domainPath: model.instance.domainPath,
        class: model.class,
        initialized: await model.instance._init(
          model.class,
          engineInstance,
          model.instance.domainName,
          model.instance.domainPath,
        ),
        original: model.instance
      });
    }
    return initializedStateModels
  }

  async geInitializedModelsByName(engineInstance: Engine) {
    const duplicatedEngineInstance = await engineInstance.duplicate();
    const closeEngineInstance = duplicatedEngineInstance.close.bind(duplicatedEngineInstance);

    const wasInitialized = Object.keys(this.initializedModelsByName).length > 0;
    if (wasInitialized) return {
      initializedModels: this.initializedModelsByName,
      closeEngineInstance
    };

    const initializedModels = await this.initializeModels(duplicatedEngineInstance);
    for (const initializedModel of initializedModels) {
      this.initializedModelsByName[initializedModel.original.originalName] = initializedModel;
    }
    return {
      initializedModels: this.initializedModelsByName,
      closeEngineInstance
    };
  }

  static async buildState(
    foundMigrations: FoundMigrationsFileType[],
    untilMigration?: string,
    untilOperationIndex?: number
  ) {
    const state = new State();

    for (const foundMigration of foundMigrations) {
      const isToBuildStateUntilThisMigration = foundMigration.migration.name === untilMigration;

      for (let i = 0; i<foundMigration.migration.operations.length; i++) {
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
