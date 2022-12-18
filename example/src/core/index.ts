import { Domain } from '@palmares/core';
import { DatabaseDomainInterface } from '@palmares/databases';
import { EventsDomainInterface } from '@palmares/events';
import { ServerDomainInterface } from '@palmares/server';

export default class CoreDomain
  extends Domain
  implements
    DatabaseDomainInterface,
    EventsDomainInterface,
    ServerDomainInterface
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

  async getRoutes() {
    return import('./routes');
  }
}
