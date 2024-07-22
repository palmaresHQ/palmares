import type { EventsDomainInterface } from '../interfaces';
import type { EventsServer } from '../server';

/**
 * This is used for loading the events on the server.
 * The events will be loaded asynchronously. To append an event without worrying about the result you should send an object for each key of the event handler
 * like:
 *
 * ```
 * class MyDomain extends Domain implements EventsDomainInterface {
 *   async getEvents() {
 *      return {
 *         'hello': {
 *            handler: () => console.log('hello'),
 *            withResult: false,
 *          },
 *      };
 *   }
 * }
 * ```
 *
 * @param domains - The domains filtered out with only the domains that complies to EventDomainInterface interface.
 */
export async function loadEvents(server: EventsServer<any>, domains: EventsDomainInterface[]) {
  const promises = domains.map(async (eventsDomain) => {
    const events = await eventsDomain.getEvents();
    const eventsEntries = Object.entries(events);
    await Promise.all(
      eventsEntries.map(async ([eventName, eventHandlerOrObject]) => {
        let isWithResult = true;
        let eventHandler: (...args: any) => any;
        if (typeof eventHandlerOrObject !== 'function') {
          isWithResult = eventHandlerOrObject.withResult;
          eventHandler = eventHandlerOrObject.handler.bind(eventHandlerOrObject.handler);
        } else {
          eventHandler = eventHandlerOrObject.bind(eventHandlerOrObject);
        }
        if (isWithResult) await server.addEventListener(eventName, eventHandler);
        else await server.addEventListenerWithoutResult(eventName, eventHandler);
      })
    );
  });
  await Promise.all(promises);
}
