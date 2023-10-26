import { NotImplementedAdapterException } from '../exceptions';

export default class EngineOrdering {
  async parseOrdering(ordering: (`${string}` | `-${string}`)[]): Promise<any> {
    throw new NotImplementedAdapterException('parseOrdering');
  }
}
