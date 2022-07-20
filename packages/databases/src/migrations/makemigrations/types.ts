import { InitializedModelsType } from "../../types";

export type FieldOrModelParamType = 'field' | 'model';

export type OriginalOrStateModelsType = {
  [modelName: string]: InitializedModelsType;
};
