import { NotImplementedServerException } from './exceptions';

/**
 * This interface is supposed to be overriden by the library that we want to use the event emitter of.
 *
 * It could be an implementation using node.js, or by using the default browser behaviour and so on.
 */
export default class Emitter {
  // eslint-disable-next-line ts/require-await
  static async new(...args: any[]): Promise<Emitter> {
    throw new NotImplementedServerException(this.name, 'new');
  }

  // eslint-disable-next-line ts/require-await
  async addEventListener(
    groupId: string,
    eventName: string,
    callback: (...args: any) => any
  ) {
    throw new NotImplementedServerException(
      this.constructor.name,
      'addEventListener'
    );
  }

  // eslint-disable-next-line ts/require-await
  async removeEventListener(
    groupId: string,
    eventName: string,
    callback: (...args: any) => any
  ) {
    throw new NotImplementedServerException(
      this.constructor.name,
      'unsubscribe'
    );
  }

  // eslint-disable-next-line ts/require-await
  async emit(groupId: string, eventName: string, ...data: any) {
    throw new NotImplementedServerException(this.constructor.name, 'emit');
  }
}
