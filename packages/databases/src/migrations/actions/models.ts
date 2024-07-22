import { Operation } from './operation';
import { BaseModel } from '../../models';

import type {
  ActionToGenerateType,
  ChangeModelToGenerateData,
  CreateModelToGenerateData,
  RenameModelToGenerateData,
  ToStringFunctionReturnType,
} from './types';
import type DatabaseAdapter from '../../engine';
import type { ModelFieldsType, ModelOptionsType } from '../../models/types';
import type Migration from '../migrate/migration';
import type State from '../state';
import type { OriginalOrStateModelsByNameType } from '../types';


/**
 * This operation is used when you create a model in the application.
 * Whenever a new model appears that it does not appear
 * in the state, it will be understood that a new model had been created.
 * We are certain that a new model have been created if the number of models
 * from the state and the original increase in a factor of 1 or more.
 * If the number of models doesn't change we can't be sure.
 */
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

  async stateForwards(state: State, domainName: string, domainPath: string) {
    const model = await state.get(this.modelName);
    const modelConstructor = model.constructor as typeof BaseModel;

    modelConstructor.domainName = domainName;
    modelConstructor.domainPath = domainPath;
    model.fields = this.fields;
    model.options = this.options;
    state.set(this.modelName, model)
  }

  async run(
    migration: Migration,
    engineInstance: DatabaseAdapter,
    _: OriginalOrStateModelsByNameType,
    toState: OriginalOrStateModelsByNameType,
    returnOfInit: any
  ): Promise<void> {
    const toModel = toState[this.modelName];
    await engineInstance.migrations?.addModel(engineInstance, toModel, migration, returnOfInit);
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: CreateModelToGenerateData) {
    return await super.defaultToGenerate(domainName, domainPath, modelName, data);
  }

  static async toString(
    indentation = 0,
    data: ActionToGenerateType<CreateModelToGenerateData>
  ): Promise<ToStringFunctionReturnType> {
    const ident = '  '.repeat(indentation);
    const { asString: fieldsAsString, customImports } = await BaseModel._fieldsToString(indentation, data.data.fields);
    return {
      asString: await super.defaultToString(
        indentation - 1,
        `${ident}"${data.modelName}",\n` +
          `${fieldsAsString},\n` +
          `${await BaseModel._optionsToString(indentation, data.data.options)}`
      ),
      customImports: customImports,
    };
  }

  // eslint-disable-next-line ts/require-await
  static async describe(data: ActionToGenerateType<CreateModelToGenerateData>): Promise<string> {
    return `Create the model '${data.modelName}'`;
  }
}

/**
 * Operation that runs when a model is deleted. Similar to CreateModel, we know that the model
 * was deleted and it is on the previous state and not on the current state. We are certain that it
 * was deleted when the number of models decrease in a factor of 1 or more.
 */
export class DeleteModel extends Operation {
  modelName: string;

  constructor(modelName: string) {
    super();
    this.modelName = modelName;
  }

  async stateForwards(state: State, _domainName: string, _domainPath: string): Promise<void> {
    await state.remove(this.modelName);
  }

  async run(
    migration: Migration,
    engineInstance: DatabaseAdapter,
    fromState: OriginalOrStateModelsByNameType,
    _toState: OriginalOrStateModelsByNameType,
    returnOfInit: any
  ): Promise<void> {
    const fromModel = fromState[this.modelName];
    await engineInstance.migrations?.removeModel(engineInstance, fromModel, migration, returnOfInit);
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string) {
    return super.defaultToGenerate(domainName, domainPath, modelName, null);
  }

  static async toString(indentation = 0, data: ActionToGenerateType<null>): Promise<ToStringFunctionReturnType> {
    const ident = '  '.repeat(indentation);
    return {
      asString: await super.defaultToString(indentation - 1, `${ident}"${data.modelName}"`),
    };
  }

  // eslint-disable-next-line ts/require-await
  static async describe(data: ActionToGenerateType<null>): Promise<string> {
    return `Remove the model '${data.modelName}'`;
  }
}

/**
 * Operation that runs when the model had changed, not the fields but the options.
 *
 * If any of the custom options of the model had changed we will then create a migration
 * with this operation.
 */
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
    const modelConstructor = model.constructor as typeof BaseModel;

    modelConstructor.domainName = domainName;
    modelConstructor.domainPath = domainPath;

    model.options = this.optionsAfter;
  }

  async run(
    migration: Migration,
    engineInstance: DatabaseAdapter,
    fromState: OriginalOrStateModelsByNameType,
    toState: OriginalOrStateModelsByNameType,
    returnOfInit: any
  ) {
    const toModel = toState[this.modelName];
    const fromModel = fromState[this.modelName];
    await engineInstance.migrations?.changeModel(engineInstance, toModel, fromModel, migration, returnOfInit);
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: ChangeModelToGenerateData) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }

  static async toString(
    indentation = 0,
    data: ActionToGenerateType<ChangeModelToGenerateData>
  ): Promise<ToStringFunctionReturnType> {
    const ident = '  '.repeat(indentation);
    return {
      asString: await super.defaultToString(
        indentation - 1,
        `${ident}"${data.modelName}",\n` +
          `${await BaseModel._optionsToString(indentation, data.data.optionsBefore)},\n` +
          `${await BaseModel._optionsToString(indentation, data.data.optionsAfter)}`
      ),
    };
  }

  // eslint-disable-next-line ts/require-await
  static async describe(data: ActionToGenerateType<ChangeModelToGenerateData>): Promise<string> {
    return `Changed one or more options of the model '${data.modelName}' options`;
  }
}

/**
 * Operation used when the name of the model changes, it have any side effects besides
 * changing the name of the model. It's more needed and used for updating the state.
 */
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
    const modelConstructor = model.constructor as typeof BaseModel;

    (modelConstructor as any).__cachedName = this.newModelName;
    modelConstructor.domainName = domainName;
    modelConstructor.domainPath = domainPath;

    await Promise.all([state.set(this.newModelName, model), state.remove(this.oldModelName)]);
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: RenameModelToGenerateData) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }

  static async toString(
    indentation = 0,
    data: ActionToGenerateType<RenameModelToGenerateData>
  ): Promise<ToStringFunctionReturnType> {
    const ident = '  '.repeat(indentation);
    return {
      asString: await super.defaultToString(
        indentation - 1,
        `${ident}"${data.data.modelNameBefore}",\n` + `${ident}"${data.data.modelNameBefore}"`
      ),
    };
  }

  // eslint-disable-next-line ts/require-await
  static async describe(data: ActionToGenerateType<RenameModelToGenerateData>): Promise<string> {
    return `Renamed the model '${data.data.modelNameBefore}' to '${data.data.modelNameAfter}'`;
  }
}
