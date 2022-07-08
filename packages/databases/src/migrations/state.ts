import { StateModelsType } from "./types";
import Model from "../models/model";

export default class State {
  modelsByName: StateModelsType = {};

  async get(modelName: string): Promise<Model> {
    const model = this.modelsByName[modelName]
    const doesModelExist = model instanceof Model;
    if (doesModelExist) return model;
    else return await this.newModel(modelName);
  }

  async set(modelName: string, modifiedModel: Model) {
    this.modelsByName[modelName] = modifiedModel;
  }

  async newModel(modelName: string): Promise<Model> {
    const newModel = new Model();
    newModel.name = modelName;
    this.modelsByName[modelName] = newModel;
    return this.get(modelName);
  }

  async remove(modelName: string) {
    delete this.modelsByName[modelName];
  }
}
