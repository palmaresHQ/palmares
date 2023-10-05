import { NotImplementedEngineException } from '../exceptions';

export default class EngineOrdering {
  async parseOrdering(ordering: (`${string}` | `-${string}`)[]): Promise<any> {
    throw new NotImplementedEngineException('parseOrdering');
  }
}
