import { NotImplementedServerException } from './exceptions';

/**
 * This interface is supposed to be overriden by the library that we want to use the event emitter of.
 *
 * It could be an implementation using node.js, or by using the default browser behaviour and so on.
 */
export default class Emitter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addEventListener(eventName: string, callback: (...args: any) => any) {
    throw new NotImplementedServerException(
      this.constructor.name,
      'addEventListener'
    );
  }

  async removeEventListener(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    eventName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    callback: (...args: any) => any
  ) {
    throw new NotImplementedServerException(
      this.constructor.name,
      'unsubscribe'
    );
  }

  async emit(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    eventName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...data: any
  ) {
    throw new NotImplementedServerException(this.constructor.name, 'emit');
  }
}
