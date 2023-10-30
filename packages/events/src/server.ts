import Emitter from './emitter';
import EventEmitter from './events';
import { EventEmitterOptionsType } from './events/types';

let runningEventsServer: EventsServer<Emitter>;

/**
 * The idea of an event server is to keep the application running so that it can receive requests from other servers
 * and vice versa.
 *
 * It's kinda the same as how express works but the difference is that we do not start an http server and doesn't rely
 * on process.nextTick.
 *
 * IMPORTANT: This server is not tied to palmares, we create this here to wrap it around the actual EventsAppServer. The
 * idea is that this should not need to be tied to palmares and could work outside of it normally.
 */
export class EventsServer<E extends Emitter> extends EventEmitter<E> {
  #interval!: NodeJS.Timeout;
  #addEventListenerPromises: Promise<any>[] = [];

  /**
   * This is used for appending the promise of adding the event listener to an array so when we initialize the server
   * we can wait for all the callbacks to be appended and listen for events.
   */
  addEventListener(...params: Parameters<EventEmitter['addEventListener']>) {
    const addEventListenerPromise = super.addEventListener(...params);
    this.#addEventListenerPromises.push(addEventListenerPromise);
    return addEventListenerPromise;
  }

  /**
   * This is used for appending the promise of adding the event listener to an array so when we initialize the server
   * we can wait for all the callbacks to be appended and listen for events.
   */
  addEventListenerWithoutResult(...params: Parameters<EventEmitter['addEventListenerWithoutResult']>) {
    const addEventListenerPromise = super.addEventListenerWithoutResult(...params);
    this.#addEventListenerPromises.push(addEventListenerPromise);
    return addEventListenerPromise;
  }

  /**
   * Listens for a request and keeps the application running, see here:
   * https://stackoverflow.com/questions/23622051/how-to-forcibly-keep-a-node-js-process-from-terminating/47456805#47456805
   *
   * @param callback - Receives a function that should be called prior to starting the server.
   */
  async listen(callback: () => void) {
    await Promise.all(this.#addEventListenerPromises);
    this.#addEventListenerPromises = []; // remove the variable and let the Garbage Collector take care of it.
    callback();
    if (setInterval) {
      this.#interval = setInterval(() => {
        return;
      }, 1 << 30);
    }
  }

  /**
   * If an interval had been created then we use this function to remove it so the connection is not kept alive.
   *
   * Also we use this so we can unsubscribe everything from the layer and unsubscribe all of it's listeners.
   */
  async close() {
    const promises: Promise<void>[] = [];
    if (this.#interval) clearInterval(this.#interval);
    if (this.layer) promises.push(this.layer.unsubscribeAll());
    promises.push(this.unsubscribeAll());
    await Promise.all(promises);
  }
}

export default async function eventsServer<E extends typeof Emitter = typeof Emitter>(
  emitter: Promise<{ default: E }> | E,
  options?: EventEmitterOptionsType & {
    emitterParams?: Parameters<E['new']>;
  }
) {
  return EventsServer.new<E>(emitter, options) as Promise<EventsServer<InstanceType<E>>>;
}

export function setEventsServer(server: EventsServer<Emitter>) {
  runningEventsServer = server;
}

export function getEventsServer<E extends typeof Emitter = typeof Emitter>() {
  return runningEventsServer as EventsServer<InstanceType<E>>;
}
