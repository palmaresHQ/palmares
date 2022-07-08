import Engine from "../../engine";
import { Operation } from "./operation";
import { Field } from "../../models/fields";
import {
  MigrationFromAndToStateModelType,
  CreateFieldToGenerateData,
  ChangeFieldToGenerateData,
  RenameFieldToGenerateData,
  DeleteFieldToGenerateData
} from "./types";
import Migration from "../migration";
import State from "../state";

export class CreateField extends Operation {
  modelName: string;
  fieldName: string;
  fieldDefinition: Field;

  constructor(modelName: string, fieldName: string, fieldDefinition: Field) {
    super();
    this.modelName = modelName;
    this.fieldName = fieldName;
    this.fieldDefinition = fieldDefinition;
  }

  async stateForwards(state: State, domainName: string, domainPath: string): Promise<void> {
    const model = await state.get(this.modelName);
    model.domainName = domainName;
    model.domainPath = domainPath;
    model.fields[this.fieldName] = this.fieldDefinition;
    await state.set(this.modelName, model);
  }

  async run(
    migration: Migration,
    engineInstance: Engine,
    fromState: MigrationFromAndToStateModelType,
    toState: MigrationFromAndToStateModelType
  ) {
    const toModel = toState[this.modelName];
    const fromModel = fromState[this.modelName];
    await engineInstance.migrations.addField(toModel, fromModel, this.fieldName, migration);
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: CreateFieldToGenerateData) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }
}

export class ChangeField extends Operation {
  modelName: string;
  fieldName: string;
  fieldDefinitionBefore: Field;
  fieldDefinitionAfter: Field;

  constructor(
    modelName: string,
    fieldName: string,
    fieldDefinitionBefore: Field,
    fieldDefinitionAfter: Field
  ) {
    super();
    this.modelName = modelName;
    this.fieldName = fieldName;
    this.fieldDefinitionBefore = fieldDefinitionBefore;
    this.fieldDefinitionAfter = fieldDefinitionAfter;
  }

  async stateForwards(state: State, domainName: string, domainPath: string) {
    const model = await state.get(this.modelName);
    model.domainName = domainName;
    model.domainPath = domainPath;
    model.fields[this.fieldName] = this.fieldDefinitionAfter;
    await state.set(this.modelName, model);
  }

  async run(
    migration: Migration,
    engineInstance: Engine,
    fromState: MigrationFromAndToStateModelType,
    toState: MigrationFromAndToStateModelType
  ) {
    const fromModel = fromState[this.modelName];
    const toModel = toState[this.modelName];
    await engineInstance.migrations.changeField(
      toModel, fromModel, this.fieldDefinitionBefore, this.fieldDefinitionAfter, migration
    );
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: ChangeFieldToGenerateData) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data)
  }
}

export class RenameField extends Operation {
  modelName: string;
  fieldNameBefore: string;
  fieldNameAfter: string;
  fieldDefinition: Field;

  constructor(
    modelName: string,
    fieldNameBefore: string,
    fieldNameAfter: string,
    fieldDefinition: Field,
  ) {
    super();
    this.modelName = modelName;
    this.fieldNameBefore = fieldNameBefore;
    this.fieldNameAfter = fieldNameAfter;
    this.fieldDefinition = fieldDefinition;
  }

  async stateForwards(state: State, domainName: string, domainPath: string) {
    const model = await state.get(this.modelName);
    model.domainName = domainName;
    model.domainPath = domainPath;

    const hasNamesReallyChanged = this.fieldNameAfter !== this.fieldNameBefore;
    if (hasNamesReallyChanged) {
      model.fields[this.fieldNameAfter] = model.fields[this.fieldNameBefore];
      delete model.fields[this.fieldNameBefore];
    }
    model.fields[this.fieldNameAfter] = this.fieldDefinition;
    await state.set(this.modelName, model);
  }

  async run(migration: Migration, engineInstance: Engine, fromState: MigrationFromAndToStateModelType, toState: MigrationFromAndToStateModelType): Promise<void> {
    const fromModel = fromState[this.modelName];
    const toModel = toState[this.modelName];
    await engineInstance.migrations.renameField(
      toModel, fromModel, this.fieldNameBefore, this.fieldNameAfter, migration
    )
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: RenameFieldToGenerateData) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }
}

export class DeleteField extends Operation {
  modelName: string;
  fieldName: string;

  constructor(modelName: string, fieldName: string) {
    super();
    this.modelName = modelName;
    this.fieldName = fieldName;
  }

  async stateForwards(state: State, domainName: string, domainPath: string): Promise<void> {
    const model = await state.get(this.modelName);
    model.domainName = domainName;
    model.domainPath = domainPath;
    delete model.fields[this.fieldName];
    await state.set(this.modelName, model);
  }

  async run(
    migration: Migration,
    engineInstance: Engine,
    fromState: MigrationFromAndToStateModelType,
    toState: MigrationFromAndToStateModelType
  ) {
    const fromModel = fromState[this.modelName];
    const toModel = toState[this.modelName];
    await engineInstance.migrations.deleteField(toModel, fromModel, this.fieldName, migration);
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: DeleteFieldToGenerateData) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }
}
