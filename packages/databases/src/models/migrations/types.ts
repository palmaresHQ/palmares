import Model from "../model"
import { ModelFieldsType, ModelOptionsType } from "../types";

export type StateModelsType = {
  [modelName: string]: Model;
}

export type ActionToGenerateType<T> = {
  action: string,
  domainName: string,
  domainPath: string,
  modelName: string,
  order: number,
  dependsOn: string[],
  data: T
}

export type CreateModelToGenerateData = {
  fields: ModelFieldsType,
  options: ModelOptionsType
}

export type ChangeModelToGenerateData = {
  optionsBefore: ModelOptionsType;
  optionsAfter: ModelOptionsType;
};

export type RenameModelToGenerateData = {
  modelNameBefore: string;
  modelNameAfter: string;
};
