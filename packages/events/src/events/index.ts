import Emitter from '../emitter';
import { uuid } from '../utils';
import type {
  EventEmitterOptionsType,
  ResultWrappedCallbackType,
} from './types';

/**
 * This class is responsible for appending listeners (functions) and sending events to them
 * when needed.
 *
 * WHY THIS IS NEEDED SINCE NODE AND THE BROWSER HAS IT'S OWN EVENTS SYSTEM?
 * We do not try to change the default event system of node, or libraries like EventEmitter2,
 * instead we try to work with them.
 *
 * We use them to emit the events locally inside of the application but we use this class to emit
 * and listen to events distributed to multiple machines. For example, if we need to send an event
 * between one machine over the other we will need to append a layer to the event emitter. This layer
 * will receive an event and dispatch it to the responsible listeners. By default a layer is just another
 * event emitter. Who defines the behavior of the layer is the emitter and not the layer, so who defines
 * the listeners of this layer is the emitter by itself.
 *
 * >>> FOR MAINTAINERS <<<
 * This class can be kinda hard to debug, specially with layers on top of it, so we need to dissect it first
 * before you start working on it.
 *
 * - 1: Simple event/emitter:
 * When you initialize this class you need to pass an Emitter instance. Emitter will be the interface that we use
 * for pub/sub. Emitter can be for example Redis, EventEmitter2, node's EventEmitter from 'events'. This interface
 * will be available right below EventEmitter class/instance.
 * This means that all of the logic is extracted away from the emitter interface and should be implemented here. One
 * of those special logics are wildcards.
 * To save an event to the emitter like 'EventEmitter2' we will have some work to do. We don't save it `raw`,
 * but instead we save a representation of the event. First things first we need to separate it between groups and handlers.
 * - Groups:
 * T.L.D.R.: This is the name of the event.
 * a groupId is the name of the event, so for example: for the event 'create.user', we transform 'create.user' to
 * a uuid `124002c4-3719-4c9b-a88e-f743b67f1686`, this means that on the emitter what we will be firing is the `124002c4-3719-4c9b-a88e-f743b67f1686`
 * event and not directly `create.user`. In other words we need to guarantee that we do this conversion when firing the event.
 * To help us with that we use the `this.#groupByKeys`, this means that for `create.user`, or `create.**`, or `create.*` we need
 * to fire the emit action to the following groups. You will see that for most functions we just need to do
 *
 * ```ts
 * const key = `create.user`
 * const groupIdsToEmitEventTo = (this.#groupByKeys[key] || new Set()).values();
 * ```
 *
 * This guarantees that for the specific key we will call the emitters correctly. The nicest thing about doing this way is that
 * it's really easy to store this data since most of them are just strings so stuff like wildcards are like:
 *
 * ```ts
 * {
 *    'results-b35ab092-48f3-472f-be2c-48ee2ea0df91': Set(1) { '30e6d1c4-2470-4cff-8ccb-a48b6378dd67' },
 *    '**': Set(1) { 'ad14de8c-9104-4eaf-9c14-9c7384cc0473' },
 *    'create.**': Set(1) { 'ad14de8c-9104-4eaf-9c14-9c7384cc0473' },
 *    'create.*': Set(1) { 'ad14de8c-9104-4eaf-9c14-9c7384cc0473' },
 *    'create.user': Set(1) { 'ad14de8c-9104-4eaf-9c14-9c7384cc0473' }
 * }
 * ```
 *
 * You see that for `create.*`, 'create.**', 'create.user' we are pointing to the same group? That's the general idea.
 *
 * - Handlers:
 * Handlers are the functions, that is being called, it doesn't have any usage for the `emitter` instance. Our usage for it is internal
 * like for example removing a handler. Most APIs for event emitters work like:
 *
 * ```
 * const emitter = new EventEmitter2()
 *
 * const callback = (value1, value2) => {
 *    console.log(this.event, value1, value2);
 * }
 * emitter.on('foo', callback);
 * emitter.removeListener('foo', callback);
 * ```
 *
 * Do you see that we need to pass the function there to remove the listener? That's what we try to solve by storing it. By transforming
 * this handler to an id we can easily find for it with a O(n) algorithm that retrieves the handler and removes it. The other usage
 * of handlers is on results we will cover it on the next topic.
 *
 * - 2: Emitting an event and waiting for a result.
 * Your first though might be? WHAT, how's that even possible? We can't know an event has fired or even the result of it, specially
 * on distributed systems.
 *
 * That's not really magic it's really simple actually.
 * When we add a new listener you see that we wrap the function (callback) to another function (see #wrapInResultCallback).
 * What this function do is that it has a lifecycle, similar to a promise in javascript: `pending`, `completed`, `failed`.
 * What's the idea?
 * When we call the for example `emitter.emit('create.user', 1)` we will call this function after
 * creating a resultKey, the emitter by itself, when we initialize the class, will also hold a `resultsEventName`.
 * Why both? The second one is a listener, a listener that will only listen for results of this emitter. The second one
 * is needed because a single emitter can send multiple events at the same time, se we need to differ between them.
 *
 * Continuing on, we called `emitter.emit('create.user', 1)`, created the resultId, and sent the resultsEventName to the listener.
 * After calling we return to the user a promise, inside of this promise there will be a recursion that iterates over for
 * each tick of the event loop. (see #fetchResultForEmit). Inside of this promise be aware of `pingTimeout` and `resultsTimeout`.
 * Ping is how long we will wait to be notified that ""someone"" is working on the result, this is needed for cases when the
 * event simply don't exist so we don't wait for too long. The second one is `resultsTimeout`, as you might have guessed, means
 * how long we will wait for a result.
 *
 * Now let's jump to the listener itself, you see that the first thing we do is to emit an event TO THE `resultsEventName` (remember,
 * that's the listener for the results), this event will have the following structure: { status: string; data: any }
 * When the listener receives this event, it'll append this result to `#pendingResults` the Promise (that will not be resolved just yet),
 * will iterate over and it'll see that some listener is working on the response for this emit. When this finishes we enter the `waiting`
 * stage. So now we will wait until all pending results have finished or until we reach the resultsTimeout. This get's kinda complicated
 * when adding a layer.
 *
 * - 3: Layers, what makes this almost unstoppable and where things gets kinda complicated.
 * Layers are just EventEmitter instances, a layer will be able to make distributed systems fully in sync with each other. But how?
 * Generally speaking a layer will be using `RedisEmitter` or `KafkaEmitter` or basically any type of Pub/Sub or messaging service.
 *
 * A layer works by channels, channels enables the user to separate the logic between each of them, for example: if we have
 * have a chat, we might end up having multiple rooms, `room1` would be the first channel and `room2` would be the second channel.
 * If we want to broadcast an event to `room1` layer we can do that by just emitting the event to it. If we want `room2` to be broadcasted
 * we can send an event directly to it.
 * You will see that when layers are defined, emitting events are done inside of the layer, and not inside of the EventEmitter instance.
 * In other words, what we are doing is: Every event that will be emitted from the emitter will actually be sent to the layer. The layer broadcasts
 * the events to `room1` for example, `room1`  so we emit it, when we emit a broadcast will be fired, this message received it'll be
 * handled by
 *
 * ```
 * this.emitEventToEmitter
 * ```
 *
 * in other words, i'll be handled by the emitter (the local one) itself.
 *
 * This might become easier with an example:
 * - Call `emitter.emitToChannel(['birds', 'users'], 'create.user', { id: 1, name: 'Nicolas'})`
 * - Send the key ('create.user') and the data both to `bird` and `user` keys INSIDE of the layer
 * - `Bird` handler points to a function defined in birdsEmitter, so when we are receiving this value we are handling inside of `birdsEmitter`.
 * - on `birdsEmitter` instance, we get get the original key (so `create.user`) and we will be able to make it work normally as the layer didn't exist.
 * - When we notify about the response we follow the same thing.
 *
 * IMPORTANT: Your emitter cannot receive responses from channels it's not subscribed to.
 *
 * ```
 * const emitter = await EventEmitter.new(EventEmitter2Emitter, {
 *  layer: {
 *    use: layer,
 *    channels: ['birds'],
 *  },
 *  wildcards: { use: true },
 * });
 *
 * const result = await emitter.emitToChannel(['users', 'birds'], 'create.*'); // We totally ignore 'users channel' on this case
 * ```
 *
 * IMPORTANT: We can't rely on the data inside of this class, when working with events
 * we are working with distributed systems, the data might not be inside of here, so this means
 * a listener might be in other machine. So when working with them we do not have to rely too much on
 * internal data for the class.
 */
export default class EventEmitter<E extends Emitter = Emitter> {
  emitter: E;
  private layer?: EventEmitter;
  private resultsEventName!: string;
  #channels!: string[];
  #unsubscribeByChannel: Record<string, (...args: any) => any> = {};
  #pendingHandlerIdForResultKey: Map<string, string> = new Map();
  #pendingResults: Record<
    string,
    Record<string, { status: 'completed' | 'failed' | 'pending'; result: any }>
  > = {};
  #pingTimeout = 1000; // how much time we will wait for the listeners to respond that they are working on a response.
  #resultsTimeout = 5000; // Waits for 5 seconds for the result otherwise return undefined.
  #delimiter = '.';
  #wildcards = false;
  #groupByKeys: Record<string, Set<string>> = {};
  #groups: Record<
    string,
    { keys: Set<string>; listeners: Record<string, (...args: any) => any> }
  > = {};

  /**
   * Factory method for the building the emitter, we need this because we need to add results listener and layer listeners
   * to the function and both operations are async.
   *
   * Be aware that you need to pass the emitter, the constructor, and not the instance, you can pass the parameters of the emitter
   * inside of options: { customParams: <your_params_for_the_emitter> }
   *
   * @param emitter - The emitter constructor so we build it inside here or a default export by using `import('./my-custom-emitter.ts')`
   * @param options - Custom options for the emitter, on here you can pass a layer instance, wildcards options and customize
   * the timeout for the results to be retrieved.
   *
   * @returns - This is a factory method so we create a new EventEmitter instance.
   */
  static async new<E extends typeof Emitter = typeof Emitter>(
    emitter: Promise<{ default: E }> | E,
    options?: EventEmitterOptionsType & {
      emitterParams?: Parameters<E['new']>;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...custom: any[]
  ) {
    const { emitterParams, ...optionsForConstructor } = options || {};
    if (emitter instanceof Promise) emitter = (await emitter).default;
    const emitterCustomParams = emitterParams || [];
    const emitterInstance = await emitter.new(...emitterCustomParams);

    const eventEmitterInstance = new this(
      emitterInstance,
      optionsForConstructor
    ) as EventEmitter<InstanceType<E>>;

    // Define the results data so we can retrieve results for all of the handlers
    eventEmitterInstance.resultsEventName = `resultsOfEmitter-${uuid()}`;
    await eventEmitterInstance.addRawEventListenerWithoutResult(
      eventEmitterInstance.resultsEventName,
      eventEmitterInstance.resultsListener.bind(eventEmitterInstance)
    );

    if (options?.layer?.use) {
      eventEmitterInstance.layer = options.layer.use;
      await eventEmitterInstance.addChannelListeners(
        options?.layer.channels || ['all']
      );
    }

    return eventEmitterInstance;
  }

  constructor(emitterInstance: E, options?: EventEmitterOptionsType) {
    this.emitter = emitterInstance;
    if (options?.wildcards?.delimiter)
      this.#delimiter = options?.wildcards?.delimiter;
    if (options?.wildcards?.use) this.#wildcards = options?.wildcards?.use;
    if (typeof options?.results?.pingTimeout === 'number')
      this.#pingTimeout = options.results.pingTimeout;
    if (typeof options?.results?.timeout === 'number')
      this.#resultsTimeout = options.results.timeout;
    if (options?.layer?.channels) this.#channels = options.layer.channels;
  }

  /**
   * This is responsible fo retrieving the response of the emitted event, when the event
   * finishes processing it'll send a response to this function (this is handler for a specific
   * event inside of the event emitter).
   */
  private resultsListener(
    handlerId: string,
    resultId: string,
    _: string | null,
    result: any
  ) {
    const hasPendingResultsForId =
      typeof this.#pendingResults[resultId] === 'object' &&
      this.#pendingResults[resultId] !== undefined;
    if (hasPendingResultsForId)
      this.#pendingResults[resultId][handlerId] = result;
  }

  /**
   * Adds the event listener without the wildcards, self explanatory, so we will
   * not append the groupId to stuff like '*' or '**' or 'create.*'
   *
   * We just append the groupId to the key and that's it. It shouldn't be called directly
   * because there is no other reason for this instead of organizing the callback in the right keys.
   *
   * @param handlerGroupId - As explained, the groupId is the actual event that will be fired in the actual emitter.
   * @param handlerId - The id of the handler so we can retrieve the function quickly.
   * @param key - The actual key that the `handlerGroupId` refers to.
   * @param callback - The function (wrapped or not) that will be fired when we emit an event.
   */
  #addListenerWithoutWildcards(
    handlerGroupId: string,
    handlerId: string,
    key: string,
    callback: ResultWrappedCallbackType
  ) {
    if (key in this.#groupByKeys === false)
      this.#groupByKeys[key] = new Set([handlerGroupId]);

    if (this.#groups[handlerGroupId])
      this.#groups[handlerGroupId].listeners[handlerId] = callback;
    else {
      this.#groups[handlerGroupId] = {
        listeners: {
          [handlerId]: callback,
        },
        keys: new Set([key]),
      };
    }
  }

  #addListenerThatAlreadyExistsWithWildcards(
    handlerGroupId: string,
    handlerId: string,
    callback: ResultWrappedCallbackType
  ) {
    this.#groups[handlerGroupId].listeners[handlerId] = callback;
  }

  #addListenerWithWildcards(
    handlerGroupId: string,
    handlerId: string,
    key: string,
    callback: ResultWrappedCallbackType
  ) {
    // Add the group of events that will be fired.
    const splittedKey = key.split(this.#delimiter);
    const allKeysOfKey = ['**'];

    if (this.#groupByKeys['**']) this.#groupByKeys['**'].add(handlerGroupId);
    else this.#groupByKeys['**'] = new Set([handlerGroupId]);

    let appendedKey = '';
    for (let i = 0; i < splittedKey.length; i++) {
      const isLastKey = i === splittedKey.length - 1;
      const eachKey = splittedKey[i];
      const newAppendedKey = `${appendedKey}${
        i > 0 ? this.#delimiter : ''
      }${eachKey}`;

      if (isLastKey) {
        const wildCardLastKey = `${appendedKey}${
          i > 0 ? this.#delimiter : ''
        }*`;
        if (this.#groupByKeys[wildCardLastKey])
          this.#groupByKeys[wildCardLastKey].add(handlerGroupId);
        else this.#groupByKeys[wildCardLastKey] = new Set([handlerGroupId]);

        const completeKey = newAppendedKey;
        if (this.#groupByKeys[completeKey])
          this.#groupByKeys[completeKey].add(handlerGroupId);
        else this.#groupByKeys[completeKey] = new Set([handlerGroupId]);

        allKeysOfKey.push(wildCardLastKey, completeKey);
      } else {
        const deepNestedKey = `${newAppendedKey}${this.#delimiter}**`;
        if (this.#groupByKeys[deepNestedKey])
          this.#groupByKeys[deepNestedKey].add(handlerGroupId);
        else this.#groupByKeys[deepNestedKey] = new Set([handlerGroupId]);

        allKeysOfKey.push(deepNestedKey);
      }
      appendedKey = newAppendedKey;
    }

    if (this.#groups[handlerGroupId])
      this.#groups[handlerGroupId].listeners[handlerId] = callback;
    else {
      this.#groups[handlerGroupId] = {
        listeners: {
          [handlerId]: callback,
        },
        keys: new Set(allKeysOfKey),
      };
    }
  }

  /**
   * This will prevent that we call the same function for the same handler twice, it'll also nicely organize the data.
   * stuff like `resultsEventName`, `resultKey` and `channelLayer` should not be passed to the user defined callback.
   * It's for internal usage only, so you see that if `isResultWrapped` is false we will just pass the data to the
   * callback and nothing else.
   *
   * @param handlerId - The id of the handler that is being called.
   * @param callback - The function (wrapped or not) that will be called when we fire the event.
   * @param isResultWrapped - Boolean value, if it's result wrapped we will send the `resultsEventName`,
   * `resultKey`, `channelLayer` to the callback, otherwise we will just send the data. We try to not send unnecessary
   * data to the callback, all of the values should be used by the handler itself.
   *
   * @returns - Return the callback wrapped, so we can notify the class that we are working on a result for a particular
   * resultKey, this is nice so if the system receives multiple requests it won't do nothing.
   */
  async #wrapInPendingHandlerToPreventMultipleCalls(
    handlerId: string,
    callback: ResultWrappedCallbackType | ((...args: any) => any),
    isResultWrapped = true
  ) {
    const preventMultipleCallsWrappedCallback: ResultWrappedCallbackType =
      async (resultsEventName, resultKey, channelLayer, ...data) => {
        // Guarantee that we will only call the handler once, this is useful for layers we might send multiple times
        // because the same emitter might be attached to the same layer.
        const isThisHandlerAlreadyWorkingForAResponse =
          this.#pendingHandlerIdForResultKey.has(handlerId) &&
          this.#pendingHandlerIdForResultKey.get(handlerId) === resultKey;

        if (isThisHandlerAlreadyWorkingForAResponse === false) {
          this.#pendingHandlerIdForResultKey.set(handlerId, resultKey);
          if (isResultWrapped)
            await Promise.resolve(
              (callback as ResultWrappedCallbackType)(
                resultsEventName,
                resultKey,
                channelLayer,
                ...data
              )
            );
          else
            await Promise.resolve((callback as (...args: any) => any)(...data));
          this.#pendingHandlerIdForResultKey.delete(handlerId);
        }
      };
    return preventMultipleCallsWrappedCallback.bind(this);
  }

  /**
   * This works similar to a promise in javascript, what we do is that we send the emitter
   * that we are working on a response.
   *
   * When we work on a response we notify with `pending`, after the result is finished we notify
   * the result with `completed`. This is why we use the `resultsEventName` and `resultKey` for.
   * This way we are able to notify the emitter that we are working on a response for it.
   *
   * @param handlerId - We need the handlerId so we know that exactly that this handler that is
   * working on a response.
   */
  async #wrapInResultCallback(
    handlerId: string,
    callback: (...args: any) => any
  ) {
    const resultWrappedCallback: ResultWrappedCallbackType = async (
      resultsEventName,
      resultKey,
      channelLayer,
      ...data
    ) => {
      // Guarantee that we will only call the handler once, this is useful for layers we might send multiple times
      // because the same emitter might be attached to the same layer.
      this.emitResult(resultsEventName, handlerId, resultKey, channelLayer, {
        status: 'pending',
      });
      try {
        const result = await Promise.resolve(callback(...data));
        this.emitResult(resultsEventName, handlerId, resultKey, channelLayer, {
          status: 'completed',
          result,
        });
        // Emit the result back to the caller.
      } catch (e) {
        this.emitResult(resultsEventName, handlerId, resultKey, channelLayer, {
          status: 'failed',
        });
        throw e;
        // Emit an empty result back to the caller
      }
    };

    return this.#wrapInPendingHandlerToPreventMultipleCalls(
      handlerId,
      resultWrappedCallback.bind(this),
      true
    );
  }

  /**
   * This will subscribe a listener (function) to an specific event (key). When this key is emitted, either from a channel
   * or from the emitter itself, the listener (function) will be called.
   *
   * Returning a value from the function will emit a result back to the caller.
   *
   * IMPORTANT: The data received and the return value must be JSON serializable values. This means you cannot expect
   * to receive a callback or function in your listener. As well as this, you can't return a function, can't return
   * a class. It needs to be JSON serializable.
   *
   * @param key - The key that will be used to emit the event.
   * @param callback - The function that will be called when the event is emitted.
   *
   * @returns - A unsubscribe function that if called, will remove the listener from the emitter.
   */
  async addEventListener(key: string, callback: (...args: any) => any) {
    return this.#addEventListenerWithOptions(
      key,
      {
        useResult: true,
        wildcards: this.#wildcards,
        usePreventMultipleCalls: true,
      },
      callback
    );
  }

  /**
   * This method will subscribe a listener that will not emit a result back to the caller. So it might
   * be useful for listeners where performance does matter and needs to be taken aware of.
   *
   * @param key - The key that will be used to emit the event.
   * @param callback - The function that will be called when the event is emitted.
   *
   * @returns - A unsubscribe function that if called, will remove the listener from the emitter.
   */
  async addEventListenerWithoutResult(
    key: string,
    callback: (...args: any) => any
  ) {
    return this.#addEventListenerWithOptions(
      key,
      {
        useResult: false,
        wildcards: this.#wildcards,
        usePreventMultipleCalls: true,
      },
      callback
    );
  }

  /**
   * [INTERNAL] This will subscribe a listener (function) to an specific event (key) without worrying about the result.
   * This is mostly used for internal usage, we do not need to wrap the `results` listener and
   * `layerListener` to send the results. Actually if we did this we might would end up in a loop.
   *
   * So in other words, this adds the key and the listener `raw`, so not wrapped in anything and without
   * the wildcards.
   *
   * @param key - The key that will be used to emit the event.
   * @param callback - The function that will be called when the event is emitted.
   *
   * @returns - Returns the unsubscribe function that should be called to unsubscribe the listener.
   */
  protected async addRawEventListenerWithoutResult(
    key: string,
    callback: (...args: any) => any
  ) {
    return this.#addEventListenerWithOptions(
      key,
      { useResult: false, wildcards: false, usePreventMultipleCalls: false },
      callback
    );
  }

  /**
   * Adds the event listeners with custom options, as you see this function is 100% private, we do not want to
   * expose this to the user because we want to keep the api as simple as possible, and this might bring more
   * confusion than making it simple. We created this function so we can reuse it if you are adding an event
   * listener with the `addEventListener` or with the `addRawEventListenerWithoutResult`.
   *
   * @param key - The key that will be used to fire the event.
   * @param options - The options that will be used to fire the event.
   * @param options.useResult - If the event listener will be wrapped with the result emitter.
   * @param options.wildcards - If the event listener accepts wildcards or not.
   * @param callback - The function (not wrapped) that will be fired when we emit an event.
   *
   * @returns - Returns the unsubscribe function that should be called to unsubscribe the listener.
   */
  async #addEventListenerWithOptions(
    key: string,
    options: {
      useResult?: boolean;
      usePreventMultipleCalls?: boolean;
      wildcards: boolean;
    },
    callback: (...args: any) => any
  ) {
    // A group means another handler for the same key. For example, to listeners to `users.create.index` will point to the same
    // group but are different handlers. Generally speaking, the groupId will be the name of the event that you should append
    // in your custom listeners.
    const handlerGroupId =
      key in this.#groupByKeys
        ? [...this.#groupByKeys[key].values()][0]
        : `group-${uuid()}`;
    const handlerId = `handler-${uuid()}`;

    if (options.useResult)
      callback = await this.#wrapInResultCallback(handlerId, callback);
    else if (options.usePreventMultipleCalls) {
      callback = await this.#wrapInPendingHandlerToPreventMultipleCalls(
        handlerId,
        callback,
        false
      );
    }
    if (options.wildcards) {
      if (key in this.#groupByKeys)
        this.#addListenerThatAlreadyExistsWithWildcards(
          handlerGroupId,
          handlerId,
          callback
        );
      else
        this.#addListenerWithWildcards(
          handlerGroupId,
          handlerId,
          key,
          callback
        );
    } else {
      this.#addListenerWithoutWildcards(
        handlerGroupId,
        handlerId,
        key,
        callback
      );
    }

    // Adds the event listener to the emitter class so that we will be able to emit events.
    await this.emitter.addEventListener(handlerGroupId, key, callback);

    return this.#unsubscribe(handlerGroupId, key, handlerId);
  }

  /**
   * This will either unsubscribe all listeners or all of the listeners of a specific key. We pass an object here
   * to prevent undesired behavior, if for some reason key is undefined we will not remove all of the listeners you need
   * to explicitly define the key that you want to remove.
   *
   * @param options - The options of the listeners we want to remove.
   * @param options.key - The key that you want to remove from the emitter.
   */
  async unsubscribeAll(options?: { key: string }) {
    const isKeyDefined = typeof options?.key === 'string';
    const isToRemoveAll = options === undefined;
    const doesKeyExists = isKeyDefined && options.key in this.#groupByKeys;

    if (doesKeyExists) {
      const groupIds = this.#groupByKeys[options.key];
      const promises = [] as Promise<void>[];
      for (const groupId of groupIds) {
        promises.push(
          (async () => {
            const groupKeysAndListeners = this.#groups[groupId];
            if (groupKeysAndListeners) {
              const listeners = Object.values(groupKeysAndListeners.listeners);
              const listenerRemovalPromises = listeners.map(
                async (listener) => {
                  await this.emitter.removeEventListener(
                    groupId,
                    options.key,
                    listener
                  );
                }
              );

              const keysToRemove = groupKeysAndListeners.keys.values();
              for (const keyBeingRemoved of keysToRemove) {
                if (this.#groupByKeys[keyBeingRemoved].size === 1)
                  delete this.#groupByKeys[keyBeingRemoved];
                else this.#groupByKeys[keyBeingRemoved].delete(groupId);
              }
              await Promise.all(listenerRemovalPromises);
              delete this.#groups[groupId];
            }
          })()
        );
      }
      await Promise.all(promises);
    } else if (isToRemoveAll) {
      if (this.#wildcards) await this.unsubscribeAll({ key: '**' });
      else {
        const promises = [] as Promise<void>[];
        const keysToRemove = Object.keys(this.#groupByKeys);
        // we don't want to remove the results listener we keep it open.
        for (const key of keysToRemove) {
          if (this.resultsEventName !== key)
            promises.push(this.unsubscribeAll({ key }));
        }
        await Promise.all(promises);
      }
    }
  }

  /**
   * Unsubscribes this emitter from a specific channel inside of the layer. If it doesn't exist it will do nothing.
   *
   * @param channel - The channel that you want to unsubscribe from.
   */
  async unsubscribeFromChannel(channel: string) {
    if (channel in this.#unsubscribeByChannel)
      await this.#unsubscribeByChannel[channel]();
  }

  /**
   * When unsubscribing we need to remove the listener from the groups array. This is exactly what this do.
   * We remove all of the keys from the groupKeys. Also if the #groupByKeys becomes empty we make sure to remove
   * it from the #groupByKeys object.
   *
   * @param handlerGroupId - The group id that we want to remove from the #groups and #groupByKeys.
   */
  #unsubscribeGroup(handlerGroupId: string) {
    for (const keyToRemoveIdFrom of this.#groups[handlerGroupId].keys) {
      this.#groupByKeys[keyToRemoveIdFrom].delete(handlerGroupId);
      const isHandlerByKeyEmpty =
        this.#groupByKeys[keyToRemoveIdFrom].size === 0;
      if (isHandlerByKeyEmpty) delete this.#groupByKeys[keyToRemoveIdFrom];
    }
    delete this.#groups[handlerGroupId];
  }

  /**
   * This function is called when we append a new listener using the `addEventListeners` functions.
   *
   * @example
   * ```ts
   * const unsubscribe = await emitter.addEventListener('customEventName', () => { console.log('hello world') });
   *
   * await unsubscribe();
   * ```
   *
   * You see that on addEventListener what we return a function to unsubscribe the listener. The unsubscribe function
   * is returned from this method.
   *
   * To unsubscribe the listener we need to remove it from the emitter and from the #groups and #groupByKeys objects.
   * But all of this logic is handled here. You see that we bind the function we return to the `this` context of the
   * emitter instance. So that the `this` context will always be the emitter instance.
   *
   * @param handlerGroupId - The group id that we want to remove from the emitter (remember, groupIds are like the
   * 'eventName')
   * @param key - The original key that we used to add the listener.
   * @param handlerId - The id of the handler that we want to remove from the emitter.
   */
  async #unsubscribe(handlerGroupId: string, key: string, handlerId: string) {
    const unsubscribeHandlerFunction = async () => {
      const doesGroupStillExists = handlerGroupId in this.#groups;
      const doesHandlerStillExists =
        doesGroupStillExists &&
        handlerId in this.#groups[handlerGroupId].listeners;
      const isLastListenerFromGroup =
        doesHandlerStillExists &&
        Object.keys(this.#groups[handlerGroupId].listeners).length === 1;

      if (doesHandlerStillExists) {
        const listener = this.#groups[handlerGroupId].listeners[handlerId];

        // Call the emitter instance to remove the actual handler
        await this.emitter.removeEventListener(handlerGroupId, key, listener);

        delete this.#groups[handlerGroupId].listeners[handlerId];

        if (isLastListenerFromGroup) this.#unsubscribeGroup(handlerGroupId);
      }
    };
    return unsubscribeHandlerFunction.bind(this);
  }

  #getOriginalKeyFromGroup(key: string, groupId: string) {
    if (groupId in this.#groups) {
      const groupKeys = this.#groups[groupId].keys;
      // Reference: https://stackoverflow.com/a/34583715/13158385
      let originalKey;
      for (originalKey of groupKeys);
      return originalKey as string;
    }
    return key;
  }
  /**
   * Emits the event to the `this.emitter.emit`
   *
   * @param resultsEventName - this is the handler you will call with the result, it'll
   * it's just one for every emitter, so each emitter instance define it's own resultsEventName
   * @param resultKey - This is the key of the result, when you all `.emit()` we will create a key
   * meaning that we will populate the contents of this key with the results.
   */
  protected async emitEventToEmitter(
    key: string,
    resultsEventName: string,
    resultKey: string,
    channelLayer: string | null,
    ...data: any[]
  ) {
    const groupIdsToEmitEventTo = (
      this.#groupByKeys[key] || new Set()
    ).values();

    for (const groupId of groupIdsToEmitEventTo) {
      const groupListenersIds = Object.keys(
        this.#groups[groupId]?.listeners || {}
      );
      // This will prevent that we will emit the event multiple times to the same handler.
      const areAllListenersBeingHandled = groupListenersIds.every(
        (handlerId) =>
          this.#pendingHandlerIdForResultKey.get(handlerId) === resultKey
      );

      if (areAllListenersBeingHandled === false) {
        const originalKey = this.#getOriginalKeyFromGroup(key, groupId);
        this.emitter.emit(
          groupId,
          originalKey,
          resultsEventName,
          resultKey,
          channelLayer,
          ...data
        );
      }
    }
  }

  /**
   * This is responsible to wait for the result of the fired event. First we fire the event, then we will iterate
   * over and over again over `this.#pendingResults` until we receive the result of the event that we fired.
   *
   * We will loop until we receive the result of the event, or we can timeout with both `#resultsTimeout` or
   * `#pingTimeout`. The first one is how long we will wait to retrieve a response. The second one is how long we will
   * wait until we receive that a listener is working on a response. The second one is useful when the event fired does
   * not have any handlers.
   *
   * @param resultKey - In other words, the key of the event that was fired. But generally speaking this is the id
   * that we will append the results to.
   *
   * @returns - A Promise that resolves to an array of the results of the event that was fired.
   */
  async #fetchResultForEmit(resultKey: string) {
    return new Promise((resolve, reject) => {
      function keepAlive(this: EventEmitter, startTimer: number) {
        try {
          const hasReachedTimeout =
            Date.now() - startTimer > this.#resultsTimeout;
          const hasResultForKey =
            Object.keys(this.#pendingResults[resultKey]).length > 0;
          const resultsAsArray = Object.values(
            this.#pendingResults[resultKey] || {}
          );
          const allResultsConcluded =
            hasResultForKey &&
            resultsAsArray.every(({ status }) => status !== 'pending');
          const isPingTimeoutPassed =
            Date.now() - startTimer > this.#pingTimeout;
          const hasReachedPingTimeout =
            hasResultForKey === false && isPingTimeoutPassed;

          if (
            (allResultsConcluded && isPingTimeoutPassed) ||
            hasReachedTimeout
          ) {
            delete this.#pendingResults[resultKey];
            return resolve(
              resultsAsArray
                .filter(({ status }) => status === 'completed')
                .map(({ result }) => result)
            );
          } else if (hasReachedPingTimeout) {
            return resolve([]);
          }
          // We use setTimeout so we do not block the main thread on the loop
          else setTimeout(() => keepAlive.bind(this)(startTimer), 0);
        } catch (e) {
          reject(e);
        }
      }
      keepAlive.bind(this)(Date.now());
    });
  }

  /**
   * Emits some data to a channel, a channel is something that should be defined in the layer, This will fire the event
   * in the layer calling all subscribed listeners. By doing this you can call the `emit` method on multiple machines
   * inside of the server.
   *
   * @param channel - The channel to emit the event to.
   * @param key - The key to send events to.
   * @param data - The data to send over to the listeners. (IT SHOULD BE JSON SERIALIZABLE)
   *
   * @return - A promise that will wait for a return of the emitters.
   */
  async emitToChannel<R = unknown>(
    channels: string[] | string,
    key: string,
    ...data: any[]
  ) {
    const resultKey = `emittedToChannelResultKey-${uuid()}`;
    this.#pendingResults[resultKey] = {};

    if (this.layer) {
      const channelsAsArray = Array.isArray(channels) ? channels : [channels];
      const filteredChannels = channelsAsArray.filter((channel) =>
        this.#channels.includes(channel)
      );
      for (const channel of filteredChannels) {
        this.layer.emitEventToEmitter(
          channel,
          this.resultsEventName,
          resultKey,
          channel,
          { key, data }
        );
      }
      return this.#fetchResultForEmit(resultKey) as Promise<R>;
    } else {
      throw new Error(
        'Your emitter does not have a layer. You should add a layer before trying to emit an event to the layer'
      );
    }
  }

  /**
   * When we emit the event we will return a promise, this promise will wait
   * for the results of the listeners to be sent back to the application. With this
   * we are able to retrieve the results of the connected listeners.
   *
   * @param key - The key to send events to.
   * @param data - The data to send over to the listeners. (IT SHOULD BE JSON SERIALIZABLE)
   *
   * @return - A promise that will wait for a return of the emitters.
   */
  async emit<R = unknown>(key: string, ...data: any[]) {
    const resultKey = `emittedResultKey-${uuid()}`;
    this.#pendingResults[resultKey] = {};

    this.emitEventToEmitter(
      key,
      this.resultsEventName,
      resultKey,
      null,
      ...data
    );

    return this.#fetchResultForEmit(resultKey) as Promise<R>;
  }

  protected emitResult(
    key: string,
    handlerId: string,
    pendingResultId: string,
    channelLayer: string | null,
    ...data: any[]
  ) {
    // Sends Event -> Emits to Layer -> Layer dispatches to actual handler -> result is wrapped and sent back to layer.
    if (this.layer && channelLayer !== null) {
      this.layer.emitEventToEmitter(
        channelLayer,
        handlerId,
        pendingResultId,
        channelLayer,
        { key, data }
      );
    } else if (channelLayer === null) {
      this.emitEventToEmitter(key, handlerId, pendingResultId, null, ...data);
    }
  }

  /**
   * This is used to append listener functions to the layer, you see that the layer calls the emitter.
   *
   * So what we are doing is: We are appending the callback to the layer, from the emitter, when this function
   * is called we will call the `this.emitEventToEmitter` from the emitter itself AND NOT the layer.
   *
   * @returns - Returns the callback that will be called when we fire the emitter.
   */
  async #getLayerListener(): Promise<
    (
      this: EventEmitter,
      resultsEventName: string,
      resultKey: string,
      channel: string,
      data: {
        key: string;
        data: any[];
      }
    ) => void
  > {
    function layerListener(
      this: EventEmitter,
      resultsEventName: string,
      resultKey: string,
      channel: string,
      data: {
        key: string;
        data: any[];
      }
    ) {
      this.emitEventToEmitter(
        data.key,
        resultsEventName,
        resultKey,
        channel,
        ...(data.data || [])
      );
    }
    return layerListener.bind(this);
  }

  /**
   * Appends the listeners to the layer, this way we will be able to connect two different emitters together.
   * Those 2 different emitters might be on the same machine or a completely different machine (if we are using
   * RedisEmitter)
   *
   * @param channels - The channels that your emitter will listen to. This means that when we receive an event on
   * a specific channel and this emitter has handlers for this event, we will emit the event.
   */
  private async addChannelListeners(channels: string[]) {
    const promises = channels.map(async (channel) => {
      if (this.layer) {
        const unsubscribe = await this.layer.addRawEventListenerWithoutResult(
          channel,
          await this.#getLayerListener()
        );
        this.#unsubscribeByChannel[channel] = unsubscribe;
      }
    });
    await Promise.all(promises);
  }
}
