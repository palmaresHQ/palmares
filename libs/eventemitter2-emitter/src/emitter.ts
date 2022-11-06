import { Emitter } from '@palmares/events';
import EventEmitter2 from 'eventemitter2';

export default class EventEmitter2Emitter extends Emitter {
  emitterInstance: EventEmitter2;

  constructor() {
    super();
    const eventemitter2Instance = new EventEmitter2();
    this.emitterInstance = eventemitter2Instance;
  }

  static async new() {
    const instance = new this();
    return instance;
  }

  async addEventListener(
    groupId: string,
    eventName: string,
    callback: (...args: any) => any
  ) {
    this.emitterInstance.addListener(groupId, callback);
  }

  async removeEventListener(
    groupId: string,
    eventName: string,
    callback: (...args: any) => any
  ) {
    this.emitterInstance.removeListener(groupId, callback);
  }

  async emit(groupId: string, eventName: string, ...data: any): Promise<void> {
    this.emitterInstance.emit(groupId, ...data);
  }
}
