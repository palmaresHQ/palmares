/* eslint-disable @typescript-eslint/no-unused-vars */
import Engine from '.';
import { Field } from '../models/fields';
import { Model } from '../models/model';
import { NotImplementedEngineException } from './exceptions';
import EngineFields from './fields';

/**
 * Used for translating a model from palmares to a model of the engine.
 */
export default class EngineModels {
  engine: Engine;
  engineFields: EngineFields;

  constructor(engine: Engine, engineFields: EngineFields) {
    this.engine = engine;
    this.engineFields = engineFields;
  }

  async translateOptions(model: Model): Promise<any> {
    if (this.engine.__ignoreNotImplementedErrors !== true) throw new NotImplementedEngineException('translateOptions');
  }

  async translateFields(fieldEntriesOfModel: [string, Field][], model: Model): Promise<any> {
    if (this.engine.__ignoreNotImplementedErrors !== true) throw new NotImplementedEngineException('translateFields');
  }

  async translate(model: Model): Promise<any> {
    const options = await this.translateOptions(model);
    const fields = await this.translateFields(Object.entries(model.fields), model);

    return {
      options,
      fields,
    };
  }
}
