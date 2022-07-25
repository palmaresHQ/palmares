import Engine from "../../engine";
import { Operation } from "./operation";
import { Field } from "../../models/fields";
import {
  MigrationFromAndToStateModelType,
  ActionToGenerateType,
  CreateFieldToGenerateData,
  ChangeFieldToGenerateData,
  RenameFieldToGenerateData,
  DeleteFieldToGenerateData,
  ToStringFunctionReturnType
} from "./types";
import Migration from "../migrate/migration";
import State from "../state";

/**
 * This operation is used when a new field is created on a specific model. If the hole model is created
 * we will just use CreateModel instead.
 */
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

  static async toString(
    indentation: number = 0,
    data: ActionToGenerateType<CreateFieldToGenerateData>
  ): Promise<ToStringFunctionReturnType> {
    const ident = '  '.repeat(indentation);
    return {
      asString: await super.defaultToString(
        indentation-1,
        `${ident}"${data.modelName}",\n` +
        `${ident}"${data.data.fieldName}",\n` +
        `${await data.data.fieldDefinition.toString(indentation)}`
      ),
      customImports: await data.data.fieldDefinition.customImports()
    };
  }

  static async describe(
    data: ActionToGenerateType<CreateFieldToGenerateData>
  ): Promise<string> {
    return `Created the field '${data.data.fieldName}' on the '${data.modelName}' model`;
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

  static async toString(
    indentation: number = 0,
    data: ActionToGenerateType<ChangeFieldToGenerateData>
  ): Promise<ToStringFunctionReturnType> {
    const ident = '  '.repeat(indentation);
    return {
      asString: await super.defaultToString(
        indentation-1,
        `${ident}"${data.modelName}",\n` +
        `${ident}"${data.data.fieldName}",\n` +
        `${await data.data.fieldDefinitionBefore.toString(indentation)},\n` +
        `${await data.data.fieldDefinitionAfter.toString(indentation)}`
      ),
      customImports: (
        await data.data.fieldDefinitionBefore.customImports()
      ).concat(
        await data.data.fieldDefinitionAfter.customImports()
      )
    }
  }

  static async describe(
    data: ActionToGenerateType<ChangeFieldToGenerateData>
  ): Promise<string> {
    return `Changed one of the attributes of the '${data.data.fieldName}' field on the '${data.modelName}' model`;
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

  static async toGenerate(
    domainName: string,
    domainPath: string,
    modelName: string,
    data: RenameFieldToGenerateData
  ) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }

  static async toString(
    indentation: number = 0,
    data: ActionToGenerateType<RenameFieldToGenerateData>
  ): Promise<ToStringFunctionReturnType> {
    const ident = '  '.repeat(indentation);
    return {
      asString: await super.defaultToString(
        indentation-1,
        `${ident}"${data.modelName}",\n` +
        `${ident}"${data.data.fieldNameBefore}",\n` +
        `${ident}"${data.data.fieldNameAfter}",\n` +
        `${await data.data.fieldDefinition.toString(indentation)}`
      ),
      customImports: await data.data.fieldDefinition.customImports()
    };
  }

  static async describe(
    data: ActionToGenerateType<RenameFieldToGenerateData>
  ): Promise<string> {
    return `Renamed the field '${data.data.fieldNameBefore}' to '${data.data.fieldNameAfter}' on the '${data.modelName}' model`;
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

  static async toGenerate(
    domainName: string,
    domainPath: string,
    modelName: string,
    data: DeleteFieldToGenerateData
  ) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }

  static async toString(
    indentation: number = 0,
    data: ActionToGenerateType<DeleteFieldToGenerateData>
  ): Promise<ToStringFunctionReturnType> {
    const ident = '  '.repeat(indentation);
    return {
      asString: await super.defaultToString(
        indentation-1,
        `${ident}"${data.modelName}",\n` +
        `${ident}"${data.data.fieldName}"`
      )
    };
  }

  static async describe(
    data: ActionToGenerateType<DeleteFieldToGenerateData>
  ): Promise<string> {
    return `Removed the field '${data.data.fieldName}' on the '${data.modelName}' model`;
  }
}
