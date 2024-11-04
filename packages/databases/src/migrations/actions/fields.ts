import { Operation } from './operation';

import type {
  ActionToGenerateType,
  ChangeFieldToGenerateData,
  CreateFieldToGenerateData,
  DeleteFieldToGenerateData,
  RenameFieldToGenerateData,
  ToStringFunctionReturnType
} from './types';
import type { DatabaseAdapter } from '../../engine';
import type { BaseModel } from '../../models';
import type { Field } from '../../models/fields';
import type { Migration } from '../migrate/migration';
import type { State } from '../state';
import type { OriginalOrStateModelsByNameType } from '../types';

/**
 * This operation is used when a new field is created on a specific model. If the hole model is created
 * we will just use CreateModel instead.
 */
export class CreateField extends Operation {
  modelName: string;
  fieldName: string;
  fieldDefinition: Field<any, any>;

  constructor(modelName: string, fieldName: string, fieldDefinition: Field<any, any>) {
    super();
    this.modelName = modelName;
    this.fieldName = fieldName;
    this.fieldDefinition = fieldDefinition;
  }

  async stateForwards(state: State, domainName: string, domainPath: string): Promise<void> {
    const model = await state.get(this.modelName);
    const modelConstructor = model.constructor as typeof BaseModel;
    modelConstructor['__domainName'] = domainName;
    modelConstructor['__domainPath'] = domainPath;
    model.fields[this.fieldName] = this.fieldDefinition;
    await state.set(this.modelName, model);
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
    await engineInstance.migrations?.addField(
      engineInstance,
      toModel,
      fromModel,
      this.fieldName,
      migration,
      returnOfInit
    );
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: CreateFieldToGenerateData) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }

  static async toString(
    engine: DatabaseAdapter,
    indentation = 0,
    data: ActionToGenerateType<CreateFieldToGenerateData>
  ): Promise<ToStringFunctionReturnType> {
    const ident = '  '.repeat(indentation);
    return {
      asString: await super.defaultToString(
        indentation - 1,
        `${ident}"${data.modelName}",\n` +
          `${ident}"${data.data.fieldName}",\n` +
          `${await data.data.fieldDefinition['__toString'](engine)}`
      ),
      customImports: await data.data.fieldDefinition['__getCustomImports']()
    };
  }

  // eslint-disable-next-line ts/require-await
  static async describe(data: ActionToGenerateType<CreateFieldToGenerateData>): Promise<string> {
    return `Created the field '${data.data.fieldName}' on the '${data.modelName}' model`;
  }
}

export class ChangeField extends Operation {
  modelName: string;
  fieldName: string;
  fieldDefinitionBefore: Field<any, any>;
  fieldDefinitionAfter: Field<any, any>;

  constructor(
    modelName: string,
    fieldName: string,
    fieldDefinitionBefore: Field<any, any>,
    fieldDefinitionAfter: Field<any, any>
  ) {
    super();
    this.modelName = modelName;
    this.fieldName = fieldName;
    this.fieldDefinitionBefore = fieldDefinitionBefore;
    this.fieldDefinitionAfter = fieldDefinitionAfter;
  }

  async stateForwards(state: State, domainName: string, domainPath: string) {
    const model = await state.get(this.modelName);
    const modelConstructor = model.constructor as typeof BaseModel;
    modelConstructor['__domainName'] = domainName;
    modelConstructor['__domainPath'] = domainPath;
    model.fields[this.fieldName] = this.fieldDefinitionAfter;
    await state.set(this.modelName, model);
  }

  async run(
    migration: Migration,
    engineInstance: DatabaseAdapter,
    fromState: OriginalOrStateModelsByNameType,
    toState: OriginalOrStateModelsByNameType,
    returnOfInit: any
  ) {
    const fromModel = fromState[this.modelName];
    const toModel = toState[this.modelName];
    await engineInstance.migrations?.changeField(
      engineInstance,
      toModel,
      fromModel,
      this.fieldDefinitionBefore,
      this.fieldDefinitionAfter,
      migration,
      returnOfInit
    );
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: ChangeFieldToGenerateData) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }

  static async toString(
    engine: DatabaseAdapter,
    indentation = 0,
    data: ActionToGenerateType<ChangeFieldToGenerateData>
  ): Promise<ToStringFunctionReturnType> {
    const ident = '  '.repeat(indentation);
    return {
      asString: await super.defaultToString(
        indentation - 1,
        `${ident}"${data.modelName}",\n` +
          `${ident}"${data.data.fieldName}",\n` +
          `${await data.data.fieldDefinitionBefore['__toString'](engine)},\n` +
          `${await data.data.fieldDefinitionAfter['__toString'](engine)}`
      ),
      customImports: (await data.data.fieldDefinitionBefore['__getCustomImports']()).concat(
        await data.data.fieldDefinitionAfter['__getCustomImports']()
      )
    };
  }

  // eslint-disable-next-line ts/require-await
  static async describe(data: ActionToGenerateType<ChangeFieldToGenerateData>): Promise<string> {
    return `Changed the ${`attribute${data.data.changedAttributes.length > 1 ? 's' : ''} ${data.data.changedAttributes
      .map((attribute) => `'${attribute}'`)
      .join(', ')
      .replace(/,(?!.*,)/, ' and')}`} of the '${data.data.fieldName}' field on the '${data.modelName}' model`;
  }
}

export class RenameField extends Operation {
  modelName: string;
  fieldNameBefore: string;
  fieldNameAfter: string;
  fieldDefinition: Field<any, any>;

  constructor(modelName: string, fieldNameBefore: string, fieldNameAfter: string, fieldDefinition: Field<any, any>) {
    super();
    this.modelName = modelName;
    this.fieldNameBefore = fieldNameBefore;
    this.fieldNameAfter = fieldNameAfter;
    this.fieldDefinition = fieldDefinition;
  }

  async stateForwards(state: State, domainName: string, domainPath: string) {
    const model = await state.get(this.modelName);
    const modelConstructor = model.constructor as typeof BaseModel;
    modelConstructor['__domainName'] = domainName;
    modelConstructor['__domainPath'] = domainPath;

    const hasNamesReallyChanged = this.fieldNameAfter !== this.fieldNameBefore;
    if (hasNamesReallyChanged) {
      model.fields[this.fieldNameAfter] = model.fields[this.fieldNameBefore];
      delete model.fields[this.fieldNameBefore];
    }

    model.fields[this.fieldNameAfter] = this.fieldDefinition;
    await state.set(this.modelName, model);
  }

  async run(
    migration: Migration,
    engineInstance: DatabaseAdapter,
    fromState: OriginalOrStateModelsByNameType,
    toState: OriginalOrStateModelsByNameType,
    returnOfInit: any
  ): Promise<void> {
    const fromModel = fromState[this.modelName];
    const toModel = toState[this.modelName];
    await engineInstance.migrations?.renameField(
      engineInstance,
      toModel,
      fromModel,
      this.fieldNameBefore,
      this.fieldNameAfter,
      migration,
      returnOfInit
    );
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: RenameFieldToGenerateData) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }

  static async toString(
    engine: DatabaseAdapter,
    indentation = 0,
    data: ActionToGenerateType<RenameFieldToGenerateData>
  ): Promise<ToStringFunctionReturnType> {
    const ident = '  '.repeat(indentation);
    return {
      asString: await super.defaultToString(
        indentation - 1,
        `${ident}"${data.modelName}",\n` +
          `${ident}"${data.data.fieldNameBefore}",\n` +
          `${ident}"${data.data.fieldNameAfter}",\n` +
          `${await data.data.fieldDefinition['__toString'](engine)}`
      ),
      customImports: await data.data.fieldDefinition['__getCustomImports']()
    };
  }

  // eslint-disable-next-line ts/require-await
  static async describe(data: ActionToGenerateType<RenameFieldToGenerateData>): Promise<string> {
    return (
      `Renamed the field '${data.data.fieldNameBefore}' to ` +
      `'${data.data.fieldNameAfter}' on the '${data.modelName}' model`
    );
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
    const modelConstructor = model.constructor as typeof BaseModel;
    modelConstructor['__domainName'] = domainName;
    modelConstructor['__domainPath'] = domainPath;

    delete model.fields[this.fieldName];
    await state.set(this.modelName, model);
  }

  async run(
    migration: Migration,
    engineInstance: DatabaseAdapter,
    fromState: OriginalOrStateModelsByNameType,
    toState: OriginalOrStateModelsByNameType,
    returnOfInit: any
  ) {
    const fromModel = fromState[this.modelName];
    const toModel = toState[this.modelName];
    await engineInstance.migrations?.removeField(
      engineInstance,
      toModel,
      fromModel,
      this.fieldName,
      migration,
      returnOfInit
    );
  }

  static async toGenerate(domainName: string, domainPath: string, modelName: string, data: DeleteFieldToGenerateData) {
    return super.defaultToGenerate(domainName, domainPath, modelName, data);
  }

  static async toString(
    _engine: DatabaseAdapter,

    indentation = 0,
    data: ActionToGenerateType<DeleteFieldToGenerateData>
  ): Promise<ToStringFunctionReturnType> {
    const ident = '  '.repeat(indentation);
    return {
      asString: await super.defaultToString(
        indentation - 1,
        `${ident}"${data.modelName}",\n` + `${ident}"${data.data.fieldName}"`
      )
    };
  }

  // eslint-disable-next-line ts/require-await
  static async describe(data: ActionToGenerateType<DeleteFieldToGenerateData>): Promise<string> {
    return `Removed the field '${data.data.fieldName}' on the '${data.modelName}' model`;
  }
}
