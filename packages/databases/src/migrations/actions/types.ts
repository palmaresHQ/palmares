import DatabaseAdapter from '../../engine';
import { Field } from '../../models/fields';
import { CustomImportsForFieldType } from '../../models/fields/types';
import { ModelFieldsType, ModelOptionsType } from '../../models/types';
import Migration from '../migrate/migration';
import { StateModelsConstructorType } from '../types';
import { Operation } from './operation';

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
  fieldDefinition: Field;
};

export type ChangeFieldToGenerateData = {
  fieldName: string;
  fieldDefinitionBefore: Field;
  fieldDefinitionAfter: Field;
  changedAttributes: string[];
};

export type RenameFieldToGenerateData = {
  fieldNameBefore: string;
  fieldNameAfter: string;
  fieldDefinition: Field;
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
