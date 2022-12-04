import { Domain } from '@palmares/core';

type EventHandlerType = (...args: any[]) => any;
export type EventsDomainInterface = {
  getEvents: () => Promise<
    ReturnType<EventHandlerType>[] | { [modelName: string]: EventHandlerType }
  >;
} & Domain;
