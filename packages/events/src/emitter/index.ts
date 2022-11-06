/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotImplementedServerException } from './exceptions';

/**
 * This interface is supposed to be overriden by the library that we want to use the event emitter of.
 *
 * It could be an implementation using node.js, or by using the default browser behaviour and so on.
 */
export default class Emitter {
  static async new(...args: any[]): Promise<Emitter> {
    throw new NotImplementedServerException(this.name, 'new');
  }

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

  async emit(groupId: string, eventName: string, ...data: any) {
    throw new NotImplementedServerException(this.constructor.name, 'emit');
  }
}
