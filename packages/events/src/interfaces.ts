import { Domain } from '@palmares/core';

type EventHandlerType = (...args: any[]) => any;
export type EventsDomainInterface = {
  getEvents: () => Promise<{
    [eventName: string]:
      | EventHandlerType
      | { handler: EventHandlerType; withResult: boolean };
  }>;
} & Domain;
