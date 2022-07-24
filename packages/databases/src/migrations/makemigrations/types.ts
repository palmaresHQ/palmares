import { InitializedModelsType } from "../../types";

export type FieldOrModelParamType = 'field' | 'model';

export type OriginalOrStateModelsType = {
  [modelName: string]: InitializedModelsType;
};

export type EmptyOptionsOnGenerateFilesType = {
  onDomain: string,
  previousMigrationName?: string
}
