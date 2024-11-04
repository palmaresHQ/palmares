import type { Operation } from './operation';
import type { DatabaseAdapter } from '../../engine';
import type { Field } from '../../models/fields';
import type { CustomImportsForFieldType } from '../../models/fields/types';
import type { ModelFieldsType, ModelOptionsType } from '../../models/types';
import type { Migration } from '../migrate/migration';
import type { StateModelsConstructorType } from '../types';

export type ActionToGenerateType<T> = {
  operation: typeof Operation;
  domainName: string;
  domainPath: string;
  modelName: string;
  order: number;
  dependsOn: string[];
  data: T;
};

export type CreateModelToGenerateData = {
  fields: ModelFieldsType;
  options: ModelOptionsType;
};

export type ChangeModelToGenerateData = {
  optionsBefore: ModelOptionsType;
  optionsAfter: ModelOptionsType;
};

export type RenameModelToGenerateData = {
  modelNameBefore: string;
  modelNameAfter: string;
};

export type CreateFieldToGenerateData = {
  fieldName: string;
  fieldDefinition: Field<any, any>;
};

export type ChangeFieldToGenerateData = {
  fieldName: string;
  fieldDefinitionBefore: Field<any, any>;
  fieldDefinitionAfter: Field<any, any>;
  changedAttributes: string[];
};

export type RenameFieldToGenerateData = {
  fieldNameBefore: string;
  fieldNameAfter: string;
  fieldDefinition: Field<any, any>;
};

export type DeleteFieldToGenerateData = {
  fieldName: string;
};

export type CodeFunctionType = (
  migration: Migration,
  engineInstance: DatabaseAdapter,
  stateModels: StateModelsConstructorType,
  returnOfInit: any
) => Promise<void> | void;

export type ToStringFunctionReturnType = {
  asString: string;
  customImports?: CustomImportsForFieldType[];
};
