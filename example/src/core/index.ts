import { Domain } from '@palmares/core';
import { DatabaseDomainInterface } from '@palmares/databases';
import { EventsDomainInterface } from '@palmares/events';

export default class CoreDomain
  extends Domain
  implements DatabaseDomainInterface, EventsDomainInterface
{
  constructor() {
    super(CoreDomain.name, __dirname);
  }

  async getModels() {
    return import('./models');
  }

  async getEvents() {
    return import('./events');
  }
}
