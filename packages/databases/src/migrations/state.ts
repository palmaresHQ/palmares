import { FoundMigrationsFileType, StateModelsType } from "./types";
import Model from "../models/model";
import { InitializedModelsType } from "../types";
import Engine from "../engine";

export default class State {
  modelsByName: StateModelsType = {};

  /**
   * Gets the model instance by a given model name. If the model does not exist
   * we will create a new model.
   *
   * @param modelName - The name of the model to get the model instance for.
   *
   * @returns - Returns a model instance with all of the fields and options.
   */
  async get(modelName: string): Promise<Model> {
    const model = this.modelsByName[modelName]
    const doesModelExist = model && model.instance instanceof Model;
    if (doesModelExist) return model.instance;
    else return await this.newModel(modelName);
  }

  async set(modelName: string, modifiedModel: Model) {
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
    const ModelClass = Model;
    const expression = `return class State${modelName} extends ModelClass {}`;
    const model = eval('(function() {' + expression + '}())');
    //eval(`(function() { class State${modelName} extends Model {} })`)
    //console.log(model);
    const newModel = new model();
    newModel.name = modelName;
    newModel._isState = true;
    this.modelsByName[modelName] = {
      class: model,
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

  static async buildState(
    foundMigrations: FoundMigrationsFileType[],
    untilMigration?: string,
    migrationIndex?: { from: undefined | number, to: undefined | number }
  ) {
    const state = new State();
    for (const foundMigration of foundMigrations) {
      const isToBuildStateUntilThisMigration = foundMigration.migration.name === untilMigration;
      if (isToBuildStateUntilThisMigration) break;

      for (let i = 0; i<foundMigration.migration.operations.length; i++) {
        const operation = foundMigration.migration.operations[i];
        await operation.stateForwards(state, foundMigration.domainName, foundMigration.domainPath);
      }
    }
    return state;
  }
}
