import type { Domain } from '@palmares/core';

export type EventHandlerType = (...args: any[]) => any;
export type EventsDomainInterface = {
  getEvents: () => Promise<{
    [eventName: string]: EventHandlerType | { handler: EventHandlerType; withResult: boolean };
  }>;
} & Domain;
