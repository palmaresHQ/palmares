import { Model } from '../../models'
import { MigrationFileType } from '../types';
import { InitializedModelsType } from '../../types';

export default class MakeMigrations {
  #originalModelsByName: {
    [modelName: string]: InitializedModelsType;
  }
  #stateModelsByName: {
    [modelName: string]: InitializedModelsType;
  }

  constructor(originalModels: InitializedModelsType[], stateModels: InitializedModelsType[]) {
    this.#originalModelsByName = {};
    this.#stateModelsByName = {};

    for (const originalModel of originalModels) {
      this.#originalModelsByName[originalModel.original.originalName] = originalModel;
    }

    for (const stateModel of stateModels) {
      this.#stateModelsByName[stateModel.original.originalName] = stateModel;
    }
  }

  async run() {
    console.log(this.#originalModelsByName);
    console.log(this.#stateModelsByName);
  }
}
