/* eslint-disable @typescript-eslint/no-unused-vars */
import type EngineQuery from '.';
import { NotImplementedEngineException } from '../exceptions';

export default class EngineOrdering {
  engineQueryInstance: EngineQuery;

  constructor(engineQueryInstance: EngineQuery) {
    this.engineQueryInstance = engineQueryInstance;
  }

  async parseOrdering(ordering: (`${string}` | `-${string}`)[]): Promise<any> {
    if (this.engineQueryInstance.engineInstance.__ignoreNotImplementedErrors)
      throw new NotImplementedEngineException('parseOrdering');
  }
}
