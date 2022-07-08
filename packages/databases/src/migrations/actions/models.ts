import Engine from "../../engine";
import { Operation } from "./operation";
import { ModelFieldsType, ModelOptionsType, } from "../../models/types";
import {
  CreateModelToGenerateData,
  ChangeModelToGenerateData,
  RenameModelToGenerateData,
  MigrationFromAndToStateModelType,
  ActionToGenerateType
} from "./types";
import Migration from "../migration";
import State from "../state";
import { dedent } from "../../utils";

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

  async run(
    migration: Migration,
    engineInstance: Engine,
    _: MigrationFromAndToStateModelType,
    toState: MigrationFromAndToStateModelType
  ): Promise<void> {
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

  static async toString(
    indentation: number = 0,
    data: ActionToGenerateType<CreateModelToGenerateData>
  ): Promise<string> {
    const ident = '  '.repeat(indentation);
    return `new actions.${this.name}(\n${ident}'${data.modelName}',\n${ident}{\n${await this.getAllAttributesAsString(indentation + 1, data)}${ident}}\n)`;
  }

  static async getAllAttributesAsString(
    indentation: number = 0,
    data: ActionToGenerateType<CreateModelToGenerateData>
  ): Promise<string> {
    const allFields = Object.entries(data.data.fields);
    const stringifiedFields = [];
    for (const [fieldName, field] of allFields) {
      stringifiedFields.push(`${'  '.repeat(indentation)}${fieldName}: ${await field.toStringForMigration(indentation + 1)},\n`);
    }
    return `${stringifiedFields.join('')}`
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
    fromState: MigrationFromAndToStateModelType,
    _: MigrationFromAndToStateModelType
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

  async run(
    migration: Migration,
    engineInstance: Engine,
    fromState: MigrationFromAndToStateModelType,
    toState: MigrationFromAndToStateModelType
  ) {
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
