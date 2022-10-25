import { uuid } from './utils';

type ObserversKeyTreeType = {
  [key: string]: {
    observers: { [uuid: string]: (...args: any) => any };
    children: ObserversKeyTreeType;
  };
};

/**
 * Class responsible for emitting events. It works similarly to Node's EventEmitter but with a slight different api.
 *
 * On this class the key is completely optional. You are not tied to any constraint
 */
export default class Emitter {
  #observersByKeyTree = {} as ObserversKeyTreeType;
  #observers: Record<
    string,
    { key?: string; callback: (...args: any) => any }
  > = {};
  #DEFAULT_DELIMITER = '.';

  async #appendInKey(
    key: string,
    callbackUuid: string,
    callback: (...args: any) => any,
    namespaceDelimiter = '.'
  ) {
    const splittedKey = key.split(namespaceDelimiter);
    const totalNumberOfKeysToOrganize = splittedKey.length - 1;
    let currentObject = this.#observersByKeyTree;

    for (let keyIndex = 0; keyIndex < splittedKey.length; keyIndex++) {
      const isLastKey = keyIndex === totalNumberOfKeysToOrganize;
      const currentKey = splittedKey[keyIndex];
      const doesNotExistKeyInObject = currentKey in currentObject === false;
      if (doesNotExistKeyInObject) {
        currentObject[currentKey] = {
          observers: {},
          children: {} as ObserversKeyTreeType,
        };
      }
      if (isLastKey)
        currentObject[currentKey].observers[callbackUuid] = callback;
      else currentObject = currentObject[currentKey].children;
    }
  }

  /**
   * Remove a callback from a key. To do this we need to loop through all of the `wildcards` of the key. It's really similar
   * to how the `addEventListener` works. If the key is for example `create.user` we first split ['create', 'user'] and then we
   * will be going through each children until we find the root (so on this case `user`) so we can remove the attached observer.
   *
   * We still keep the routes to it though. So `create` and `user` will still exist. We can create a recursive function to fix that.
   *
   * @param key - The key to remove, on this case this would be `create.user`. But can be any string.
   * @param callbackUuid - The uuid of the callback to remove. Each handler, or `observer` has a unique uuid appended to it.
   */
  async #removeInKey(
    key: string,
    callbackUuid: string,
    namespaceDelimiter = this.#DEFAULT_DELIMITER
  ) {
    const splittedKey = key.split(namespaceDelimiter);
    const totalNumberOfKeysToOrganize = splittedKey.length - 1;
    let currentObject = this.#observersByKeyTree;

    for (let keyIndex = 0; keyIndex < splittedKey.length; keyIndex++) {
      const isLastKey = keyIndex === totalNumberOfKeysToOrganize;
      const currentKey = splittedKey[keyIndex];

      if (currentKey in currentObject) {
        if (isLastKey) delete currentObject[currentKey].observers[callbackUuid];
        else currentObject = currentObject[currentKey].children;
      } else break;
    }
  }

  /**
   * Emits an event based on a key. The general approach here is that you emit an event from
   * wildcards. Similar to how EventEmitter2 does this.
   *
   * The idea is that for example if you define an event like `create.user` and `create.order`
   * you can call both of them by just calling emitter.emit('create.*')
   *
   * If you have for example an event like `delete.user` you could call all events by calling
   * emitter.emit('**'). Calling two wild cards will call all of the next events from the wildcard.
   * For example if we have an event like `create.user.many` an emit with `create.**` would call it.
   * If we did an emit like 'create.*' we would not call this event because one wildcard just send the event
   * to any key on the same level.
   *
   * @param key - The key to emit the event for.
   */
  async #emitWithKey(
    key: string,
    namespaceDelimiter = this.#DEFAULT_DELIMITER,
    data: any
  ) {
    const splittedKey = key.split(namespaceDelimiter);
    const keysToEmitTo: {
      emit: boolean;
      key: string;
    }[] = splittedKey.map((key, index) => ({
      emit: index === splittedKey.length - 1,
      key,
    }));
    let currentObjects = [this.#observersByKeyTree];

    // We will loop until currentObjects exist. We need to define it this way so it works for multilevel wildcards the idea
    // is that for every loop we will append the next children so we can iterate over them on each level.
    while (currentObjects.length > 0) {
      const currentObject = currentObjects.shift() as ObserversKeyTreeType;
      const { key: currentKey, emit: isToEmitForValue } =
        keysToEmitTo.shift() as {
          emit: boolean;
          key: string;
        };
      const isWildCard = currentKey === '*';
      const isMultiLevelWildCard = currentKey === '**';

      if (isToEmitForValue) {
        const observerValues = Object.entries(currentObject);
        for (const [observerKey, { observers }] of observerValues) {
          const observersAsArray = Object.values(observers);
          for (const observer of observersAsArray) {
            const isToEmitForKey =
              isMultiLevelWildCard || isWildCard || currentKey === observerKey;
            if (isToEmitForKey) setTimeout(() => observer(...data));
          }
          // If it's a multiLevelwildcard we will update the currentObjects with all of the children so we can pass one by one.
          // We also append `keysToEmitTo` so we know we are in a multilevel value. This means we need to emit for every children
          if (isMultiLevelWildCard) {
            keysToEmitTo.push({ key: '**', emit: true });
            currentObjects.push(currentObject[observerKey].children);
          }
        }
      } else {
        // If we do not need to emit we can safely ignore all values, so the currentObjects will be just the children on the currentObject[currentKey]
        currentObjects = [currentObject[currentKey].children];
      }
    }
  }

  /**
   * Function for unsubscribing the event to the emitter. This way we unsubscribe the event from the application.
   *
   * This api is similar to some apis on react native and EXPO like this one: https://github.com/react-native-netinfo/react-native-netinfo#usage.
   *
   * Generally speaking i think that this is more readable than needing to pass the hole function to unsubscribe the listener.
   *
   * @param uuid - The uuid of the callback to remove, each handler or observer has a unique uuid appended to it so we can differentiate
   * between them.
   */
  async unsubscribe(uuid: string, delimiter?: string) {
    return async () => {
      const observerToDelete = this.#observers[uuid];
      if (observerToDelete) {
        delete this.#observers[uuid];

        if (observerToDelete.key) {
          return this.#removeInKey(
            observerToDelete.key,
            uuid,
            delimiter || this.#DEFAULT_DELIMITER
          );
        }
      }
    };
  }

  async addEventListener(
    callbackKey: string,
    callback: (...args: any) => any,
    options?: {
      delimiter?: string;
    }
  ) {
    const callbackUuid = uuid();
    this.#observers[callbackUuid] = {
      key: callbackKey,
      callback: callback,
    };
    return (
      await Promise.all([
        this.unsubscribe(callbackUuid),
        this.#appendInKey(
          callbackKey,
          callbackUuid,
          callback,
          options?.delimiter || '.'
        ),
      ])
    )[0];
  }

  async emit(key: string, ...data: any[]) {
    void this.#emitWithKey(key, '.', data);
  }
}
