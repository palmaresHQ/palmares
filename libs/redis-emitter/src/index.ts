/* eslint-disable @typescript-eslint/no-unused-vars */
import { Emitter } from '@palmares/events';
import {
  createClient,
  RedisClientType,
  RedisModules,
  RedisFunctions,
  RedisScripts,
  RedisClientOptions,
} from 'redis';

export default class RedisEmitter<
  M extends RedisModules,
  F extends RedisFunctions,
  S extends RedisScripts
> extends Emitter {
  options!: RedisClientOptions<M, F, S>;
  client!: RedisClientType<M, F, S>;
  subscriber!: RedisClientType<M, F, S>;
  publisher!: RedisClientType<M, F, S>;
  handlers: Set<(...data: any[]) => any> = new Set();
  private static __instance: RedisEmitter<
    RedisModules,
    RedisFunctions,
    RedisScripts
  >;

  static async new<
    M extends RedisModules,
    F extends RedisFunctions,
    S extends RedisScripts
  >(options: RedisClientOptions<M, F, S>) {
    const doesInstanceExistsAndAreTheSameOptions =
      this.__instance &&
      JSON.stringify(this.__instance.options) === JSON.stringify(options);
    if (doesInstanceExistsAndAreTheSameOptions) return this.__instance;

    const instance = new this();
    instance.options = options;
    instance.client = createClient<M, F, S>(options);

    await instance.initialize();

    this.__instance = instance;

    return instance as RedisEmitter<M, F, S>;
  }

  async initialize() {
    await this.defineRedisErrors();
    await this.client.connect();
    this.publisher = this.client.duplicate();
    this.subscriber = this.client.duplicate();
    await Promise.all([this.publisher.connect(), this.subscriber.connect()]);
  }

  async defineRedisErrors() {
    this.client.on('error', (err) =>
      console.error('RedisEmitter Client Error', err)
    );
  }

  /**
   * We save inside of this class all of the functions that are added as listener, this way we can blacklist them
   * from the set to take it out to not be handled anymore.
   *
   * @param groupId - The id of the group that we want to listen to (this is useful for local emitters)
   * @param eventName - The name of the event that is being fired (the actual key)
   * @param callback - The function that will be called when the event is fired.
   */
  async addEventListener(
    groupId: string,
    eventName: string,
    callback: (...args: any) => any
  ) {
    this.handlers.add(callback);
    await this.subscriber.subscribe(eventName, (data) => {
      const canHandleEvent = this.handlers.has(callback);
      if (canHandleEvent) callback(...JSON.parse(data));
    });
  }

  async removeEventListener(
    groupId: string,
    eventName: string,
    callback: (...args: any) => any
  ) {
    const willBeEmptyHandlers = this.handlers.size <= 1;
    this.handlers.delete(callback);
    if (willBeEmptyHandlers) await this.subscriber.unsubscribe(eventName);
  }

  async emit(groupId: string, eventName: string, ...data: any): Promise<void> {
    await this.publisher.publish(eventName, JSON.stringify(data));
  }
}
