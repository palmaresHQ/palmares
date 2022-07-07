import Engine from "../../engine";
import { ModelFieldsType, ModelOptionsType, } from "../types";
import {
  ActionToGenerateType,
  StateModelsType,
  CreateModelToGenerateData,
  ChangeModelToGenerateData,
  RenameModelToGenerateData
} from "./types";
import Migration from "./migration";
import State from "./state";

/**
 * Actions are the operations that we do in each migration.
 *
 * Instead of needing to create a migration file with the changes we already did to the models
 * the database will look through all of the models and see the changes so we can apply the actions.
 *
 * The idea for migrations is that instead of creating a json with the state of the models
 * (other solutions made that: https://github.com/flexxnn/sequelize-auto-migrations)
 * what we do is that by creating our own migration files and models, we have full control over
 * what changed from one model to the other. And with that the migrations actually hold the state of
 * the models
 *
 * When we want to know what changed it's simple: just start from the first migration to the last and
 * modify the model based on that.
 *
 * By the end of the state generation we will probably have the same models.
 *
 * IMPORTANT: The order of the migrations is crucial for this to work, if you change the order of any of the
 * migrations it will crash.
 */
export class Operation {
  async stateForwards(state: State, domainName: string, domainPath: string) {}
  async run(migration: Migration, engineInstance: Engine, fromState: StateModelsType, toState: StateModelsType) {}
  static async defaultToGenerate<T>(domainName: string, domainPath: string, modelName: string, data: T): Promise<ActionToGenerateType<T>> {
    return {
      action: this.name,
      domainName: domainName,
      domainPath: domainPath,
      modelName: modelName,
      order: 0,
      dependsOn: [],
      data: data
    }
  }
}


export class CreateModel extends Operation {
  modelName: string;
  fields: ModelFieldsType;
  options: ModelOptionsType;

  constructor(modelName: string, fields: ModelFieldsType, options: ModelOptionsType = {}) {
    super();
    this.modelName = modelName;
    this.fields = fields;
    this.options = options;
  }

  async stateForwards(state: State, domainName: string, domainPath: string): Promise<void> {
    const model = await state.get(this.modelName);
    model.domainName = domainName;
    model.domainPath = domainPath;
    model.fields = this.fields;
    model.options = this.options;
  }

  async run(migration: Migration, engineInstance: Engine, _: StateModelsType, toState: StateModelsType): Promise<void> {
    const toModel = toState[this.modelName];
    await engineInstance.migrations.addModel(toModel, migration);
  }

  static async toGenerate(
    domainName: string,
    domainPath: string,
    modelName: string,
    data: CreateModelToGenerateData,
  ) {
    return await super.defaultToGenerate(domainName, domainPath, modelName, data);
  }
}


export class DeleteModel extends Operation {
  modelName: string;

  constructor(modelName: string) {
    super();
    this.modelName = modelName;
  }

  async stateForwards(state: State, domainName: string, domainPath: string): Promise<void> {
    await state.remove(this.modelName);
  }

  async run(
    migration: Migration,
    engineInstance: Engine,
    fromState: StateModelsType,
    _: StateModelsType
  ): Promise<void> {
    const fromModel = fromState[this.modelName];
    await engineInstance.migrations.removeModel(fromModel, migration)
  }

  static async toGenerate(
    domainName: string,
    domainPath: string,
    modelName: string
  ) {
    return super.defaultToGenerate(domainName, domainPath, modelName, null);
  }
}

export class ChangeModel extends Operation {
  modelName!: string;
  optionsBefore!: ModelOptionsType;
  optionsAfter!: ModelOptionsType;

  constructor(modelName: string, optionsBefore: ModelOptionsType, optionsAfter: ModelOptionsType) {
    super();
    this.modelName = modelName;
    this.optionsBefore = optionsBefore;
    this.optionsAfter = optionsAfter;
  }

  async stateForwards(state: State, domainName: string, domainPath: string): Promise<void> {
    const model = await state.get(this.modelName);
    model.domainName = domainName;
    model.domainPath = domainPath;
    model.options = this.optionsAfter;
  }

  async run(migration: Migration, engineInstance: Engine, fromState: StateModelsType, toState: StateModelsType): Promise<void> {
    const toModel = toState[this.modelName];
    const fromModel = fromState[this.modelName];
    await engineInstance.migrations.changeModel(toModel, fromModel, migration)
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: ChangeModelToGenerateData) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }
}

export class RenameModel extends Operation {
  oldModelName: string;
  newModelName: string;

  constructor(oldModelName: string, newModelName: string) {
    super();
    this.oldModelName = oldModelName;
    this.newModelName = newModelName;
  }

  async stateForwards(state: State, domainName: string, domainPath: string): Promise<void> {
    const model = await state.get(this.oldModelName);
    model.name = this.newModelName;
    model.domainName = domainName;
    model.domainPath = domainPath;
    await Promise.all([
      state.set(this.newModelName, model),
      state.remove(this.oldModelName)
    ]);
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: RenameModelToGenerateData) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }
}
