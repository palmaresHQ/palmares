/* eslint-disable @typescript-eslint/no-unused-vars */
import type Engine from '.';
import { Field } from '../models/fields';
import { Model } from '../models/model';
import { NotImplementedEngineException } from './exceptions';
import EngineFields from './fields';

/**
 * Used for translating a model from palmares to a model of the engine.
 */
export default class EngineModels {
  async translateOptions(_engine: Engine, _model: Model): Promise<any> {
    throw new NotImplementedEngineException('translateOptions');
  }

  async translateFields(
    _engine: Engine,
    _fieldEntriesOfModel: [string, Field][],
    _model: Model,
    _defaultGetTranslatedFieldCallback: (_field: Field) => Promise<any>
  ): Promise<any> {
    throw new NotImplementedEngineException('translateFields');
  }

  async translate(
    _engine: Engine,
    _model: Model,
    _defaultTranslateCallback: () => Promise<{ options: any; fields: any }>,
    _defaultGetTranslatedFieldCallback: (_field: Field) => Promise<any>
  ): Promise<any> {
    throw new NotImplementedEngineException('translate');
  }
}
