import EngineFields from './fields';
import Engine from '.';

export type EngineInitializedModels<M = unknown> = {
  [key: string]: M | undefined;
};

export type EngineType = {
  connectionName: string;
  fields: EngineFields;
};

export type EngineFieldsType = {
  engineInstance: Engine;
};
