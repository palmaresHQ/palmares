/* eslint-disable @typescript-eslint/no-unused-vars */
import { Emitter } from '@palmares/events';
import { createClient, RedisClientType } from 'redis';

export default class RedisEmitter extends Emitter {
  client!: RedisClientType;
  subscriber!: RedisClientType;
  publisher!: RedisClientType;

  static async new(url: string) {
    const instance = new this();
    instance.client = createClient({
      url,
    });
    instance.client.on('error', (err) =>
      console.log('Redis Client Error', err)
    );

    await instance.client.connect();
    instance.publisher = instance.client.duplicate();
    instance.subscriber = instance.client.duplicate();

    await instance.publisher.connect();
    await instance.subscriber.connect();
    return instance;
  }

  async addEventListener(
    groupId: string,
    eventName: string,
    callback: (...args: any) => any
  ) {
    await this.subscriber.subscribe(eventName, (data) => {
      callback(...JSON.parse(data));
    });
  }

  async removeEventListener(
    groupId: string,
    eventName: string,
    callback: (...args: any) => any
  ) {
    await this.subscriber.unsubscribe(eventName);
  }

  async emit(groupId: string, eventName: string, ...data: any): Promise<void> {
    await this.publisher.publish(eventName, JSON.stringify(data));
  }
}
