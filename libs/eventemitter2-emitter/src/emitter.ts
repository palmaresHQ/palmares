import { Emitter } from '@palmares/events';
import EventEmitter2 from 'eventemitter2';

export default class EventEmitter2Emitter extends Emitter {
  emitterInstance: EventEmitter2;

  constructor() {
    super();
    this.emitterInstance = new EventEmitter2();
  }

  async addEventListener(eventName: string, callback: (...args: any) => any) {
    this.emitterInstance.addListener(eventName, callback);
  }

  async removeEventListener(
    eventName: string,
    callback: (...args: any) => any
  ) {
    this.emitterInstance.removeListener(eventName, callback);
  }

  async emit(eventName: string, ...data: any): Promise<void> {
    this.emitterInstance.emit(eventName, ...data);
  }
}
