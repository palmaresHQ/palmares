import { Domain } from '@palmares/core';
import { DatabaseDomainInterface } from '@palmares/databases';

export default class CoreDomain
  extends Domain
  implements DatabaseDomainInterface
{
  constructor() {
    super(CoreDomain.name, __dirname);
  }

  async getModels() {
    return import('./models');
  }
}
